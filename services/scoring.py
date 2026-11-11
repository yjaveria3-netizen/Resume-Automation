import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import docx

ACTION_VERBS = {
    "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
    "advanced", "advised", "aligned", "allocated", "analyzed", "architected",
    "assembled", "assessed", "automated", "built", "calculated", "centralized",
    "championed", "clarified", "collaborated", "compiled", "completed", "composed",
    "computed", "conceptualized", "conducted", "configured", "constructed", "containerized", "converted",
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

WEAK_STARTERS = [
    "worked on",
    "helped with",
    "helped to",
    "assisted with",
    "assisted in",
    "responsible for",
    "participated in",
    "involved in",
]

# Distinct technologies dictionary
TECH_KEYWORDS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "rust", "ruby",
    "php", "swift", "kotlin", "scala", "html", "css", "sql", "react", "next.js",
    "vue", "angular", "node.js", "fastapi", "flask", "django", "spring boot",
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "dynamodb",
    "kafka", "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "terraform",
    "gitlab", "ci/cd", "graphql", "grpc", "pytorch", "tensorflow", "scikit-learn",
    "opencv", "numpy", "pandas", "tailwind", "bootstrap", "clickhouse", "rabbitmq",
    "prometheus", "grafana", "linux", "elasticsearch", "helm", "ansible"
}

# Ambiguous words: only counted if capitalized in text or in a dedicated skills line
AMBIGUOUS_TECH = {"go", "rest", "git", "express"}

# True metrics attached to units/magnitude/changes; excludes years, dates, phone numbers
METRIC_UNIT_PATTERN = re.compile(
    r"""(?xi)
    \b(
        \d+(\.\d+)?\s*%\b                           # Percentages: 45%, 99.9%
      | \$\s*\d+[\d,]*(?:\.\d+)?\s*[kKmMbB]?\b      # Currencies: $10k, $500,000
      | \b\d+x\b                                    # Multipliers: 2x, 10x
      | \b\d+[\d,]*\+\b                             # Pluses: 50+, 1000+
      | \b\d+[\d,]*(?:\.\d+)?\s*(?:\w+\s+){0,3}(?:users?|customers?|clients?|requests?|req/s|rps|queries|events?|qps|ms|milliseconds?|seconds?|secs?|minutes?|hours?|hrs?|gb|tb|mb|tickets?|endpoints?|services?)\b
      | \b(?:by|reduced(?:\s+by)?|reducing(?:\s+by)?|increased(?:\s+by)?|increasing(?:\s+by)?|saved|saving|cut|cutting|slashed|slashing)\s+\$?\d+[\d,]*(?:\.\d+)?\b
    )
    """
)

# Year and phone number exclusions
EXCLUDE_NUMBERS_PATTERN = re.compile(
    r"\b(19\d\d|20\d\d|\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b"
)

SECTION_REGEX = re.compile(
    r"\b(Projects|Technical Projects|Experience|Work Experience|Professional Experience|Education|Skills|Technical Skills|Certifications)\b",
    re.IGNORECASE
)

CONTACT_REGEX = re.compile(
    r"(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|github\.com|linkedin\.com|\b\d{3}[-.]\d{3}[-.]\d{4}\b)",
    re.IGNORECASE
)


def compute_ats_score(docx_path: str, target_keywords: list = None) -> dict:
    """Calculates a calibrated 0-100 ATS score for a .docx resume with 4 core pillars:
    - Action Verbs (25 pts): Evaluates first word of bullet points; penalizes weak starters.
    - Quantifiable Metrics (25 pts): Evaluates distinct metric-bearing bullets (excludes years/phones).
    - Tech Stack Density (30 pts): Evaluates distinct technologies; detects and caps keyword stuffing.
    - Formatting Structure (20 pts): Required sections, bullet lengths, 1-page budget, and contact info.
    Returns: {score, score_label, breakdown, suggestions, offending_lines}
    """
    path = Path(docx_path)
    if not path.exists():
        return {
            "score": 0,
            "score_label": "Needs Work",
            "breakdown": {"action_verbs": 0, "metrics": 0, "tech_stack": 0, "structure": 0},
            "suggestions": ["File not found at specified path."],
            "offending_lines": []
        }

    try:
        doc = docx.Document(docx_path)
    except Exception as exc:
        return {
            "score": 0,
            "score_label": "Needs Work",
            "breakdown": {"action_verbs": 0, "metrics": 0, "tech_stack": 0, "structure": 0},
            "suggestions": [f"Could not parse document: {exc}"],
            "offending_lines": []
        }

    # Extract text from paragraphs and table cells
    all_paragraphs = []
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt:
            all_paragraphs.append((p, txt))

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    txt = p.text.strip()
                    if txt:
                        all_paragraphs.append((p, txt))

    if not all_paragraphs:
        return {
            "score": 0,
            "score_label": "Needs Work",
            "breakdown": {"action_verbs": 0, "metrics": 0, "tech_stack": 0, "structure": 0},
            "suggestions": ["Resume is completely empty."],
            "offending_lines": []
        }

    all_text_lines = [txt for _, txt in all_paragraphs]
    full_text = " ".join(all_text_lines)

    # Identify bullets and entry lines
    bullet_lines = []
    offending_lines = []
    for p, txt in all_paragraphs:
        style_name = (p.style.name if p.style else "").lower()
        is_bullet = (
            "bullet" in style_name
            or txt.startswith(("•", "-", "*"))
            or (p._p.pPr is not None and p._p.pPr.find(docx.oxml.ns.qn("w:numPr")) is not None)
            or (len(txt.split()) >= 8 and not SECTION_REGEX.search(txt) and not txt.endswith(":"))
        )
        if is_bullet:
            bullet_lines.append(txt)

    # 1. Action Verbs Evaluation (Max 25 pts)
    strong_starters_count = 0
    weak_starters_count = 0

    for line in bullet_lines:
        clean = line.lstrip("•-* \t").strip()
        if not clean:
            continue
        lower_clean = clean.lower()

        # Check for weak starter
        if any(lower_clean.startswith(ws) for ws in WEAK_STARTERS):
            weak_starters_count += 1
            offending_lines.append(line)
            continue

        first_word = re.findall(r"\b[a-zA-Z]+\b", clean)
        if first_word:
            fw = first_word[0].lower()
            if fw in ACTION_VERBS:
                strong_starters_count += 1
            else:
                offending_lines.append(line)

    # 5 strong verbs max out the 25 points; each weak starter deducts 3 points
    raw_verb_score = (strong_starters_count * 5) - (weak_starters_count * 3)
    verb_score = max(0, min(25, raw_verb_score))

    # 2. Quantifiable Metrics Evaluation (Max 25 pts)
    # Count distinct metric bullets, not raw matches
    metric_bullet_count = 0
    for line in bullet_lines:
        # Mask out 4-digit years and phone numbers
        line_clean = EXCLUDE_NUMBERS_PATTERN.sub("", line)
        if METRIC_UNIT_PATTERN.search(line_clean):
            metric_bullet_count += 1

    # Metric scoring with diminishing returns:
    # 1 metric bullet: 10 pts, 2: 16 pts, 3: 21 pts, 4+: 25 pts
    if metric_bullet_count == 0:
        metric_score = 0
    elif metric_bullet_count == 1:
        metric_score = 10
    elif metric_bullet_count == 2:
        metric_score = 16
    elif metric_bullet_count == 3:
        metric_score = 21
    else:
        metric_score = min(25, 21 + int((metric_bullet_count - 3) * 2))

    metric_score = int(round(metric_score))

    # 3. Tech Stack Density & Anti-Stuffing Evaluation (Max 30 pts)
    found_tech = set()
    full_lower = full_text.lower()

    for kw in TECH_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", full_lower):
            found_tech.add(kw)

    # Handle ambiguous words
    for kw in AMBIGUOUS_TECH:
        # If capitalized in the original text (e.g., 'Go', 'Git', 'REST')
        if re.search(r"\b" + re.escape(kw.capitalize()) + r"\b", full_text) or re.search(r"\b" + re.escape(kw.upper()) + r"\b", full_text):
            found_tech.add(kw)

    if target_keywords:
        for tk in target_keywords:
            if re.search(r"\b" + re.escape(tk.lower()) + r"\b", full_lower):
                found_tech.add(tk.lower())

    # Detect keyword stuffing:
    # If document has high density of keywords (>10) but very few sentences/bullets (<3)
    # or identical keywords repeated > 8 times without metrics or narrative
    word_count = len(full_text.split())
    is_keyword_stuffed = (len(found_tech) >= 8 and len(bullet_lines) <= 2) or (word_count > 0 and (len(found_tech) / float(word_count)) > 0.3)

    if is_keyword_stuffed:
        tech_score = 10  # Penalized
    else:
        tech_score = min(30, len(found_tech) * 3)

    # 4. Formatting Structure Evaluation (Max 20 pts)
    structure_score = 0
    found_sections = set(SECTION_REGEX.findall(full_text))
    # Major sections (Projects, Experience, Skills, Education): up to 8 pts
    structure_score += min(8, len(found_sections) * 2)

    # Contact info present: 3 pts
    if CONTACT_REGEX.search(full_text):
        structure_score += 3

    # Bullet length quality (8-35 words per bullet): up to 5 pts
    good_length_bullets = sum(1 for b in bullet_lines if 8 <= len(b.split()) <= 35)
    if bullet_lines:
        ratio = good_length_bullets / float(len(bullet_lines))
        structure_score += int(round(ratio * 5))

    # 1-page budget compliance: 4 pts
    from docx_engine.page_budget import calculate_document_line_budget
    budget = calculate_document_line_budget(doc)
    if budget["is_one_page_safe"]:
        structure_score += 4

    structure_score = min(20, structure_score)

    total_score = min(95, int(round(verb_score + metric_score + tech_score + structure_score)))

    # Determine score label: "Needs Work" (<60), "Good" (60-79), "Strong" (80-89), "Exceptional" (90+)
    if total_score >= 90:
        score_label = "Exceptional"
    elif total_score >= 80:
        score_label = "Strong"
    elif total_score >= 60:
        score_label = "Good"
    else:
        score_label = "Needs Work"

    suggestions = []
    if verb_score < 18:
        suggestions.append(f"Incorporate strong action verbs at the start of bullet points. Avoid weak starters like {', '.join(WEAK_STARTERS[:3])}.")
    if metric_score < 15:
        suggestions.append("Quantify accomplishments with numbers, percentages, dollar values, or user/request volumes (e.g., 'reduced latency by 35%').")
    if tech_score < 20:
        suggestions.append("Enhance technical keyword density by naming frameworks, databases, and tools used.")
    if structure_score < 15:
        suggestions.append("Ensure distinct section headings (Projects, Experience, Skills), contact info, and keep bullets between 8-35 words on 1 page.")

    return {
        "score": total_score,
        "score_label": score_label,
        "breakdown": {
            "action_verbs": verb_score,
            "metrics": metric_score,
            "tech_stack": tech_score,
            "structure": structure_score
        },
        "suggestions": suggestions if suggestions else ["Outstanding ATS alignment across action verbs, quantified metrics, tech stack, and document structure!"],
        "offending_lines": offending_lines[:5],
    }


from services.jd_matcher import compute_jd_match_score
