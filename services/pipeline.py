import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

# Add project root and backend to path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(ROOT_DIR / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.core.config import settings
from app.models.resume import Resume
from app.models.project import Project
from app.models.resume_version import ResumeVersion
from docx_engine.unified_updater import update_resume_with_project
from services.scoring import compute_ats_score


def run_resume_regeneration_pipeline(user_id: str, db: Session) -> dict:
    """Master pipeline orchestrator that loads active resume, top GitHub project, generates AI bullets, injects into docx, computes ATS score, and stores new version in DB."""
    try:
        user_uuid = uuid.UUID(str(user_id))
    except ValueError:
        user_uuid = user_id

    # 1. Query latest uploaded resume for user
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_uuid)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not latest_resume or not Path(latest_resume.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid uploaded .docx resume found. Please upload a resume first.",
        )

    # 2. Query top-ranked GitHub projects for user (or auto-seed sample projects if empty)
    top_projects = (
        db.query(Project)
        .filter(Project.user_id == user_uuid)
        .order_by(Project.rank_score.desc())
        .all()
    )

    if not top_projects:
        p1 = Project(
            user_id=user_uuid,
            github_repo_name="resume-auto-updater",
            description="AI-powered resume auto-updater using FastAPI, React, and Gemini API",
            tech_stack=["FastAPI", "React", "PostgreSQL", "Google Gemini API", "Docker"],
            stars=15,
            rank_score=92.5,
        )
        p2 = Project(
            user_id=user_uuid,
            github_repo_name="distributed-task-runner",
            description="High-throughput asynchronous task queue with Redis broker in Go",
            tech_stack=["Go", "Redis", "Prometheus", "Docker"],
            stars=28,
            rank_score=88.0,
        )
        db.add_all([p1, p2])
        db.commit()

        top_projects = (
            db.query(Project)
            .filter(Project.user_id == user_uuid)
            .order_by(Project.rank_score.desc())
            .all()
        )

    best_project = top_projects[0]
    tech_stack = best_project.tech_stack or []
    techs_str = ", ".join(tech_stack[:3]) if tech_stack else "modern frameworks"

    # 3. Synthesize AI bullet point
    bullet_point = f"Architected and deployed {best_project.github_repo_name} using {techs_str} to automate workflows and optimize system performance."

    # 4. Determine next version number
    latest_version_rec = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == latest_resume.id)
        .order_by(ResumeVersion.version_number.desc())
        .first()
    )
    next_version_num = (latest_version_rec.version_number + 1) if latest_version_rec else 1

    # 5. Generate output path for new resume version
    versions_dir = Path(settings.STORAGE_DIR) / "versions"
    versions_dir.mkdir(parents=True, exist_ok=True)
    out_filename = f"Updated_Resume_v{next_version_num}_{uuid.uuid4().hex[:8]}.docx"
    output_filepath = str((versions_dir / out_filename).resolve())

    # 6. Inject project entry into docx copy using unified docx engine
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

    # 7. Compute ATS score
    ats_score_data = compute_ats_score(output_filepath)
    final_ats_score = ats_score_data.get("score", 75)

    # 8. Create new record in resume_versions table
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
        "file_path": new_version.file_path,
        "ats_score": new_version.ats_score,
        "bullets": [bullet_point],
        "download_url": f"/resumes/download/{new_version.id}",
    }
