from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from jose import jwt
from jose import JWTError

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.config import settings

security = HTTPBearer()
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

def require_super_admin(
    current_user: User = Depends(
        get_current_user
    )
):
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Super Admin access required"
        )

    return current_user


def require_admin(
    current_user: User = Depends(
        get_current_user
    )
):
    if current_user.role not in [
        "admin",
        "super_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def require_dispatcher(
    current_user: User = Depends(
        get_current_user
    )
):
    if current_user.role not in [
        "dispatcher",
        "admin",
        "super_admin"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Dispatcher access required"
        )

    return current_user