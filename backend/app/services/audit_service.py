from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.alert import Alert


def create_audit_log(db: Session, admin_id: str, alert_id: str, action: str):
    log = AuditLog(
        admin_id=admin_id,
        alert_id=alert_id,
        action=action,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


def get_all_audit_logs(db: Session, page: int = 1, limit: int = 10):
    """
    Returns paginated audit logs with resolved admin email and alert type.
    """

    base_query = (
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
    )

    total = base_query.count()

    rows = (
        base_query.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": [dict(row._mapping) for row in rows],
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit if total else 1,
    }