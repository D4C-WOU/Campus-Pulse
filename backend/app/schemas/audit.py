from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: int
    admin_id: Optional[str] = None
    admin_email: Optional[str] = None
    alert_id: Optional[str] = None
    alert_type: Optional[str] = None
    action: str
    created_at: datetime

    class Config:
        from_attributes = True
