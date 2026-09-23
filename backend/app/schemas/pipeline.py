from uuid import UUID
from typing import List
from pydantic import BaseModel


class RegenerationResponse(BaseModel):
    success: bool
    version_id: UUID
    version_number: int
    file_path: str
    ats_score: int
    bullets: List[str]
    download_url: str
