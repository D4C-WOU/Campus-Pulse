from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.alert import Alert


def create_audit_log(db: Session, admin_id: str, alert_id: str, action: str):
    log = AuditLog(admin_id=admin_id, alert_id=alert_id, action=action)

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_all_audit_logs(db: Session, limit: int = 200):
    """
    Newest first, with admin email and alert type resolved so the frontend
    doesn't have to do N+1 lookups just to render a readable table.
    """
    rows = (
        db.query(
            AuditLog.id,
            AuditLog.admin_id,
            User.email.label("admin_email"),
            AuditLog.alert_id,
            Alert.type.label("alert_type"),
            AuditLog.action,
            AuditLog.created_at,
        )
        .outerjoin(User, User.id == AuditLog.admin_id)
        .outerjoin(Alert, Alert.id == AuditLog.alert_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )

    return [dict(row._mapping) for row in rows]
