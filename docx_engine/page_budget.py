import math
from typing import List, Optional
import docx
from docx.shared import Pt, Inches
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.document import Document

from docx_engine.parser import find_projects_section_index
from docx_engine.formatter import clone_paragraph_style, clone_font_style


def estimate_page_lines(doc: Document) -> int:
    """Estimates the total lines of content in a Word resume to predict single-page capacity (budget ~40-48 lines)."""
    total_lines = 0

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            total_lines += 0.5
            continue

        # Check if heading (headings typically consume 2 equivalent lines with margin)
        style_name = (p.style.name if p.style else "").lower()
        if "heading" in style_name or p.style.name.startswith("Heading"):
            total_lines += 2.0
            continue

        # Line estimation based on standard 85 characters per full-width line
        char_count = len(text)
        para_lines = max(1, math.ceil(char_count / 85.0))

        # Check paragraph spacing budget
        space_after = p.paragraph_format.space_after
        if space_after and space_after.pt > 4:
            para_lines += 0.5

        total_lines += para_lines

    # Account for tables if present
    for table in doc.tables:
        for row in table.rows:
            total_lines += 1.2

    return int(round(total_lines))


def calculate_document_line_budget(doc: Document) -> dict:
    """Calculates document capacity metrics: total estimated lines, max budget (45 lines),
    and whether it is safely strictly within 1 page."""
    estimated_lines = estimate_page_lines(doc)
    max_single_page_budget = 45
    remaining_lines = max(0, max_single_page_budget - estimated_lines)
    is_safe = estimated_lines <= max_single_page_budget

    return {
        "estimated_lines": estimated_lines,
        "max_single_page_budget": max_single_page_budget,
        "remaining_lines": remaining_lines,
        "is_one_page_safe": is_safe,
        "status": "safe" if is_safe else "overflow_risk",
    }


def auto_tighten_docx_spacing(doc: Document, line_threshold: int = 42) -> bool:
    """Automatically reduces paragraph space_before, space_after, and line_spacing slightly
    if the document nears or exceeds the 1-page threshold (default 42 lines), preventing 1.1 page visual overflows."""
    estimated = estimate_page_lines(doc)
    if estimated <= line_threshold:
        return False  # No tightening needed

    # Tighten margins if margins are loose
    for section in doc.sections:
        if section.top_margin > Inches(0.5):
            section.top_margin = Inches(0.4)
        if section.bottom_margin > Inches(0.5):
            section.bottom_margin = Inches(0.4)
        if section.left_margin > Inches(0.6):
            section.left_margin = Inches(0.5)
        if section.right_margin > Inches(0.6):
            section.right_margin = Inches(0.5)

    # Tighten paragraph spacing
    for p in doc.paragraphs:
        style_name = (p.style.name if p.style else "").lower()
        is_heading = "heading" in style_name

        if is_heading:
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(2)
        else:
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(1.5)
            p.paragraph_format.line_spacing = 1.05

    return True


def replace_project_in_docx(
    doc_path: str,
    output_path: str,
    old_project_name: str,
    new_project_name: str,
    new_bullet: str,
    tech_stack: Optional[List[str]] = None,
) -> bool:
    """Smart Project Swap: Finds the old project paragraphs in doc_path, replaces title and bullets
    in place with cloned styling, tightens spacing if needed, and saves to output_path."""
    doc = docx.Document(doc_path)
    old_clean = old_project_name.strip().lower()

    target_idx = -1
    for idx, p in enumerate(doc.paragraphs):
        if old_clean in p.text.lower():
            target_idx = idx
            break

    if target_idx == -1:
        # If specific project wasn't found by exact name, locate Projects section
        proj_idx = find_projects_section_index(doc)
        if proj_idx != -1 and proj_idx + 1 < len(doc.paragraphs):
            target_idx = proj_idx + 1
        else:
            target_idx = 0

    # 1. Update Project Title paragraph
    title_p = doc.paragraphs[target_idx]
    title_run_format = None
    if title_p.runs:
        title_run_format = title_p.runs[0]

    stack_str = f" | {', '.join(tech_stack)}" if tech_stack else ""
    full_new_title = f"{new_project_name}{stack_str}"

    title_p.text = ""
    new_title_run = title_p.add_run(full_new_title)
    new_title_run.bold = True
    if title_run_format:
        clone_font_style(title_run_format, new_title_run)

    # 2. Update subsequent bullet point paragraph
    bullet_idx = target_idx + 1
    if bullet_idx < len(doc.paragraphs):
        bullet_p = doc.paragraphs[bullet_idx]
        bullet_run_format = None
        if bullet_p.runs:
            bullet_run_format = bullet_p.runs[0]

        bullet_p.text = ""
        bullet_run = bullet_p.add_run(new_bullet)
        if bullet_run_format:
            clone_font_style(bullet_run_format, bullet_run)
    else:
        doc.add_paragraph(new_bullet, style="List Bullet")

    # 3. Ensure 1-page compliance
    auto_tighten_docx_spacing(doc, line_threshold=42)

    doc.save(output_path)
    return True
