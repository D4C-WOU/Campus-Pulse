from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.alert_comment import AlertComment


def get_alert_by_reference(db: Session, reference: str):
    """
    Returns an alert plus its latest admin comment.
    """

    alert = (
        db.query(Alert)
        .filter(Alert.id.like(f"{reference}%"))
        .first()
    )

    if not alert:
        return None

    latest_comment = (
        db.query(AlertComment.comment)
        .filter(AlertComment.alert_id == alert.id)
        .order_by(AlertComment.created_at.desc())
        .first()
    )

    return {
        "alert": alert,
        "latest_comment": latest_comment.comment if latest_comment else None,
    }


def get_latest_public_alerts(db: Session, limit: int = 3):
    """
    Returns the latest public-safe incidents for the homepage.
    """

    alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "reference": alert.id[:8],
            "type": alert.type,
            "status": alert.status,
            "location_hint": alert.location_hint,
            "created_at": alert.created_at,
        }
        for alert in alerts
    ]