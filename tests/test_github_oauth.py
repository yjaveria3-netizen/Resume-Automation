import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from jose import jwt
import httpx

from app.main import app
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.services.crypto import decrypt_token
from app.routers.github_auth import STATE_ALGORITHM


@pytest.fixture
def oauth_setup(temp_db_session):
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user1 = User(id=uuid.uuid4(), email="user1@example.com", password_hash="pw1")
    user2 = User(id=uuid.uuid4(), email="user2@example.com", password_hash="pw2")
    temp_db_session.add_all([user1, user2])
    temp_db_session.commit()

    token1 = create_access_token(subject=str(user1.id))
    token2 = create_access_token(subject=str(user2.id))

    client = TestClient(app)

    yield {
        "client": client,
        "db": temp_db_session,
        "user1": user1,
        "user2": user2,
        "token1": token1,
        "token2": token2,
    }

    app.dependency_overrides.pop(get_db, None)


def test_github_login_requires_jwt(oauth_setup):
    client = oauth_setup["client"]
    # Without auth token -> 401
    res = client.get("/auth/github/login")
    assert res.status_code == 401

    # With auth token -> 200 and returns state
    res = client.get(
        "/auth/github/login",
        headers={"Authorization": f"Bearer {oauth_setup['token1']}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "url" in data
    assert "state" in data
    assert "github.com/login/oauth/authorize" in data["url"]


def test_github_callback_happy_path_and_token_encrypted(oauth_setup):
    client = oauth_setup["client"]
    token1 = oauth_setup["token1"]
    user1 = oauth_setup["user1"]
    db = oauth_setup["db"]

    # 1. Get state from login
    login_res = client.get("/auth/github/login", headers={"Authorization": f"Bearer {token1}"})
    state = login_res.json()["state"]

    mock_raw_token = "gho_16characterfaketoken123456"

    # Mock httpx responses for token exchange and user profile fetch
    def mock_post(url, **kwargs):
        resp = MagicMock()
        resp.status_code = 200
        resp.json.return_value = {"access_token": mock_raw_token, "token_type": "bearer"}
        return resp

    def mock_get(url, **kwargs):
        resp = MagicMock()
        resp.status_code = 200
        resp.json.return_value = {"id": 123456, "login": "octocat_tester"}
        return resp

    with patch("httpx.AsyncClient.post", side_effect=mock_post), \
         patch("httpx.AsyncClient.get", side_effect=mock_get):

        res = client.get(
            f"/auth/github/callback?code=valid_code&state={state}&format=json"
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["github_username"] == "octocat_tester"

    # Verify DB record and encryption
    account = db.query(GitHubAccount).filter(GitHubAccount.user_id == user1.id).first()
    assert account is not None
    assert account.github_username == "octocat_tester"
    # Token must NOT be stored in plaintext
    assert not account.encrypted_access_token.startswith("gho_")
    assert not account.encrypted_access_token.startswith("ghp_")
    # Must be decryptable back to original
    assert decrypt_token(account.encrypted_access_token) == mock_raw_token


def test_github_callback_redirect_mode(oauth_setup):
    client = oauth_setup["client"]
    token1 = oauth_setup["token1"]

    login_res = client.get("/auth/github/login", headers={"Authorization": f"Bearer {token1}"})
    state = login_res.json()["state"]

    with patch("httpx.AsyncClient.post") as mock_post, \
         patch("httpx.AsyncClient.get") as mock_get:
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {"access_token": "gho_abc"})
        mock_get.return_value = MagicMock(status_code=200, json=lambda: {"id": 111, "login": "redirect_user"})

        res = client.get(
            f"/auth/github/callback?code=some_code&state={state}",
            follow_redirects=False,
        )
        assert res.status_code == 307
        assert f"{settings.FRONTEND_URL}/dashboard?github=connected" in res.headers["location"]


def test_github_callback_state_mismatch_rejected(oauth_setup):
    client = oauth_setup["client"]
    # Forged state signed with wrong secret or corrupted
    forged_state = "invalid.forged.token"
    res = client.get(f"/auth/github/callback?code=valid_code&state={forged_state}&format=json")
    assert res.status_code == 400
    assert "invalid" in res.json()["detail"].lower()


def test_github_callback_expired_state_rejected(oauth_setup):
    client = oauth_setup["client"]
    user1 = oauth_setup["user1"]

    # Generate expired state token
    past = datetime.now(timezone.utc) - timedelta(minutes=15)
    expired_payload = {
        "sub": str(user1.id),
        "nonce": "nonce123",
        "iat": past - timedelta(minutes=10),
        "exp": past,
        "type": "github_oauth_state",
    }
    expired_state = jwt.encode(expired_payload, settings.JWT_SECRET, algorithm=STATE_ALGORITHM)

    res = client.get(f"/auth/github/callback?code=valid_code&state={expired_state}&format=json")
    assert res.status_code == 400
    assert "expired" in res.json()["detail"].lower()


def test_github_callback_single_use_enforced(oauth_setup):
    client = oauth_setup["client"]
    token1 = oauth_setup["token1"]

    login_res = client.get("/auth/github/login", headers={"Authorization": f"Bearer {token1}"})
    state = login_res.json()["state"]

    with patch("httpx.AsyncClient.post") as mock_post, \
         patch("httpx.AsyncClient.get") as mock_get:
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {"access_token": "gho_single"})
        mock_get.return_value = MagicMock(status_code=200, json=lambda: {"id": 222, "login": "single_user"})

        # First use -> success
        res1 = client.get(f"/auth/github/callback?code=c1&state={state}&format=json")
        assert res1.status_code == 200

        # Second use of identical state -> 400
        res2 = client.get(f"/auth/github/callback?code=c2&state={state}&format=json")
        assert res2.status_code == 400
        assert "already been used" in res2.json()["detail"].lower()


def test_github_callback_user_denied_access(oauth_setup):
    client = oauth_setup["client"]
    res = client.get(
        "/auth/github/callback?error=access_denied&error_description=User+denied+access&format=json"
    )
    assert res.status_code == 400
    assert "access_denied" in res.json()["detail"] or "User denied access" in res.json()["detail"]


def test_github_callback_already_linked_account_returns_409(oauth_setup):
    client = oauth_setup["client"]
    user1 = oauth_setup["user1"]
    user2 = oauth_setup["user2"]
    token2 = oauth_setup["token2"]
    db = oauth_setup["db"]

    # Pre-link user1 to octocat_shared
    existing_acc = GitHubAccount(
        user_id=user1.id,
        github_username="octocat_shared",
        github_user_id="999888",
        encrypted_access_token="gAAAAA_dummy",
    )
    db.add(existing_acc)
    db.commit()

    # Now user2 tries to link the same GitHub account
    login_res = client.get("/auth/github/login", headers={"Authorization": f"Bearer {token2}"})
    state = login_res.json()["state"]

    with patch("httpx.AsyncClient.post") as mock_post, \
         patch("httpx.AsyncClient.get") as mock_get:
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {"access_token": "gho_other"})
        mock_get.return_value = MagicMock(status_code=200, json=lambda: {"id": 999888, "login": "octocat_shared"})

        res = client.get(f"/auth/github/callback?code=c_steal&state={state}&format=json")
        assert res.status_code == 409
        assert "already linked to another user" in res.json()["detail"].lower()
