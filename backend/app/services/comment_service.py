import uuid
from sqlalchemy.orm import Session

from app.models.alert_comment import AlertComment
from app.models.user import User

SYSTEM_USER_ID = "system"


def list_comments(db: Session, alert_id: str):
    rows = (
        db.query(AlertComment, User.full_name)
        .outerjoin(User, User.id == AlertComment.user_id)
        .filter(AlertComment.alert_id == alert_id)
        .order_by(AlertComment.created_at.asc())
        .all()
    )

    return [
        {
            "id": comment.id,
            "alert_id": comment.alert_id,
            "user_id": comment.user_id,
            "author_name": full_name if full_name else "System",
            "comment": comment.comment,
            "created_at": comment.created_at,
        }
        for comment, full_name in rows
    ]


def add_comment(db: Session, alert_id: str, user_id: str, text: str):
    comment = AlertComment(
        id=str(uuid.uuid4()),
        alert_id=alert_id,
        user_id=user_id,
        comment=text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment