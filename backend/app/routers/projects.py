from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.models.project import Project
from app.schemas.project import ProjectResponse
from app.services.crypto import decrypt_token
from app.services.github import fetch_user_repos
from app.services.ranking import rank_repositories

router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetches user's GitHub repos, ranks them, upserts top projects into DB, and returns sorted project list."""

    # 1. Lookup GitHub account for authenticated user
    github_account = (
        db.query(GitHubAccount)
        .filter(GitHubAccount.user_id == current_user.id)
        .first()
    )

    if not github_account or not github_account.encrypted_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account not connected. Please connect your GitHub account first.",
        )

    # 2. Decrypt GitHub OAuth access token
    try:
        access_token = decrypt_token(github_account.encrypted_access_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to decrypt GitHub access token: {str(exc)}",
        ) from exc

    # 3. Fetch user repositories from GitHub API
    raw_repos = await fetch_user_repos(access_token)

    if not raw_repos:
        # Return empty list if user has no repositories
        return []

    # 4. Rank repositories using algorithm
    ranked_repos = rank_repositories(raw_repos)

    # 5. Select top 10 ranked projects
    top_projects = ranked_repos[:10]
    saved_projects = []
    now = datetime.now(timezone.utc)

    # 6. Upsert top projects into database
    for r in top_projects:
        repo_name = r["name"]

        # Parse pushed_at timestamp
        pushed_at_dt = None
        if r.get("pushed_at"):
            try:
                pushed_raw = r["pushed_at"]
                if isinstance(pushed_raw, str):
                    pushed_at_dt = datetime.fromisoformat(pushed_raw.replace("Z", "+00:00"))
                else:
                    pushed_at_dt = pushed_raw
            except Exception:
                pushed_at_dt = None

        # Check existing project record in DB
        existing_proj = (
            db.query(Project)
            .filter(Project.user_id == current_user.id, Project.github_repo_name == repo_name)
            .first()
        )

        if existing_proj:
            existing_proj.description = r.get("description")
            existing_proj.html_url = r.get("html_url")
            existing_proj.language = r.get("language")
            existing_proj.tech_stack = r.get("tech_stack")
            existing_proj.stars = r.get("stargazers_count", 0)
            existing_proj.rank_score = r.get("rank_score", 0.0)
            existing_proj.pushed_at = pushed_at_dt
            existing_proj.fetched_at = now
            project_record = existing_proj
        else:
            project_record = Project(
                user_id=current_user.id,
                github_repo_name=repo_name,
                description=r.get("description"),
                html_url=r.get("html_url"),
                language=r.get("language"),
                tech_stack=r.get("tech_stack"),
                stars=r.get("stargazers_count", 0),
                rank_score=r.get("rank_score", 0.0),
                pushed_at=pushed_at_dt,
                fetched_at=now,
            )
            db.add(project_record)

        saved_projects.append(project_record)

    db.commit()

    for p in saved_projects:
        db.refresh(p)

    # Sort saved projects descending by rank_score before returning
    saved_projects.sort(key=lambda p: p.rank_score, reverse=True)
    return saved_projects
