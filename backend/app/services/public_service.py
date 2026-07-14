from sqlalchemy.orm import Session
from app.models.alert import Alert


def get_alert_by_reference(db: Session, reference: str):
    # reference is the first 8 chars of the alert's UUID. Anchoring the LIKE
    # at the start (no leading %) keeps this an index-friendly prefix match
    # rather than a full table scan.
    return db.query(Alert).filter(Alert.id.like(f"{reference}%")).first()