from uuid import UUID
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict


class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    github_repo_name: str
    description: Optional[str] = None
    html_url: Optional[str] = None
    language: Optional[str] = None
    tech_stack: Optional[Any] = None
    stars: int = 0
    rank_score: float = 0.0
    pushed_at: Optional[datetime] = None
    fetched_at: datetime

    model_config = ConfigDict(from_attributes=True)
