import os
import sys
import shutil
import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Ensure project root directory is in sys.path so 'services' and 'docx_engine' are resolvable regardless of execution CWD
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Depends, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import httpx

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.core.dependencies import get_current_user, JWT_SECRET, JWT_ALGORITHM
from app.models.user import User
from app.models.automation_log import AutomationLog
from app.routers.auth import router as auth_router
from app.routers.github_auth import router as github_auth_router
from app.routers.projects import router as projects_router
from app.routers.resumes import router as resumes_router
from app.schemas.pipeline import RegenerationResponse
from app.services.pipeline import run_resume_regeneration_pipeline

logger = logging.getLogger("keep_alive")

# Auto-create storage directory on startup
storage_path = Path(settings.STORAGE_DIR)
storage_path.mkdir(parents=True, exist_ok=True)

# Auto-create DB tables on startup (users, github_accounts, projects, resumes, resume_versions)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production API for Resume Auto-Updater",
    version="1.0.0",
)

# CORS Middleware setup with dynamic CORS_ORIGINS from env
allowed_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",") if origin.strip()]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(github_auth_router, prefix="/auth/github", tags=["github_auth"])
app.include_router(projects_router, prefix="/projects", tags=["projects"])
app.include_router(resumes_router, prefix="/resumes", tags=["resumes"])


# Automatic Background Keep-Alive Self-Ping Task
async def render_keep_alive_loop():
    """Background loop that pings the server health check every 45 seconds to keep Render free web services awake."""
    render_url = os.getenv("RENDER_EXTERNAL_URL", "").rstrip("/")
    target_url = f"{render_url}/health" if render_url else "http://127.0.0.1:8000/health"
    ping_interval = int(os.getenv("PING_INTERVAL", "45"))

    logger.info(f"Starting automatic Render keep-alive loop (Target: {target_url}, Interval: {ping_interval}s)")

    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            await asyncio.sleep(ping_interval)
            try:
                resp = await client.get(target_url)
                if resp.status_code == 200:
                    logger.info(f"[Keep-Alive] Ping success to {target_url}")
                else:
                    logger.warning(f"[Keep-Alive] Ping status {resp.status_code} to {target_url}")
            except Exception as e:
                logger.debug(f"[Keep-Alive] Self-ping status: {e}")


@app.on_event("startup")
async def start_keep_alive():
    """Starts background keep-alive task on FastAPI app startup."""
    if os.getenv("ENABLE_KEEP_ALIVE", "true").lower() in ("true", "1", "yes"):
        asyncio.create_task(render_keep_alive_loop())


@app.get("/", include_in_schema=False)
def root_redirect():
    """Redirects root URL GET / directly to interactive Swagger API documentation."""
    return RedirectResponse(url="/docs")


@app.post("/regenerate-resume", response_model=RegenerationResponse, tags=["resumes"])
async def regenerate_resume_alias(
    request: Request,
    db: Session = Depends(get_db),
):
    """Master pipeline endpoint alias POST /regenerate-resume.
    Supports JWT Bearer token authentication or Service Secret (for n8n webhook automation).
    """
    auth_header = request.headers.get("Authorization", "")
    service_secret = request.headers.get("X-Service-Secret", "")

    body_data = {}
    try:
        body_data = await request.json()
    except Exception:
        pass

    target_user = None
    valid_secrets = {"resume001122--", JWT_SECRET, "dev_secret_key_change_in_production"}
    bearer_token = auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else ""

    if service_secret in valid_secrets or bearer_token in valid_secrets:
        user_id_cand = body_data.get("user_id")
        if user_id_cand:
            try:
                from uuid import UUID
                target_user = db.query(User).filter(User.id == UUID(str(user_id_cand))).first()
            except Exception:
                pass
        if not target_user:
            target_user = db.query(User).first()
    else:
        if not bearer_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication credentials (JWT Bearer token or service secret required)",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
            from uuid import UUID
            payload = jwt.decode(bearer_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id_str: str = payload.get("sub")
            if not user_id_str:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload: missing subject claim",
                )
            target_user = db.query(User).filter(User.id == UUID(user_id_str)).first()
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate authentication credentials",
                headers={"WWW-Authenticate":="Bearer"},
            ) from exc

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for resume regeneration",
        )

    repo_name = body_data.get("repo_name", "resume-auto-updater")
    try:
        result = run_resume_regeneration_pipeline(str(target_user.id), db)
        log_entry = AutomationLog(
            repo_name=repo_name,
            user_id=target_user.id,
            status="SUCCESS",
            error_message=None,
        )
        db.add(log_entry)
        db.commit()
        return result
    except Exception as e:
        log_entry = AutomationLog(
            repo_name=repo_name,
            user_id=target_user.id,
            status="FAILED",
            error_message=str(e),
        )
        db.add(log_entry)
        db.commit()
        raise e


@app.get("/health", tags=["health"])
def health_check(db: Session = Depends(get_db)):
    """Production health check testing DB connectivity SELECT 1, storage directory availability, and service status."""
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    storage_available = storage_path.exists()
    free_disk_mb = 0
    try:
        total, used, free = shutil.disk_usage(storage_path)
        free_disk_mb = free // (1024 * 1024)
    except Exception:
        pass

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "storage": {
            "available": storage_available,
            "free_disk_mb": free_disk_mb,
            "path": str(storage_path.resolve()),
        },
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
