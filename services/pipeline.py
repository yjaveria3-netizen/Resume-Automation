import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
import docx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

# Add project root and backend to path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.models.resume import Resume
from app.models.project import Project
from app.models.resume_version import ResumeVersion
from docx_engine.unified_updater import update_resume_with_project
from docx_engine.page_budget import auto_tighten_docx_spacing
from services.gemini_client import generate_bullets_with_retries
from services.scoring import compute_ats_score


def run_resume_regeneration_pipeline(user_id: str, db: Session) -> dict:
    """Master pipeline orchestrator:
    1. Loads ONLY this user's latest resume (404 'Upload a resume first' if none).
    2. Loads user's top projects (400 'Fetch projects first' if none).
    3. Calls gemini_client.generate_bullets_with_retries with cache, records fallback_used.
    4. Inserts via docx_engine.unified_updater.update_resume_with_project.
    5. Runs page_budget.auto_tighten_docx_spacing.
    6. Computes ATS score via services/scoring.py with target keywords.
    7. Saves ResumeVersion record and returns clean response dictionary.
    """
    try:
        user_uuid = uuid.UUID(str(user_id))
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user_id format: {user_id}",
        ) from exc

    # 1. Query ONLY this user's latest uploaded resume
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_uuid)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not latest_resume or not Path(latest_resume.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload a resume first",
        )

    # 2. Query user's top GitHub projects
    top_projects = (
        db.query(Project)
        .filter(Project.user_id == user_uuid)
        .order_by(Project.rank_score.desc())
        .all()
    )

    if not top_projects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fetch projects first",
        )

    best_project = top_projects[0]
    tech_stack = best_project.tech_stack or []
    if not isinstance(tech_stack, list):
        tech_stack = [str(tech_stack)]

    # 3. Call gemini_client with cache and retry support
    ai_result = generate_bullets_with_retries(
        repo_name=best_project.github_repo_name,
        description=best_project.description or "",
        tech_stack=tech_stack,
        db=db,
    )
    bullet_point = ai_result.get("bullet")
    if not bullet_point:
        bullets_list = ai_result.get("bullets", [])
        bullet_point = bullets_list[0] if bullets_list else f"Engineered {best_project.github_repo_name} using modern frameworks."

    fallback_used = (ai_result.get("source") == "fallback")

    # 4. Determine next version number
    latest_version_rec = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == latest_resume.id)
        .order_by(ResumeVersion.version_number.desc())
        .first()
    )
    next_version_num = (latest_version_rec.version_number + 1) if latest_version_rec else 1

    # 5. Output path for new version
    versions_dir = Path(settings.STORAGE_DIR) / "versions"
    versions_dir.mkdir(parents=True, exist_ok=True)
    out_filename = f"Updated_Resume_v{next_version_num}_{uuid.uuid4().hex[:8]}.docx"
    output_filepath = str((versions_dir / out_filename).resolve())

    # 6. Inject project entry using unified updater
    update_res = update_resume_with_project(
        input_docx_path=latest_resume.file_path,
        output_docx_path=output_filepath,
        project_title=best_project.github_repo_name,
        tech_stack=tech_stack,
        bullet_point=bullet_point,
    )

    if not update_res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update document: {update_res.get('error', 'Unknown error')}",
        )

    # 7. Auto-tighten spacing to enforce 1-page budget
    try:
        doc = docx.Document(output_filepath)
        auto_tighten_docx_spacing(doc)
        doc.save(output_filepath)
    except Exception:
        pass

    # 8. Compute calibrated ATS score
    ats_score_data = compute_ats_score(output_filepath, target_keywords=tech_stack)
    final_ats_score = int(ats_score_data.get("score", 75))

    # 9. Create ResumeVersion record
    new_version = ResumeVersion(
        resume_id=latest_resume.id,
        file_path=output_filepath,
        ats_score=final_ats_score,
        version_number=next_version_num,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return {
        "success": True,
        "version_id": new_version.id,
        "version_number": new_version.version_number,
        "download_url": f"/resumes/download/{new_version.id}",
        "ats_score": new_version.ats_score,
        "bullets": [bullet_point],
        "fallback_used": fallback_used,
    }
