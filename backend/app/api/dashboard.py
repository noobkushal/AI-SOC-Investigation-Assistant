from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.all_models import Alert, Incident, Asset, Event, Investigation

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    crit_alerts = db.query(Alert).filter(Alert.severity == "CRITICAL").count()
    high_alerts = db.query(Alert).filter(Alert.severity == "HIGH").count()
    med_alerts = db.query(Alert).filter(Alert.severity == "MEDIUM").count()
    low_alerts = db.query(Alert).filter(Alert.severity == "LOW").count()

    active_incidents = db.query(Incident).filter(Incident.status.in_(["New", "Investigating", "Confirmed"])).count()
    investigations_count = db.query(Investigation).count()
    assets_at_risk = db.query(Asset).filter(Asset.risk_score >= 50.0).count()
    total_events = db.query(Event).count()

    # Time series chart data generator
    telemetry_data = [
        {"time": "00:00", "critical": 0, "high": 1, "medium": 3, "low": 8},
        {"time": "04:00", "critical": 0, "high": 2, "medium": 5, "low": 12},
        {"time": "08:00", "critical": 1, "high": 3, "medium": 8, "low": 15},
        {"time": "12:00", "critical": 0, "high": 2, "medium": 6, "low": 10},
        {"time": "14:00", "critical": 3, "high": 12, "medium": 38, "low": 64}, # Peak spike
        {"time": "18:00", "critical": 1, "high": 4, "medium": 12, "low": 20},
        {"time": "22:00", "critical": 0, "high": 2, "medium": 5, "low": 14},
    ]

    return {
        "critical_alerts": crit_alerts,
        "high_alerts": high_alerts,
        "medium_alerts": med_alerts,
        "low_alerts": low_alerts,
        "active_incidents": active_incidents,
        "investigations": investigations_count,
        "assets_at_risk": assets_at_risk,
        "mttr_minutes": 18,
        "ingestion_rate_eps": 142890,
        "copilot_precision": 94.2,
        "sensors_online": "48/48",
        "total_events": total_events,
        "telemetry_chart": telemetry_data
    }
