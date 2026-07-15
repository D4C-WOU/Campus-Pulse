from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import require_super_admin
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import (
    create_audit_log,
    get_all_audit_logs,
)

router = APIRouter(prefix="/api/audit-logs", tags=["Audit"])

@router.get("/")
def list_audit_logs(
    page: int = 1,
    limit: int = 10,
    current_user=Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    return get_all_audit_logs(
        db=db,
        page=page,
        limit=limit,
    )