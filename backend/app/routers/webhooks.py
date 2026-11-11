import hmac
import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.github_account import GitHubAccount
from app.models.project import Project
from app.models.bullet_suggestion import BulletSuggestion
from app.services.crypto import decrypt_token
from app.services.github import fetch_commit_diff_summary
from services.gemini_client import generate_bullets_with_retries

router = APIRouter()


@router.post("/github")
async def github_webhook_handler(
    request: Request,
    db: Session = Depends(get_db),
):
    """Processes incoming GitHub push webhooks:
    1. Verifies HMAC-SHA256 signature against GITHUB_WEBHOOK_SECRET.
    2. Ignores non-push events or pushes to non-default branch.
    3. Maps committer/repo owner to registered user via github_accounts.
    4. Fetches commit diff summary (capped to 50 lines max/file).
    5. Synthesizes a new bullet point via Gemini AI.
    6. Stores pending BulletSuggestion in DB.
    """
    raw_body = await request.body()
    signature_header = (
        request.headers.get("X-Hub-Signature-256")
        or request.headers.get("x-hub-signature-256")
        or ""
    ).strip()

    # 1. Signature verification
    if not settings.GITHUB_WEBHOOK_SECRET or not signature_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or unconfigured webhook signature",
        )

    expected_signature = "sha256=" + hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature_header, expected_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    # 2. Check event type
    event_type = request.headers.get("X-GitHub-Event", "push")
    if event_type != "push":
        return {"status": "ignored", "reason": f"Event '{event_type}' ignored (push only)"}

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed JSON payload: {exc}",
        ) from exc

    # 3. Check branch (only process default branch)
    repo_data = payload.get("repository", {})
    default_branch = repo_data.get("default_branch", "main")
    ref = payload.get("ref", "")
    expected_ref = f"refs/heads/{default_branch}"

    if ref != expected_ref:
        return {
            "status": "ignored",
            "reason": f"Push to non-default branch '{ref}' ignored (default is '{default_branch}')",
        }

    # 4. Map owner / pusher to user
    repo_owner = repo_data.get("owner", {}).get("login", "")
    repo_name = repo_data.get("name", "unknown-repo")
    pusher_name = payload.get("pusher", {}).get("name", "")
    head_commit = payload.get("head_commit") or (payload.get("commits", []) and payload.get("commits")[-1]) or {}
    committer_username = (
        head_commit.get("author", {}).get("username")
        or head_commit.get("committer", {}).get("username")
        or pusher_name
        or repo_owner
    )
    commit_sha = head_commit.get("id") or payload.get("after", "HEAD")
    commit_message = head_commit.get("message", "Auto-update codebase")

    account = (
        db.query(GitHubAccount)
        .filter(
            (GitHubAccount.github_username == repo_owner)
            | (GitHubAccount.github_username == committer_username)
            | (GitHubAccount.github_username == pusher_name)
        )
        .first()
    )

    if not account:
        return {
            "status": "ignored",
            "reason": f"No linked user account found for GitHub username '{repo_owner}' or '{committer_username}'",
        }

    user_id = account.user_id

    # 5. Fetch diff summary from GitHub API (capped to 50 lines max per patch)
    access_token = ""
    if account.encrypted_access_token:
        try:
            access_token = decrypt_token(account.encrypted_access_token)
        except Exception:
            access_token = ""

    diff_summary = await fetch_commit_diff_summary(
        owner=repo_owner,
        repo=repo_name,
        sha=commit_sha,
        access_token=access_token,
    )

    # Lookup tech stack from project if available
    project = (
        db.query(Project)
        .filter(Project.user_id == user_id, Project.github_repo_name == repo_name)
        .first()
    )
    tech_stack = project.tech_stack if project and project.tech_stack else []
    if not isinstance(tech_stack, list):
        tech_stack = [str(tech_stack)]

    # 6. Synthesize bullet point via Gemini with diff data
    repo_desc = repo_data.get("description") or (project.description if project else "") or ""
    bullet_result = generate_bullets_with_retries(
        repo_name=repo_name,
        description=repo_desc,
        tech_stack=tech_stack,
        commit_sha=commit_sha,
        diff_data=diff_summary,
        db=db,
    )
    proposed_bullet = bullet_result.get("bullet")
    if not proposed_bullet:
        bullets = bullet_result.get("bullets", [])
        proposed_bullet = bullets[0] if bullets else f"Engineered updates to {repo_name}."

    # 7. Create pending BulletSuggestion
    suggestion = BulletSuggestion(
        user_id=user_id,
        repo_name=repo_name,
        commit_sha=commit_sha,
        commit_message=commit_message,
        proposed_bullet=proposed_bullet,
        diff_summary=diff_summary,
        status="pending",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)

    return {
        "status": "success",
        "suggestion_id": str(suggestion.id),
        "proposed_bullet": proposed_bullet,
    }
