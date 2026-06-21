from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Enum
from sqlalchemy import DateTime

from datetime import datetime

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)

    full_name = Column(String(255))

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        Enum(
            "super_admin",
            "admin",
            "dispatcher"
        )
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )