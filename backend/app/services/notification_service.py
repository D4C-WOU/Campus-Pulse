import uuid
from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(db: Session, *, title: str, message: str, type: str, alert_id: str | None):
    notification = Notification(
        id=str(uuid.uuid4()),
        title=title,
        message=message,
        type=type,
        alert_id=alert_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notification(db: Session):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()


def get_unread_count(db: Session) -> int:
    return db.query(Notification).filter(Notification.is_read == False).count()


def mark_read(db: Session, notification_id: str):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification


def mark_all_read(db: Session):
    notifications = db.query(Notification).filter(Notification.is_read == False).all()
    for notification in notifications:
        notification.is_read = True
    db.commit()