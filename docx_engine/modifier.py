import docx
from typing import List, Optional
from docx_engine.parser import find_projects_section_index
from docx_engine.formatter import clone_font_style, clone_paragraph_style


def insert_project_to_resume(
    doc_path: str,
    output_path: str,
    project_title: str,
    tech_stack: List[str],
    bullet_point: str,
) -> bool:
    """Inserts a new project entry (title line + bullet point) into doc_path under Projects section while cloning existing styles."""
    doc = docx.Document(doc_path)
    heading_idx = find_projects_section_index(doc)

    # 1. Determine insertion target paragraph
    if heading_idx != -1 and heading_idx < len(doc.paragraphs):
        target_p = doc.paragraphs[heading_idx]
    else:
        # Fallback: append to end of document if no Projects section found
        target_p = doc.paragraphs[-1] if doc.paragraphs else doc.add_paragraph()

    # 2. Sample existing styling from nearby paragraphs/runs
    sample_title_p = None
    sample_bullet_p = None
    sample_title_run = None
    sample_bullet_run = None

    start_scan = heading_idx + 1 if heading_idx != -1 else 0
    for idx in range(start_scan, min(start_scan + 10, len(doc.paragraphs))):
        p = doc.paragraphs[idx]
        if not p.text.strip():
            continue

        style_name = (p.style.name if p.style else "").lower()
        if "bullet" in style_name or p.text.strip().startswith(("•", "-", "*")):
            if not sample_bullet_p:
                sample_bullet_p = p
                if p.runs:
                    sample_bullet_run = p.runs[0]
        else:
            if not sample_title_p:
                sample_title_p = p
                if p.runs:
                    sample_title_run = p.runs[0]

    # 3. Format project header text line
    tech_stack_str = ", ".join(tech_stack) if tech_stack else ""
    header_text = f"{project_title} | {tech_stack_str}" if tech_stack_str else project_title

    # 4. Insert project title paragraph directly after target_p
    title_p = target_p.insert_paragraph_before(header_text)
    # Move target_p below title_p by modifying XML elements order safely
    target_p._p.addprevious(title_p._p)

    title_run = title_p.runs[0] if title_p.runs else title_p.add_run(header_text)
    title_run.bold = True

    if sample_title_p:
        clone_paragraph_style(sample_title_p, title_p)
    if sample_title_run:
        clone_font_style(sample_title_run, title_run)

    # 5. Clean up bullet point text
    clean_bullet = bullet_point.lstrip("-*• ").strip()

    # 6. Insert bullet point paragraph
    bullet_p = title_p.insert_paragraph_before()
    title_p._p.addprevious(bullet_p._p)

    try:
        bullet_p.style = "List Bullet"
    except Exception:
        pass

    bullet_run = bullet_p.add_run(f"• {clean_bullet}" if not bullet_p.style else clean_bullet)

    if sample_bullet_p:
        clone_paragraph_style(sample_bullet_p, bullet_p)
    if sample_bullet_run:
        clone_font_style(sample_bullet_run, bullet_run)

    # 7. Save modified resume to output_path
    doc.save(output_path)
    return True
