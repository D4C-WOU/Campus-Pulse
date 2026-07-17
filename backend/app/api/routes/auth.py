from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from app.core.dependencies import require_super_admin
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.models.user import User

from app.db.session import get_db

from app.schemas.auth import LoginRequest

from app.services.auth_service import (
    get_user_by_email
)

from app.core.security import (
    verify_password
)

from app.core.jwt import (
    create_access_token
)



router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):

    user = get_user_by_email(
        db,
        payload.email
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        payload.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": user.id,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me")
def me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }

