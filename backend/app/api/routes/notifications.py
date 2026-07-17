from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_super_admin
from app.db.session import get_db

from app.services.notification_service import (get_notification,mark_read,mark_all_read)

router = APIRouter(prefix='/api/notifications',tags=['Notifications'])

@router.get('/')
def list_notifications(current_user = Depends(require_super_admin), db:Session = Depends(get_db)):
  return get_notification(db)


@router.patch('/{notification_id}/read')
def read_notification(notification_id : str, current_user= Depends(require_super_admin),db:Session = Depends(get_db)):
  notification = mark_read(db, notification_id)

  if not notification:
    raise HTTPException(404, 'Notification not found')
  
  return notification

@router.patch('/read-all')
def read_all( current_user = Depends(require_super_admin), db: Session = Depends(get_db)):
  mark_all_read(db)
  return {'message' : 'success'}