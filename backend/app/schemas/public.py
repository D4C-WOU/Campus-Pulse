from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PublicAlertStatus(BaseModel):
    reference: str
    type: str
    status: str

    location_hint: Optional[str]
    message: Optional[str]
    latest_comment: Optional[str]

    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True