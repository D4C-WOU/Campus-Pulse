from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertCreate(BaseModel):
    type: str
    message: str
    location_hint: Optional[str] = None
    priority: Optional[str] = "medium"


class AlertResponse(BaseModel):
    id: str
    type: str
    message: str
    location_hint: Optional[str]
    status: str
    priority: str

    class Config:
        from_attributes = True