from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict, Union
from pydantic import BaseModel, ConfigDict


class BulletSuggestionOut(BaseModel):
    id: UUID
    user_id: UUID
    repo_name: str
    commit_sha: Optional[str] = None
    commit_message: Optional[str] = None
    proposed_bullet: str
    diff_summary: Optional[Union[Dict[str, Any], str]] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SuggestionUpdateRequest(BaseModel):
    proposed_bullet: str


class SuggestionAcceptRequest(BaseModel):
    custom_bullet: Optional[str] = None


class SwapProjectRequest(BaseModel):
    archive_project_id: UUID


class MatchJdRequest(BaseModel):
    resume_id: UUID
    job_description: str


class MatchJdResponse(BaseModel):
    match_score: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendations: list[str]
