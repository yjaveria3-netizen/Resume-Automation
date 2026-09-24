from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class VersionResponse(BaseModel):
    id: UUID
    resume_id: UUID
    version_number: int
    file_path: str
    ats_score: int
    created_at: datetime
    download_url: str

    model_config = ConfigDict(from_attributes=True)
