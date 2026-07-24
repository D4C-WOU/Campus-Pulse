from sqlalchemy import Column, Integer, String

from app.db.base import Base


class IncidentType(Base):
    __tablename__ = "incident_types"

    id = Column(Integer, primary_key=True, autoincrement=True)

    name = Column(String(100), unique=True, nullable=False)

    description = Column(String(500))