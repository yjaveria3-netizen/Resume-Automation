import secrets
import urllib.parse
from uuid import UUID
from datetime import datetime, timedelta, timezone
from typing import Optional, Set
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.services.crypto import encrypt_token
from app.schemas.github import GitHubLoginResponse, GitHubCallbackResponse

router = APIRouter()

STATE_ALGORITHM = "HS256"
STATE_EXPIRE_MINUTES = 10
_used_state_nonces: Set[str] = set()


def create_oauth_state(user_id: UUID) -> str:
    """Generate a signed short-lived JWT OAuth state bound to user_id (exp=10 min)."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=STATE_EXPIRE_MINUTES)
    nonce = secrets.token_urlsafe(16)
    payload = {
        "sub": str(user_id),
        "nonce": nonce,
        "iat": now,
        "exp": expire,
        "type": "github_oauth_state",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=STATE_ALGORITHM)


def verify_oauth_state(state_token: str) -> UUID:
    """Verify OAuth state signature, expiry, and enforce single-use nonce."""
    if not state_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing OAuth state token",
        )
    try:
        payload = jwt.decode(state_token, settings.JWT_SECRET, algorithms=[STATE_ALGORITHM])
        if payload.get("type") != "github_oauth_state":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OAuth state token type",
            )
        nonce = payload.get("nonce")
        if not nonce:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OAuth state: missing nonce",
            )
        if nonce in _used_state_nonces:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth state token has already been used (single-use enforced)",
            )
        _used_state_nonces.add(nonce)

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OAuth state: missing subject claim",
            )
        return UUID(user_id_str)
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth state token has expired",
        ) from exc
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or forged OAuth state token: {exc}",
        ) from exc


@router.get("/login")
def github_login(
    redirect: bool = Query(False, description="If True, directly redirect browser to GitHub authorization page"),
    current_user: User = Depends(get_current_user),
):
    """Initiates GitHub OAuth flow. Requires authenticated JWT. Binds state token to current user."""
    client_id = settings.GITHUB_CLIENT_ID or "placeholder_github_client_id"
    state = create_oauth_state(current_user.id)

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


@router.get("/callback")
async def github_callback(
    request: Request,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    format: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Exchanges GitHub code for access token, verifies state, encrypts token, prevents account stealing."""
    is_json = (format == "json") or ("application/json" in request.headers.get("Accept", ""))

    # 1. Handle user denied / OAuth error parameter
    if error:
        detail_msg = f"GitHub OAuth Authorization Failed: {error_description or error}"
        if is_json:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail_msg)
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason={urllib.parse.quote(error)}"
        )

    # 2. Verify state token (signature, expiry, single-use, extract user_id)
    if not state:
        if is_json:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing 'state' parameter")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=missing_state")

    try:
        user_id = verify_oauth_state(state)
    except HTTPException as exc:
        if is_json:
            raise exc
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason={urllib.parse.quote(exc.detail)}"
        )

    if not code:
        if is_json:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing 'code' query parameter")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=missing_code")

    # Verify target user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        if is_json:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User associated with OAuth state not found")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=user_not_found")

    # 3. Exchange authorization code for access token
    token_url = "https://github.com/login/oauth/access_token"
    token_payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
    }
    headers = {"Accept": "application/json"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            token_response = await client.post(token_url, json=token_payload, headers=headers)
            token_data = token_response.json()
        except httpx.TimeoutException as exc:
            if is_json:
                raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="GitHub token exchange timed out") from exc
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=timeout")
        except Exception as exc:
            if is_json:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to connect to GitHub OAuth server: {exc}") from exc
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=gateway_error")

    if "error" in token_data or "access_token" not in token_data:
        err_msg = token_data.get("error_description", token_data.get("error", "Invalid code"))
        if is_json:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"GitHub token exchange failed: {err_msg}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=invalid_code")

    access_token = token_data["access_token"]

    # 4. Fetch GitHub user profile
    user_url = "https://api.github.com/user"
    user_headers = {
        "Authorization": f"Bearer {access_token}",
        "User-Agent": "Resume-Auto-Updater",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            user_response = await client.get(user_url, headers=user_headers)
            user_data = user_response.json()
        except httpx.TimeoutException as exc:
            if is_json:
                raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="GitHub profile fetch timed out") from exc
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=timeout")
        except Exception as exc:
            if is_json:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to fetch user profile: {exc}") from exc
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=gateway_error")

    if user_response.status_code != 200 or "login" not in user_data:
        if is_json:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to retrieve GitHub profile")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=profile_error")

    github_username = user_data["login"]
    github_user_id = str(user_data.get("id"))

    # 5. Prevent account hijacking: Never reassign an existing github_account row to a different user
    existing_by_gh = db.query(GitHubAccount).filter(
        (GitHubAccount.github_username == github_username) | (GitHubAccount.github_user_id == github_user_id)
    ).first()

    if existing_by_gh and existing_by_gh.user_id != user_id:
        if is_json:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"GitHub account '{github_username}' is already linked to another user.",
            )
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=error&reason=account_already_linked")

    # 6. Encrypt token using Fernet and upsert record
    encrypted_token = encrypt_token(access_token)

    account = db.query(GitHubAccount).filter(GitHubAccount.user_id == user_id).first()
    if account:
        account.github_username = github_username
        account.github_user_id = github_user_id
        account.encrypted_access_token = encrypted_token
    else:
        account = GitHubAccount(
            user_id=user_id,
            github_username=github_username,
            github_user_id=github_user_id,
            encrypted_access_token=encrypted_token,
        )
        db.add(account)

    db.commit()
    db.refresh(account)

    if is_json:
        return GitHubCallbackResponse(
            status="success",
            message="GitHub account successfully connected and encrypted token stored.",
            github_username=github_username,
            user_id=account.user_id,
        )

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?github=connected")


@router.get("/status")
def get_github_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check if the current authenticated user has a connected GitHub account."""
    account = db.query(GitHubAccount).filter(GitHubAccount.user_id == current_user.id).first()
    if not account:
        return {
            "is_connected": False,
            "github_username": None,
            "avatar_url": None,
            "connected_at": None,
        }

    return {
        "is_connected": True,
        "github_username": account.github_username,
        "avatar_url": f"https://github.com/{account.github_username}.png",
        "connected_at": account.updated_at.isoformat() if account.updated_at else None,
    }


@router.delete("/disconnect")
@router.post("/disconnect")
def disconnect_github(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disconnect/unlink GitHub account for current user."""
    account = db.query(GitHubAccount).filter(GitHubAccount.user_id == current_user.id).first()
    if account:
        db.delete(account)
        db.commit()

    return {"status": "success", "message": "GitHub account disconnected."}
