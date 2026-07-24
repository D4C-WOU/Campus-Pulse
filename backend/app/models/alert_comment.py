# backend/app/models/alert_comment.py
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base

class AlertComment(Base):
    __tablename__ = "alert_comments"

    id = Column(String(36), primary_key=True)
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True) # Nullable for system entries
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)