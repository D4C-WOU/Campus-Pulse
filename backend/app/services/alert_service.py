import uuid

from sqlalchemy.orm import Session

from app.models.alert import Alert


def create_alert(
    db: Session,
    payload
):
    alert = Alert(
        id=str(uuid.uuid4()),
        type=payload.type,
        message=payload.message,
        location_hint=payload.location_hint,
        priority=payload.priority,
        status="active",
        reported_by="anonymous"
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def get_all_alerts(
    db: Session
):
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )


def get_alert_by_id(
    db: Session,
    alert_id: str
):
    return (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )