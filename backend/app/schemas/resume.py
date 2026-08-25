from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    original_filename: str
    file_path: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
