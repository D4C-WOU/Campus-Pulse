from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import require_admin
from app.services.dashboard_service import get_overview

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview")
def overview(
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_overview(db)