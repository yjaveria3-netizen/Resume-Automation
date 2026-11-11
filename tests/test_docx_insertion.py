import pytest
import docx
from docx.shared import Pt, RGBColor, Inches
from docx_engine.modifier import insert_project_to_resume


def test_core_insertion_order(tmp_path):
    """Assert that the new entry goes directly UNDER the Projects heading:
    Projects (heading)
    New Project | Tech, Stack
    • bullet text
    <existing entries...>
    """
    doc_path = str(tmp_path / "resume_order.docx")
    out_path = str(tmp_path / "resume_order_out.docx")

    doc = docx.Document()
    doc.add_heading("Education", level=1)
    doc.add_paragraph("Bachelor of Science in CS")
    doc.add_heading("Projects", level=1)
    doc.add_paragraph("Old Existing Project | Python, Django")
    doc.add_paragraph("Old bullet description.", style="List Bullet")
    doc.add_heading("Skills", level=1)
    doc.add_paragraph("Python, Docker, AWS")
    doc.save(doc_path)

    success = insert_project_to_resume(
        doc_path=doc_path,
        output_path=out_path,
        project_title="Cloud Native Microservices",
        tech_stack=["Go", "Kubernetes", "gRPC"],
        bullet_point="Architected high-throughput microservices handling 25,000 req/sec."
    )
    assert success is True

    result_doc = docx.Document(out_path)
    paras = [p.text for p in result_doc.paragraphs]

    proj_idx = paras.index("Projects")
    assert paras[proj_idx + 1] == "Cloud Native Microservices | Go, Kubernetes, gRPC"
    assert "Architected high-throughput microservices" in paras[proj_idx + 2]
    assert paras[proj_idx + 3] == "Old Existing Project | Python, Django"
    assert paras[proj_idx + 4] == "Old bullet description."
    assert paras[proj_idx + 5] == "Skills"


def test_cloned_formatting_custom_font_size_color(tmp_path):
    """Test that font name, size, and color are cloned from existing project entries."""
    doc_path = str(tmp_path / "custom_style.docx")
    out_path = str(tmp_path / "custom_style_out.docx")

    doc = docx.Document()
    doc.add_heading("Projects", level=1)
    p_title = doc.add_paragraph()
    r_title = p_title.add_run("Existing Title | Java")
    r_title.font.name = "Georgia"
    r_title.font.size = Pt(13)
    r_title.font.color.rgb = RGBColor(0x1A, 0x2B, 0x3C)

    p_bullet = doc.add_paragraph(style="List Bullet")
    r_bullet = p_bullet.add_run("Existing bullet text.")
    r_bullet.font.name = "Georgia"
    r_bullet.font.size = Pt(10.5)

    doc.save(doc_path)

    insert_project_to_resume(
        doc_path=doc_path,
        output_path=out_path,
        project_title="New Scalable App",
        tech_stack=["Rust"],
        bullet_point="Engineered memory-safe concurrency engine."
    )

    result_doc = docx.Document(out_path)
    paras = result_doc.paragraphs
    # paras[0] is Projects heading
    # paras[1] is new title
    # paras[2] is new bullet
    new_title_p = paras[1]
    new_bullet_p = paras[2]

    assert new_title_p.runs[0].font.name == "Georgia"
    assert new_title_p.runs[0].font.size == Pt(13)
    assert new_title_p.runs[0].font.color.rgb == RGBColor(0x1A, 0x2B, 0x3C)

    assert new_bullet_p.runs[0].font.name == "Georgia"
    assert new_bullet_p.runs[0].font.size == Pt(10.5)


def test_no_double_bullets_when_style_exists(tmp_path):
    """Never prepend literal '•' AND a list bullet style together."""
    doc_path = str(tmp_path / "bullet_test.docx")
    out_path = str(tmp_path / "bullet_test_out.docx")

    doc = docx.Document()
    doc.add_heading("Projects", level=1)
    doc.add_paragraph("Sample | Python")
    doc.add_paragraph("Bullet one", style="List Bullet")
    doc.save(doc_path)

    insert_project_to_resume(
        doc_path=doc_path,
        output_path=out_path,
        project_title="Project Alpha",
        tech_stack=["Go"],
        bullet_point="• Scaled backend worker nodes by 50%."
    )

    result_doc = docx.Document(out_path)
    new_bullet_text = result_doc.paragraphs[2].text
    assert not new_bullet_text.startswith("• •"), f"Found double bullets: {new_bullet_text}"
    assert not new_bullet_text.startswith("•"), f"Literal bullet should not be prepended when List Bullet style is used: {new_bullet_text}"
    assert new_bullet_text == "Scaled backend worker nodes by 50%."


def test_section_properties_headers_footers_unchanged(tmp_path):
    """Section properties, headers, footers, and other paragraphs remain byte-identical/unchanged."""
    doc_path = str(tmp_path / "doc_with_header.docx")
    out_path = str(tmp_path / "doc_with_header_out.docx")

    doc = docx.Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.75)
    section.header.paragraphs[0].text = "Header: Confidential Resume"
    section.footer.paragraphs[0].text = "Page 1 of 1"

    doc.add_heading("Education", level=1)
    doc.add_paragraph("MIT CS 2024")
    doc.add_heading("Projects", level=1)
    doc.add_paragraph("Pre-existing Project | C++")
    doc.add_paragraph("Built low-latency matching engine.")
    doc.save(doc_path)

    insert_project_to_resume(
        doc_path=doc_path,
        output_path=out_path,
        project_title="New Service",
        tech_stack=["Python"],
        bullet_point="Automated CI/CD deployment pipelines."
    )

    result_doc = docx.Document(out_path)
    res_section = result_doc.sections[0]
    assert res_section.header.paragraphs[0].text == "Header: Confidential Resume"
    assert res_section.footer.paragraphs[0].text == "Page 1 of 1"
    assert res_section.top_margin == Inches(0.75)
    assert result_doc.paragraphs[0].text == "Education"
    assert result_doc.paragraphs[1].text == "MIT CS 2024"
