from sqlalchemy import Column 
from sqlalchemy import String
from sqlalchemy import DateTime
from datetime import datetime
from app.db.base import Base

class User(Base):
  __tablename__ = 'users'

  id = Column(String,primary_key=True)

  full_name = Column(String)
  email = Column(String,unique=True)
  password_hash = Column(String)
  role= Column(String)

  created_at = Column(DateTime,default = datetime.utcnow)