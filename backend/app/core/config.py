import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for backend project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from backend/.env or root .env
env_path = BASE_DIR / ".env"
root_env_path = BASE_DIR.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
elif root_env_path.exists():
    load_dotenv(dotenv_path=root_env_path)
else:
    load_dotenv()


class Settings:
    PROJECT_NAME: str = "Resume Auto-Updater"

    def __init__(self):
        self.ENV: str = os.getenv("ENV", "development").strip().lower()
        self.DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
        self.JWT_SECRET: str = os.getenv("JWT_SECRET", "").strip()
        self.JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256").strip()
        self.SERVICE_SECRET: str = os.getenv("SERVICE_SECRET", "").strip()
        self.ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "").strip()
        self.GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
        self.GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "").strip()
        self.GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "").strip()
        self.GITHUB_REDIRECT_URI: str = os.getenv(
            "GITHUB_REDIRECT_URI", "http://127.0.0.1:8000/auth/github/callback"
        ).strip()
        self.GITHUB_WEBHOOK_SECRET: str = os.getenv("GITHUB_WEBHOOK_SECRET", "").strip()
        self.FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173").strip()
        self.CORS_ORIGINS: str = os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
        ).strip()
        self.STORAGE_DIR: str = os.getenv("STORAGE_DIR", str(BASE_DIR / "storage" / "resumes")).strip()

        if self.ENV == "production":
            missing = []
            if not self.JWT_SECRET:
                missing.append("JWT_SECRET")
            if not self.ENCRYPTION_KEY:
                missing.append("ENCRYPTION_KEY")
            if not self.SERVICE_SECRET:
                missing.append("SERVICE_SECRET")
            if not self.DATABASE_URL:
                missing.append("DATABASE_URL")
            if missing:
                raise RuntimeError(
                    f"Missing required secrets in production (ENV=production): {', '.join(missing)}"
                )

            try:
                from cryptography.fernet import Fernet
                Fernet(self.ENCRYPTION_KEY.encode("utf-8"))
            except Exception as e:
                raise RuntimeError(
                    f"ENCRYPTION_KEY must be a valid 32-byte url-safe base64 Fernet key: {e}"
                ) from e
        else:
            # Development defaults
            if not self.JWT_SECRET:
                self.JWT_SECRET = "local_dev_insecure_jwt_secret_change_in_prod"
            if not self.SERVICE_SECRET:
                self.SERVICE_SECRET = "local_dev_insecure_service_secret_change_in_prod"
            if not self.ENCRYPTION_KEY:
                # Valid 32-byte URL-safe base64 Fernet key for local dev
                self.ENCRYPTION_KEY = "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE="


settings = Settings()
