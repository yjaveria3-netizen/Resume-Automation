import logging
from pathlib import Path
import docx

from docx_engine.parser import find_projects_section_index
from docx_engine.modifier import insert_project_to_resume
from docx_engine.fallback import create_projects_section_fallback, with_document_backup
from docx_engine.table_parser import find_projects_in_tables, insert_project_into_cell

logger = logging.getLogger("docx_engine")


def update_resume_with_project(
    input_docx_path: str,
    output_docx_path: str,
    project_title: str,
    tech_stack: list,
    bullet_point: str,
) -> dict:
    """Unified single-function interface that modifies a .docx resume with table layout support, missing section fallbacks, and safe backup protection."""
    input_path = Path(input_docx_path)
    if not input_path.exists():
        return {
            "success": False,
            "error": f"Input file not found: {input_docx_path}",
            "output_path": None,
        }

    output_path = Path(output_docx_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with with_document_backup(input_docx_path):
            doc = docx.Document(input_docx_path)

            # 1. Check standard paragraph headers
            heading_idx = find_projects_section_index(doc)
            if heading_idx != -1:
                insert_project_to_resume(
                    doc_path=input_docx_path,
                    output_path=output_docx_path,
                    project_title=project_title,
                    tech_stack=tech_stack,
                    bullet_point=bullet_point,
                )
                return {
                    "success": True,
                    "section_found": True,
                    "method": "standard",
                    "output_path": str(output_path.resolve()),
                }

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
                doc.save(output_docx_path)
                return {
                    "success": True,
                    "section_found": True,
                    "method": "table",
                    "output_path": str(output_path.resolve()),
                }

            # 3. Safe Fallback: create new Projects section at best spot
            fallback_idx = create_projects_section_fallback(doc)
            doc.save(output_docx_path)

            # Insert project entry into newly created fallback section
            insert_project_to_resume(
                doc_path=output_docx_path,
                output_path=output_docx_path,
                project_title=project_title,
                tech_stack=tech_stack,
                bullet_point=bullet_point,
            )
            return {
                "success": True,
                "section_found": False,
                "method": "fallback",
                "output_path": str(output_path.resolve()),
            }

    except Exception as exc:
        logger.error(f"Error in update_resume_with_project: {exc}")
        return {
            "success": False,
            "error": str(exc),
            "output_path": None,
        }
