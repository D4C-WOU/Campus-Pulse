from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.alert import AlertCreate
from app.core.dependencies import require_dispatcher
from app.models.user import User
from app.websocket.connection_manager import manager
from app.services.alert_service import (
    create_alert,
    get_all_alerts,
    get_alert_by_id,
    acknowledge_alert,
    investigate_alert,
    resolve_alert,
    false_report_alert,
    alert_to_dict,
    list_alerts_paginated
)

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.post("/")
async def create_new_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    alert = create_alert(db, payload)
    await manager.broadcast("NEW_ALERT", alert_to_dict(alert))
    return alert

@router.get("/")
def get_alerts(
    page: int = 1,
    limit: int = 20,
    status: str | None = None,
    current_user=Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    return list_alerts_paginated(db, page=page, limit=limit, status=status)

@router.get("/{alert_id}")
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}/acknowledge")
async def acknowledge(
    alert_id: str,
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    updated = acknowledge_alert(db, alert, current_user.id)
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid state transition")

    await manager.broadcast("ALERT_ACKNOWLEDGED", alert_to_dict(updated))
    return updated


@router.patch("/{alert_id}/investigate")
async def investigate(
    alert_id: str,
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    updated = investigate_alert(db, alert, current_user.id)
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid state transition")

    await manager.broadcast("ALERT_UPDATED", alert_to_dict(updated))
    return updated


@router.patch("/{alert_id}/resolve")
async def resolve(
    alert_id: str,
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    updated = resolve_alert(db, alert, current_user.id)
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid state transition")

    await manager.broadcast("ALERT_RESOLVED", alert_to_dict(updated))
    return updated


@router.patch("/{alert_id}/false-report")
async def false_report(
    alert_id: str,
    current_user: User = Depends(require_dispatcher),
    db: Session = Depends(get_db),
):
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    updated = false_report_alert(db, alert, current_user.id)
    if not updated:
        raise HTTPException(status_code=400, detail="Invalid state transition")

    await manager.broadcast("FALSE_REPORT", alert_to_dict(updated))
    return updated