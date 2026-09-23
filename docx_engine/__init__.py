from docx_engine.formatter import clone_font_style, clone_paragraph_style
from docx_engine.parser import find_projects_section_index, find_section_end_index
from docx_engine.modifier import insert_project_to_resume

__all__ = [
    "clone_font_style",
    "clone_paragraph_style",
    "find_projects_section_index",
    "find_section_end_index",
    "insert_project_to_resume",
]
