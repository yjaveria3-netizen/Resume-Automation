import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, UUID, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base


class ArchivedProject(Base):
    __tablename__ = "archived_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_name = Column(Text, nullable=False)
    tech_stack = Column(JSON, nullable=True)  # JSON-compatible for SQLite and Postgres
    bullet_point = Column(Text, nullable=True)
    archived_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", backref="archived_projects")
