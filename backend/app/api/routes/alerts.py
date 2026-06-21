from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.alert import (
    AlertCreate
)

from app.services.alert_service import (
    create_alert,
    get_all_alerts,
    get_alert_by_id
)

router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"]
)


@router.post("/")
def create_new_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db)
):
    return create_alert(
        db,
        payload
    )


@router.get("/")
def get_alerts(
    db: Session = Depends(get_db)
):
    return get_all_alerts(db)


@router.get("/{alert_id}")
def get_alert(
    alert_id: str,
    db: Session = Depends(get_db)
):

    alert = get_alert_by_id(
        db,
        alert_id
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert