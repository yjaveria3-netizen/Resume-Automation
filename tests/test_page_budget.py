import os
import pytest
import docx
from docx.shared import Pt, Inches
from docx_engine.page_budget import (
    estimate_page_lines,
    calculate_document_line_budget,
    auto_tighten_docx_spacing,
    replace_project_in_docx,
)


@pytest.fixture
def sample_docx_file(tmp_path):
    doc_path = tmp_path / "test_resume.docx"
    doc = docx.Document()
    doc.add_heading("Jane Doe", 0)
    doc.add_paragraph("Email: jane@example.com | GitHub: github.com/janedoe")

    doc.add_heading("Projects", 1)
    doc.add_paragraph("Legacy Task Runner | Python, Flask", style="Normal")
    doc.add_paragraph("Built simple task runner handling small background jobs.", style="List Bullet")

    doc.add_paragraph("Old Analytics Tool | JavaScript", style="Normal")
    doc.add_paragraph("Created analytics chart dashboard for internal team.", style="List Bullet")

    doc.add_heading("Experience", 1)
    doc.add_paragraph("Software Engineer | Cloud Solutions")
    doc.add_paragraph("Maintained backend APIs and microservices infrastructure.", style="List Bullet")

    doc.save(str(doc_path))
    return str(doc_path)


def test_estimate_page_lines(sample_docx_file):
    doc = docx.Document(sample_docx_file)
    lines = estimate_page_lines(doc)
    assert 5 <= lines <= 25
    budget = calculate_document_line_budget(doc)
    assert budget["is_one_page_safe"] is True
    assert budget["max_single_page_budget"] == 45
    assert budget["status"] == "safe"


def test_auto_tighten_spacing_on_overflow(sample_docx_file):
    doc = docx.Document(sample_docx_file)
    # Add paragraphs to simulate overflow
    for i in range(25):
        doc.add_paragraph(f"High-density project bullet point {i} detailing complex microservices architecture and optimization metrics.")

    initial_lines = estimate_page_lines(doc)
    assert initial_lines > 30

    tightened = auto_tighten_docx_spacing(doc, line_threshold=30)
    assert tightened is True

    # Verify spacing properties were tightened
    for p in doc.paragraphs:
        if not ("heading" in (p.style.name or "").lower()):
            assert p.paragraph_format.space_before == Pt(0)
            assert p.paragraph_format.line_spacing == 1.05


def test_replace_project_in_docx(sample_docx_file, tmp_path):
    out_path = str(tmp_path / "updated_swapped.docx")
    success = replace_project_in_docx(
        doc_path=sample_docx_file,
        output_path=out_path,
        old_project_name="Legacy Task Runner",
        new_project_name="Distributed LRU Cache Engine",
        new_bullet="Engineered distributed in-memory cache in Go with Redis backend, cutting DB load by 45%.",
        tech_stack=["Go", "Redis", "Docker"]
    )
    assert success is True
    assert os.path.exists(out_path)

    # Check updated document contents
    updated_doc = docx.Document(out_path)
    text = " ".join([p.text for p in updated_doc.paragraphs])
    assert "Distributed LRU Cache Engine" in text
    assert "cutting DB load by 45%" in text
    assert "Legacy Task Runner" not in text
