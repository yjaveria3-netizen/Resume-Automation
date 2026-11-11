import os
import time
import uuid
import hmac
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
import docx
from fastapi import APIRouter, Depends, File, Header, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.middleware.auth import require_resume_owner
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.job_description import JobDescription
from app.models.automation_log import AutomationLog
from app.schemas.resume import ResumeResponse
from app.schemas.pipeline import RegenerationResponse
from app.schemas.resume_version import VersionResponse
from app.schemas.suggestions import MatchJdRequest, MatchJdResponse
from app.services.storage import save_resume_file
from app.services.pipeline import run_resume_regeneration_pipeline
from services.jd_matcher import compute_jd_match_score

router = APIRouter()


async def handle_regeneration_request(request: Request, db: Session) -> dict:
    """Core regeneration handler supporting JWT or X-Service-Secret + user_id.
    Measures duration_ms, logs to AutomationLog, and wraps errors in clean JSON.
    """
    start_time = time.time()
    auth_header = request.headers.get("Authorization", "").strip()
    service_secret = request.headers.get("X-Service-Secret", "").strip()

    body_data = {}
    try:
        body_data = await request.json()
    except Exception:
        body_data = {}

    target_user = None
    repo_name = body_data.get("repo_name", "portfolio-project") if isinstance(body_data, dict) else "portfolio-project"

    try:
        if service_secret:
            if not settings.SERVICE_SECRET or not hmac.compare_digest(service_secret, settings.SERVICE_SECRET):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid service secret",
                )
            raw_user_id = body_data.get("user_id") if isinstance(body_data, dict) else None
            if not raw_user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="user_id is required in request body when using X-Service-Secret",
                )
            try:
                target_uuid = uuid.UUID(str(raw_user_id))
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid user_id format; must be a valid UUID",
                )
            target_user = db.query(User).filter(User.id == target_uuid).first()
            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User {target_uuid} not found",
                )
        else:
            bearer_token = auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else ""
            if not bearer_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing authentication credentials (JWT Bearer token or service secret required)",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            try:
                payload = jwt.decode(bearer_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
                user_id_str = payload.get("sub")
                if not user_id_str:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token payload: missing subject claim",
                    )
                target_uuid = uuid.UUID(user_id_str)
                target_user = db.query(User).filter(User.id == target_uuid).first()
            except (JWTError, ValueError) as exc:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                ) from exc

            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found for resume regeneration",
                )

        result = run_resume_regeneration_pipeline(str(target_user.id), db)
        duration_ms = int((time.time() - start_time) * 1000)

        log_entry = AutomationLog(
            repo_name=repo_name,
            user_id=target_user.id,
            duration_ms=duration_ms,
            status="SUCCESS",
            error_message=None,
        )
        db.add(log_entry)
        db.commit()

        return result

    except HTTPException as http_exc:
        duration_ms = int((time.time() - start_time) * 1000)
        log_entry = AutomationLog(
            repo_name=repo_name,
            user_id=target_user.id if target_user else None,
            duration_ms=duration_ms,
            status="FAILED",
            error_message=str(http_exc.detail),
        )
        db.add(log_entry)
        db.commit()
        raise http_exc
    except Exception as exc:
        duration_ms = int((time.time() - start_time) * 1000)
        log_entry = AutomationLog(
            repo_name=repo_name,
            user_id=target_user.id if target_user else None,
            duration_ms=duration_ms,
            status="FAILED",
            error_message=str(exc),
        )
        db.add(log_entry)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Regeneration pipeline error: {str(exc)}",
        ) from exc


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Uploads and validates a real .docx resume (<5MB), stores initial ATS score and line budget, returns 201."""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in request.",
        )

    stored_path, original_name = await save_resume_file(str(current_user.id), file)

    line_budget = 0
    ats_score = 0
    try:
        from docx_engine.page_budget import calculate_document_line_budget
        doc = docx.Document(stored_path)
        budget = calculate_document_line_budget(doc)
        line_budget = budget.get("lines_used", 0)
    except Exception:
        line_budget = 0

    try:
        from services.scoring import compute_ats_score
        ats_result = compute_ats_score(stored_path)
        ats_score = int(ats_result.get("score", 0))
    except Exception:
        ats_score = 0

    resume = Resume(
        user_id=current_user.id,
        original_filename=original_name,
        file_path=stored_path,
        ats_score=ats_score,
        line_budget=line_budget,
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
    """Retrieves metadata for user's latest uploaded resume with line budget metrics, returning download_url only."""
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

    lines_used = 0
    lines_available = 42
    is_one_page_safe = True
    if Path(latest_resume.file_path).exists():
        try:
            from docx_engine.page_budget import calculate_document_line_budget
            doc = docx.Document(latest_resume.file_path)
            budget = calculate_document_line_budget(doc)
            lines_used = budget.get("lines_used", 0)
            lines_available = budget.get("lines_available", 42)
            is_one_page_safe = budget.get("is_one_page_safe", True)
        except Exception:
            lines_used = latest_resume.line_budget or 25
            is_one_page_safe = lines_used <= 40

    return {
        "id": latest_resume.id,
        "user_id": latest_resume.user_id,
        "original_filename": latest_resume.original_filename,
        "download_url": f"/resumes/download/{latest_resume.id}",
        "uploaded_at": latest_resume.uploaded_at,
        "lines_count": lines_used,
        "lines_available": lines_available,
        "is_one_page_safe": is_one_page_safe,
        "ats_score": latest_resume.ats_score,
        "line_budget": latest_resume.line_budget,
    }


@router.get("/{resume_id}/versions", response_model=List[VersionResponse])
async def get_resume_versions(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all generated versions for a specific resume owned by current user. download_url only."""
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
    """Day 12 Job Matcher: Compares active resume with target JD, computes keyword match scores, and stores result in DB."""
    resume = None
    if payload.resume_id:
        resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        resume = (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id)
            .order_by(Resume.uploaded_at.desc())
            .first()
        )

    if not resume or not Path(resume.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No uploaded resume found for current user",
        )

    match_result = compute_jd_match_score(resume.file_path, payload.job_description)

    jd_record = JobDescription(
        user_id=current_user.id,
        resume_id=resume.id,
        jd_text=payload.job_description,
        match_score=int(match_result["match_score"]),
        matched_keywords=match_result["matched_keywords"],
        missing_keywords=match_result["missing_keywords"],
        created_at=datetime.now(timezone.utc),
    )
    db.add(jd_record)
    db.commit()
    db.refresh(jd_record)

    return MatchJdResponse(
        match_score=int(match_result["match_score"]),
        matched_keywords=match_result["matched_keywords"],
        missing_keywords=match_result["missing_keywords"],
        recommendations=match_result["recommendations"],
    )


@router.post("/regenerate", response_model=RegenerationResponse)
async def regenerate_resume(
    request: Request,
    db: Session = Depends(get_db),
):
    """Triggers full AI + docx + ATS scoring regeneration pipeline. Supports JWT or X-Service-Secret."""
    return await handle_regeneration_request(request, db)


@router.get("/download/{version_id}")
async def download_resume_version(
    version_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Serves the generated .docx resume version file or uploaded resume file for download."""
    try:
        v_uuid = uuid.UUID(version_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid version ID format.",
        )

    version_rec = db.query(ResumeVersion).filter(ResumeVersion.id == v_uuid).first()
    if version_rec:
        resume_rec = db.query(Resume).filter(Resume.id == version_rec.resume_id).first()
        if not resume_rec or resume_rec.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to requested resume version.",
            )
        filepath = Path(version_rec.file_path)
        filename = f"Updated_Resume_v{version_rec.version_number}.docx"
    else:
        resume_rec = db.query(Resume).filter(Resume.id == v_uuid).first()
        if not resume_rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requested resume not found.",
            )
        if resume_rec.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to requested resume.",
            )
        filepath = Path(resume_rec.file_path)
        filename = resume_rec.original_filename

    if not filepath.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file does not exist on server storage.",
        )

    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
