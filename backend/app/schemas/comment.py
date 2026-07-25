from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    comment: str


class CommentResponse(BaseModel):
    id: str
    alert_id: str
    user_id: Optional[str] = None
    author_name: str
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True