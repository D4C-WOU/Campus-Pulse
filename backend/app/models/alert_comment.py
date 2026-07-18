import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.db.base import Base


class AlertComment(Base):
    __tablename__ = "alert_comments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id = Column(String(36), nullable=False)
    user_id = Column(String(36), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)