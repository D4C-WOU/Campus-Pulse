from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PublicAlertStatus(BaseModel):
    reference: str
    type: str
    status: str
    location_hint: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True