from typing import Any, Dict, List
import httpx
from fastapi import HTTPException, status


async def fetch_user_repos(access_token: str) -> List[Dict[str, Any]]:
    """Fetches user repositories from GitHub API using the user's OAuth access token."""
    url = "https://api.github.com/user/repos?sort=pushed&per_page=50"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Resume-Auto-Updater",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with GitHub API: {str(exc)}",
            ) from exc

    if response.status_code == 401:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired GitHub access token. Please reconnect your GitHub account.",
        )

    if response.status_code == 403:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="GitHub API rate limit exceeded or access forbidden.",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub API returned error code {response.status_code}: {response.text}",
        )

    raw_repos = response.json()
    extracted_repos = []

    for repo in raw_repos:
        extracted_repos.append({
            "id": repo.get("id"),
            "name": repo.get("name", ""),
            "full_name": repo.get("full_name", ""),
            "description": repo.get("description"),
            "html_url": repo.get("html_url", ""),
            "stargazers_count": repo.get("stargazers_count", 0),
            "language": repo.get("language"),
            "topics": repo.get("topics", []) or [],
            "fork": repo.get("fork", False),
            "pushed_at": repo.get("pushed_at"),
            "created_at": repo.get("created_at"),
            "updated_at": repo.get("updated_at"),
        })

    return extracted_repos
