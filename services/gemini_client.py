import os
import sys
import logging
from typing import List
from tenacity import retry, stop_after_attempt, wait_exponential_jitter, retry_if_exception_type
from dotenv import load_dotenv

from services.gemini_prompt import build_specialized_system_prompt, normalize_tech_capitalization

load_dotenv()
logger = logging.getLogger("gemini_client")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()


def generate_local_fallback_bullets(repo_name: str, tech_stack: List[str], description: str) -> List[str]:
    """Generates high-quality algorithmic bullet points locally without external API calls as a 100% reliable fallback."""
    techs = ", ".join(tech_stack[:3]) if tech_stack else "modern tech stack"
    bullet = f"Architected and deployed {repo_name} using {techs} to automate core workflows and optimize system performance."
    return [normalize_tech_capitalization(bullet)]


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential_jitter(initial=1, max=10),
    reraise=False,
)
def _call_gemini_api_with_retry(prompt: str) -> str:
    """Internal function wrapping Gemini API call with exponential jitter backoff retries using tenacity."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY not configured")

    from google import genai
    client = genai.Client(api_key=GEMINI_API_KEY)

    for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API attempt on model {model_name} failed: {e}")
            continue

    raise RuntimeError("All Gemini API models failed")


def generate_bullets_with_retries(
    repo_name: str,
    description: str,
    tech_stack: List[str],
    readme_text: str = "",
) -> List[str]:
    """Generates resume bullets using Gemini API with exponential retry backoff and local fallback protection."""
    prompt = build_specialized_system_prompt(repo_name, description, tech_stack, readme_text)

    try:
        raw_output = _call_gemini_api_with_retry(prompt)
        if raw_output:
            bullet_clean = raw_output.lstrip("-*• ").strip()
            bullet_clean = normalize_tech_capitalization(bullet_clean)
            return [bullet_clean]
    except Exception as exc:
        logger.warning(f"Gemini generation failed after retries ({exc}); using local fallback generator.")

    return generate_local_fallback_bullets(repo_name, tech_stack, description)
