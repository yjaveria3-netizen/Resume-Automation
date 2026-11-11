import json
import logging
import os
import time
import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from services.cleanup import cleanup_old_temp_files


def test_structured_logging_middleware_logs_json_and_masks_secrets(caplog, temp_db_session):
    app.dependency_overrides[get_db] = lambda: temp_db_session
    user = User(id=uuid.uuid4(), email="obs_user@example.com", password_hash="pw")
    temp_db_session.add(user)
    temp_db_session.commit()

    token = create_access_token(subject=str(user.id))
    client = TestClient(app)

    with caplog.at_level(logging.INFO, logger="api_access"):
        res = client.get("/projects", headers={"Authorization": f"Bearer {token}"})

    app.dependency_overrides.pop(get_db, None)

    # Find log record from api_access logger
    api_records = [r for r in caplog.records if r.name == "api_access"]
    assert len(api_records) > 0

    log_entry = json.loads(api_records[0].message)
    assert "timestamp" in log_entry
    assert log_entry["method"] == "GET"
    assert log_entry["path"] == "/projects"
    assert "status" in log_entry
    assert "duration_ms" in log_entry
    assert log_entry["user_id"] == str(user.id)

    # Ensure sensitive bearer token itself was never logged
    assert token not in api_records[0].message


def test_cleanup_deletes_old_temp_files_but_preserves_resumes_and_recent_files(tmp_path):
    now = time.time()
    old_time = now - (48 * 3600)  # 48 hours ago
    recent_time = now - (1 * 3600)  # 1 hour ago

    # 1. Old temp file (.tmp)
    old_tmp = tmp_path / "scratch_123.tmp"
    old_tmp.write_text("temporary data")
    os.utime(old_tmp, (old_time, old_time))

    # 2. Recent temp file (.tmp)
    recent_tmp = tmp_path / "current_upload.tmp"
    recent_tmp.write_text("in flight upload")
    os.utime(recent_tmp, (recent_time, recent_time))

    # 3. Old actual user resume (.docx)
    actual_resume = tmp_path / "John_Doe_Master_Resume.docx"
    actual_resume.write_text("actual resume content")
    os.utime(actual_resume, (old_time, old_time))

    # 4. Old file in temp subdirectory
    temp_sub = tmp_path / "temp"
    temp_sub.mkdir()
    old_temp_subfile = temp_sub / "scratch.bin"
    old_temp_subfile.write_text("temp bin")
    os.utime(old_temp_subfile, (old_time, old_time))

    # Run cleanup
    deleted = cleanup_old_temp_files(storage_dir=tmp_path, max_age_hours=24)
    assert deleted == 2

    # Assertions on disk state
    assert not old_tmp.exists()
    assert not old_temp_subfile.exists()
    assert recent_tmp.exists()  # Kept because it's recent
    assert actual_resume.exists()  # Kept because it's an actual user resume docx
