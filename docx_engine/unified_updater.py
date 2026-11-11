import os
import logging
import tempfile
from pathlib import Path
import docx

from docx_engine.parser import find_projects_section_index
from docx_engine.modifier import insert_project_to_resume
from docx_engine.fallback import create_projects_section_fallback, with_document_backup
from docx_engine.table_parser import find_projects_in_tables, insert_project_into_cell
from docx_engine.page_budget import auto_tighten_docx_spacing, calculate_document_line_budget

logger = logging.getLogger("docx_engine")


def update_resume_with_project(
    input_docx_path: str,
    output_docx_path: str,
    project_title: str,
    tech_stack: list,
    bullet_point: str,
) -> dict:
    """Unified single-function interface that modifies a .docx resume with table layout support,
    missing section fallbacks, safe atomic backup protection, and 1-page budget verification.
    Never modifies input file, never leaves *_backup files on disk, and never raises."""
    input_path = Path(input_docx_path)
    if not input_path.exists():
        return {
            "success": False,
            "error": f"Input file not found: {input_docx_path}",
            "output_path": None,
            "method": None,
            "section_found": False,
        }

    output_path = Path(output_docx_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Use a temp output file first; move to output_path only on complete success
    temp_fd, temp_output_file = tempfile.mkstemp(suffix=".docx")
    os.close(temp_fd)

    try:
        with with_document_backup(input_docx_path):
            doc = docx.Document(input_docx_path)

            # 1. Check standard paragraph headers (including Portfolio Highlights, Featured Projects)
            heading_idx = find_projects_section_index(doc)
            if heading_idx != -1:
                insert_project_to_resume(
                    doc_path=input_docx_path,
                    output_path=temp_output_file,
                    project_title=project_title,
                    tech_stack=tech_stack,
                    bullet_point=bullet_point,
                )
                method = "standard"
                section_found = True
            else:
                # 2. Check table-based resume layout
                table_match = find_projects_in_tables(doc)
                if table_match:
                    t_idx, r_idx, c_idx = table_match
                    cell = doc.tables[t_idx].rows[r_idx].cells[c_idx]
                    insert_project_into_cell(
                        cell=cell,
                        project_title=project_title,
                        tech_stack=tech_stack,
                        bullet_point=bullet_point,
                    )
                    doc.save(temp_output_file)
                    method = "table"
                    section_found = True
                else:
                    # 3. Safe Fallback: create new Projects section at best spot (before Education/Skills)
                    create_projects_section_fallback(
                        doc=doc,
                        output_path=temp_output_file,
                        project_title=project_title,
                        tech_stack=tech_stack,
                        bullet_point=bullet_point,
                    )
                    method = "fallback"
                    section_found = False

            # Check 1-page budget and auto-tighten if needed
            tightened_doc = docx.Document(temp_output_file)
            tighten_res = auto_tighten_docx_spacing(tightened_doc, line_threshold=42)
            budget_info = calculate_document_line_budget(tightened_doc)
            if tighten_res:
                tightened_doc.save(temp_output_file)

            # Atomic move from temp_output_file to target output_path
            if output_path.exists():
                output_path.unlink()
            os.replace(temp_output_file, str(output_path))

            return {
                "success": True,
                "method": method,
                "section_found": section_found,
                "output_path": str(output_path.resolve()),
                "budget": budget_info,
            }

    except Exception as exc:
        logger.error(f"Error in update_resume_with_project: {exc}")
        if os.path.exists(temp_output_file):
            try:
                os.remove(temp_output_file)
            except Exception:
                pass
        return {
            "success": False,
            "error": str(exc),
            "output_path": None,
            "method": None,
            "section_found": False,
        }
