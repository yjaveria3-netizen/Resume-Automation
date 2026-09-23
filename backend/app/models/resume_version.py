import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id"), nullable=False, index=True)
    file_path = Column(Text, nullable=False)
    ats_score = Column(Integer, default=0)
    version_number = Column(Integer, default=1)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    resume = relationship("Resume", backref="versions")
