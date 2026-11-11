import os
import uuid
import pytest
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import settings
from app.core.security import verify_password
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.project import Project
from app.models.bullet_suggestion import BulletSuggestion
from app.models.job_description import JobDescription
from scripts.reset_demo_data import reset_and_seed_demo_data


def test_demo_reset_seeds_correctly(temp_db_session, monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "STORAGE_DIR", str(tmp_path))
    monkeypatch.setattr(settings, "ENV", "development")
    monkeypatch.setenv("ENV", "development")

    # Add a bystander user to ensure they are untouched
    bystander = User(
        id=uuid.uuid4(),
        email="bystander@example.com",
        password_hash="secret",
        role="user",
        created_at=datetime.now(timezone.utc),
    )
    temp_db_session.add(bystander)
    temp_db_session.commit()

    demo_user = reset_and_seed_demo_data(force=False, db=temp_db_session)

    assert demo_user is not None
    assert demo_user.email == "demo@resumeautoupdater.com"
    assert verify_password("DemoPassword123!", demo_user.password_hash)

    # Bystander should still exist!
    bystander_check = temp_db_session.query(User).filter(User.email == "bystander@example.com").first()
    assert bystander_check is not None

    # Check Resume & Version
    resumes = temp_db_session.query(Resume).filter(Resume.user_id == demo_user.id).all()
    assert len(resumes) == 1
    resume = resumes[0]
    assert resume.ats_score == 70
    assert resume.line_budget == 20

    versions = temp_db_session.query(ResumeVersion).filter(ResumeVersion.resume_id == resume.id).all()
    assert len(versions) == 1
    assert versions[0].version_number == 1
    assert versions[0].ats_score == 70

    # Check Projects
    projects = temp_db_session.query(Project).filter(Project.user_id == demo_user.id).all()
    assert len(projects) == 4
    project_names = {p.github_repo_name for p in projects}
    assert "e-commerce-microservices" in project_names
    assert "distributed-task-runner" in project_names
    assert "analytics-pipeline" in project_names
    assert "cloud-infra-automation" in project_names

    # Check Bullet Suggestion
    suggestions = temp_db_session.query(BulletSuggestion).filter(BulletSuggestion.user_id == demo_user.id).all()
    assert len(suggestions) == 1
    sugg = suggestions[0]
    assert sugg.repo_name == "distributed-cache"
    assert sugg.status == "pending"
    assert sugg.diff_summary is not None
    assert len(sugg.proposed_bullet) > 0

    # Check Job Description
    jds = temp_db_session.query(JobDescription).filter(JobDescription.user_id == demo_user.id).all()
    assert len(jds) == 1
    jd = jds[0]
    assert jd.title == "Senior Full-Stack Engineer"
    assert jd.match_score == 85
    assert "Go" in jd.matched_keywords
    assert "Memcached" in jd.missing_keywords


def test_demo_reset_is_idempotent(temp_db_session, monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "STORAGE_DIR", str(tmp_path))
    monkeypatch.setattr(settings, "ENV", "development")
    monkeypatch.setenv("ENV", "development")

    # Run once
    user1 = reset_and_seed_demo_data(force=False, db=temp_db_session)
    assert user1 is not None

    # Run twice
    user2 = reset_and_seed_demo_data(force=False, db=temp_db_session)
    assert user2 is not None

    # Assert exactly 1 of each record type exists for demo user
    demo_users = temp_db_session.query(User).filter(User.email == "demo@resumeautoupdater.com").all()
    assert len(demo_users) == 1
    demo_user = demo_users[0]

    assert temp_db_session.query(Resume).filter(Resume.user_id == demo_user.id).count() == 1
    resume = temp_db_session.query(Resume).filter(Resume.user_id == demo_user.id).first()
    assert temp_db_session.query(ResumeVersion).filter(ResumeVersion.resume_id == resume.id).count() == 1
    assert temp_db_session.query(Project).filter(Project.user_id == demo_user.id).count() == 4
    assert temp_db_session.query(BulletSuggestion).filter(BulletSuggestion.user_id == demo_user.id).count() == 1
    assert temp_db_session.query(JobDescription).filter(JobDescription.user_id == demo_user.id).count() == 1


def test_demo_reset_refuses_in_production_without_force(temp_db_session, monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "STORAGE_DIR", str(tmp_path))
    monkeypatch.setattr(settings, "ENV", "production")
    monkeypatch.setenv("ENV", "production")

    with pytest.raises(RuntimeError, match="Refusing to reset demo data in production without --force"):
        reset_and_seed_demo_data(force=False, db=temp_db_session)


def test_demo_reset_succeeds_in_production_with_force(temp_db_session, monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "STORAGE_DIR", str(tmp_path))
    monkeypatch.setattr(settings, "ENV", "production")
    monkeypatch.setenv("ENV", "production")

    demo_user = reset_and_seed_demo_data(force=True, db=temp_db_session)
    assert demo_user is not None
    assert demo_user.email == "demo@resumeautoupdater.com"
