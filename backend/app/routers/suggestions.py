import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.project import Project
from app.models.bullet_suggestion import BulletSuggestion
from app.models.archived_project import ArchivedProject
from app.schemas.suggestions import (
    BulletSuggestionOut,
    SuggestionUpdateRequest,
    SuggestionAcceptRequest,
    SwapProjectRequest,
)
from app.schemas.resume_version import VersionResponse
from docx_engine.unified_updater import update_resume_with_project
from docx_engine.page_budget import replace_project_in_docx
from services.scoring import compute_ats_score

router = APIRouter()


@router.get("", response_model=List[BulletSuggestionOut])
def get_pending_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all pending bullet suggestions for current user ordered by created_at DESC."""
    return (
        db.query(BulletSuggestion)
        .filter(BulletSuggestion.user_id == current_user.id)
        .filter(BulletSuggestion.status == "pending")
        .order_by(BulletSuggestion.created_at.desc())
        .all()
    )


@router.put("/{suggestion_id}", response_model=BulletSuggestionOut)
def update_proposed_bullet(
    suggestion_id: uuid.UUID,
    payload: SuggestionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates the proposed bullet text for a suggestion before accepting."""
    sugg = (
        db.query(BulletSuggestion)
        .filter(BulletSuggestion.id == suggestion_id)
        .filter(BulletSuggestion.user_id == current_user.id)
        .first()
    )
    if not sugg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found.",
        )

    sugg.proposed_bullet = payload.proposed_bullet
    sugg.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(sugg)
    return sugg


@router.post("/{suggestion_id}/dismiss", response_model=BulletSuggestionOut)
def dismiss_suggestion(
    suggestion_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks a bullet suggestion as dismissed so it leaves the review queue."""
    sugg = (
        db.query(BulletSuggestion)
        .filter(BulletSuggestion.id == suggestion_id)
        .filter(BulletSuggestion.user_id == current_user.id)
        .first()
    )
    if not sugg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found.",
        )

    sugg.status = "dismissed"
    sugg.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(sugg)
    return sugg


@router.post("/{suggestion_id}/accept", response_model=VersionResponse)
def accept_suggestion(
    suggestion_id: uuid.UUID,
    payload: SuggestionAcceptRequest = SuggestionAcceptRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accepts a suggestion, writes the bullet into active resume, saves new version with ATS score, and marks suggestion accepted."""
    sugg = (
        db.query(BulletSuggestion)
        .filter(BulletSuggestion.id == suggestion_id)
        .filter(BulletSuggestion.user_id == current_user.id)
        .first()
    )
    if not sugg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found.",
        )

    # Fetch latest uploaded resume
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if not latest_resume or not Path(latest_resume.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No uploaded resume found to apply suggestion to.",
        )

    bullet_to_insert = (payload.custom_bullet or sugg.proposed_bullet).strip()

    # Query latest version to increment version_number
    latest_v = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == latest_resume.id)
        .order_by(ResumeVersion.version_number.desc())
        .first()
    )
    next_v_num = (latest_v.version_number + 1) if latest_v else 1

    versions_dir = Path(settings.STORAGE_DIR) / "versions"
    versions_dir.mkdir(parents=True, exist_ok=True)
    out_file = str((versions_dir / f"Updated_Resume_v{next_v_num}_{uuid.uuid4().hex[:8]}.docx").resolve())

    # Insert bullet into docx
    update_res = update_resume_with_project(
        input_docx_path=latest_resume.file_path,
        output_docx_path=out_file,
        project_title=sugg.repo_name,
        tech_stack=[],
        bullet_point=bullet_to_insert,
    )
    if not update_res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update resume document: {update_res.get('error')}",
        )

    ats_data = compute_ats_score(out_file)
    ats_score = ats_data.get("score", 75)

    new_version = ResumeVersion(
        resume_id=latest_resume.id,
        file_path=out_file,
        ats_score=ats_score,
        version_number=next_v_num,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_version)

    # Mark suggestion as accepted
    sugg.status = "accepted"
    sugg.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(new_version)

    return VersionResponse(
        id=new_version.id,
        resume_id=new_version.resume_id,
        version_number=new_version.version_number,
        ats_score=new_version.ats_score,
        created_at=new_version.created_at,
        download_url=f"/resumes/download/{new_version.id}",
    )


@router.post("/{suggestion_id}/swap", response_model=VersionResponse)
def swap_project_suggestion(
    suggestion_id: uuid.UUID,
    payload: SwapProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Day 12 Smart Swap: Archives designated older project, replaces it in the docx with the suggested project, protecting the 1-page resume limit."""
    sugg = (
        db.query(BulletSuggestion)
        .filter(BulletSuggestion.id == suggestion_id)
        .filter(BulletSuggestion.user_id == current_user.id)
        .first()
    )
    if not sugg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suggestion not found.",
        )

    # Verify project to archive belongs to current_user
    old_proj = (
        db.query(Project)
        .filter(Project.id == payload.archive_project_id)
        .filter(Project.user_id == current_user.id)
        .first()
    )
    if not old_proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Designated project to archive was not found.",
        )

    # Find active resume
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )
    if not latest_resume or not Path(latest_resume.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No uploaded resume found for swapping projects.",
        )

    # Extract displaced bullet text from docx
    import docx
    from docx_engine.page_budget import auto_tighten_docx_spacing

    displaced_bullet_text = ""
    try:
        doc = docx.Document(latest_resume.file_path)
        target_found = False
        for p in doc.paragraphs:
            txt = p.text.strip()
            if old_proj.github_repo_name.lower() in txt.lower():
                target_found = True
                continue
            if target_found:
                if (p.style and "bullet" in p.style.name.lower()) or txt.startswith(("-", "•", "*")):
                    displaced_bullet_text = txt.lstrip("-•* \t")
                    break
                elif txt:
                    displaced_bullet_text = txt
                    break
    except Exception:
        pass

    if not displaced_bullet_text:
        displaced_bullet_text = old_proj.description or f"Archived project: {old_proj.github_repo_name}"

    # Record in archived_projects table
    archived = ArchivedProject(
        user_id=current_user.id,
        resume_id=latest_resume.id,
        project_title=old_proj.github_repo_name,
        project_name=old_proj.github_repo_name,
        bullet_text=displaced_bullet_text,
        bullet_point=displaced_bullet_text,
        tech_stack=old_proj.tech_stack,
        archived_at=datetime.now(timezone.utc),
    )

    # Increment version
    latest_v = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == latest_resume.id)
        .order_by(ResumeVersion.version_number.desc())
        .first()
    )
    next_v_num = (latest_v.version_number + 1) if latest_v else 1

    versions_dir = Path(settings.STORAGE_DIR) / "versions"
    versions_dir.mkdir(parents=True, exist_ok=True)
    out_file = str((versions_dir / f"Updated_Resume_v{next_v_num}_{uuid.uuid4().hex[:8]}.docx").resolve())

    # Execute canonical replacement in docx
    replace_project_in_docx(
        doc_path=latest_resume.file_path,
        output_path=out_file,
        old_project_name=old_proj.github_repo_name,
        new_project_title=sugg.repo_name,
        new_tech_stack=old_proj.tech_stack or [],
        new_bullet_point=sugg.proposed_bullet,
    )

    # Auto-tighten spacing to preserve 1-page budget
    try:
        doc_out = docx.Document(out_file)
        auto_tighten_docx_spacing(doc_out)
        doc_out.save(out_file)
    except Exception:
        pass

    ats_data = compute_ats_score(out_file)
    ats_score = ats_data.get("score", 75)

    new_version = ResumeVersion(
        resume_id=latest_resume.id,
        file_path=out_file,
        ats_score=ats_score,
        version_number=next_v_num,
        created_at=datetime.now(timezone.utc),
    )

    # Atomic DB transaction
    try:
        db.add(archived)
        db.add(new_version)
        sugg.status = "accepted"
        sugg.updated_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as exc:
        db.rollback()
        if Path(out_file).exists():
            try:
                Path(out_file).unlink()
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record project swap: {exc}",
        ) from exc
    db.refresh(new_version)

    return VersionResponse(
        id=new_version.id,
        resume_id=new_version.resume_id,
        version_number=new_version.version_number,
        ats_score=new_version.ats_score,
        created_at=new_version.created_at,
        download_url=f"/resumes/download/{new_version.id}",
    )
