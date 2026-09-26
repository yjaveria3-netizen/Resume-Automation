from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

raw_url = (settings.DATABASE_URL or "").strip()

if not raw_url:
    database_url = "sqlite:///./resume_auto_updater.db"
elif raw_url.startswith("postgres://"):
    database_url = raw_url.replace("postgres://", "postgresql://", 1)
elif raw_url.startswith("postgresql://"):
    database_url = raw_url
elif raw_url.startswith(":"):
    database_url = f"postgresql://postgres{raw_url}"
else:
    database_url = raw_url


def create_db_engine(url: str):
    """Creates SQLAlchemy engine with optimized connection pooling (pool_size=10, max_overflow=20, pool_recycle=1800, pool_pre_ping=True)."""
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )

    return create_engine(
        url,
        pool_size=10,
        max_overflow=20,
        pool_recycle=1800,
        pool_pre_ping=True,
    )


try:
    engine = create_db_engine(database_url)
    with engine.connect() as conn:
        pass
except Exception:
    database_url = "sqlite:///./resume_auto_updater.db"
    engine = create_db_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for obtaining database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
