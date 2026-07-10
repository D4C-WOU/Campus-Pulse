import uuid
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password


def list_admins(db: Session):
    return db.query(User).order_by(User.created_at.desc()).all()


def create_admin(db: Session, payload):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        return None

    user = User(
        id=str(uuid.uuid4()),
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_admin(db: Session, admin_id: str, requesting_user_id: str):
    if admin_id == requesting_user_id:
        return "self"  # block self-deletion, caller turns this into a 400

    user = db.query(User).filter(User.id == admin_id).first()
    if not user:
        return None

    db.delete(user)
    db.commit()
    return True