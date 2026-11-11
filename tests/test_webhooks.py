import hmac
import hashlib
import json
import uuid
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.models.bullet_suggestion import BulletSuggestion
from app.services.crypto import encrypt_token
from app.services.github import fetch_commit_diff_summary


@pytest.fixture
def webhook_setup(temp_db_session, monkeypatch):
    monkeypatch.setattr(settings, "GITHUB_WEBHOOK_SECRET", "super_webhook_secret_key_123")
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user = User(id=uuid.uuid4(), email="hook_user@example.com", password_hash="pw")
    temp_db_session.add(user)
    temp_db_session.commit()

    gh_account = GitHubAccount(
        user_id=user.id,
        github_username="hook_tester",
        github_user_id="778899",
        encrypted_access_token=encrypt_token("gho_dummy_token"),
    )
    temp_db_session.add(gh_account)
    temp_db_session.commit()

    client = TestClient(app)

    yield {
        "client": client,
        "db": temp_db_session,
        "user": user,
        "secret": "super_webhook_secret_key_123",
    }

    app.dependency_overrides.pop(get_db, None)


def sign_payload(body: bytes, secret: str) -> str:
    return "sha256=" + hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()


def test_webhook_bad_signature_returns_401(webhook_setup):
    client = webhook_setup["client"]
    payload = json.dumps({"ref": "refs/heads/main"}).encode("utf-8")

    # Missing signature
    res1 = client.post("/webhooks/github", content=payload, headers={"Content-Type": "application/json"})
    assert res1.status_code == 401

    # Wrong signature
    res2 = client.post(
        "/webhooks/github",
        content=payload,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": "sha256=invalidsignature"},
    )
    assert res2.status_code == 401


def test_webhook_non_main_branch_ignored(webhook_setup):
    client = webhook_setup["client"]
    secret = webhook_setup["secret"]

    payload_dict = {
        "ref": "refs/heads/feature-branch",
        "repository": {"name": "test-repo", "default_branch": "main", "owner": {"login": "hook_tester"}},
    }
    body = json.dumps(payload_dict).encode("utf-8")
    sig = sign_payload(body, secret)

    res = client.post(
        "/webhooks/github",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": sig,
            "X-GitHub-Event": "push",
        },
    )
    assert res.status_code == 200
    assert res.json()["status"] == "ignored"
    assert "non-default branch" in res.json()["reason"]


def test_webhook_push_to_main_creates_pending_bullet_suggestion(webhook_setup):
    client = webhook_setup["client"]
    secret = webhook_setup["secret"]
    db = webhook_setup["db"]
    user = webhook_setup["user"]

    payload_dict = {
        "ref": "refs/heads/main",
        "repository": {
            "name": "payments-engine",
            "default_branch": "main",
            "description": "Payment gateway processing microservice",
            "owner": {"login": "hook_tester"},
        },
        "head_commit": {
            "id": "commit123456",
            "message": "Add Stripe idempotency logic",
            "author": {"username": "hook_tester"},
        },
    }
    body = json.dumps(payload_dict).encode("utf-8")
    sig = sign_payload(body, secret)

    mock_diff = {
        "commit_sha": "commit123456",
        "commit_message": "Add Stripe idempotency logic",
        "total_files_changed": 1,
        "additions": 45,
        "deletions": 5,
        "key_files": ["payments/stripe.py"],
        "diff_snippets": [
            {
                "filename": "payments/stripe.py",
                "status": "modified",
                "additions": 45,
                "deletions": 5,
                "patch": "def process_stripe_payment(): ...",
            }
        ],
    }

    with patch("app.routers.webhooks.fetch_commit_diff_summary", return_value=mock_diff), \
         patch("app.routers.webhooks.generate_bullets_with_retries") as mock_gemini:
        mock_gemini.return_value = {
            "bullet": "Architected Stripe payment idempotency mechanism processing 10k daily charges with 0% duplication.",
            "source": "gemini",
        }

        res = client.post(
            "/webhooks/github",
            content=body,
            headers={
                "Content-Type": "application/json",
                "X-Hub-Signature-256": sig,
                "X-GitHub-Event": "push",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"

        # Verify DB record
        sugg = db.query(BulletSuggestion).filter(BulletSuggestion.user_id == user.id).first()
        assert sugg is not None
        assert sugg.status == "pending"
        assert sugg.repo_name == "payments-engine"
        assert sugg.commit_sha == "commit123456"
        assert "Stripe payment idempotency" in sugg.proposed_bullet
        assert sugg.diff_summary["total_files_changed"] == 1


@pytest.mark.asyncio
async def test_large_diff_truncated_cleanly():
    """Verify that patch snippets with >50 lines are truncated to 50 lines max per file."""
    large_patch = "\n".join([f"+ line {i}" for i in range(100)])

    mock_commit_data = {
        "commit": {"message": "Large refactor"},
        "files": [
            {
                "filename": "big_file.py",
                "additions": 100,
                "deletions": 0,
                "status": "modified",
                "patch": large_patch,
            }
        ],
    }

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_commit_data
        mock_get.return_value = mock_resp

        result = await fetch_commit_diff_summary("owner", "repo", "sha123", "token")
        snippet = result["diff_snippets"][0]
        # Must be capped to 50 lines max
        patch_lines = snippet["patch"].splitlines()
        assert len(patch_lines) == 50
        assert patch_lines[0] == "+ line 0"
        assert patch_lines[-1] == "+ line 49"
