from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
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
from services.pipeline import run_resume_regeneration_pipeline

# Auto-create storage directory on startup
Path(settings.STORAGE_DIR).mkdir(parents=True, exist_ok=True)

# Auto-create DB tables on startup (users, github_accounts, projects, resumes, resume_versions)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Resume Auto-Updater",
    version="0.1.0",
)

# CORS Middleware setup
if settings.FRONTEND_URL:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL, "*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(github_auth_router, prefix="/auth/github", tags=["github_auth"])
app.include_router(projects_router, prefix="/projects", tags=["projects"])
app.include_router(resumes_router, prefix="/resumes", tags=["resumes"])


@app.post("/regenerate-resume", response_model=RegenerationResponse, tags=["resumes"])
async def regenerate_resume_alias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Master pipeline endpoint alias POST /regenerate-resume."""
    return run_resume_regeneration_pipeline(str(current_user.id), db)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
    }
