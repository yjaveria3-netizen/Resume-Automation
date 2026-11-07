import re
from pathlib import Path
from typing import Dict, Any, List
import docx
from services.scoring import TECH_KEYWORDS


def compute_jd_match_score(docx_path: str, job_description_text: str) -> Dict[str, Any]:
    """Compares uploaded resume text against a Job Description to compute a 0-100 match score,
    returning matched keywords, missing keywords, and actionable tailoring tips.
    """
    path = Path(docx_path)
    resume_text = ""
    if path.exists():
        try:
            doc = docx.Document(docx_path)
            paragraphs_text = [p.text for p in doc.paragraphs if p.text.strip()]
            tables_text = []
            for t in doc.tables:
                for row in t.rows:
                    for cell in row.cells:
                        tables_text.append(cell.text.strip())
            resume_text = " ".join(paragraphs_text + tables_text).lower()
        except Exception:
            resume_text = ""

    jd_lower = job_description_text.lower()
    
    # Extract keywords from JD that appear in our modern technical dictionary or common software terms
    jd_tokens = set(re.findall(r"\b[a-zA-Z0-9+#.-]+\b", jd_lower))
    
    # Identify target technical requirements mentioned in the JD
    relevant_jd_keywords = [
        kw for kw in TECH_KEYWORDS
        if re.search(r"\b" + re.escape(kw) + r"\b", jd_lower)
    ]

    # If few keywords detected from dictionary, extract high-frequency capitalized/technical terms from JD
    if len(relevant_jd_keywords) < 5:
        custom_candidates = set(re.findall(r"\b[a-z]{3,}\b", jd_lower)) - {
            "the", "and", "for", "with", "experience", "will", "our", "team", "years", "work", "role"
        }
        for cand in custom_candidates:
            if cand in jd_tokens and len(relevant_jd_keywords) < 12:
                relevant_jd_keywords.append(cand)

    matched = []
    missing = []

    for kw in relevant_jd_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", resume_text):
            matched.append(kw)
        else:
            missing.append(kw)

    total_kws = len(relevant_jd_keywords)
    if total_kws > 0:
        base_match = int((len(matched) / total_kws) * 100)
    else:
        base_match = 70

    score = max(20, min(95, base_match))

    recommendations = []
    if missing:
        top_missing = ", ".join(missing[:4])
        recommendations.append(f"Incorporate missing core technologies from JD: {top_missing}.")
    if score < 75:
        recommendations.append("Align project descriptions more closely with the specific requirements listed in the job post.")
    else:
        recommendations.append("Strong keyword alignment with the target job description!")

    return {
        "match_score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "recommendations": recommendations,
    }
