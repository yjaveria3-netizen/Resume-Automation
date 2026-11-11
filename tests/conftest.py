import os
import sys
import tempfile
from pathlib import Path

# Force default DATABASE_URL to a temporary sqlite file so tests NEVER touch committed DB
_TEMP_DIR = tempfile.mkdtemp()
_TEST_DB_PATH = Path(_TEMP_DIR) / "test_runner.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"

import docx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import Base
import app.models  # ensure all models are registered in Base.metadata


@pytest.fixture
def temp_db_engine(tmp_path):
    """Creates an isolated temporary SQLite database engine."""
    db_file = tmp_path / "test_temp.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()
    if db_file.exists():
        try:
            db_file.unlink()
        except Exception:
            pass


@pytest.fixture
def temp_db_session(temp_db_engine):
    """Yields a temporary SQLAlchemy session bound to the temp DB engine."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=temp_db_engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def tmp_docx_builder(tmp_path):
    """Helper fixture to build customized test docx files in tmp_path."""
    def _builder(filename: str = "test.docx", title: str = "Candidate", sections: dict = None) -> Path:
        p = tmp_path / filename
        doc = docx.Document()
        doc.add_heading(title, 0)
        if sections:
            for sec_name, content in sections.items():
                doc.add_heading(sec_name, 1)
                if isinstance(content, list):
                    for item in content:
                        if item.startswith(("-", "•")):
                            doc.add_paragraph(item.lstrip("-• "), style="List Bullet")
                        else:
                            doc.add_paragraph(item)
                else:
                    doc.add_paragraph(str(content))
        doc.save(str(p))
        return p

    return _builder


@pytest.fixture
def clean_env(monkeypatch):
    """Provides a sanitized environment for tests."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_MODELS", "gemini-2.5-flash")


@pytest.fixture(autouse=True)
def reset_rate_limit_between_tests():
    """Automatically resets the in-memory rate limit store between tests to prevent test leakage."""
    from app.middleware.rate_limit import reset_rate_limit_store
    reset_rate_limit_store()
    yield
    reset_rate_limit_store()

