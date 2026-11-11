import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, UUID, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ArchivedProject(Base):
    __tablename__ = "archived_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True, index=True)
    project_title = Column(Text, nullable=False)
    bullet_text = Column(Text, nullable=True)
    project_name = Column(Text, nullable=True)
    bullet_point = Column(Text, nullable=True)
    tech_stack = Column(JSON, nullable=True)
    archived_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", backref="archived_projects")
    resume = relationship("Resume", backref="archived_projects")
