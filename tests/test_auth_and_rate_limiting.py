import uuid
import pytest
from fastapi import Depends, APIRouter
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.dependencies import get_current_user, require_role, require_resume_owner
from app.models.user import User
from app.models.resume import Resume
from app.middleware.rate_limit import reset_rate_limit_store
from app.schemas.suggestions import MatchJdRequest

# Add a test-only route to verify require_role
_test_router = APIRouter()

@_test_router.get("/test/admin-only")
def admin_only_endpoint(user: User = Depends(require_role("admin"))):
    return {"message": "hello admin"}

app.include_router(_test_router)


@pytest.fixture
def auth_setup(temp_db_session):
    reset_rate_limit_store()
    app.dependency_overrides[get_db] = lambda: temp_db_session

    user_regular = User(id=uuid.uuid4(), email="regular@example.com", password_hash="pw", role="user")
    user_admin = User(id=uuid.uuid4(), email="admin@example.com", password_hash="pw", role="admin")
    temp_db_session.add_all([user_regular, user_admin])
    temp_db_session.commit()

    token_regular = create_access_token(subject=str(user_regular.id))
    token_admin = create_access_token(subject=str(user_admin.id))

    client = TestClient(app)

    yield {
        "client": client,
        "db": temp_db_session,
        "user_regular": user_regular,
        "user_admin": user_admin,
        "token_regular": token_regular,
        "token_admin": token_admin,
    }

    reset_rate_limit_store()
    app.dependency_overrides.pop(get_db, None)


def test_auth_middleware_rejects_missing_or_invalid_token(auth_setup):
    client = auth_setup["client"]

    # Missing token -> 401 (or 403 from HTTPBearer)
    res = client.get("/projects")
    assert res.status_code in (401, 403)

    # Invalid / forged token -> 401
    res = client.get("/projects", headers={"Authorization": "Bearer not-a-valid-token"})
    assert res.status_code == 401


def test_require_role_enforcement(auth_setup):
    client = auth_setup["client"]
    token_regular = auth_setup["token_regular"]
    token_admin = auth_setup["token_admin"]

    # Regular user attempting admin endpoint -> 403
    res_regular = client.get("/test/admin-only", headers={"Authorization": f"Bearer {token_regular}"})
    assert res_regular.status_code == 403
    assert "requires role 'admin'" in res_regular.json()["detail"]

    # Admin user attempting admin endpoint -> 200
    res_admin = client.get("/test/admin-only", headers={"Authorization": f"Bearer {token_admin}"})
    assert res_admin.status_code == 200
    assert res_admin.json()["message"] == "hello admin"


def test_require_resume_owner_enforcement(auth_setup):
    db = auth_setup["db"]
    user_regular = auth_setup["user_regular"]
    user_admin = auth_setup["user_admin"]

    # Resume owned by user_regular
    resume = Resume(
        id=uuid.uuid4(),
        user_id=user_regular.id,
        original_filename="regular.docx",
        file_path="C:/dummy/path/regular.docx",
    )
    db.add(resume)
    db.commit()

    # user_regular can access their own resume
    r1 = require_resume_owner(resume.id, user_regular, db)
    assert r1.id == resume.id

    # user_admin attempting to access user_regular's resume -> 403
    with pytest.raises(Exception) as exc_info:
        require_resume_owner(resume.id, user_admin, db)
    assert exc_info.value.status_code == 403

    # Non-existent resume ID -> 404
    with pytest.raises(Exception) as exc_info2:
        require_resume_owner(uuid.uuid4(), user_regular, db)
    assert exc_info2.value.status_code == 404


def test_rate_limit_triggers_on_11th_attempt(auth_setup):
    client = auth_setup["client"]
    reset_rate_limit_store()

    # 10 attempts allowed
    for i in range(10):
        res = client.post("/auth/login", json={"email": "none@example.com", "password": "wrong"})
        assert res.status_code == 401

    # 11th attempt must trigger 429 Too Many Requests
    res11 = client.post("/auth/login", json={"email": "none@example.com", "password": "wrong"})
    assert res11.status_code == 429
    assert "Retry-After" in res11.headers
    retry_after = int(res11.headers["Retry-After"])
    assert retry_after > 0


def test_job_description_validation_caps_length():
    # Length > 10000 characters must fail validation
    long_jd = "A" * 10001
    with pytest.raises(ValueError, match="cannot exceed 10000 characters"):
        MatchJdRequest(resume_id=uuid.uuid4(), job_description=long_jd)

    # Valid length strips whitespace
    valid_jd = MatchJdRequest(resume_id=uuid.uuid4(), job_description="   Python Developer required   ")
    assert valid_jd.job_description == "Python Developer required"
