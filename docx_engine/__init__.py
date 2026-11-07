from docx_engine.formatter import clone_font_style, clone_paragraph_style
from docx_engine.parser import find_projects_section_index, find_section_end_index
from docx_engine.modifier import insert_project_to_resume
from docx_engine.page_budget import (
    estimate_page_lines,
    calculate_document_line_budget,
    auto_tighten_docx_spacing,
    replace_project_in_docx,
)
from docx_engine.fallback import create_projects_section_fallback, with_document_backup
from docx_engine.table_parser import find_projects_in_tables
from docx_engine.unified_updater import update_resume_with_project

__all__ = [
    "clone_font_style",
    "clone_paragraph_style",
    "find_projects_section_index",
    "find_section_end_index",
    "insert_project_to_resume",
    "replace_project_in_docx",
    "estimate_page_lines",
    "calculate_document_line_budget",
    "auto_tighten_docx_spacing",
    "create_projects_section_fallback",
    "with_document_backup",
    "find_projects_in_tables",
    "update_resume_with_project",
]
