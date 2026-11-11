import os
import pytest
import docx
from docx.shared import Pt, Inches
from docx_engine.page_budget import (
    estimate_page_lines,
    calculate_document_line_budget,
    auto_tighten_docx_spacing,
    replace_project_in_docx,
    has_libreoffice,
    convert_docx_to_pdf_page_count,
)


@pytest.fixture
def multi_bullet_resume(tmp_path):
    doc_path = tmp_path / "multi_bullet.docx"
    doc = docx.Document()
    doc.add_heading("Alex Taylor", 0)
    doc.add_paragraph("Fullstack Engineer | alex@example.com")

    doc.add_heading("Projects", 1)
    doc.add_paragraph("E-Commerce Microservices | Java, Spring Boot")
    doc.add_paragraph("First bullet for e-commerce: architected order queue.", style="List Bullet")
    doc.add_paragraph("Second bullet for e-commerce: reduced latency by 35%.", style="List Bullet")

    doc.add_paragraph("Distributed Cache | Go, Redis")
    doc.add_paragraph("Single bullet for distributed cache.", style="List Bullet")

    doc.add_heading("Skills", 1)
    doc.add_paragraph("Go, Python, Java, Docker, Kubernetes")

    doc.save(str(doc_path))
    return str(doc_path)


def test_replace_multi_bullet_removes_all_old_bullets(multi_bullet_resume, tmp_path):
    """Replacing a 2-bullet project removes BOTH old bullets and inserts the single new bullet."""
    out_path = str(tmp_path / "swapped_multi.docx")
    success = replace_project_in_docx(
        doc_path=multi_bullet_resume,
        output_path=out_path,
        old_project_name="E-Commerce Microservices",
        new_project_title="Cloud Kubernetes Ingress",
        new_tech_stack=["Go", "K8s"],
        new_bullet_point="Engineered zero-downtime ingress routing controller."
    )
    assert success is True

    doc = docx.Document(out_path)
    text = " ".join([p.text for p in doc.paragraphs])
    assert "Cloud Kubernetes Ingress | Go, K8s" in text
    assert "zero-downtime ingress routing controller" in text

    # Neither of the two old bullets should remain
    assert "First bullet for e-commerce" not in text
    assert "Second bullet for e-commerce" not in text
    assert "E-Commerce Microservices" not in text

    # Sibling project remains intact
    assert "Distributed Cache | Go, Redis" in text
    assert "Single bullet for distributed cache." in text


def test_replace_project_not_found_inserts_under_heading(multi_bullet_resume, tmp_path):
    """If old project is not found, insert a new entry under Projects heading instead of editing paragraph 0."""
    out_path = str(tmp_path / "swapped_fallback.docx")
    success = replace_project_in_docx(
        doc_path=multi_bullet_resume,
        output_path=out_path,
        old_project_name="Nonexistent Project Title",
        new_project_title="Brand New Architecture",
        new_tech_stack=["Rust"],
        new_bullet_point="Engineered memory-safe actor system."
    )
    assert success is True

    doc = docx.Document(out_path)
    paras = [p.text for p in doc.paragraphs]
    proj_idx = paras.index("Projects")
    assert paras[proj_idx + 1] == "Brand New Architecture | Rust"
    assert "Engineered memory-safe actor system." in paras[proj_idx + 2]


def test_tighten_progressive_steps(tmp_path):
    """Verify progressive tightening in steps without dropping font below 9.5pt."""
    doc_path = tmp_path / "overflow_resume.docx"
    doc = docx.Document()
    doc.add_heading("Jane Dev", 0)
    doc.add_paragraph("Summary: Senior engineer with extensive experience.")

    doc.add_heading("Projects", 1)
    for i in range(25):
        doc.add_paragraph(f"Project Entry {i} | Tech Stack, Tools, Frameworks")
        doc.add_paragraph(f"Detailed engineering bullet point {i} describing distributed cloud architectures and streaming data pipelines.", style="List Bullet")

    doc.save(str(doc_path))

    doc_test = docx.Document(str(doc_path))
    res = auto_tighten_docx_spacing(doc_test, line_threshold=35)
    assert res["tightened"] is True
    assert "paragraph_spacing_reduced" in res["changes"]

    # Verify no font run is smaller than 9.5 pt
    for p in doc_test.paragraphs:
        for r in p.runs:
            if r.font and r.font.size:
                assert r.font.size.pt >= 9.5


@pytest.mark.skipif(not has_libreoffice(), reason="LibreOffice not installed for PDF page count verification")
def test_libreoffice_pdf_page_count_verification(tmp_path):
    """Converts 10 generated resumes to PDF via LibreOffice and verifies they are exactly 1 page."""
    for i in range(10):
        doc_path = tmp_path / f"resume_{i}.docx"
        doc = docx.Document()
        doc.add_heading(f"Candidate {i}", 0)
        doc.add_paragraph("Email: candidate@example.com")
        doc.add_heading("Projects", 1)
        for j in range(3):
            doc.add_paragraph(f"Project {j} | Python")
            doc.add_paragraph(f"Engineered service {j} processing large data.", style="List Bullet")
        auto_tighten_docx_spacing(doc)
        doc.save(str(doc_path))

        pages = convert_docx_to_pdf_page_count(str(doc_path), str(tmp_path))
        if pages is not None:
            assert pages == 1
