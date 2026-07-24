from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AlertCreate(BaseModel):
    type: str
    message: str
    location_hint: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    priority: Optional[str] = "medium"


class AlertResponse(BaseModel):
    id: str

    incident_code: str

    type: str

    message: str

    location_hint: Optional[str]

    latitude: Optional[float]

    longitude: Optional[float]

    status: str

    priority: str

    created_at: datetime

    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True