from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class GitHubLoginResponse(BaseModel):
    url: str
    state: str


class GitHubAccountOut(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    github_username: str
    github_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GitHubCallbackResponse(BaseModel):
    status: str
    message: str
    github_username: str
    user_id: Optional[UUID] = None
