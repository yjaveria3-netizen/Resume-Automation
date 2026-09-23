import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.schemas.resume import ResumeResponse
from app.schemas.pipeline import RegenerationResponse
from app.services.storage import save_resume_file
from services.pipeline import run_resume_regeneration_pipeline

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


@router.get("/current", response_model=ResumeResponse)
async def get_current_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves metadata for the user's latest uploaded resume."""
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

    return latest_resume


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

    # Check ownership via parent resume
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
