from app.routers.auth import router as auth_router
from app.routers.github_auth import router as github_auth_router
from app.routers.projects import router as projects_router

__all__ = ["auth_router", "github_auth_router", "projects_router"]
