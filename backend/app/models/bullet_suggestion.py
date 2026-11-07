import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, UUID, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class BulletSuggestion(Base):
    __tablename__ = "bullet_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    repo_name = Column(Text, nullable=False)
    commit_sha = Column(Text, nullable=True)
    commit_message = Column(Text, nullable=True)
    proposed_bullet = Column(Text, nullable=False)
    diff_summary = Column(JSON, nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # pending, accepted, dismissed
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", backref="suggestions")
