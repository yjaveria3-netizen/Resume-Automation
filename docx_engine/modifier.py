import docx
from typing import List, Optional
from docx_engine.parser import find_projects_section_index
from docx_engine.formatter import clone_font_style, clone_paragraph_style
from docx_engine.bullet_utils import copy_num_pr, style_exists_in_doc


def insert_project_to_resume(
    doc_path: str,
    output_path: str,
    project_title: str,
    tech_stack: List[str],
    bullet_point: str,
) -> bool:
    """Inserts a new project entry directly UNDER the Projects heading:
    Projects (heading)
    New Project | Tech, Stack       <- title line
    • bullet text                   <- bullet
    <existing entries...>

    Preserves exact document order, formatting, headers, footers, and properties.
    """
    doc = docx.Document(doc_path)
    heading_idx = find_projects_section_index(doc)

    if heading_idx == -1 or heading_idx >= len(doc.paragraphs):
        # Fallback to end of document if no Projects section found
        from docx_engine.fallback import create_projects_section_fallback
        return create_projects_section_fallback(
            doc,
            output_path=output_path,
            project_title=project_title,
            tech_stack=tech_stack,
            bullet_point=bullet_point,
        )

    heading_p = doc.paragraphs[heading_idx]

    # 1. Sample existing styling from nearby paragraphs/runs in Projects section
    sample_title_p = None
    sample_bullet_p = None
    sample_title_run = None
    sample_bullet_run = None

    for idx in range(heading_idx + 1, min(heading_idx + 12, len(doc.paragraphs))):
        p = doc.paragraphs[idx]
        if not p.text.strip():
            continue

        style_name = (p.style.name if p.style else "").lower()
        is_bullet = (
            "bullet" in style_name
            or p.text.strip().startswith(("•", "-", "*"))
            or (p._p.pPr is not None and p._p.pPr.find(docx.oxml.ns.qn("w:numPr")) is not None)
        )

        if is_bullet:
            if not sample_bullet_p:
                sample_bullet_p = p
                if p.runs:
                    sample_bullet_run = p.runs[0]
        else:
            if not sample_title_p:
                sample_title_p = p
                if p.runs:
                    sample_title_run = p.runs[0]

    # 2. Build header text
    tech_stack_str = ", ".join(tech_stack) if tech_stack else ""
    header_text = f"{project_title} | {tech_stack_str}" if tech_stack_str else project_title

    # 3. Clean bullet point
    clean_bullet = bullet_point.lstrip("-*• ").strip()

    # 4. Create and position the title paragraph directly after heading_p
    # Create new paragraph element via document body
    title_p = doc.add_paragraph()
    heading_p._p.addnext(title_p._p)

    title_run = title_p.add_run(header_text)
    title_run.bold = True

    if sample_title_p:
        clone_paragraph_style(sample_title_p, title_p)
    if sample_title_run:
        clone_font_style(sample_title_run, title_run)

    # 5. Create and position the bullet paragraph directly after title_p
    bullet_p = doc.add_paragraph()
    title_p._p.addnext(bullet_p._p)

    # Bullet formatting:
    # Check if sample bullet has numPr XML or a bullet style
    copied_num = False
    if sample_bullet_p:
        clone_paragraph_style(sample_bullet_p, bullet_p)
        copied_num = copy_num_pr(sample_bullet_p, bullet_p)

    has_list_bullet_style = False
    if not copied_num:
        if sample_bullet_p and sample_bullet_p.style and sample_bullet_p.style.name:
            bullet_p.style = sample_bullet_p.style
            has_list_bullet_style = "bullet" in sample_bullet_p.style.name.lower()
        elif style_exists_in_doc(doc, "List Bullet"):
            bullet_p.style = "List Bullet"
            has_list_bullet_style = True

    # Avoid double bullets: never prepend '• ' if bullet style or numPr is active
    if copied_num or has_list_bullet_style:
        bullet_run = bullet_p.add_run(clean_bullet)
    else:
        # Prepend glyph only when document has no bullet list style/numbering
        bullet_run = bullet_p.add_run(f"• {clean_bullet}")

    if sample_bullet_run:
        clone_font_style(sample_bullet_run, bullet_run)

    doc.save(output_path)
    return True
