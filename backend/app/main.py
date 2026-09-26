import os
import sys
import shutil
from datetime import datetime, timezone
from pathlib import Path

# Ensure project root directory is in sys.path so 'services' and 'docx_engine' are resolvable regardless of execution CWD
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.github_auth import router as github_auth_router
from app.routers.projects import router as projects_router
from app.routers.resumes import router as resumes_router
from app.schemas.pipeline import RegenerationResponse
from app.services.pipeline import run_resume_regeneration_pipeline

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


@app.get("/", include_in_schema=False)
def root_redirect():
    """Redirects root URL GET / directly to interactive Swagger API documentation."""
    return RedirectResponse(url="/docs")


@app.post("/regenerate-resume", response_model=RegenerationResponse, tags=["resumes"])
async def regenerate_resume_alias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Master pipeline endpoint alias POST /regenerate-resume."""
    return run_resume_regeneration_pipeline(str(current_user.id), db)


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
