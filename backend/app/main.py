from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers.auth import router as auth_router

# Auto-create tables on launch (users table)
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


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
    }
