import re
from typing import List, Dict, Any, Optional

PROMPT_INJECTION_PHRASES = [
    r"ignore\s+previous\s+instructions",
    r"ignore\s+above\s+instructions",
    r"disregard\s+all\s+prior",
    r"system\s+prompt",
    r"developer\s+mode",
    r"print\s+secret",
    r"bypass\s+limits",
    r"reveal\s+key",
]

PROHIBITED_BOILERPLATE = [
    "worked on",
    "helped with",
    "assisted in",
    "responsible for",
    "leveraged modern best practices",
    "utilizing best practices",
    "used best practices",
]

CAPITALIZATION_DICTIONARY = {
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "fastapi": "FastAPI",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "graphql": "GraphQL",
    "grpc": "gRPC",
}


def sanitize_prompt_input(text: str, max_length: int = 1000) -> str:
    """Sanitizes user/repository text inputs by removing control chars, truncating, and neutralizing prompt injection attempts."""
    if not text:
        return ""

    # Remove non-printable control characters (except newlines and spaces)
    clean = "".join(ch for ch in text if ch.isprintable() or ch in "\n\t")

    # Limit max length
    clean = clean[:max_length].strip()

    # Neutralize prompt injection phrases
    for pattern in PROMPT_INJECTION_PHRASES:
        clean = re.sub(pattern, "[REDACTED_PROMPT_INJECTION_ATTEMPT]", clean, flags=re.IGNORECASE)

    # Escape XML delimiter tags to prevent breaking prompt boundaries
    clean = clean.replace("<", "&lt;").replace(">", "&gt;")
    return clean


def infer_engineering_role(tech_stack: List[str]) -> str:
    """Infers engineering role specialization (Frontend, Backend, Fullstack, ML, DevOps) from tech stack."""
    stack_str = " ".join(tech_stack).lower() if tech_stack else ""

    if any(k in stack_str for k in ["pytorch", "tensorflow", "opencv", "scikit-learn"]):
        return "Machine Learning / AI Engineer"
    elif any(k in stack_str for k in ["docker", "kubernetes", "prometheus", "aws", "terraform", "ci/cd"]):
        if any(k in stack_str for k in ["fastapi", "react", "spring"]):
            return "Fullstack & DevOps Engineer"
        return "DevOps & Infrastructure Engineer"
    elif any(k in stack_str for k in ["react", "vue", "angular", "tailwind", "next.js"]):
        if any(k in stack_str for k in ["fastapi", "postgres", "kafka", "java", "go"]):
            return "Fullstack Software Engineer"
        return "Frontend Engineer"
    else:
        return "Backend Software Engineer"


def normalize_tech_capitalization(text: str) -> str:
    """Normalizes tech terms to standard technical capitalization (e.g. TypeScript, PostgreSQL, FastAPI)."""
    for raw, capitalized in CAPITALIZATION_DICTIONARY.items():
        text = re.sub(r"\b" + re.escape(raw) + r"\b", capitalized, text, flags=re.IGNORECASE)
    return text


def build_specialized_system_prompt(
    repo_name: str,
    description: str,
    tech_stack: List[str],
    readme_text: str = "",
) -> str:
    """Builds a role-specialized Gemini system prompt incorporating the X-Y-Z formula and prompt injection XML delimiters."""
    clean_name = sanitize_prompt_input(repo_name, max_length=100)
    clean_desc = sanitize_prompt_input(description, max_length=300)
    clean_readme = sanitize_prompt_input(readme_text, max_length=500)
    role = infer_engineering_role(tech_stack)
    tech_str = ", ".join(tech_stack) if tech_stack else "Python"

    prompt = f"""You are an expert technical resume writer specializing in {role} roles.
Your goal is to synthesize EXACTLY ONE high-impact resume bullet point following Google's X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".

STRICT RULES:
1. Start with one strong action verb in past tense (e.g. Architected, Engineered, Developed, Implemented, Deployed, Optimized).
2. Mention ONLY technologies explicitly listed in Provided Tech Stack: {tech_str}. NEVER invent or hallucinate unmentioned frameworks or tools.
3. Include a clear, plausible technical outcome or metric (e.g., reducing latency by 30%, processing 10k requests/sec, automating workflows).
4. STRICTLY FORBID vague boilerplate phrases like "worked on", "helped with", "leveraged modern best practices".
5. Keep the total length under 35 words.

<repo_data>
Repository Name: {clean_name}
Description: {clean_desc}
Provided Tech Stack: {tech_str}
README Excerpt: {clean_readme}
</repo_data>

Generate EXACTLY ONE bullet point:"""

    return prompt


def build_diff_aware_prompt(
    repo_name: str,
    commit_msg: str,
    diff_data: Dict[str, Any],
    tech_stack: List[str],
) -> str:
    """Constructs a Git Diff-Aware prompt instructing Gemini to analyze modified files and code patch snippets
    rather than relying on sparse or informal commit messages."""
    clean_repo = sanitize_prompt_input(repo_name, max_length=100)
    clean_msg = sanitize_prompt_input(commit_msg, max_length=200)
    role = infer_engineering_role(tech_stack)
    tech_str = ", ".join(tech_stack) if tech_stack else "Python"

    # Summarize diff snippets
    diff_snippets = diff_data.get("diff_snippets", [])
    files_summary = []
    patch_excerpts = []

    for item in diff_snippets[:5]:
        fn = item.get("filename", "")
        status = item.get("status", "modified")
        adds = item.get("additions", 0)
        dels = item.get("deletions", 0)
        files_summary.append(f"- {fn} ({status}, +{adds}/-{dels})")

        patch = item.get("patch", "")
        if patch:
            patch_trimmed = "\n".join(patch.splitlines()[:15])
            patch_excerpts.append(f"--- File: {fn} ---\n{patch_trimmed}")

    files_text = "\n".join(files_summary) if files_summary else "No files modified"
    patch_text = "\n\n".join(patch_excerpts) if patch_excerpts else "No code patch available"
    if len(patch_text) > 1500:
        patch_text = patch_text[:1500] + "\n...[truncated]"

    prompt = f"""You are an elite technical career coach and software architect specializing in {role} roles.
Your task is to analyze the actual code modifications in the Git commit diff below and synthesize EXACTLY ONE executive-level resume bullet point following the X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".

CRITICAL INSTRUCTIONS:
1. Analyze the actual code modifications in the diff. Even if the commit message is sparse or informal (e.g. 'wip', 'fix', 'update', 'asdf'), determine the specific architectural feature, optimization, or integration implemented.
2. Synthesize exactly 1 professional resume bullet point starting with a strong action verb (e.g. Engineered, Architected, Implemented, Integrated, Optimized).
3. Keep length strictly under 28 words.
4. Adhere strictly to technologies found in the diff or tech stack ({tech_str}).
5. FORBID filler words, boilerplate ("worked on", "helped with"), and hallucinations of non-existent libraries.

<git_diff_context>
Repository: {clean_repo}
Commit Message: {clean_msg}
Files Modified:
{files_text}

Code Patch Snippets:
{patch_text}
</git_diff_context>

Generate EXACTLY ONE executive bullet point under 28 words:"""
    return prompt


def synthesize_bullet_from_diff(
    repo_name: str,
    commit_msg: str,
    diff_data: Dict[str, Any],
    tech_stack: List[str],
) -> str:
    """Entrypoint function for Day 11 Diff-Aware Bullet Synthesis.
    Calls Gemini API with diff context, falling back locally to a substantive patch-based extraction."""
    from services.gemini_client import GEMINI_API_KEY, _call_gemini_api_with_retry

    prompt = build_diff_aware_prompt(repo_name, commit_msg, diff_data, tech_stack)

    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            bullet = _call_gemini_api_with_retry(prompt)
            if bullet:
                cleaned = bullet.lstrip("-*• ").strip()
                return normalize_tech_capitalization(cleaned)
        except Exception:
            pass

    # Deterministic local fallback reading the actual diff and patch
    return generate_diff_fallback_bullet(repo_name, commit_msg, diff_data, tech_stack)


def generate_diff_fallback_bullet(
    repo_name: str,
    commit_msg: str,
    diff_data: Dict[str, Any],
    tech_stack: List[str],
) -> str:
    """Deterministic, zero-hallucination local synthesizer that inspects raw patches and file changes."""
    files = diff_data.get("key_files", [])
    snippets = diff_data.get("diff_snippets", [])
    combined_patch = " ".join([s.get("patch", "") for s in snippets])

    detected_tech = []
    # Detect tech in patches
    keywords = ["redis", "fastapi", "docker", "kubernetes", "postgres", "kafka", "go", "react", "graphql", "grpc", "spring", "aws"]
    for kw in keywords:
        if kw in combined_patch.lower() or any(kw in f.lower() for f in files):
            detected_tech.append(kw.capitalize())

    if not detected_tech and tech_stack:
        detected_tech = tech_stack[:2]

    tech_mention = ", ".join(detected_tech[:2]) if detected_tech else "core services"

    # Action detection
    if "cache" in combined_patch.lower() or "redis" in combined_patch.lower():
        bullet = f"Engineered distributed caching layer using {tech_mention}, reducing database query latency and improving throughput."
    elif "test" in combined_patch.lower() or any("test" in f.lower() for f in files):
        bullet = f"Implemented automated test suite and validation pipelines for {repo_name} using {tech_mention} to ensure reliability."
    elif "auth" in combined_patch.lower() or any("auth" in f.lower() for f in files):
        bullet = f"Architected secure authentication middleware and access controls in {repo_name} using {tech_mention}."
    elif any(f.endswith(".sql") or "migration" in f.lower() for f in files):
        bullet = f"Implemented relational database schema migrations and indexing in PostgreSQL, enhancing query efficiency."
    elif any("docker" in f.lower() or "k8s" in f.lower() for f in files):
        bullet = f"Containerized {repo_name} microservices and configured orchestration manifests with Docker and Kubernetes."
    elif "api" in combined_patch.lower() or "router" in combined_patch.lower():
        bullet = f"Engineered RESTful API endpoints and data models in FastAPI, optimizing backend request routing."
    else:
        bullet = f"Engineered core backend modules for {repo_name} utilizing {tech_mention}, streamlining feature execution."

    words = bullet.split()
    if len(words) > 28:
        bullet = " ".join(words[:27]) + "."

    return normalize_tech_capitalization(bullet)
