import re
from pathlib import Path
import docx

ACTION_VERBS = {
    "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
    "advanced", "advised", "aligned", "allocated", "analyzed", "architected",
    "assembled", "assessed", "automated", "built", "calculated", "centralized",
    "championed", "clarified", "collaborated", "compiled", "completed", "composed",
    "computed", "conceptualized", "conducted", "configured", "constructed", "converted",
    "coordinated", "created", "customized", "debugged", "decreased", "defined",
    "delivered", "deployed", "designed", "developed", "devised", "diagnosed",
    "directed", "discovered", "documented", "drafted", "drove", "eliminated",
    "empowered", "enabled", "engineered", "enhanced", "established", "evaluated",
    "executed", "expanded", "expedited", "fabricated", "facilitated", "formulated",
    "fostered", "generated", "guided", "handled", "identified", "implemented",
    "improved", "increased", "initiated", "innovated", "inspected", "installed",
    "instituted", "integrated", "introduced", "invented", "launched", "led",
    "leveraged", "maintained", "managed", "maximized", "migrated", "minimized",
    "modeled", "modernized", "monitored", "negotiated", "optimized", "orchestrated",
    "organized", "overhauled", "performed", "pioneered", "planned", "prepared",
    "produced", "programmed", "promoted", "provided", "published", "rearchitected",
    "redesigned", "refactored", "refined", "reformatted", "reorganized", "replaced",
    "restructured", "revamped", "reviewed", "revitalized", "scaled", "scheduled",
    "secured", "simplified", "spearheaded", "standardized", "streamlined", "structured",
    "supervised", "supported", "surpassed", "synthesized", "systematized", "tested",
    "tracked", "trained", "transformed", "troubleshot", "unified", "updated",
    "upgraded", "validated", "verified"
}

TECH_KEYWORDS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby",
    "php", "swift", "kotlin", "scala", "html", "css", "sql", "react", "next.js",
    "vue", "angular", "node.js", "express", "fastapi", "flask", "django", "spring boot",
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "dynamodb",
    "kafka", "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "terraform",
    "git", "github", "gitlab", "ci/cd", "rest", "graphql", "grpc", "pytorch",
    "tensorflow", "scikit-learn", "opencv", "numpy", "pandas", "tailwind", "bootstrap"
}

METRICS_REGEX = re.compile(
    r"\b(\d+(\.\d+)?%|\$\d+[\d,]*[kKmMbB]?|\d+x|\d+\+|\d+\s*users?|\d+\s*ms|\d+\s*seconds?|\d+\s*hours?|\d+\s*requests?|\d+[\d,]*)\b",
    re.IGNORECASE
)

SECTION_REGEX = re.compile(
    r"\b(Projects|Technical Projects|Experience|Work Experience|Education|Skills|Technical Skills|Certifications)\b",
    re.IGNORECASE
)


def compute_ats_score(docx_path: str, target_keywords: list = None) -> dict:
    """Calculates a 0-100 ATS score for a .docx resume based on Action Verbs, Quantifiable Metrics, Tech Stack Density, and Formatting Structure."""
    path = Path(docx_path)
    if not path.exists():
        return {
            "score": 0,
            "breakdown": {"action_verbs": 0, "metrics": 0, "tech_stack": 0, "structure": 0},
            "suggestions": ["File not found at specified path."]
        }

    try:
        doc = docx.Document(docx_path)
    except Exception as exc:
        return {
            "score": 0,
            "breakdown": {"action_verbs": 0, "metrics": 0, "tech_stack": 0, "structure": 0},
            "suggestions": [f"Could not parse document: {exc}"]
        }

    # Extract text from paragraphs and table cells
    all_text_lines = []
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt:
            all_text_lines.append(txt)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    txt = p.text.strip()
                    if txt:
                        all_text_lines.append(txt)

    full_text = " ".join(all_text_lines)
    words = re.findall(r"\b[a-zA-Z0-9+#.-]+\b", full_text.lower())

    if not words:
        return {
            "score": 0,
            "breakdown": {"action_verbs": 0, "metrics": 0, "tech_stack": 0, "structure": 0},
            "suggestions": ["Resume is completely empty."]
        }

    # 1. Action Verbs Evaluation (max 25 pts)
    found_verbs = set(w for w in words if w in ACTION_VERBS)
    verb_score = min(25, len(found_verbs) * 4)

    # 2. Quantifiable Metrics Evaluation (max 25 pts)
    found_metrics = METRICS_REGEX.findall(full_text)
    metric_score = min(25, len(found_metrics) * 5)

    # 3. Tech Stack Density Evaluation (max 30 pts)
    tech_set = set(TECH_KEYWORDS)
    if target_keywords:
        tech_set.update(k.lower() for k in target_keywords)

    found_tech = set()
    for kw in tech_set:
        if re.search(r"\b" + re.escape(kw) + r"\b", full_text, re.IGNORECASE):
            found_tech.add(kw)

    tech_score = min(30, len(found_tech) * 5)

    # 4. Formatting Structure Evaluation (max 20 pts)
    structure_score = 0
    found_sections = set(SECTION_REGEX.findall(full_text))
    structure_score += min(12, len(found_sections) * 3)

    bullet_lines = [line for line in all_text_lines if line.startswith(("•", "-", "*")) or len(line.split()) >= 10]
    good_bullets = sum(1 for line in bullet_lines if 10 <= len(line.split()) <= 40)
    structure_score += min(8, good_bullets * 2)

    total_score = min(100, int(round(verb_score + metric_score + tech_score + structure_score)))

    suggestions = []
    if verb_score < 18:
        suggestions.append("Incorporate more strong action verbs (e.g., Architected, Engineered, Optimized) at the start of bullet points.")
    if metric_score < 15:
        suggestions.append("Add quantifiable metrics and numbers (e.g., percentages, performance gains, dollar values, user counts).")
    if tech_score < 20:
        suggestions.append("Increase technical keyword density by explicitly naming frameworks, databases, and cloud services used.")
    if structure_score < 15:
        suggestions.append("Ensure clear section headings (Projects, Experience, Skills) and balanced bullet lengths (15-35 words).")

    return {
        "score": total_score,
        "breakdown": {
            "action_verbs": verb_score,
            "metrics": metric_score,
            "tech_stack": tech_score,
            "structure": structure_score
        },
        "suggestions": suggestions if suggestions else ["Great job! Your resume demonstrates strong action verbs, technical terms, and metrics."]
    }
