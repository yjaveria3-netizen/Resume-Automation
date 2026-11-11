from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict, Union, List
from pydantic import BaseModel, ConfigDict, field_validator


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

    @field_validator("proposed_bullet", mode="before")
    @classmethod
    def clean_bullet(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v


class SuggestionAcceptRequest(BaseModel):
    custom_bullet: Optional[str] = None

    @field_validator("custom_bullet", mode="before")
    @classmethod
    def clean_custom_bullet(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip()
        return v


class SwapProjectRequest(BaseModel):
    archive_project_id: UUID


class MatchJdRequest(BaseModel):
    resume_id: Optional[UUID] = None
    job_description: str

    @field_validator("job_description", mode="before")
    @classmethod
    def clean_and_validate_jd(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if len(cleaned) > 10000:
                raise ValueError("job_description text cannot exceed 10000 characters")
            return cleaned
        return v


class MatchJdResponse(BaseModel):
    match_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    recommendations: List[str]
