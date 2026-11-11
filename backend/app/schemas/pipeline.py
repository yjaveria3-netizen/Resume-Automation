from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel


class RegenerationResponse(BaseModel):
    success: bool
    version_id: UUID
    version_number: int
    ats_score: int
    bullets: List[str]
    download_url: str
