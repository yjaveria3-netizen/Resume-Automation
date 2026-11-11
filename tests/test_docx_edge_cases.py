import os
import pytest
import docx
from docx.shared import Pt, Inches
from docx_engine.unified_updater import update_resume_with_project


def test_edge_case_no_projects_section_fallback(tmp_path):
    """Case 1: No Projects section exists. Must create Projects heading BEFORE Education,
    insert title and bullet under it in correct order (Projects -> Title -> Bullet),
    not [bullet], [title in Heading 1], ['Projects' in Normal]."""
    in_path = str(tmp_path / "no_proj.docx")
    out_path = str(tmp_path / "no_proj_out.docx")

    doc = docx.Document()
    doc.add_heading("Skills", level=1)
    doc.add_paragraph("Python, Go")
    doc.add_heading("Education", level=1)
    doc.add_paragraph("Stanford University")
    doc.save(in_path)

    initial_content = open(in_path, "rb").read()

    res = update_resume_with_project(
        input_docx_path=in_path,
        output_docx_path=out_path,
        project_title="Cloud Orchestrator",
        tech_stack=["Go", "Docker"],
        bullet_point="Automated multi-node cluster failover."
    )

    assert res["success"] is True
    assert res["method"] == "fallback"
    assert res["section_found"] is False
    assert os.path.exists(out_path)

    # Input file must be strictly unchanged
    assert open(in_path, "rb").read() == initial_content

    # No backup files left behind
    assert not list(tmp_path.glob("*_backup*"))

    res_doc = docx.Document(out_path)
    paras = [p.text for p in res_doc.paragraphs]

    # Verify order: Projects must be before Education
    proj_idx = paras.index("Projects")
    edu_idx = paras.index("Education")
    assert proj_idx < edu_idx, f"Projects heading must appear before Education: {paras}"

    # Verify order: Projects -> Title -> Bullet
    assert paras[proj_idx + 1] == "Cloud Orchestrator | Go, Docker"
    assert "Automated multi-node cluster failover" in paras[proj_idx + 2]


def test_edge_case_table_layout(tmp_path):
    """Case 2: Content inside a table cell. Insert inside the same cell directly after Projects heading."""
    in_path = str(tmp_path / "table_resume.docx")
    out_path = str(tmp_path / "table_resume_out.docx")

    doc = docx.Document()
    table = doc.add_table(rows=1, cols=2)
    left_cell = table.rows[0].cells[0]
    left_cell.paragraphs[0].text = "Skills & Bio"
    right_cell = table.rows[0].cells[1]
    right_cell.paragraphs[0].text = "Projects"
    p_exist = right_cell.add_paragraph("Existing Tool | Python")
    p_bullet = right_cell.add_paragraph("Built CLI tool.", style="List Bullet")
    doc.save(in_path)

    res = update_resume_with_project(
        input_docx_path=in_path,
        output_docx_path=out_path,
        project_title="Distributed Cache",
        tech_stack=["Redis", "Go"],
        bullet_point="Reduced database latency by 45%."
    )

    assert res["success"] is True
    assert res["method"] == "table"
    assert res["section_found"] is True

    res_doc = docx.Document(out_path)
    cell_paras = [p.text for p in res_doc.tables[0].rows[0].cells[1].paragraphs]
    proj_idx = cell_paras.index("Projects")
    assert cell_paras[proj_idx + 1] == "Distributed Cache | Redis, Go"
    assert "Reduced database latency by 45%" in cell_paras[proj_idx + 2]


def test_edge_case_non_standard_heading(tmp_path):
    """Case 3: Non-standard heading like 'PORTFOLIO HIGHLIGHTS'."""
    in_path = str(tmp_path / "portfolio.docx")
    out_path = str(tmp_path / "portfolio_out.docx")

    doc = docx.Document()
    doc.add_heading("PORTFOLIO HIGHLIGHTS", level=1)
    doc.add_paragraph("Old App | React")
    doc.add_paragraph("Built web dashboard.", style="List Bullet")
    doc.save(in_path)

    res = update_resume_with_project(
        input_docx_path=in_path,
        output_docx_path=out_path,
        project_title="E-Commerce Engine",
        tech_stack=["FastAPI", "Stripe"],
        bullet_point="Processed 10,000 transactions/day."
    )

    assert res["success"] is True
    assert res["section_found"] is True
    assert res["method"] == "standard"

    res_doc = docx.Document(out_path)
    paras = [p.text for p in res_doc.paragraphs]
    idx = paras.index("PORTFOLIO HIGHLIGHTS")
    assert paras[idx + 1] == "E-Commerce Engine | FastAPI, Stripe"
    assert "Processed 10,000 transactions/day." in paras[idx + 2]


def test_edge_case_empty_and_single_paragraph_doc(tmp_path):
    """Case 4: Empty document and single paragraph document do not crash and append cleanly."""
    in_empty = str(tmp_path / "empty.docx")
    out_empty = str(tmp_path / "empty_out.docx")
    docx.Document().save(in_empty)

    res = update_resume_with_project(
        input_docx_path=in_empty,
        output_docx_path=out_empty,
        project_title="Starter Project",
        tech_stack=["Python"],
        bullet_point="Initialized base repository."
    )
    assert res["success"] is True
    assert os.path.exists(out_empty)
    doc = docx.Document(out_empty)
    paras = [p.text for p in doc.paragraphs if p.text.strip()]
    assert "Projects" in paras[0]
    assert "Starter Project | Python" in paras[1]
    assert "Initialized base repository." in paras[2]


def test_edge_case_backup_and_no_leftover_files(tmp_path):
    """Case 5: Verification of atomic move and no leftover *_backup files even on failure."""
    in_path = str(tmp_path / "crash_test.docx")
    out_path = str(tmp_path / "crash_test_out.docx")

    doc = docx.Document()
    doc.add_paragraph("Sample Resume")
    doc.save(in_path)

    # Calling with an invalid output directory path that cannot be written
    res = update_resume_with_project(
        input_docx_path="non_existent_file.docx",
        output_docx_path=out_path,
        project_title="Test",
        tech_stack=[],
        bullet_point="Test"
    )
    assert res["success"] is False
    assert not list(tmp_path.glob("*_backup*"))
