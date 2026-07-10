from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import require_super_admin
from app.schemas.admin import AdminCreate, AdminResponse
from app.services.admin_service import list_admins, create_admin, delete_admin
from app.services.audit_service import create_audit_log

router = APIRouter(prefix="/api/admins", tags=["Admin Management"])


@router.get("/", response_model=list[AdminResponse])
def get_admins(
    current_user=Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    return list_admins(db)


@router.post("/", response_model=AdminResponse)
def add_admin(
    payload: AdminCreate,
    current_user=Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    user = create_admin(db, payload)
    if user is None:
        raise HTTPException(status_code=400, detail="Email already in use")

    create_audit_log(db, current_user.id, None, f"ADMIN_CREATED:{user.email}")
    return user


@router.delete("/{admin_id}")
def remove_admin(
    admin_id: str,
    current_user=Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    result = delete_admin(db, admin_id, current_user.id)
    if result == "self":
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if result is None:
        raise HTTPException(status_code=404, detail="Admin not found")

    create_audit_log(db, current_user.id, None, f"ADMIN_DELETED:{admin_id}")
    return {"message": "Admin removed"}