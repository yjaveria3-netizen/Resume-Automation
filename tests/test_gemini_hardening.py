import pytest
from unittest.mock import patch, MagicMock
from services.gemini_client import (
    generate_bullets_with_retries,
    generate_local_fallback_bullets,
    is_retryable_error,
)
from services.gemini_prompt import validate_generated_bullet, sanitize_prompt_input


def test_is_retryable_error():
    assert is_retryable_error(Exception("429 Resource has been exhausted")) is True
    assert is_retryable_error(Exception("503 Service Unavailable")) is True
    assert is_retryable_error(Exception("Connection timeout")) is True
    assert is_retryable_error(Exception("401 Unauthorized API key")) is False
    assert is_retryable_error(Exception("403 Forbidden")) is False
    assert is_retryable_error(Exception("400 Bad Request")) is False


def test_gemini_retries_429_then_succeeds():
    """Mock Gemini client raising 429 once, then succeeding on retry."""
    with patch("services.gemini_client._call_single_model") as mock_call:
        mock_call.side_effect = [
            Exception("429 Too Many Requests"),
            "Engineered distributed task queue using Python and FastAPI."
        ]

        res = generate_bullets_with_retries(
            repo_name="task-runner",
            description="Task runner",
            tech_stack=["Python", "FastAPI"],
            commit_sha="c1",
        )

        assert res["source"] == "gemini"
        assert res["bullet"] == "Engineered distributed task queue using Python and FastAPI."
        assert mock_call.call_count == 2


def test_gemini_401_no_retry_falls_back():
    """Mock Gemini client raising 401: must NOT retry, falls back immediately."""
    with patch("services.gemini_client._call_single_model") as mock_call:
        mock_call.side_effect = Exception("401 Invalid API key")

        res = generate_bullets_with_retries(
            repo_name="task-runner",
            description="Task runner",
            tech_stack=["Python", "FastAPI"],
            commit_sha="c2",
        )

        assert res["source"] == "fallback"
        assert mock_call.call_count == 1
        assert "FastAPI" in res["bullet"]


def test_gemini_hallucinated_tech_rejected():
    """If Gemini returns a technology not in the provided tech stack, it is rejected and falls back."""
    with patch("services.gemini_client._call_single_model") as mock_call:
        # Output mentions Kubernetes and AWS, but tech stack only has Python and Flask
        mock_call.return_value = "Engineered cloud microservices using Kubernetes and AWS."

        res = generate_bullets_with_retries(
            repo_name="simple-api",
            description="Simple API",
            tech_stack=["Python", "Flask"],
            commit_sha="c3",
        )

        assert res["source"] == "fallback"
        assert "Kubernetes" not in res["bullet"]
        assert "AWS" not in res["bullet"]


def test_cache_hit_makes_zero_api_calls():
    """A cache hit returns cached bullet without invoking the Gemini client."""
    mock_db = MagicMock()
    mock_entry = MagicMock()
    mock_entry.bullets_json = '["Architected scalable cache layer using Redis."]'
    mock_db.query.return_value.filter.return_value.filter.return_value.first.return_value = mock_entry

    with patch("services.gemini_client._call_single_model") as mock_call:
        res = generate_bullets_with_retries(
            repo_name="cache-service",
            description="Cache",
            tech_stack=["Redis"],
            commit_sha="c4",
            db=mock_db,
        )

        assert res["source"] == "cache"
        assert res["bullet"] == "Architected scalable cache layer using Redis."
        assert mock_call.call_count == 0


def test_fallback_never_contains_invented_metrics_or_tech():
    """Local fallback generator must not claim invented metrics or unmentioned technologies."""
    bullet = generate_local_fallback_bullets("my-tool", ["Python", "Flask"])[0]
    assert "Python" in bullet
    assert "Flask" in bullet
    assert not any(metric in bullet for metric in ["45%", "10k", "99.9%", "$50k"])
    assert "Kubernetes" not in bullet
