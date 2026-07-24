import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.alert_comment import AlertComment
from app.services.audit_service import create_audit_log
from app.services.notification_service import create_notification


def _create_timeline_entry(db: Session, alert_id: str, text: str):
    entry = AlertComment(
        id=str(uuid.uuid4()),
        alert_id=alert_id,
        user_id=None,  # System timeline entry uses None
        comment=text,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def create_alert(db: Session, payload):
    alert = Alert(
        id=str(uuid.uuid4()),
        type=payload.type,
        message=payload.message,
        location_hint=payload.location_hint,
        priority=payload.priority or "medium",
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


def acknowledge_alert(db: Session, alert: Alert, admin_id: str):
    if alert.status != "active":
        return None

    alert.status = "acknowledged"
    db.commit()
    db.refresh(alert)

    _create_timeline_entry(db, alert.id, "👁️ Alert acknowledged by dispatcher.")
    create_audit_log(db, admin_id, alert.id, "ALERT_ACKNOWLEDGED")
    return alert


def investigate_alert(db: Session, alert: Alert, admin_id: str):
    if alert.status not in ["active", "acknowledged"]:
        return None

    alert.status = "investigating"
    db.commit()
    db.refresh(alert)

    _create_timeline_entry(db, alert.id, "🔍 Investigation started.")
    create_audit_log(db, admin_id, alert.id, "ALERT_INVESTIGATING")
    return alert


def resolve_alert(db: Session, alert: Alert, admin_id: str):
    if alert.status not in ["acknowledged", "investigating"]:
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


def false_report_alert(db: Session, alert: Alert, admin_id: str):
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