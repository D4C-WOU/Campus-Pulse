from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.public import PublicAlertStatus
from app.services.public_service import get_alert_by_reference

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/alerts/{reference}", response_model=PublicAlertStatus)
def check_status(reference: str, db: Session = Depends(get_db)):
    alert = get_alert_by_reference(db, reference)
    if not alert:
        raise HTTPException(status_code=404, detail="No report found for this reference")

    return PublicAlertStatus(
        reference=alert.id[:8],
        type=alert.type,
        status=alert.status,
        location_hint=alert.location_hint,
        created_at=alert.created_at,
        resolved_at=alert.resolved_at,
    )