import os
import uuid
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User
from app.core.config import Settings


def test_production_settings_enforce_required_secrets(monkeypatch):
    """Missing JWT_SECRET, ENCRYPTION_KEY, SERVICE_SECRET or DATABASE_URL must raise in production."""
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("JWT_SECRET", "")
    monkeypatch.setenv("SERVICE_SECRET", "")
    monkeypatch.setenv("ENCRYPTION_KEY", "")
    monkeypatch.setenv("DATABASE_URL", "")

    with pytest.raises(RuntimeError, match="Missing required secrets in production"):
        Settings()


def test_production_settings_enforce_valid_fernet_key(monkeypatch):
    """ENCRYPTION_KEY must be a valid Fernet key in production."""
    monkeypatch.setenv("ENV", "production")
    monkeypatch.setenv("JWT_SECRET", "super-secure-production-jwt-secret")
    monkeypatch.setenv("SERVICE_SECRET", "super-secure-service-secret")
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.setenv("ENCRYPTION_KEY", "not-a-fernet-key")

    with pytest.raises(RuntimeError, match="ENCRYPTION_KEY must be a valid 32-byte url-safe base64 Fernet key"):
        Settings()


def test_regenerate_service_secret_rejects_missing_or_invalid_secret(temp_db_session):
    client = TestClient(app)
    # Missing secret entirely
    res = client.post("/regenerate-resume", json={"user_id": str(uuid.uuid4())})
    assert res.status_code == 401

    # Wrong secret
    res = client.post(
        "/regenerate-resume",
        headers={"X-Service-Secret": "wrong_secret"},
        json={"user_id": str(uuid.uuid4())},
    )
    assert res.status_code == 401


def test_regenerate_service_secret_requires_user_id(temp_db_session, monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "SERVICE_SECRET", "valid_service_secret_123")
    client = TestClient(app)

    # Missing user_id in body -> 400
    res = client.post(
        "/regenerate-resume",
        headers={"X-Service-Secret": "valid_service_secret_123"},
        json={"repo_name": "test-repo"},
    )
    assert res.status_code == 400
    assert "user_id is required" in res.json()["detail"]

    # Invalid UUID format -> 400
    res = client.post(
        "/regenerate-resume",
        headers={"X-Service-Secret": "valid_service_secret_123"},
        json={"user_id": "not-a-valid-uuid"},
    )
    assert res.status_code == 400
    assert "Invalid user_id format" in res.json()["detail"]


def test_regenerate_service_secret_returns_404_for_unknown_user(temp_db_session, monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "SERVICE_SECRET", "valid_service_secret_123")
    client = TestClient(app)

    non_existent_uuid = str(uuid.uuid4())
    res = client.post(
        "/regenerate-resume",
        headers={"X-Service-Secret": "valid_service_secret_123"},
        json={"user_id": non_existent_uuid},
    )
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_regenerate_service_secret_success(temp_db_session, monkeypatch):
    from app.core.config import settings
    from app.core.database import get_db
    monkeypatch.setattr(settings, "SERVICE_SECRET", "valid_service_secret_123")

    app.dependency_overrides[get_db] = lambda: temp_db_session
    try:
        # Create user in temp DB
        user = User(email="service_user@example.com", password_hash="pw")
        temp_db_session.add(user)
        temp_db_session.commit()
        temp_db_session.refresh(user)

        client = TestClient(app)

        with patch("app.routers.resumes.run_resume_regeneration_pipeline") as mock_pipeline:
            mock_pipeline.return_value = {
                "success": True,
                "version_id": uuid.uuid4(),
                "version_number": 1,
                "ats_score": 85,
                "bullets": ["Implemented feature"],
                "download_url": "/download/test.docx",
            }
            res = client.post(
                "/regenerate-resume",
                headers={"X-Service-Secret": "valid_service_secret_123"},
                json={"user_id": str(user.id), "repo_name": "auto-updater"},
            )
            assert res.status_code == 200
            assert res.json()["success"] is True
            mock_pipeline.assert_called_once()
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_health_check_does_not_leak_absolute_file_path():
    client = TestClient(app)
    res = client.get("/health")
    assert res.status_code == 200
    storage_info = res.json().get("storage", {})
    assert "path" not in storage_info
