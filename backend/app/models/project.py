import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer, Float, UUID, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    github_repo_name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    html_url = Column(String, nullable=True)
    language = Column(String, nullable=True)
    tech_stack = Column(JSON, nullable=True)
    stars = Column(Integer, default=0)
    rank_score = Column(Float, default=0.0)
    pushed_at = Column(DateTime(timezone=True), nullable=True)
    fetched_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "github_repo_name", name="uix_user_repo_name"),
    )

    user = relationship("User", backref="projects")
