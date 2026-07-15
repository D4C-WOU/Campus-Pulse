from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.public import PublicAlertStatus
from app.services.public_service import (
    get_alert_by_reference,
    get_latest_public_alerts,
)

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/alerts/{reference}", response_model=PublicAlertStatus)
def check_status(reference: str, db: Session = Depends(get_db)):
    result = get_alert_by_reference(db, reference)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="No report found for this reference",
        )

    alert = result["alert"]

    return PublicAlertStatus(
        reference=alert.id[:8],
        type=alert.type,
        status=alert.status,
        location_hint=alert.location_hint,
        message=alert.message,
        latest_comment=result["latest_comment"],
        created_at=alert.created_at,
        resolved_at=alert.resolved_at,
    )

@router.get("/latest-alerts")
def latest_alerts(
    limit: int = 3,
    db: Session = Depends(get_db),
):
    return get_latest_public_alerts(
        db=db,
        limit=limit,
    )