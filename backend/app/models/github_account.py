import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class GitHubAccount(Base):
    __tablename__ = "github_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    github_username = Column(String, nullable=False, index=True)
    github_user_id = Column(String, nullable=True)
    encrypted_access_token = Column(Text, nullable=False)
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

    user = relationship("User", backref="github_account", uselist=False)
