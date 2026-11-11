import io
import uuid
import docx
from unittest.mock import patch, MagicMock
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.models.resume import Resume
from app.models.project import Project
from app.models.resume_version import ResumeVersion
from app.models.automation_log import AutomationLog
from services.pipeline import run_resume_regeneration_pipeline


@pytest.fixture
def regen_setup(temp_db_session, tmp_path):
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user = User(id=uuid.uuid4(), email="pipeline_user@example.com", password_hash="pw")
    temp_db_session.add(user)
    temp_db_session.commit()

    token = create_access_token(subject=str(user.id))

    # Create dummy docx file
    doc_path = tmp_path / "baseline_resume.docx"
    doc = docx.Document()
    doc.add_heading("Jane Dev", 0)
    doc.add_paragraph("janedev@example.com | 555-0199")
    doc.add_heading("Projects", level=1)
    doc.add_paragraph("Existing Project | Python, Redis")
    doc.add_paragraph("Developed core backend caching system reducing latency by 30% across services.")
    doc.save(str(doc_path))

    client = TestClient(app)

    yield {
        "client": client,
        "db": temp_db_session,
        "user": user,
        "token": token,
        "doc_path": str(doc_path),
        "tmp_path": tmp_path,
    }

    app.dependency_overrides.pop(get_db, None)


def test_regeneration_fails_when_no_resume(regen_setup):
    user = regen_setup["user"]
    db = regen_setup["db"]

    # Seed project but no resume
    proj = Project(
        user_id=user.id,
        github_repo_name="my-service",
        description="Core service",
        tech_stack=["Python", "FastAPI"],
        rank_score=80.0,
    )
    db.add(proj)
    db.commit()

    with pytest.raises(HTTPException) as exc_info:
        run_resume_regeneration_pipeline(str(user.id), db)
    assert exc_info.value.status_code == 404
    assert "upload a resume first" in exc_info.value.detail.lower()


def test_regeneration_fails_when_no_projects(regen_setup):
    user = regen_setup["user"]
    db = regen_setup["db"]
    doc_path = regen_setup["doc_path"]

    # Seed resume but no project
    resume = Resume(
        user_id=user.id,
        original_filename="resume.docx",
        file_path=doc_path,
    )
    db.add(resume)
    db.commit()

    with pytest.raises(HTTPException) as exc_info:
        run_resume_regeneration_pipeline(str(user.id), db)
    assert exc_info.value.status_code == 400
    assert "fetch projects first" in exc_info.value.detail.lower()


def test_regeneration_happy_path_mocked_gemini(regen_setup):
    user = regen_setup["user"]
    db = regen_setup["db"]
    doc_path = regen_setup["doc_path"]
    client = regen_setup["client"]
    token = regen_setup["token"]

    resume = Resume(
        user_id=user.id,
        original_filename="resume.docx",
        file_path=doc_path,
        ats_score=70,
    )
    proj = Project(
        user_id=user.id,
        github_repo_name="cloud-microservice",
        description="Scalable distributed system",
        tech_stack=["Go", "Docker", "Kubernetes"],
        rank_score=95.0,
    )
    db.add_all([resume, proj])
    db.commit()

    with patch("services.pipeline.generate_bullets_with_retries") as mock_gemini:
        mock_gemini.return_value = {
            "bullet": "Architected cloud microservice using Go and Docker to process 50k transactions with 99.9% uptime.",
            "bullets": ["Architected cloud microservice using Go and Docker to process 50k transactions with 99.9% uptime."],
            "source": "gemini",
            "model": "gemini-2.5-flash",
            "latency_ms": 120,
        }

        res = client.post(
            "/resumes/regenerate",
            headers={"Authorization": f"Bearer {token}"},
            json={"repo_name": "cloud-microservice"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["version_number"] == 1
        assert "download_url" in data
        assert "file_path" not in data
        assert data["ats_score"] > 0
        assert len(data["bullets"]) == 1

        # Check AutomationLog duration_ms
        log = db.query(AutomationLog).filter(AutomationLog.user_id == user.id).first()
        assert log is not None
        assert log.status == "SUCCESS"
        assert log.duration_ms is not None
        assert log.duration_ms >= 0


def test_regeneration_cache_hit_and_fallback(regen_setup):
    user = regen_setup["user"]
    db = regen_setup["db"]
    doc_path = regen_setup["doc_path"]

    resume = Resume(user_id=user.id, original_filename="resume.docx", file_path=doc_path)
    proj = Project(user_id=user.id, github_repo_name="cache-repo", tech_stack=["Python"], rank_score=85.0)
    db.add_all([resume, proj])
    db.commit()

    # 1. Test cache hit
    with patch("services.pipeline.generate_bullets_with_retries") as mock_gemini:
        mock_gemini.return_value = {
            "bullet": "Engineered high throughput cache using Python reducing DB latency by 40%.",
            "bullets": ["Engineered high throughput cache using Python reducing DB latency by 40%."],
            "source": "cache",
            "model": "cached",
            "latency_ms": 2,
        }
        res_cache = run_resume_regeneration_pipeline(str(user.id), db)
        assert res_cache["success"] is True
        assert res_cache["fallback_used"] is False

    # 2. Test fallback bullet path
    with patch("services.pipeline.generate_bullets_with_retries") as mock_gemini:
        mock_gemini.return_value = {
            "bullet": "Implemented cache-repo system utilizing Python architecture for automated tasks.",
            "bullets": ["Implemented cache-repo system utilizing Python architecture for automated tasks."],
            "source": "fallback",
            "model": "local_fallback",
            "latency_ms": 5,
        }
        res_fallback = run_resume_regeneration_pipeline(str(user.id), db)
        assert res_fallback["success"] is True
        assert res_fallback["fallback_used"] is True
