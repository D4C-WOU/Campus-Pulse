from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import require_super_admin
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.comment_service import list_comments, add_comment

router = APIRouter(prefix="/api/alerts", tags=["Comments"])


@router.get("/{alert_id}/comments", response_model=list[CommentResponse])
def get_comments(alert_id: str, current_user=Depends(require_super_admin), db: Session = Depends(get_db)):
    return list_comments(db, alert_id)


@router.post("/{alert_id}/comments", response_model=CommentResponse)
def post_comment(
    alert_id: str,
    payload: CommentCreate,
    current_user=Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    comment = add_comment(db, alert_id, current_user.id, payload.comment)
    return {
        "id": comment.id,
        "alert_id": comment.alert_id,
        "user_id": comment.user_id,
        "author_name": current_user.full_name,
        "comment": comment.comment,
        "created_at": comment.created_at,
    }