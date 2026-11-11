import uuid
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.models.project import Project
from app.services.crypto import encrypt_token
from app.services.github import fetch_user_repos


@pytest.fixture
def project_test_env(temp_db_session):
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user = User(id=uuid.uuid4(), email="project_user@example.com", password_hash="hash")
    temp_db_session.add(user)
    temp_db_session.commit()

    token = create_access_token(subject=str(user.id))

    encrypted_gh_token = encrypt_token("gho_test_secret_token_123")
    gh_account = GitHubAccount(
        user_id=user.id,
        github_username="testdev",
        github_user_id="12345",
        encrypted_access_token=encrypted_gh_token,
    )
    temp_db_session.add(gh_account)
    temp_db_session.commit()

    client = TestClient(app)

    yield {
        "client": client,
        "db": temp_db_session,
        "user": user,
        "token": token,
    }

    app.dependency_overrides.pop(get_db, None)


def test_zero_repos_returns_empty_and_removes_stale_projects(project_test_env):
    client = project_test_env["client"]
    token = project_test_env["token"]
    db = project_test_env["db"]
    user = project_test_env["user"]

    # Pre-seed a stale project
    stale_proj = Project(
        user_id=user.id,
        github_repo_name="deleted_repo",
        description="Old repo",
        forks_count=1,
        default_branch="main",
    )
    db.add(stale_proj)
    db.commit()

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = []
        mock_resp.links = {}
        mock_get.return_value = mock_resp

        res = client.get("/projects", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert res.json() == []

    # Stale project should have been cleaned up from DB
    remaining = db.query(Project).filter(Project.user_id == user.id).all()
    assert len(remaining) == 0


def test_rate_limit_distinction():
    """Verify 403 with X-RateLimit-Remaining == 0 raises 429, but other 403 raises 403."""
    import asyncio

    # Case A: Rate limit 403 -> 429
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 403
        mock_resp.headers = {"X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1787320000"}
        mock_resp.links = {}
        mock_get.return_value = mock_resp

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(fetch_user_repos("test_token"))
        assert exc_info.value.status_code == 429
        assert "rate limit exceeded" in exc_info.value.detail.lower()

    # Case B: Forbidden 403 -> 403
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 403
        mock_resp.headers = {"X-RateLimit-Remaining": "42"}
        mock_resp.links = {}
        mock_get.return_value = mock_resp

        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(fetch_user_repos("test_token"))
        assert exc_info.value.status_code == 403
        assert "forbidden" in exc_info.value.detail.lower()


def test_ranking_order_and_missing_descriptions(project_test_env):
    client = project_test_env["client"]
    token = project_test_env["token"]

    mock_repos = [
        {
            "id": 1,
            "name": "low_ranked_stale_repo",
            "full_name": "testdev/low_ranked_stale_repo",
            "description": None,  # Missing description -> no +20 points
            "html_url": "https://github.com/testdev/low_ranked_stale_repo",
            "stargazers_count": 0,
            "forks_count": 0,
            "default_branch": "master",
            "language": None,
            "topics": [],
            "fork": True,  # Fork -> no +15 points
            "pushed_at": "2020-01-01T00:00:00Z",  # Stale -> 0 recency points
        },
        {
            "id": 2,
            "name": "high_ranked_active_repo",
            "full_name": "testdev/high_ranked_active_repo",
            "description": "High impact full-stack cloud application",
            "html_url": "https://github.com/testdev/high_ranked_active_repo",
            "stargazers_count": 15,
            "forks_count": 4,
            "default_branch": "main",
            "language": "Python",
            "topics": ["fastapi", "docker"],
            "fork": False,
            "pushed_at": datetime.now(timezone.utc).isoformat(),
        },
    ]

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_repos
        mock_resp.links = {}
        mock_get.return_value = mock_resp

        res = client.get("/projects", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 2
        # Highest ranked must be first
        assert data[0]["github_repo_name"] == "high_ranked_active_repo"
        assert data[0]["rank_score"] > data[1]["rank_score"]
        assert data[0]["forks_count"] == 4
        assert data[0]["default_branch"] == "main"
        assert data[1]["github_repo_name"] == "low_ranked_stale_repo"
        assert data[1]["description"] is None
        assert data[1]["rank_score"] == 0.0


def test_only_forks_handled(project_test_env):
    client = project_test_env["client"]
    token = project_test_env["token"]

    mock_fork_repos = [
        {
            "id": 10,
            "name": "fork_a",
            "full_name": "testdev/fork_a",
            "description": "Fork A description",
            "html_url": "https://github.com/testdev/fork_a",
            "stargazers_count": 2,
            "forks_count": 1,
            "default_branch": "main",
            "language": "Go",
            "topics": [],
            "fork": True,
            "pushed_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_fork_repos
        mock_resp.links = {}
        mock_get.return_value = mock_resp

        res = client.get("/projects", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["github_repo_name"] == "fork_a"
        assert data[0]["forks_count"] == 1
