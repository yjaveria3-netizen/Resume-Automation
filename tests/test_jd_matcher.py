import os
import pytest
import docx
from services.scoring import compute_jd_match_score


@pytest.fixture
def test_resume_docx(tmp_path):
    doc_path = tmp_path / "candidate_resume.docx"
    doc = docx.Document()
    doc.add_heading("Alex Rivera", 0)
    doc.add_paragraph("Fullstack Engineer | alex@example.com")

    doc.add_heading("Skills", 1)
    doc.add_paragraph("Python, FastAPI, Docker, PostgreSQL, Redis, Kubernetes, React, TypeScript, Git")

    doc.add_heading("Projects", 1)
    doc.add_paragraph("High-Throughput Ingestion Engine | Python, FastAPI, Docker")
    doc.add_paragraph("Engineered streaming data ingestion pipeline processing 20k events/sec.", style="List Bullet")

    doc.save(str(doc_path))
    return str(doc_path)


def test_compute_jd_match_score_high_alignment(test_resume_docx):
    jd_text = """
    We are looking for a Senior Backend Engineer.
    Requirements:
    - Proficiency in Python and FastAPI.
    - Experience containerizing microservices with Docker and deploying to Kubernetes.
    - Strong database background in PostgreSQL and Redis caching.
    """
    res = compute_jd_match_score(test_resume_docx, jd_text)
    assert res["match_score"] >= 80
    assert "python" in res["matched_keywords"]
    assert "fastapi" in res["matched_keywords"]
    assert "docker" in res["matched_keywords"]
    assert "redis" in res["matched_keywords"]
    assert len(res["recommendations"]) > 0


def test_compute_jd_match_score_missing_keywords(test_resume_docx):
    jd_text = """
    We need an ML & Data Engineer with:
    - PyTorch and TensorFlow deep learning experience
    - Apache Kafka stream processing
    - Scala, Spark, and Snowflake
    """
    res = compute_jd_match_score(test_resume_docx, jd_text)
    assert any(kw in res["missing_keywords"] for kw in ["pytorch", "tensorflow", "kafka"])
    assert any("Incorporate missing core technologies" in rec for rec in res["recommendations"])
