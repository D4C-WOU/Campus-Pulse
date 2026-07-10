from sqlalchemy import func
from sqlalchemy.orm import Session, text 

from app.models.alert import Alert


def get_overview(db: Session):
    total = db.query(func.count(Alert.id)).scalar()
    active = db.query(func.count(Alert.id)).filter(Alert.status == "active").scalar()
    resolved = db.query(func.count(Alert.id)).filter(Alert.status == "resolved").scalar()
    false_reports = db.query(func.count(Alert.id)).filter(Alert.status == "false_report").scalar()

    avg_resolution_seconds = (
        db.query(
            func.avg(
                func.timestampdiff(text("SECOND"), Alert.created_at, Alert.resolved_at)
            )
        )
        .filter(Alert.resolved_at.isnot(None))
        .scalar()
    )

    by_type = (
        db.query(Alert.type, func.count(Alert.id))
        .group_by(Alert.type)
        .order_by(func.count(Alert.id).desc())
        .all()
    )

    return {
        "total_incidents": total or 0,
        "active_incidents": active or 0,
        "resolved_incidents": resolved or 0,
        "false_report_count": false_reports or 0,
        "false_report_rate": round((false_reports / total) * 100, 1) if total else 0,
        "avg_resolution_minutes": round((avg_resolution_seconds or 0) / 60, 1),
        "incidents_by_type": [{"type": t, "count": c} for t, c in by_type],
    }