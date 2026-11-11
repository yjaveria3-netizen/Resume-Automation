import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db


@pytest.fixture
def auth_client(temp_db_session):
    app.dependency_overrides[get_db] = lambda: temp_db_session
    yield TestClient(app)
    app.dependency_overrides.pop(get_db, None)


def test_signup_short_password_rejected(auth_client):
    """Password < 8 characters must be rejected."""
    res = auth_client.post(
        "/auth/signup",
        json={"email": "user@example.com", "password": "1234567"},
    )
    assert res.status_code == 422


def test_signup_long_password_rejected(auth_client):
    """Password > 72 bytes must be rejected, not silently truncated."""
    long_password = "A" * 73
    res = auth_client.post(
        "/auth/signup",
        json={"email": "user@example.com", "password": long_password},
    )
    assert res.status_code == 422


def test_signup_and_login_case_insensitive_and_trimmed(auth_client):
    """Emails should be trimmed and lowercased on signup and login."""
    signup_res = auth_client.post(
        "/auth/signup",
        json={"email": "  TestUser@Example.Com  ", "password": "securepassword123"},
    )
    assert signup_res.status_code == 201
    data = signup_res.json()
    assert data["user"]["email"] == "testuser@example.com"
    assert "password_hash" not in data["user"]
    assert "password" not in data["user"]

    # Login with different casing and whitespace
    login_res = auth_client.post(
        "/auth/login",
        json={"email": "TESTUSER@EXAMPLE.COM", "password": "securepassword123"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["email"] == "testuser@example.com"
    assert "password_hash" not in login_data["user"]
    assert "password" not in login_data["user"]


def test_signup_duplicate_email_returns_400(auth_client):
    """Duplicate email must return 400 Bad Request."""
    res1 = auth_client.post(
        "/auth/signup",
        json={"email": "dup@example.com", "password": "password123"},
    )
    assert res1.status_code == 201

    res2 = auth_client.post(
        "/auth/signup",
        json={"email": "DUP@example.com", "password": "anotherpassword123"},
    )
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_login_invalid_credentials_identical_message(auth_client):
    """Bad credentials must return 401 with identical message for unknown email vs wrong password."""
    # Unknown email
    res1 = auth_client.post(
        "/auth/login",
        json={"email": "unknown@example.com", "password": "wrongpassword123"},
    )
    assert res1.status_code == 401

    # Create account
    auth_client.post(
        "/auth/signup",
        json={"email": "known@example.com", "password": "correctpassword123"},
    )

    # Wrong password
    res2 = auth_client.post(
        "/auth/login",
        json={"email": "known@example.com", "password": "wrongpassword123"},
    )
    assert res2.status_code == 401

    assert res1.json()["detail"] == res2.json()["detail"]
    assert res1.json()["detail"] == "Invalid email or password"
