import re
from typing import List

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
