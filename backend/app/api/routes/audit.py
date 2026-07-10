from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import require_super_admin
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import get_all_audit_logs

router = APIRouter(prefix="/api/audit-logs", tags=["Audit"])


@router.get("/", response_model=list[AuditLogResponse])
def list_audit_logs(
    limit: int = 200,
    current_user=Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    return get_all_audit_logs(db, limit=limit)
