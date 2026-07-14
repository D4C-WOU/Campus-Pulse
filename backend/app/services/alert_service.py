import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.services.audit_service import create_audit_log


def alert_to_dict(alert: Alert) -> dict:
    """Shared serializer so REST responses and WebSocket broadcasts never drift apart."""
    return {
        "id": alert.id,
        "type": alert.type,
        "message": alert.message,
        "location_hint": alert.location_hint,
        "status": alert.status,
        "priority": alert.priority,
        "is_false_report": alert.is_false_report,
        "reported_by": alert.reported_by,
        "assigned_to": alert.assigned_to,
        "created_at": alert.created_at,
        "resolved_at": alert.resolved_at,
    }


def create_alert(db: Session, payload):
    alert = Alert(
        id=str(uuid.uuid4()),
        type=payload.type,
        message=payload.message,
        location_hint=payload.location_hint,
        priority=payload.priority,
        status="active",
        reported_by="anonymous",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def get_all_alerts(db: Session):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()


def get_alert_by_id(db: Session, alert_id: str):
    return db.query(Alert).filter(Alert.id == alert_id).first()


def acknowledge_alert(db, alert, admin_id):
    if alert.status != "active":
        return None

    alert.status = "acknowledged"
    db.commit()
    db.refresh(alert)

    create_audit_log(db, admin_id, alert.id, "ALERT_ACKNOWLEDGED")

    return alert


def investigate_alert(db, alert, admin_id):
    if alert.status != "acknowledged":
        return None

    alert.status = "investigating"
    db.commit()
    db.refresh(alert)

    create_audit_log(db, admin_id, alert.id, "ALERT_INVESTIGATING")

    return alert


def resolve_alert(db, alert, admin_id):
    if alert.status not in ["acknowledged", "investigating"]:
        return None

    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)

    create_audit_log(db, admin_id, alert.id, "ALERT_RESOLVED")

    return alert


def false_report_alert(db, alert, admin_id):
    if alert.status == "resolved":
        return None

    alert.status = "false_report"
    alert.is_false_report = True
    db.commit()
    db.refresh(alert)

    create_audit_log(db, admin_id, alert.id, "FALSE_REPORT")

    return alert       


def list_alerts_paginated(db: Session, page: int = 1, limit: int = 20, status: str | None = None):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)

    total = query.count()
    items = (
        query.order_by(Alert.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit if total else 0,
    }