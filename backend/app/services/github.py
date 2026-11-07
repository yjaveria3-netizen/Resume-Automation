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


async def fetch_commit_diff_summary(owner: str, repo: str, sha: str, access_token: str) -> Dict[str, Any]:
    """Fetches commit details and diff patch summary from GitHub API.
    Filters out lockfiles and binary assets, returning modified files, counts, and patch snippets.
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Resume-Auto-Updater",
    }
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(url, headers=headers)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with GitHub API: {str(exc)}",
            ) from exc

    if response.status_code != 200:
        # Fallback/stub structure if commit is unreachable or token is invalid
        return {
            "total_files_changed": 0,
            "additions": 0,
            "deletions": 0,
            "key_files": [],
            "diff_snippets": [],
            "raw_message": f"Could not fetch commit {sha}: {response.status_code}",
        }

    data = response.json()
    raw_files = data.get("files", [])
    
    ignored_patterns = (
        "package-lock.json",
        "poetry.lock",
        "yarn.lock",
        "pnpm-lock.yaml",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".ico",
    )

    total_additions = 0
    total_deletions = 0
    key_files = []
    diff_snippets = []

    for f in raw_files:
        filename = f.get("filename", "")
        if any(filename.lower().endswith(p) for p in ignored_patterns):
            continue

        adds = f.get("additions", 0)
        dels = f.get("deletions", 0)
        status_val = f.get("status", "modified")
        patch = f.get("patch", "")

        total_additions += adds
        total_deletions += dels
        key_files.append(filename)

        patch_lines = patch.splitlines()[:50]
        trimmed_patch = "\n".join(patch_lines)

        diff_snippets.append({
            "filename": filename,
            "status": status_val,
            "additions": adds,
            "deletions": dels,
            "patch": trimmed_patch,
        })

    return {
        "commit_sha": sha,
        "commit_message": data.get("commit", {}).get("message", ""),
        "total_files_changed": len(key_files),
        "additions": total_additions,
        "deletions": total_deletions,
        "key_files": key_files,
        "diff_snippets": diff_snippets,
    }
