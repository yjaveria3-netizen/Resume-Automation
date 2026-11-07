import pytest
from services.gemini_prompt import (
    build_diff_aware_prompt,
    synthesize_bullet_from_diff,
    generate_diff_fallback_bullet,
)

SAMPLE_DIFF_REDIS = {
    "key_files": ["backend/app/cache/redis_client.py", "backend/app/main.py"],
    "diff_snippets": [
        {
            "filename": "backend/app/cache/redis_client.py",
            "status": "added",
            "additions": 45,
            "deletions": 0,
            "patch": """
+import redis.asyncio as aioredis
+from fastapi import FastAPI
+
+redis_pool = aioredis.from_url("redis://localhost:6379", decode_responses=True)
+
+async def get_cached_item(key: str):
+    return await redis_pool.get(key)
            """.strip()
        }
    ]
}

SAMPLE_DIFF_DOCKER = {
    "key_files": ["Dockerfile", "docker-compose.yml", "k8s/deployment.yaml"],
    "diff_snippets": [
        {
            "filename": "Dockerfile",
            "status": "modified",
            "additions": 20,
            "deletions": 5,
            "patch": "+FROM python:3.11-slim\n+RUN pip install fastapi uvicorn\n+CMD ['uvicorn', 'main:app']"
        }
    ]
}

SAMPLE_DIFF_SQL = {
    "key_files": ["migrations/004_add_indexes.sql"],
    "diff_snippets": [
        {
            "filename": "migrations/004_add_indexes.sql",
            "status": "added",
            "additions": 15,
            "deletions": 0,
            "patch": "+CREATE INDEX idx_user_email ON users(email);\n+CREATE INDEX idx_proj_rank ON projects(rank_score);"
        }
    ]
}

SAMPLE_DIFF_AUTH = {
    "key_files": ["app/middleware/auth.py"],
    "diff_snippets": [
        {
            "filename": "app/middleware/auth.py",
            "status": "modified",
            "additions": 30,
            "deletions": 8,
            "patch": "+from jose import jwt\n+def verify_jwt_token(token: str):\n+    return jwt.decode(token, SECRET)"
        }
    ]
}

SAMPLE_DIFF_TESTS = {
    "key_files": ["tests/test_api.py"],
    "diff_snippets": [
        {
            "filename": "tests/test_api.py",
            "status": "added",
            "additions": 60,
            "deletions": 0,
            "patch": "+def test_endpoint():\n+    res = client.get('/health')\n+    assert res.status_code == 200"
        }
    ]
}


def test_sparse_commit_wip_redis():
    """Verify that a sparse commit message 'wip' produces an impact bullet referencing Redis and FastAPI."""
    bullet = synthesize_bullet_from_diff(
        repo_name="distributed-task-runner",
        commit_msg="wip",
        diff_data=SAMPLE_DIFF_REDIS,
        tech_stack=["Python", "FastAPI", "Redis"],
    )
    assert any(verb in bullet for verb in ["Engineered", "Architected", "Implemented", "Integrated"])
    assert "Redis" in bullet
    words = bullet.split()
    assert len(words) <= 28, f"Bullet should be under 28 words, got {len(words)}"


def test_sparse_commit_fix_bug():
    """Verify that a sparse commit message 'fix bug' with docker patch synthesizes docker/kubernetes bullet."""
    bullet = synthesize_bullet_from_diff(
        repo_name="cloud-infra",
        commit_msg="fix bug",
        diff_data=SAMPLE_DIFF_DOCKER,
        tech_stack=["Docker", "Kubernetes"],
    )
    assert any(verb in bullet for verb in ["Containerized", "Engineered", "Configured", "Implemented"])
    assert "Docker" in bullet or "Kubernetes" in bullet
    assert len(bullet.split()) <= 28


def test_sparse_commit_changes_sql():
    """Verify that 'changes' with SQL migration generates database indexing bullet."""
    bullet = synthesize_bullet_from_diff(
        repo_name="core-db",
        commit_msg="changes",
        diff_data=SAMPLE_DIFF_SQL,
        tech_stack=["PostgreSQL", "SQL"],
    )
    assert any(verb in bullet for verb in ["Implemented", "Engineered", "Architected"])
    assert "PostgreSQL" in bullet or "database" in bullet.lower()
    assert len(bullet.split()) <= 28


def test_sparse_commit_asdf_auth():
    """Verify that 'asdf' with auth middleware patch generates secure authentication bullet."""
    bullet = synthesize_bullet_from_diff(
        repo_name="auth-service",
        commit_msg="asdf",
        diff_data=SAMPLE_DIFF_AUTH,
        tech_stack=["Python", "FastAPI"],
    )
    assert any(verb in bullet for verb in ["Architected", "Engineered", "Implemented", "Secured"])
    assert "auth" in bullet.lower() or "authentication" in bullet.lower()
    assert len(bullet.split()) <= 28


def test_sparse_commit_update_tests():
    """Verify that 'update' with test suite generates testing bullet."""
    bullet = synthesize_bullet_from_diff(
        repo_name="api-service",
        commit_msg="update",
        diff_data=SAMPLE_DIFF_TESTS,
        tech_stack=["Python", "Pytest"],
    )
    assert any(verb in bullet for verb in ["Implemented", "Engineered", "Built"])
    assert "test" in bullet.lower() or "reliability" in bullet.lower()
    assert len(bullet.split()) <= 28


def test_diff_aware_prompt_structure():
    """Verify prompt formatting and instruction containment."""
    prompt = build_diff_aware_prompt(
        repo_name="cache-api",
        commit_msg="wip",
        diff_data=SAMPLE_DIFF_REDIS,
        tech_stack=["FastAPI", "Redis"],
    )
    assert "under 28 words" in prompt
    assert "X-Y-Z formula" in prompt
    assert "Code Patch Snippets" in prompt
    assert "redis://localhost:6379" in prompt
