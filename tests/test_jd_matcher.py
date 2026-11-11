import os
import sys
import json
import subprocess
import pytest
import docx
from pathlib import Path
from services.jd_matcher import compute_jd_match_score


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


def test_aliases_normalization(tmp_path):
    """Aliases like postgres -> postgresql, k8s -> kubernetes must match seamlessly."""
    p = tmp_path / "alias_resume.docx"
    doc = docx.Document()
    doc.add_heading("Cloud Engineer", 0)
    doc.add_paragraph("Skills: k8s, postgres, reactjs, aws")
    doc.save(str(p))

    jd = """
    Requirements:
    - Kubernetes orchestration
    - PostgreSQL database management
    - React frontend architecture
    - Amazon Web Services cloud platform
    """
    res = compute_jd_match_score(str(p), jd)
    assert res["match_score"] == 100
    assert "kubernetes" in res["matched_keywords"]
    assert "postgresql" in res["matched_keywords"]
    assert "react" in res["matched_keywords"]
    assert "aws" in res["matched_keywords"]
    assert res["missing_keywords"] == []


def test_no_skills_jd(test_resume_docx):
    """JD without technical skills must score 0 and return 'no skills detected' message."""
    jd = """
    About The Role:
    We are seeking an energetic team member with fantastic verbal communication,
    interpersonal skills, and a positive attitude. You will coordinate team meetings,
    answer inquiries, and maintain high enthusiasm.
    """
    res = compute_jd_match_score(test_resume_docx, jd)
    assert res["match_score"] == 0
    assert res.get("message") == "no skills detected"
    assert res["matched_keywords"] == []
    assert res["missing_keywords"] == []


def test_section_weighting_required_vs_bonus(tmp_path):
    """Skills in Required count 2x skills in Nice to have / Bonus."""
    # Resume A: has only the 2 required skills (Python, PostgreSQL)
    p_req = tmp_path / "resume_req.docx"
    doc_a = docx.Document()
    doc_a.add_paragraph("Skills: Python, PostgreSQL")
    doc_a.save(str(p_req))

    # Resume B: has only the 2 bonus skills (Docker, Kubernetes)
    p_bonus = tmp_path / "resume_bonus.docx"
    doc_b = docx.Document()
    doc_b.add_paragraph("Skills: Docker, Kubernetes")
    doc_b.save(str(p_bonus))

    jd = """
    Required Qualifications:
    - Python
    - PostgreSQL

    Nice to have / Bonus:
    - Docker
    - Kubernetes
    """
    # Total points = 2*2 (required) + 2*1 (bonus) = 6.0
    # Resume A: 4 / 6 = 67%
    # Resume B: 2 / 6 = 33%
    res_a = compute_jd_match_score(str(p_req), jd)
    res_b = compute_jd_match_score(str(p_bonus), jd)

    assert res_a["match_score"] == 67
    assert res_b["match_score"] == 33
    assert res_a["match_score"] > res_b["match_score"]


def test_ambiguous_go_matching(tmp_path):
    """Lowercase 'go' in regular prose must NOT trigger Go programming language match."""
    p_false = tmp_path / "resume_false_go.docx"
    doc1 = docx.Document()
    doc1.add_paragraph("I go to meetings every day and love to go above and beyond.")
    doc1.save(str(p_false))

    p_true = tmp_path / "resume_true_go.docx"
    doc2 = docx.Document()
    doc2.add_paragraph("Skills: Go, Python, Docker")
    doc2.save(str(p_true))

    jd = """
    Required:
    - Go backend microservices
    """
    res_false = compute_jd_match_score(str(p_false), jd)
    assert "go" not in res_false["matched_keywords"]
    assert "go" in res_false["missing_keywords"]

    res_true = compute_jd_match_score(str(p_true), jd)
    assert "go" in res_true["matched_keywords"]


def test_fuzzy_matching_difflib(tmp_path):
    """Minor typos (ratio >= 0.90) like 'kubernets' match 'kubernetes'."""
    p = tmp_path / "resume_fuzzy.docx"
    doc = docx.Document()
    doc.add_paragraph("Skills: kubernets, postgre, dockers")
    doc.save(str(p))

    jd = """
    Required:
    - Kubernetes
    """
    res = compute_jd_match_score(str(p), jd)
    assert "kubernetes" in res["matched_keywords"]


def test_five_real_style_jds(test_resume_docx):
    """Test 5 real-style industry job descriptions."""
    # JD 1: Senior Backend Engineer (Go, Kafka, AWS, PostgreSQL)
    jd1 = """
    Senior Backend Engineer
    Requirements:
    - Go and Python microservices development
    - PostgreSQL and Redis high concurrency
    - AWS cloud hosting and Kubernetes
    Bonus:
    - Apache Kafka event streaming
    - Terraform IaC
    """
    res1 = compute_jd_match_score(test_resume_docx, jd1)
    assert 50 <= res1["match_score"] <= 80
    assert "python" in res1["matched_keywords"]
    assert "postgresql" in res1["matched_keywords"]

    # JD 2: Fullstack Engineer (React, TypeScript, Node.js)
    jd2 = """
    Fullstack Engineer
    Requirements:
    - React, TypeScript, and Node.js
    - PostgreSQL and Docker
    Nice to have:
    - GraphQL and Next.js
    """
    res2 = compute_jd_match_score(test_resume_docx, jd2)
    assert 60 <= res2["match_score"] <= 95
    assert "react" in res2["matched_keywords"]
    assert "typescript" in res2["matched_keywords"]

    # JD 3: ML Platform Engineer
    jd3 = """
    ML Platform Engineer
    Requirements:
    - PyTorch and TensorFlow deep learning
    - ClickHouse and Apache Spark
    Bonus:
    - Python and Docker
    """
    res3 = compute_jd_match_score(test_resume_docx, jd3)
    assert res3["match_score"] < 50
    assert "pytorch" in res3["missing_keywords"]

    # JD 4: SRE / Infrastructure Engineer
    jd4 = """
    Site Reliability Engineer
    Requirements:
    - Terraform, Ansible, and Linux
    - Prometheus and Grafana monitoring
    Nice to have:
    - Kubernetes and Docker
    """
    res4 = compute_jd_match_score(test_resume_docx, jd4)
    assert "kubernetes" in res4["matched_keywords"]
    assert "terraform" in res4["missing_keywords"]

    # JD 5: Data Engineer
    jd5 = """
    Data Infrastructure Engineer
    Requirements:
    - Python and PostgreSQL
    - Apache Spark and Cassandra
    Bonus:
    - Redis and Docker
    """
    res5 = compute_jd_match_score(test_resume_docx, jd5)
    assert "python" in res5["matched_keywords"]
    assert "postgresql" in res5["matched_keywords"]


def test_determinism_across_pythonhashseed(tmp_path):
    """Output must be bit-for-bit identical across 3 different PYTHONHASHSEED values."""
    doc_path = tmp_path / "det_resume.docx"
    doc = docx.Document()
    doc.add_heading("Candidate", 0)
    doc.add_paragraph("Skills: Python, FastAPI, Docker, PostgreSQL, Redis, Kubernetes, React, TypeScript")
    doc.save(str(doc_path))

    jd_text = """
    Requirements:
    - Python, FastAPI, Docker, PostgreSQL
    Nice to have:
    - Redis, Kubernetes, Kafka, Terraform
    """

    results = []
    seeds = ["0", "1", "42"]

    script = f"""
import json
from services.jd_matcher import compute_jd_match_score
res = compute_jd_match_score(r"{str(doc_path)}", \"\"\"{jd_text}\"\"\")
print(json.dumps(res, sort_keys=True))
"""

    for seed in seeds:
        env = os.environ.copy()
        env["PYTHONHASHSEED"] = seed
        proc = subprocess.run(
            [sys.executable, "-c", script],
            capture_output=True,
            text=True,
            env=env,
            check=True
        )
        output_json = proc.stdout.strip()
        results.append(output_json)

    assert results[0] == results[1] == results[2], "JD matcher output was non-deterministic across PYTHONHASHSEED!"
