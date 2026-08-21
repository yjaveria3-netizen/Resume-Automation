import secrets
import urllib.parse
from uuid import UUID
from typing import Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.github_account import GitHubAccount
from app.services.crypto import encrypt_token
from app.schemas.github import GitHubLoginResponse, GitHubCallbackResponse

router = APIRouter()


@router.get("/login")
def github_login(
    user_id: Optional[UUID] = Query(None, description="Optional user ID to associate with GitHub account"),
    redirect: bool = Query(False, description="If True, directly redirect browser to GitHub authorization page"),
):
    client_id = settings.GITHUB_CLIENT_ID or "placeholder_github_client_id"

    # Generate state containing optional user_id and random token
    random_nonce = secrets.token_urlsafe(16)
    state = f"{user_id}:{random_nonce}" if user_id else random_nonce

    params = {
        "client_id": client_id,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "read:user repo",
        "state": state,
        "allow_signup": "true",
    }
    authorize_url = f"https://github.com/login/oauth/authorize?{urllib.parse.urlencode(params)}"

    if redirect:
        return RedirectResponse(url=authorize_url)

    return GitHubLoginResponse(url=authorize_url, state=state)


@router.get("/callback", response_model=GitHubCallbackResponse)
async def github_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Exchanges GitHub authorization code for access token, fetches username, encrypts token, and upserts into DB."""

    # 1. Handle error cases (e.g. user canceled authorization)
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub OAuth Authorization Failed: {error_description or error}",
        )

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'code' query parameter in GitHub callback.",
        )

    # 2. Extract optional user_id from state if encoded
    associated_user_id: Optional[UUID] = None
    if state and ":" in state:
        possible_uid_str = state.split(":", 1)[0]
        try:
            associated_user_id = UUID(possible_uid_str)
        except ValueError:
            associated_user_id = None

    # 3. Exchange code for access token via GitHub API
    token_url = "https://github.com/login/oauth/access_token"
    token_payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
    }
    headers = {"Accept": "application/json"}

    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(token_url, json=token_payload, headers=headers)
            token_data = token_response.json()
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to connect to GitHub OAuth server: {str(exc)}",
            ) from exc

    if "error" in token_data or "access_token" not in token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub token exchange failed: {token_data.get('error_description', token_data.get('error', 'Invalid code'))}",
        )

    access_token = token_data["access_token"]

    # 4. Fetch GitHub user profile
    user_url = "https://api.github.com/user"
    user_headers = {
        "Authorization": f"Bearer {access_token}",
        "User-Agent": "Resume-Auto-Updater",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            user_response = await client.get(user_url, headers=user_headers)
            user_data = user_response.json()
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to fetch user profile from GitHub API: {str(exc)}",
            ) from exc

    if user_response.status_code != 200 or "login" not in user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve GitHub user details with access token.",
        )

    github_username = user_data["login"]
    github_user_id = str(user_data.get("id"))

    # 5. Encrypt access token using Fernet helper
    encrypted_token = encrypt_token(access_token)

    # 6. Upsert record in github_accounts table
    account = None
    if associated_user_id:
        account = db.query(GitHubAccount).filter(GitHubAccount.user_id == associated_user_id).first()

    if not account:
        account = db.query(GitHubAccount).filter(GitHubAccount.github_username == github_username).first()

    if account:
        account.github_username = github_username
        account.github_user_id = github_user_id
        account.encrypted_access_token = encrypted_token
        if associated_user_id:
            account.user_id = associated_user_id
    else:
        account = GitHubAccount(
            user_id=associated_user_id,
            github_username=github_username,
            github_user_id=github_user_id,
            encrypted_access_token=encrypted_token,
        )
        db.add(account)

    db.commit()
    db.refresh(account)

    return GitHubCallbackResponse(
        status="success",
        message="GitHub account successfully connected and encrypted token stored.",
        github_username=github_username,
        user_id=account.user_id,
    )
