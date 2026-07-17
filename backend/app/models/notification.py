from datetime import datetime
from sqlalchemy import Boolean,Column,DateTime,ForeignKey,String,Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Notification(Base):
  __tablename__ = 'notifications'
  id = Column(String(36), primary_key=True)
  title = Column(String(255), nullable=False)
  message = Column(Text,nullable=False)
  type = Column(String(50),nullable=False)
  is_read = Column(Boolean,default=False,nullable=False)
  alert_id = Column(String(36),ForeignKey('alerts.id'),nullable=True)
  user_id = Column(String(36), ForeignKey('users.id'),nullable=True)
  created_at = Column(DateTime,default=datetime.utcnow)
  alert= relationship('Alert')
  user= relationship('User')