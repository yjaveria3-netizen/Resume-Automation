import shutil
import tempfile
from contextlib import contextmanager
from pathlib import Path
import docx
from docx.shared import Pt
from docx_engine.parser import SUBSEQUENT_HEADING_REGEX
from docx_engine.formatter import clone_font_style, clone_paragraph_style
from docx_engine.bullet_utils import copy_num_pr, style_exists_in_doc


@contextmanager
def with_document_backup(doc_path: str):
    """Context manager for safe atomic writing.
    Never modifies the original input file; guarantees that no partial or *_backup files remain on exception."""
    path = Path(doc_path)
    # Never write into or modify doc_path in-place directly without backup
    temp_dir = tempfile.mkdtemp()
    temp_backup = Path(temp_dir) / f"{path.stem}_backup{path.suffix}"
    if path.exists():
        shutil.copy2(path, temp_backup)

    try:
        yield path
    finally:
        # Clean up temp folder completely, leaving no *_backup files on disk
        if temp_backup.exists():
            try:
                temp_backup.unlink()
            except Exception:
                pass
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass


def insert_project_into_doc_object(
    doc: docx.Document,
    heading_p,
    project_title: str,
    tech_stack: list,
    bullet_point: str,
):
    """Inserts project title and bullet directly after heading_p within the given docx.Document object."""
    # Sample existing styling from nearby paragraphs
    sample_title_p = None
    sample_bullet_p = None
    sample_title_run = None
    sample_bullet_run = None

    # Locate heading_p index
    heading_idx = -1
    for idx, p in enumerate(doc.paragraphs):
        if p._p == heading_p._p:
            heading_idx = idx
            break

    start_scan = heading_idx + 1 if heading_idx != -1 else 0
    for idx in range(start_scan, min(start_scan + 12, len(doc.paragraphs))):
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

    # Format title text
    tech_stack_str = ", ".join(tech_stack) if tech_stack else ""
    header_text = f"{project_title} | {tech_stack_str}" if tech_stack_str else project_title
    clean_bullet = bullet_point.lstrip("-*• ").strip()

    title_p = doc.add_paragraph()
    heading_p._p.addnext(title_p._p)

    title_run = title_p.add_run(header_text)
    title_run.bold = True
    if sample_title_p:
        clone_paragraph_style(sample_title_p, title_p)
    if sample_title_run:
        clone_font_style(sample_title_run, title_run)

    bullet_p = doc.add_paragraph()
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
        elif style_exists_in_doc(doc, "List Bullet"):
            bullet_p.style = "List Bullet"
            has_list_bullet_style = True

    if copied_num or has_list_bullet_style:
        bullet_run = bullet_p.add_run(clean_bullet)
    else:
        bullet_run = bullet_p.add_run(f"• {clean_bullet}")

    if sample_bullet_run:
        clone_font_style(sample_bullet_run, bullet_run)


def create_projects_section_fallback(
    doc: docx.Document,
    output_path: str = None,
    project_title: str = None,
    tech_stack: list = None,
    bullet_point: str = None,
) -> int:
    """Creates a 'Projects' heading by cloning formatting of an existing section heading
    (e.g., Education, Skills, Experience). Inserts it BEFORE Education (or before Skills/Experience).
    If none exist or document is empty, appends at the end.
    Then inserts the new entry under it in the SAME document object without save/re-open roundtrips."""
    best_p = None
    sample_heading_p = None

    # Priority for insertion: Before Education, or before Skills, or before Experience
    target_sections = ["education", "skills", "experience"]
    found_target = {sec: None for sec in target_sections}

    for p in doc.paragraphs:
        text = p.text.strip().lower()
        if not text:
            continue
        style_name = (p.style.name if p.style else "").lower()
        is_heading = "heading" in style_name or "title" in style_name or any(r.bold for r in p.runs if r.bold is not None)

        if is_heading:
            if not sample_heading_p:
                sample_heading_p = p
            for sec in target_sections:
                if sec in text and found_target[sec] is None:
                    found_target[sec] = p

    for sec in target_sections:
        if found_target[sec] is not None:
            best_p = found_target[sec]
            break

    # Create new Projects heading paragraph
    new_heading_p = doc.add_paragraph()
    if best_p is not None:
        best_p._p.addprevious(new_heading_p._p)
    else:
        # If no sibling section exists or document is empty/single-paragraph, it is placed at the end of the doc
        pass

    # Clone heading style and run formatting
    if sample_heading_p:
        clone_paragraph_style(sample_heading_p, new_heading_p)
        run = new_heading_p.add_run("Projects")
        if sample_heading_p.runs:
            clone_font_style(sample_heading_p.runs[0], run)
        run.bold = True
    else:
        # Sensible defaults if no existing heading in document
        try:
            if style_exists_in_doc(doc, "Heading 1"):
                new_heading_p.style = "Heading 1"
        except Exception:
            pass
        run = new_heading_p.add_run("Projects")
        run.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(14)

    # If project details are provided, insert them directly under the new heading in the same doc object
    if project_title:
        insert_project_into_doc_object(
            doc=doc,
            heading_p=new_heading_p,
            project_title=project_title,
            tech_stack=tech_stack or [],
            bullet_point=bullet_point or "",
        )

    if output_path:
        doc.save(output_path)

    # Return index of new heading
    for idx, p in enumerate(doc.paragraphs):
        if p._p == new_heading_p._p:
            return idx
    return len(doc.paragraphs) - 1
