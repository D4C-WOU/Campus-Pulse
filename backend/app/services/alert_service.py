import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.alert_comment import AlertComment
from app.services.audit_service import create_audit_log
from app.services.notification_service import create_notification

SYSTEM_USER_ID = "system"


def _create_timeline_entry(db: Session, alert_id: str, text: str):
    """Insert an automatic system comment into the incident timeline."""
    entry = AlertComment(
        id=str(uuid.uuid4()),
        alert_id=alert_id,
        user_id=SYSTEM_USER_ID,
        comment=text,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def alert_to_dict(alert: Alert) -> dict:
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


def notification_to_dict(notification) -> dict:
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "is_read": notification.is_read,
        "alert_id": notification.alert_id,
        "created_at": str(notification.created_at),
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

    _create_timeline_entry(
        db,
        alert.id,
        f"🚨 Alert created — {alert.type} reported"
        + (f" near {alert.location_hint}" if alert.location_hint else "") + ".",
    )

    notification = create_notification(
        db=db,
        title="New Alert",
        message=f"{alert.type} reported near {alert.location_hint}",
        type="alert_created",
        alert_id=alert.id,
    )
    alert._new_notification = notification
    return alert


def get_all_alerts(db: Session):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()


def get_alert_by_id(db: Session, alert_id: str):
    return db.query(Alert).filter(Alert.id == alert_id).first()


def investigate_alert(db, alert, admin_id):
    if alert.status != "active":
        return None

    alert.status = "investigating"
    db.commit()
    db.refresh(alert)

    _create_timeline_entry(db, alert.id, "🔍 Investigation started.")
    create_audit_log(db, admin_id, alert.id, "ALERT_INVESTIGATING")
    return alert


def resolve_alert(db, alert, admin_id):
    if alert.status != "investigating":
        return None

    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)

    _create_timeline_entry(db, alert.id, "✅ Incident resolved.")

    notification = create_notification(
        db=db,
        title="Alert Resolved",
        message=f"{alert.type} at {alert.location_hint} has been resolved",
        type="alert_resolved",
        alert_id=alert.id,
    )
    alert._new_notification = notification
    create_audit_log(db, admin_id, alert.id, "ALERT_RESOLVED")
    return alert


def false_report_alert(db, alert, admin_id):
    if alert.status == "resolved":
        return None

    alert.status = "false_report"
    alert.is_false_report = True
    db.commit()
    db.refresh(alert)

    _create_timeline_entry(db, alert.id, "🚫 Marked as false report.")

    notification = create_notification(
        db=db,
        title="False Report",
        message=f"{alert.type} at {alert.location_hint} was marked as a false report",
        type="false_report",
        alert_id=alert.id,
    )
    alert._new_notification = notification
    create_audit_log(db, admin_id, alert.id, "FALSE_REPORT")
    return alert


def list_alerts_paginated(db: Session, page: int = 1, limit: int = 10, status: str | None = None):
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