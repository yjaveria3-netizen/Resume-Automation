import json
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Any


def generate_cache_key(
    repo_name: str,
    commit_sha: str,
    tech_stack: List[str],
    prompt_version: str = "v1.1",
) -> str:
    """Computes a deterministic SHA-256 hash from repo_name, commit_sha, sorted tech_stack, and prompt_version."""
    tech_str = ",".join(sorted([t.lower() for t in (tech_stack or [])]))
    raw_data = f"{repo_name.lower().strip()}:{commit_sha.strip()}:{tech_str}:{prompt_version}"
    return hashlib.sha256(raw_data.encode("utf-8")).hexdigest()


def get_cached_bullets(cache_key: str, db: Optional[Any] = None) -> Optional[List[str]]:
    """Queries project_bullets_cache table for unexpired cached bullets matching cache_key."""
    if db is None:
        return None

    try:
        from app.models.ai_cache import ProjectBulletCache
        now = datetime.now(timezone.utc)
        entry = (
            db.query(ProjectBulletCache)
            .filter(ProjectBulletCache.cache_key == cache_key)
            .filter(ProjectBulletCache.expires_at > now)
            .first()
        )
        if entry and entry.bullets_json:
            return json.loads(entry.bullets_json)
    except Exception:
        pass
    return None


def set_cached_bullets(
    cache_key: str,
    bullets: List[str],
    db: Optional[Any] = None,
    ttl_hours: int = 72,
) -> bool:
    """Stores generated bullets in project_bullets_cache table with a 72-hour expiration TTL."""
    if db is None or not bullets:
        return False

    try:
        from app.models.ai_cache import ProjectBulletCache
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(hours=ttl_hours)
        bullets_json = json.dumps(bullets)

        existing = (
            db.query(ProjectBulletCache)
            .filter(ProjectBulletCache.cache_key == cache_key)
            .first()
        )
        if existing:
            existing.bullets_json = bullets_json
            existing.expires_at = expires_at
        else:
            new_entry = ProjectBulletCache(
                cache_key=cache_key,
                bullets_json=bullets_json,
                expires_at=expires_at,
            )
            db.add(new_entry)
        db.commit()
        return True
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        return False
