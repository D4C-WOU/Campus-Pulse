from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True)

    incident_code = Column(String(20), unique=True, nullable=False)

    type = Column(
        Enum(
            "Fire",
            "Medical",
            "Safety",
            name="alert_type_enum",
        ),
        nullable=False,
    )

    message = Column(Text, nullable=False)

    location_hint = Column(String(255))

    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)

    status = Column(
        Enum(
            "active",
            "acknowledged",
            "investigating",
            "resolved",
            "false_report",
            name="alert_status_enum",
        ),
        nullable=False,
        default="active",
    )

    priority = Column(
        Enum(
            "low",
            "medium",
            "high",
            "critical",
            name="alert_priority_enum",
        ),
        nullable=False,
        default="medium",
    )

    is_false_report = Column(Boolean, default=False, nullable=False)

    reported_by = Column(String(36), default="anonymous")

    assigned_to = Column(
        String(36),
        ForeignKey("users.id"),
        nullable=True,
    )

    created_at = Column(DateTime, default=datetime.utcnow)

    resolved_at = Column(DateTime, nullable=True)

    assignee = relationship("User")