from sqlalchemy import Column
from sqlalchemy import BigInteger
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    admin_id = Column(
        String(36)
    )

    alert_id = Column(
        String(36)
    )

    action = Column(
        String(255)
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )