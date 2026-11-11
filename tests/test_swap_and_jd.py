import uuid
from pathlib import Path
import docx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.models.resume import Resume
from app.models.project import Project
from app.models.bullet_suggestion import BulletSuggestion
from app.models.archived_project import ArchivedProject
from app.models.job_description import JobDescription


@pytest.fixture
def swap_setup(temp_db_session, tmp_path):
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user = User(id=uuid.uuid4(), email="swap_user@example.com", password_hash="pw")
    temp_db_session.add(user)
    temp_db_session.commit()

    token = create_access_token(subject=str(user.id))

    # Build initial docx with 2 projects
    doc_file = tmp_path / "resume_swap_test.docx"
    doc = docx.Document()
    doc.add_heading("Alex Developer", 0)
    doc.add_paragraph("alex@example.com | 555-4321")
    doc.add_heading("Projects", level=1)

    # Project 1 (to be swapped out)
    doc.add_paragraph("Old Monolith Engine | Java, Spring")
    doc.add_paragraph("Maintained legacy monolithic Java codebase with 85% unit test coverage.")

    # Project 2 (to stay)
    doc.add_paragraph("Mobile Gateway | Swift, Kotlin")
    doc.add_paragraph("Built native mobile bridge connecting client apps to GraphQL gateway.")

    doc.add_heading("Skills", level=1)
    doc.add_paragraph("Python, Go, Java, Docker, Kubernetes, PostgreSQL")
    doc.save(str(doc_file))

    resume = Resume(
        id=uuid.uuid4(),
        user_id=user.id,
        original_filename="resume_swap_test.docx",
        file_path=str(doc_file),
        ats_score=75,
        line_budget=20,
    )
    old_project = Project(
        id=uuid.uuid4(),
        user_id=user.id,
        github_repo_name="Old Monolith Engine",
        description="Legacy enterprise platform",
        tech_stack=["Java", "Spring"],
        rank_score=60.0,
    )
    suggestion = BulletSuggestion(
        id=uuid.uuid4(),
        user_id=user.id,
        repo_name="High Speed Microservice",
        commit_sha="sha999",
        commit_message="Initial release",
        proposed_bullet="Engineered high speed microservice using Go and gRPC processing 50k events per second.",
        status="pending",
    )
    temp_db_session.add_all([resume, old_project, suggestion])
    temp_db_session.commit()

    client = TestClient(app)

    yield {
        "client": client,
        "db": temp_db_session,
        "user": user,
        "token": token,
        "resume": resume,
        "old_project": old_project,
        "suggestion": suggestion,
        "doc_file": doc_file,
    }

    app.dependency_overrides.pop(get_db, None)


def test_swap_replaces_project_and_archives_displaced_bullet(swap_setup):
    client = swap_setup["client"]
    token = swap_setup["token"]
    db = swap_setup["db"]
    user = swap_setup["user"]
    resume = swap_setup["resume"]
    old_project = swap_setup["old_project"]
    suggestion = swap_setup["suggestion"]

    res = client.post(
        f"/suggestions/{suggestion.id}/swap",
        headers={"Authorization": f"Bearer {token}"},
        json={"archive_project_id": str(old_project.id)},
    )
    assert res.status_code == 200
    data = res.json()
    assert "download_url" in data
    assert "file_path" not in data
    assert data["version_number"] >= 1

    # Verify archived_projects row
    archived = db.query(ArchivedProject).filter(ArchivedProject.user_id == user.id).first()
    assert archived is not None
    assert archived.project_title == "Old Monolith Engine"
    assert "legacy monolithic Java" in archived.bullet_text
    assert archived.resume_id == resume.id

    # Verify suggestion marked accepted
    db.refresh(suggestion)
    assert suggestion.status == "accepted"


def test_jd_match_happy_path_and_stored_in_db(swap_setup):
    client = swap_setup["client"]
    token = swap_setup["token"]
    db = swap_setup["db"]
    user = swap_setup["user"]

    jd_text = """
    We are seeking a Senior Backend Engineer proficient in Python, Go, Docker,
    and PostgreSQL. Experience with distributed architectures and gRPC is a plus.
    """

    res = client.post(
        "/resumes/match-jd",
        headers={"Authorization": f"Bearer {token}"},
        json={"job_description": jd_text},
    )
    assert res.status_code == 200
    data = res.json()
    assert "match_score" in data
    assert data["match_score"] > 0
    assert "matched_keywords" in data
    assert any(k.lower() == "python" for k in data["matched_keywords"])

    # Verify saved in job_descriptions table
    saved_jd = db.query(JobDescription).filter(JobDescription.user_id == user.id).first()
    assert saved_jd is not None
    assert saved_jd.match_score == data["match_score"]
    assert "Senior Backend Engineer" in saved_jd.jd_text


def test_jd_match_fails_when_user_has_no_resume(temp_db_session):
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user_without_resume = User(id=uuid.uuid4(), email="no_resume@example.com", password_hash="pw")
    temp_db_session.add(user_without_resume)
    temp_db_session.commit()

    token = create_access_token(subject=str(user_without_resume.id))
    client = TestClient(app)

    res = client.post(
        "/resumes/match-jd",
        headers={"Authorization": f"Bearer {token}"},
        json={"job_description": "Software engineer with Python experience."},
    )
    assert res.status_code == 404
    assert "no uploaded resume found" in res.json()["detail"].lower()

    app.dependency_overrides.pop(get_db, None)


def test_jd_match_rejects_jd_over_10000_chars(swap_setup):
    client = swap_setup["client"]
    token = swap_setup["token"]

    oversized_jd = "X" * 10005
    res = client.post(
        "/resumes/match-jd",
        headers={"Authorization": f"Bearer {token}"},
        json={"job_description": oversized_jd},
    )
    assert res.status_code == 422
