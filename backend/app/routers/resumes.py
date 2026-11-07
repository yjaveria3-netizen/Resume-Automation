import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
import docx
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.middleware.auth import require_resume_owner
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.job_description import JobDescription
from app.schemas.resume import ResumeResponse
from app.schemas.pipeline import RegenerationResponse
from app.schemas.resume_version import VersionResponse
from app.schemas.suggestions import MatchJdRequest, MatchJdResponse
from app.services.storage import save_resume_file
from app.services.pipeline import run_resume_regeneration_pipeline
from services.jd_matcher import compute_jd_match_score

router = APIRouter()


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Uploads and validates a .docx resume file (<5MB), saves it to local disk, and stores record in DB."""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in request.",
        )

    stored_path, original_name = await save_resume_file(str(current_user.id), file)

    resume = Resume(
        user_id=current_user.id,
        original_filename=original_name,
        file_path=stored_path,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


@router.get("/current")
async def get_current_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves metadata for the user's latest uploaded resume with estimated line budget metrics."""
    latest_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .first()
    )

    if not latest_resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume uploaded yet for current user.",
        )

    # Estimate line budget
    lines_count = 0
    if Path(latest_resume.file_path).exists():
        try:
            doc = docx.Document(latest_resume.file_path)
            lines_count = sum(max(1, len(p.text) // 80) for p in doc.paragraphs if p.text.strip())
        except Exception:
            lines_count = 25

    # 1-page resume safe boundary is typically ~38-42 lines
    is_one_page_safe = lines_count <= 40

    return {
        "id": latest_resume.id,
        "user_id": latest_resume.user_id,
        "original_filename": latest_resume.original_filename,
        "file_path": latest_resume.file_path,
        "uploaded_at": latest_resume.uploaded_at,
        "lines_count": lines_count,
        "is_one_page_safe": is_one_page_safe,
    }


@router.get("/{resume_id}/versions", response_model=List[VersionResponse])
async def get_resume_versions(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all generated versions for a specific resume owned by the current user, ordered by created_at DESC."""
    resume = require_resume_owner(resume_id, current_user, db)

    versions = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.resume_id == resume.id)
        .order_by(ResumeVersion.created_at.desc())
        .all()
    )

    response_list = []
    for v in versions:
        response_list.append(
            VersionResponse(
                id=v.id,
                resume_id=v.resume_id,
                version_number=v.version_number,
                file_path=v.file_path,
                ats_score=v.ats_score,
                created_at=v.created_at,
                download_url=f"/resumes/download/{v.id}",
            )
        )

    return response_list


@router.post("/match-jd", response_model=MatchJdResponse)
async def match_job_description(
    payload: MatchJdRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Day 12 Job Matcher: Compares active resume with target JD, computes keyword match scores, and stores result."""
    resume = require_resume_owner(payload.resume_id, current_user, db)

    match_result = compute_jd_match_score(resume.file_path, payload.job_description)

    # Store or update in job_descriptions table
    jd_record = JobDescription(
        user_id=current_user.id,
        resume_id=resume.id,
        jd_text=payload.job_description,
        match_score=match_result["match_score"],
        matched_keywords=match_result["matched_keywords"],
        missing_keywords=match_result["missing_keywords"],
        created_at=datetime.now(timezone.utc),
    )
    db.add(jd_record)
    db.commit()

    return MatchJdResponse(
        match_score=match_result["match_score"],
        matched_keywords=match_result["matched_keywords"],
        missing_keywords=match_result["missing_keywords"],
        recommendations=match_result["recommendations"],
    )


@router.post("/regenerate", response_model=RegenerationResponse)
async def regenerate_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Triggers full AI + docx + ATS scoring regeneration pipeline for current user."""
    res = run_resume_regeneration_pipeline(str(current_user.id), db)
    return res


@router.get("/download/{version_id}")
async def download_resume_version(
    version_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Serves the generated .docx resume version file for download."""
    try:
        v_uuid = uuid.UUID(version_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid version ID format.",
        )

    version_rec = db.query(ResumeVersion).filter(ResumeVersion.id == v_uuid).first()
    if not version_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested resume version not found.",
        )

    resume_rec = db.query(Resume).filter(Resume.id == version_rec.resume_id).first()
    if not resume_rec or resume_rec.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to requested resume version.",
        )

    filepath = Path(version_rec.file_path)
    if not filepath.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file does not exist on server storage.",
        )

    return FileResponse(
        path=str(filepath),
        filename=f"Updated_Resume_v{version_rec.version_number}.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
