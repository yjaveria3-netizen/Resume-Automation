import docx
from typing import Optional, Tuple
from docx_engine.parser import PROJECTS_HEADING_REGEX
from docx_engine.formatter import clone_font_style, clone_paragraph_style
from docx_engine.bullet_utils import copy_num_pr, style_exists_in_doc


def find_projects_in_tables(doc) -> Optional[Tuple[int, int, int]]:
    """Scans doc.tables for cells containing Projects heading. Returns (table_idx, row_idx, col_idx) or None."""
    if not doc or not hasattr(doc, "tables"):
        return None

    for t_idx, table in enumerate(doc.tables):
        for r_idx, row in enumerate(table.rows):
            for c_idx, cell in enumerate(row.cells):
                for p in cell.paragraphs:
                    text = p.text.strip()
                    if text and PROJECTS_HEADING_REGEX.search(text):
                        return (t_idx, r_idx, c_idx)
    return None


def insert_project_into_cell(
    cell,
    project_title: str,
    tech_stack: list,
    bullet_point: str,
) -> bool:
    """Inserts project title and bullet point inside a Word table cell, directly AFTER the Projects heading paragraph.
    Copies paragraph and run formatting from existing paragraphs in that cell, avoiding double bullets."""
    heading_p = None
    sample_title_p = None
    sample_bullet_p = None
    sample_title_run = None
    sample_bullet_run = None

    for p in cell.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        if PROJECTS_HEADING_REGEX.search(text) and heading_p is None:
            heading_p = p
            continue

        style_name = (p.style.name if p.style else "").lower()
        is_bullet = (
            "bullet" in style_name
            or text.startswith(("•", "-", "*"))
            or (p._p.pPr is not None and p._p.pPr.find(docx.oxml.ns.qn("w:numPr")) is not None)
        )

        if is_bullet and sample_bullet_p is None:
            sample_bullet_p = p
            if p.runs:
                sample_bullet_run = p.runs[0]
        elif not is_bullet and sample_title_p is None:
            sample_title_p = p
            if p.runs:
                sample_title_run = p.runs[0]

    # If no explicit heading found in cell, use the first paragraph
    if heading_p is None:
        heading_p = cell.paragraphs[0] if cell.paragraphs else cell.add_paragraph()

    tech_stack_str = ", ".join(tech_stack) if tech_stack else ""
    header_text = f"{project_title} | {tech_stack_str}" if tech_stack_str else project_title
    clean_bullet = bullet_point.lstrip("-*• ").strip()

    # 1. Create Title Paragraph and insert directly after heading_p
    title_p = cell.add_paragraph()
    heading_p._p.addnext(title_p._p)

    title_run = title_p.add_run(header_text)
    title_run.bold = True
    if sample_title_p:
        clone_paragraph_style(sample_title_p, title_p)
    if sample_title_run:
        clone_font_style(sample_title_run, title_run)

    # 2. Create Bullet Paragraph and insert directly after title_p
    bullet_p = cell.add_paragraph()
    title_p._p.addnext(bullet_p._p)

    copied_num = False
    if sample_bullet_p:
        clone_paragraph_style(sample_bullet_p, bullet_p)
        copied_num = copy_num_pr(sample_bullet_p, bullet_p)

    has_list_bullet_style = False
    if not copied_num:
        if sample_bullet_p and sample_bullet_p.style and sample_bullet_p.style.name:
            bullet_p.style = sample_bullet_p.style
            has_list_bullet_style = "bullet" in sample_bullet_p.style.name.lower()
        else:
            try:
                # check if cell's document has List Bullet
                doc = cell._tc.part.document
                if style_exists_in_doc(doc, "List Bullet"):
                    bullet_p.style = "List Bullet"
                    has_list_bullet_style = True
            except Exception:
                pass

    if copied_num or has_list_bullet_style:
        bullet_run = bullet_p.add_run(clean_bullet)
    else:
        bullet_run = bullet_p.add_run(f"• {clean_bullet}")

    if sample_bullet_run:
        clone_font_style(sample_bullet_run, bullet_run)

    return True
