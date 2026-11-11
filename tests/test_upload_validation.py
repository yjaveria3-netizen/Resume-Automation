import io
import uuid
import docx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User


@pytest.fixture
def upload_client(temp_db_session):
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user = User(id=uuid.uuid4(), email="uploader@example.com", password_hash="pw")
    temp_db_session.add(user)
    temp_db_session.commit()

    token = create_access_token(subject=str(user.id))
    client = TestClient(app)

    yield {
        "client": client,
        "token": token,
        "user": user,
    }

    app.dependency_overrides.pop(get_db, None)


def test_upload_pdf_rejected(upload_client):
    client = upload_client["client"]
    token = upload_client["token"]

    fake_pdf = io.BytesIO(b"%PDF-1.4 fake pdf content")
    res = client.post(
        "/resumes/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("resume.pdf", fake_pdf, "application/pdf")},
    )
    assert res.status_code == 400
    assert "Only Microsoft Word (.docx)" in res.json()["detail"]


def test_upload_txt_rejected(upload_client):
    client = upload_client["client"]
    token = upload_client["token"]

    fake_txt = io.BytesIO(b"Just plain text resume")
    res = client.post(
        "/resumes/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("resume.txt", fake_txt, "text/plain")},
    )
    assert res.status_code == 400
    assert "Only Microsoft Word (.docx)" in res.json()["detail"]


def test_upload_fake_docx_renamed_exe_rejected(upload_client):
    client = upload_client["client"]
    token = upload_client["token"]

    # PE executable header MZ
    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00ffff")
    res = client.post(
        "/resumes/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("malicious.docx", fake_exe, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 400
    assert "not a valid docx" in res.json()["detail"].lower() or "magic bytes" in res.json()["detail"].lower()


def test_upload_empty_file_rejected(upload_client):
    client = upload_client["client"]
    token = upload_client["token"]

    empty_file = io.BytesIO(b"")
    res = client.post(
        "/resumes/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("empty.docx", empty_file, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()


def test_upload_oversized_file_rejected(upload_client):
    client = upload_client["client"]
    token = upload_client["token"]

    # 6MB dummy stream (exceeds 5MB cap)
    large_stream = io.BytesIO(b"P" * (6 * 1024 * 1024))
    res = client.post(
        "/resumes/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("oversized.docx", large_stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 400
    assert "exceeds maximum allowed limit" in res.json()["detail"].lower()


def test_upload_valid_docx_succeeds_201_with_ats_and_line_budget(upload_client):
    client = upload_client["client"]
    token = upload_client["token"]

    # Create real valid docx in memory
    doc = docx.Document()
    doc.add_heading("Jane Doe", 0)
    doc.add_paragraph("janedoe@example.com | 555-123-4567 | San Francisco, CA")
    doc.add_heading("Projects", level=1)
    doc.add_paragraph("Cloud Architecture Platform | Python, Docker, AWS")
    doc.add_paragraph("Architected scalable cloud microservices reducing infrastructure latency by 45% across 2M users.")
    doc.add_heading("Skills", level=1)
    doc.add_paragraph("Python, FastAPI, Docker, Kubernetes, PostgreSQL, Redis, AWS")

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    res = client.post(
        "/resumes/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("Jane_Doe_Resume.docx", buf, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["original_filename"] == "Jane_Doe_Resume.docx"
    assert "download_url" in data
    assert "file_path" not in data  # Never leak server file path
    assert data["ats_score"] is not None
    assert data["ats_score"] > 0
    assert data["line_budget"] is not None
    assert data["line_budget"] > 0
