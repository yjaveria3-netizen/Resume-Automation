import math
import shutil
import subprocess
from typing import List, Optional, Dict, Any
import docx
from docx.shared import Pt, Inches
from docx.document import Document

from docx_engine.parser import find_projects_section_index, SUBSEQUENT_HEADING_REGEX, PROJECTS_HEADING_REGEX
from docx_engine.formatter import clone_paragraph_style, clone_font_style
from docx_engine.bullet_utils import copy_num_pr, style_exists_in_doc


def has_libreoffice() -> bool:
    """Returns True if LibreOffice (soffice / libreoffice) is available in PATH for PDF conversion."""
    return shutil.which("soffice") is not None or shutil.which("libreoffice") is not None


def convert_docx_to_pdf_page_count(docx_path: str, temp_dir: str) -> Optional[int]:
    """Converts a docx to PDF via LibreOffice and returns page count using pypdf, or None if LibreOffice is missing."""
    soffice_cmd = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice_cmd:
        return None

    try:
        proc = subprocess.run(
            [soffice_cmd, "--headless", "--convert-to", "pdf", "--outdir", temp_dir, docx_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
        )
        if proc.returncode == 0:
            import pypdf
            from pathlib import Path
            pdf_path = Path(temp_dir) / (Path(docx_path).stem + ".pdf")
            if pdf_path.exists():
                reader = pypdf.PdfReader(str(pdf_path))
                return len(reader.pages)
    except Exception:
        pass
    return None


def estimate_page_lines(doc: Document) -> Dict[str, Any]:
    """Estimates lines used and lines available based on document's real font size,
    page dimensions, margins, table rows, and indents."""
    # 1. Determine page geometry (default US Letter 8.5 x 11 in)
    page_height_pt = 11.0 * 72.0  # 792 pt
    top_margin_pt = 0.5 * 72.0
    bottom_margin_pt = 0.5 * 72.0
    left_margin_pt = 0.5 * 72.0
    right_margin_pt = 0.5 * 72.0
    page_width_pt = 8.5 * 72.0

    if doc.sections:
        sec = doc.sections[0]
        if sec.top_margin:
            top_margin_pt = sec.top_margin.pt
        if sec.bottom_margin:
            bottom_margin_pt = sec.bottom_margin.pt
        if sec.left_margin:
            left_margin_pt = sec.left_margin.pt
        if sec.right_margin:
            right_margin_pt = sec.right_margin.pt
        if sec.page_height:
            page_height_pt = sec.page_height.pt
        if sec.page_width:
            page_width_pt = sec.page_width.pt

    usable_height_pt = max(100.0, page_height_pt - top_margin_pt - bottom_margin_pt)
    usable_width_pt = max(100.0, page_width_pt - left_margin_pt - right_margin_pt)

    # 2. Determine base font size (default 10.5 pt)
    doc_font_size_pt = 10.5
    for p in doc.paragraphs:
        for r in p.runs:
            if r.font and r.font.size:
                doc_font_size_pt = r.font.size.pt
                break
        if doc_font_size_pt != 10.5:
            break

    # Average character width in proportional fonts ~ 0.5 * font_size
    avg_char_width_pt = doc_font_size_pt * 0.48
    chars_per_line = max(40, int(usable_width_pt / avg_char_width_pt))

    # Base line height in points
    base_line_pt = doc_font_size_pt * 1.2
    lines_available = max(1, int(round(usable_height_pt / base_line_pt)))

    # 3. Sum total height/lines used
    total_height_pt = 0.0

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            total_height_pt += base_line_pt * 0.4
            continue

        style_name = (p.style.name if p.style else "").lower()
        is_heading = "heading" in style_name or "title" in style_name
        is_bullet = (
            "bullet" in style_name
            or text.startswith(("•", "-", "*"))
            or (p._p.pPr is not None and p._p.pPr.find(docx.oxml.ns.qn("w:numPr")) is not None)
        )

        fmt = p.paragraph_format
        sb = fmt.space_before.pt if fmt.space_before else (4.0 if is_heading else 0.0)
        sa = fmt.space_after.pt if fmt.space_after else (3.0 if is_heading else 2.0)
        ls = fmt.line_spacing if fmt.line_spacing else 1.15
        if not isinstance(ls, (int, float)):
            ls = 1.15

        indent_pt = fmt.left_indent.pt if fmt.left_indent else (18.0 if is_bullet else 0.0)
        eff_width_pt = max(50.0, usable_width_pt - indent_pt)
        eff_chars_per_line = max(30, int(eff_width_pt / avg_char_width_pt))

        num_lines = max(1, math.ceil(len(text) / float(eff_chars_per_line)))
        p_height_pt = sb + (num_lines * doc_font_size_pt * ls) + sa
        total_height_pt += p_height_pt

    # Account for tables
    for table in doc.tables:
        for row in table.rows:
            max_cell_lines = 1
            for cell in row.cells:
                cell_chars = sum(len(cp.text) for cp in cell.paragraphs)
                cell_lines = max(1, math.ceil(cell_chars / float(chars_per_line // 2)))
                max_cell_lines = max(max_cell_lines, cell_lines)
            total_height_pt += max_cell_lines * base_line_pt * 1.25

    lines_used = int(round(total_height_pt / base_line_pt))
    is_safe = total_height_pt <= usable_height_pt

    return {
        "lines_used": lines_used,
        "lines_available": lines_available,
        "is_one_page_safe": is_safe,
        "total_height_pt": total_height_pt,
        "usable_height_pt": usable_height_pt,
    }


def calculate_document_line_budget(doc: Document) -> dict:
    """Calculates document capacity metrics: lines_used, lines_available, and is_one_page_safe."""
    res = estimate_page_lines(doc)
    return {
        "estimated_lines": res["lines_used"],
        "lines_used": res["lines_used"],
        "lines_available": res["lines_available"],
        "max_single_page_budget": res["lines_available"],
        "remaining_lines": max(0, res["lines_available"] - res["lines_used"]),
        "is_one_page_safe": res["is_one_page_safe"],
        "status": "safe" if res["is_one_page_safe"] else "overflow_risk",
    }


def auto_tighten_docx_spacing(doc: Document, line_threshold: int = 42) -> dict:
    """Tightens layout in progressive steps:
    Step 1: paragraph spacing (space_before=0, space_after=1.5pt)
    Step 2: line spacing (tighten to 1.05)
    Step 3: margins down to 0.5 in / 0.4 in
    Step 4: font size down at most 0.5pt (never below 9.5pt)
    Stops as soon as the document fits. Returns what it changed."""
    changes = []
    budget = estimate_page_lines(doc)
    if budget["is_one_page_safe"] and budget["lines_used"] <= line_threshold:
        return {"tightened": False, "changes": changes}

    # Step 1: Tighten paragraph spacing
    for p in doc.paragraphs:
        is_heading = "heading" in (p.style.name if p.style else "").lower()
        if is_heading:
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(1.5)
        else:
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(1.5)
    changes.append("paragraph_spacing_reduced")

    budget = estimate_page_lines(doc)
    if budget["is_one_page_safe"] and budget["lines_used"] <= line_threshold:
        return {"tightened": True, "changes": changes}

    # Step 2: Tighten line spacing
    for p in doc.paragraphs:
        p.paragraph_format.line_spacing = 1.05
    changes.append("line_spacing_1.05")

    budget = estimate_page_lines(doc)
    if budget["is_one_page_safe"] and budget["lines_used"] <= line_threshold:
        return {"tightened": True, "changes": changes}

    # Step 3: Margins down to 0.4 in / 0.5 in
    for section in doc.sections:
        if section.top_margin and section.top_margin > Inches(0.4):
            section.top_margin = Inches(0.4)
        if section.bottom_margin and section.bottom_margin > Inches(0.4):
            section.bottom_margin = Inches(0.4)
        if section.left_margin and section.left_margin > Inches(0.5):
            section.left_margin = Inches(0.5)
        if section.right_margin and section.right_margin > Inches(0.5):
            section.right_margin = Inches(0.5)
    changes.append("margins_tightened")

    budget = estimate_page_lines(doc)
    if budget["is_one_page_safe"] and budget["lines_used"] <= line_threshold:
        return {"tightened": True, "changes": changes}

    # Step 4: Font reduction by at most 0.5 pt, never below 9.5 pt
    font_reduced = False
    for p in doc.paragraphs:
        is_heading = "heading" in (p.style.name if p.style else "").lower()
        if not is_heading:
            for r in p.runs:
                if r.font and r.font.size and r.font.size.pt >= 10.0:
                    r.font.size = Pt(max(9.5, r.font.size.pt - 0.5))
                    font_reduced = True
    if font_reduced:
        changes.append("font_size_reduced_0.5pt")

    return {"tightened": True, "changes": changes}


def replace_project_in_docx(
    doc_path: str,
    output_path: str,
    old_project_name: str,
    new_project_title: str,
    new_tech_stack: List[str],
    new_bullet_point: str,
) -> bool:
    """Canonical Single Implementation of replace_project_in_docx.
    Replaces the old project's title line AND all its bullet paragraphs (up to the next project/section heading),
    cloning the old entry's formatting, then applies auto_tighten_docx_spacing.
    If the old project is not found by title line matching, inserts a new entry under Projects heading using Task 1 logic.
    """
    doc = docx.Document(doc_path)
    old_clean = old_project_name.strip().lower()

    # Find the title line of old_project_name
    title_idx = -1
    for idx, p in enumerate(doc.paragraphs):
        text = p.text.strip().lower()
        if not text:
            continue
        # Title lines typically contain the project name and are not bullet points or major headings
        is_major_heading = SUBSEQUENT_HEADING_REGEX.search(text) or PROJECTS_HEADING_REGEX.search(text)
        is_bullet = (
            "bullet" in (p.style.name if p.style else "").lower()
            or text.startswith(("•", "-", "*"))
            or (p._p.pPr is not None and p._p.pPr.find(docx.oxml.ns.qn("w:numPr")) is not None)
        )
        if not is_major_heading and not is_bullet:
            # Check if old_clean is in text (e.g. 'Distributed Cache | Go')
            if old_clean in text:
                title_idx = idx
                break

    if title_idx == -1:
        # Fallback: Old project not found by title line -> insert new entry under Projects heading
        from docx_engine.modifier import insert_project_to_resume
        res = insert_project_to_resume(
            doc_path=doc_path,
            output_path=output_path,
            project_title=new_project_title,
            tech_stack=new_tech_stack,
            bullet_point=new_bullet_point,
        )
        tightened_doc = docx.Document(output_path)
        auto_tighten_docx_spacing(tightened_doc)
        tightened_doc.save(output_path)
        return res

    # Sample styling from old title line
    old_title_p = doc.paragraphs[title_idx]
    sample_title_run = old_title_p.runs[0] if old_title_p.runs else None

    # Identify all subsequent bullet paragraphs belonging to old project
    bullets_to_remove = []
    sample_bullet_p = None
    sample_bullet_run = None

    scan_idx = title_idx + 1
    while scan_idx < len(doc.paragraphs):
        p = doc.paragraphs[scan_idx]
        text = p.text.strip()
        if not text:
            scan_idx += 1
            continue

        style_name = (p.style.name if p.style else "").lower()
        is_major_heading = SUBSEQUENT_HEADING_REGEX.search(text) or PROJECTS_HEADING_REGEX.search(text)
        is_bullet = (
            "bullet" in style_name
            or text.startswith(("•", "-", "*"))
            or (p._p.pPr is not None and p._p.pPr.find(docx.oxml.ns.qn("w:numPr")) is not None)
        )

        if is_major_heading:
            break

        if is_bullet:
            if sample_bullet_p is None:
                sample_bullet_p = p
                if p.runs:
                    sample_bullet_run = p.runs[0]
            bullets_to_remove.append(p)
            scan_idx += 1
        else:
            # Next title line encountered
            break

    # 1. Update Title in place
    tech_str = f" | {', '.join(new_tech_stack)}" if new_tech_stack else ""
    full_new_title = f"{new_project_title}{tech_str}"

    old_title_p.text = ""
    new_title_run = old_title_p.add_run(full_new_title)
    new_title_run.bold = True
    if sample_title_run:
        clone_font_style(sample_title_run, new_title_run)

    # 2. Insert the single new bullet right after the title
    new_bullet_p = doc.add_paragraph()
    old_title_p._p.addnext(new_bullet_p._p)

    copied_num = False
    if sample_bullet_p:
        clone_paragraph_style(sample_bullet_p, new_bullet_p)
        copied_num = copy_num_pr(sample_bullet_p, new_bullet_p)

    has_list_bullet_style = False
    if not copied_num:
        if sample_bullet_p and sample_bullet_p.style and sample_bullet_p.style.name:
            new_bullet_p.style = sample_bullet_p.style
            has_list_bullet_style = "bullet" in sample_bullet_p.style.name.lower()
        elif style_exists_in_doc(doc, "List Bullet"):
            new_bullet_p.style = "List Bullet"
            has_list_bullet_style = True

    clean_bullet = new_bullet_point.lstrip("-*• ").strip()
    if copied_num or has_list_bullet_style:
        new_bullet_run = new_bullet_p.add_run(clean_bullet)
    else:
        new_bullet_run = new_bullet_p.add_run(f"• {clean_bullet}")

    if sample_bullet_run:
        clone_font_style(sample_bullet_run, new_bullet_run)

    # 3. Remove all old bullet paragraphs that were displaced
    for old_bp in bullets_to_remove:
        p_elem = old_bp._p
        parent = p_elem.getparent()
        if parent is not None:
            parent.remove(p_elem)

    # 4. Apply auto_tighten_docx_spacing
    auto_tighten_docx_spacing(doc)

    doc.save(output_path)
    return True
