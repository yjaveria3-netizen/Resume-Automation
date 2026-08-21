import math
from datetime import datetime, timezone
from typing import Any, Dict, List


def rank_repositories(repos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Scores each repo (0-100 points) based on recency, description, tech stack tags, fork status, and stars."""
    ranked_repos = []
    now = datetime.now(timezone.utc)

    for repo in repos:
        score = 0.0

        # 1. Recency of push (+30 points for pushes within last 3 months / 90 days)
        pushed_at_raw = repo.get("pushed_at")
        if pushed_at_raw:
            try:
                if isinstance(pushed_at_raw, str):
                    # Parse ISO format (e.g. '2026-08-15T12:00:00Z')
                    pushed_dt = datetime.fromisoformat(pushed_at_raw.replace("Z", "+00:00"))
                else:
                    pushed_dt = pushed_at_raw

                if pushed_dt.tzinfo is None:
                    pushed_dt = pushed_dt.replace(tzinfo=timezone.utc)

                days_diff = (now - pushed_dt).days
                if days_diff <= 90:
                    score += 30.0
                elif days_diff <= 180:
                    score += 15.0
                elif days_diff <= 365:
                    score += 5.0
            except Exception:
                pass

        # 2. Non-empty description (+20 points)
        desc = (repo.get("description") or "").strip()
        if desc:
            score += 20.0

        # 3. Detected tech stack tags (+20 points for 3+ detected tags)
        tech_tags = []
        primary_lang = repo.get("language")
        if primary_lang:
            tech_tags.append(primary_lang)

        topics = repo.get("topics") or []
        for t in topics:
            if t and t not in tech_tags:
                tech_tags.append(t)

        if len(tech_tags) >= 3:
            score += 20.0
        elif len(tech_tags) == 2:
            score += 12.0
        elif len(tech_tags) == 1:
            score += 6.0

        # 4. Non-fork status (+15 points)
        is_fork = repo.get("fork", False)
        if not is_fork:
            score += 15.0

        # 5. Star count (+15 points max)
        stars = repo.get("stargazers_count", 0) or 0
        if stars > 0:
            # Scaled star score
            star_score = min(15.0, round(math.log2(stars + 1) * 4.5, 1))
            score += star_score

        # Cap score at 100
        final_score = min(100.0, round(score, 1))

        repo_copy = dict(repo)
        repo_copy["rank_score"] = final_score
        repo_copy["tech_stack"] = tech_tags
        ranked_repos.append(repo_copy)

    # Sort repositories descending by rank_score
    ranked_repos.sort(key=lambda r: r["rank_score"], reverse=True)
    return ranked_repos
