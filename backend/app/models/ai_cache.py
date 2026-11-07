import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, UUID
from app.core.database import Base


class ProjectBulletCache(Base):
    __tablename__ = "project_bullets_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cache_key = Column(String(255), unique=True, nullable=False, index=True)
    bullets_json = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at = Column(DateTime(timezone=True), nullable=False)
