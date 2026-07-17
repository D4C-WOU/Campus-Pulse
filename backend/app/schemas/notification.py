from datetime import datetime
from pydantic import BaseModel

class NotificationResponse(BaseModel):
  id:str
  title: str
  message : str
  type : str
  is_read: bool
  alert_id :str | None
  created_at: datetime

  class Config:
    from_attributes = True