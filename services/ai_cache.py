import json
import hashlib
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.ai_cache import ProjectBulletCache


def generate_cache_key(repo_name: str, commit_sha: str, tech_stack: List[str]) -> str:
    """Computes a unique SHA-256 hash from repo_name, commit_sha, and sorted tech_stack."""
    tech_str = ",".join(sorted([t.lower() for t in (tech_stack or [])]))
    raw_data = f"{repo_name.lower()}:{commit_sha}:{tech_str}"
    return hashlib.sha256(raw_data.encode("utf-8")).hexdigest()


def get_cached_bullets(cache_key: str, db: Session) -> Optional[List[str]]:
    """Queries project_bullets_cache table for unexpired cached bullets matching cache_key."""
    now = datetime.now(timezone.utc)
    entry = (
        db.query(ProjectBulletCache)
        .filter(ProjectBulletCache.cache_key == cache_key)
        .filter(ProjectBulletCache.expires_at > now)
        .first()
    )
    if entry and entry.bullets_json:
        try:
            return json.loads(entry.bullets_json)
        except Exception:
            return None
    return None


def set_cached_bullets(
    cache_key: str,
    bullets: List[str],
    db: Session,
    ttl_hours: int = 72,
) -> ProjectBulletCache:
    """Stores generated bullets in project_bullets_cache table with a 72-hour expiration TTL."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=ttl_hours)
    bullets_json = json.dumps(bullets)

    # Delete existing cache entry if present
    existing = (
        db.query(ProjectBulletCache)
        .filter(ProjectBulletCache.cache_key == cache_key)
        .first()
    )
    if existing:
        existing.bullets_json = bullets_json
        existing.expires_at = expires_at
        entry = existing
    else:
        entry = ProjectBulletCache(
            cache_key=cache_key,
            bullets_json=bullets_json,
            created_at=now,
            expires_at=expires_at,
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)
    return entry
