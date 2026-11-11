from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    original_filename: str
    download_url: Optional[str] = None
    ats_score: Optional[int] = 0
    line_budget: Optional[int] = 0
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
