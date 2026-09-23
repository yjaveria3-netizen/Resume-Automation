import re

PROJECTS_HEADING_REGEX = re.compile(
    r"\b(Projects|Technical Projects|Key Projects|Personal Projects|Selected Projects)\b",
    re.IGNORECASE,
)

SUBSEQUENT_HEADING_REGEX = re.compile(
    r"\b(Experience|Work Experience|Professional Experience|Education|Skills|Technical Skills|Certifications|Licenses|Honors|Awards)\b",
    re.IGNORECASE,
)


def find_projects_section_index(doc) -> int:
    """Searches doc.paragraphs for 'Projects' header index using text regex and style/bold heuristics."""
    if not doc or not hasattr(doc, "paragraphs"):
        return -1

    for idx, p in enumerate(doc.paragraphs):
        text = p.text.strip()
        if not text:
            continue

        # Check if text matches Projects heading regex
        if PROJECTS_HEADING_REGEX.search(text):
            # Check if paragraph has heading style or bold runs
            style_name = (p.style.name if p.style else "").lower()
            is_heading_style = "heading" in style_name or "title" in style_name
            is_bold = any(r.bold for r in p.runs if r.bold is not None)

            # Accept if short header line (< 40 chars) and matches pattern
            if len(text) < 40 or is_heading_style or is_bold:
                return idx

    return -1


def find_section_end_index(doc, start_idx: int) -> int:
    """Scans downward from start_idx until the next major section heading is encountered."""
    if not doc or not hasattr(doc, "paragraphs") or start_idx < 0:
        return len(doc.paragraphs) if doc and hasattr(doc, "paragraphs") else -1

    for idx in range(start_idx + 1, len(doc.paragraphs)):
        p = doc.paragraphs[idx]
        text = p.text.strip()
        if not text:
            continue

        if SUBSEQUENT_HEADING_REGEX.search(text):
            style_name = (p.style.name if p.style else "").lower()
            is_heading_style = "heading" in style_name or "title" in style_name
            is_bold = any(r.bold for r in p.runs if r.bold is not None)

            if len(text) < 40 or is_heading_style or is_bold:
                return idx

    return len(doc.paragraphs)
