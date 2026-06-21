from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Enum
from sqlalchemy import Boolean
from sqlalchemy import DateTime

from datetime import datetime

from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(
        String(36),
        primary_key=True
    )

    type = Column(
        Enum(
            "Fire",
            "Medical",
            "Safety"
        ),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    location_hint = Column(
        String(255)
    )

    status = Column(
        Enum(
            "active",
            "acknowledged",
            "investigating",
            "resolved",
            "false_report"
        ),
        default="active"
    )

    priority = Column(
        Enum(
            "low",
            "medium",
            "high",
            "critical"
        ),
        default="medium"
    )

    is_false_report = Column(
        Boolean,
        default=False
    )

    reported_by = Column(
        String(36)
    )

    assigned_to = Column(
        String(36)
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )