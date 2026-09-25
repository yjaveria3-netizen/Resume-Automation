import sys
from pathlib import Path

# Ensure project root directory is in sys.path so 'services' and 'docx_engine' are resolvable regardless of execution CWD
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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


@app.get("/", include_in_schema=False)
def root_redirect():
    """Redirects root URL GET / directly to interactive Swagger API documentation."""
    return RedirectResponse(url="/docs")


from uuid import UUID
from fastapi import FastAPI, Depends, Request, HTTPException, status
from jose import jwt, JWTError
from app.core.dependencies import JWT_SECRET, JWT_ALGORITHM
from app.models.automation_log import AutomationLog


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
    
    # Try parsing JSON body if present
    body_data = {}
    try:
        body_data = await request.json()
    except Exception:
        pass

    target_user = None
    valid_secrets = {"resume001122--", JWT_SECRET, "dev_secret_key_change_in_production"}
    bearer_token = auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else ""

    if service_secret in valid_secrets or bearer_token in valid_secrets:
        # Service authentication: resolve user from payload or first user in DB
        user_id_cand = body_data.get("user_id")
        if user_id_cand:
            try:
                target_user = db.query(User).filter(User.id == UUID(str(user_id_cand))).first()
            except Exception:
                pass
        if not target_user:
            target_user = db.query(User).first()
    else:
        # Validate standard JWT Bearer token
        if not bearer_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication credentials (JWT Bearer token or service secret required)",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
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
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found for resume regeneration",
        )

    repo_name = body_data.get("repo_name", "resume-auto-updater")
    try:
        result = run_resume_regeneration_pipeline(str(target_user.id), db)
        # Log successful run to automation_logs
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
        # Log failure run to automation_logs
        log_entry = AutomationLog(
            repo_name=repo_name,
            user_id=target_user.id,
            status="FAILED",
            error_message=str(e),
        )
        db.add(log_entry)
        db.commit()
        raise e



@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
    }
