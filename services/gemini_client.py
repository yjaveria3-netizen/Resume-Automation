import os
import sys
import time
import logging
from typing import List, Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential_jitter, retry_if_exception
from dotenv import load_dotenv

from services.gemini_prompt import (
    build_specialized_system_prompt,
    build_diff_aware_prompt,
    validate_generated_bullet,
    normalize_tech_capitalization,
    generate_diff_fallback_bullet,
)
from services.ai_cache import generate_cache_key, get_cached_bullets, set_cached_bullets

load_dotenv()
logger = logging.getLogger("gemini_client")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()


def is_retryable_error(exception: Exception) -> bool:
    """Retries ONLY on transient 429/5xx, timeouts, or network errors.
    Does NOT retry on 400, 401, 403 (e.g. invalid API key or bad request)."""
    err_msg = str(exception).lower()
    if any(code in err_msg for code in ["401", "403", "400", "invalid api key", "unauthorized"]):
        return False
    if any(code in err_msg for code in ["429", "500", "502", "503", "504", "quota", "timeout", "network", "connect"]):
        return True
    # If status_code attribute exists on exception
    status_code = getattr(exception, "status_code", getattr(exception, "code", None))
    if status_code in [400, 401, 403]:
        return False
    if status_code in [429, 500, 502, 503, 504]:
        return True
    return False


def _call_single_model(model_name: str, prompt: str) -> str:
    """Calls Gemini API for a single model with generation config. Raises on failure."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured or is a placeholder")

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=GEMINI_API_KEY)
    config = types.GenerateContentConfig(
        temperature=0.2,
        top_p=0.8,
        max_output_tokens=120,
    )

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=config,
    )

    if response and response.text:
        return response.text.strip()
    raise RuntimeError(f"Empty response from Gemini model {model_name}")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential_jitter(initial=1, max=6),
    retry=retry_if_exception(is_retryable_error),
    reraise=True,
)
def _call_model_with_retries(model_name: str, prompt: str) -> str:
    """Wraps model call with tenacity retrying only on transient errors."""
    return _call_single_model(model_name, prompt)


def generate_local_fallback_bullets(repo_name: str, tech_stack: List[str], description: str = "") -> List[str]:
    """Generates a truthful, zero-hallucination local bullet point without claims of unverified metrics."""
    techs = ", ".join(tech_stack[:3]) if tech_stack else "core technologies"
    bullet = f"Architected and deployed {repo_name} using {techs} to automate system workflows."
    return [normalize_tech_capitalization(bullet)]


def generate_bullets_with_retries(
    repo_name: str,
    description: str,
    tech_stack: List[str],
    readme_text: str = "",
    commit_sha: str = "HEAD",
    diff_data: Optional[Dict[str, Any]] = None,
    db: Optional[Any] = None,
) -> Dict[str, Any]:
    """Public entrypoint for Gemini bullet synthesis:
    1. Checks ai_cache first -> returns immediately on hit with source='cache'.
    2. Builds diff-aware or repository prompt.
    3. Attempts calls across configured models (GEMINI_MODELS) with exponential backoff on 429/5xx.
    4. Post-validates the bullet against hallucinations, word count, and injection attempts.
    5. Caches valid output and returns structured result object.
    Never raises unhandled exceptions.
    """
    start_time = time.time()
    cache_key = generate_cache_key(repo_name, commit_sha, tech_stack)

    # 1. Check Cache
    cached = get_cached_bullets(cache_key, db=db)
    if cached and len(cached) > 0:
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "bullet": cached[0],
            "bullets": cached,
            "source": "cache",
            "model": "cached",
            "latency_ms": elapsed,
        }

    # 2. Select Prompt Template
    if diff_data:
        prompt = build_diff_aware_prompt(repo_name, description, diff_data, tech_stack)
    else:
        prompt = build_specialized_system_prompt(repo_name, description, tech_stack, readme_text)

    # 3. Model list from env
    env_models = os.getenv("GEMINI_MODELS", "gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash-latest")
    models = [m.strip() for m in env_models.split(",") if m.strip()]

    # 4. Attempt API Calls
    allowed_tech = list(tech_stack or [])
    if diff_data:
        for f in diff_data.get("key_files", []):
            allowed_tech.append(f)

    for model_name in models:
        try:
            raw_text = _call_model_with_retries(model_name, prompt)
            clean_bullet = raw_text.lstrip("-*• ").strip()
            clean_bullet = normalize_tech_capitalization(clean_bullet)

            # Post-validation
            if validate_generated_bullet(clean_bullet, allowed_tech_stack=allowed_tech):
                elapsed = int((time.time() - start_time) * 1000)
                set_cached_bullets(cache_key, [clean_bullet], db=db)
                return {
                    "bullet": clean_bullet,
                    "bullets": [clean_bullet],
                    "source": "gemini",
                    "model": model_name,
                    "latency_ms": elapsed,
                }
            else:
                logger.warning(f"Bullet from {model_name} failed validation: {clean_bullet}")
        except Exception as e:
            logger.warning(f"Model {model_name} attempt failed: {e}")
            if not is_retryable_error(e):
                # Fatal auth or client error: break out immediately and fall back
                break

    # 5. Deterministic fallback
    elapsed = int((time.time() - start_time) * 1000)
    if diff_data:
        fb_bullet = generate_diff_fallback_bullet(repo_name, description, diff_data, tech_stack)
    else:
        fb_bullet = generate_local_fallback_bullets(repo_name, tech_stack, description)[0]

    return {
        "bullet": fb_bullet,
        "bullets": [fb_bullet],
        "source": "fallback",
        "model": "local_fallback",
        "latency_ms": elapsed,
    }
