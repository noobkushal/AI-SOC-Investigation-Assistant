from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Incident, Alert, Event, Indicator, Asset
from app.schemas.schemas import SearchCategoryResult

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("", response_model=SearchCategoryResult)
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    term = f"%{q.strip()}%"

    incidents = db.query(Incident).filter(
        (Incident.incident_id.ilike(term)) |
        (Incident.title.ilike(term)) |
        (Incident.description.ilike(term))
    ).limit(10).all()

    alerts = db.query(Alert).filter(
        (Alert.alert_id.ilike(term)) |
        (Alert.title.ilike(term)) |
        (Alert.description.ilike(term)) |
        (Alert.mitre_technique.ilike(term))
    ).limit(10).all()

    events = db.query(Event).filter(
        (Event.hostname.ilike(term)) |
        (Event.username.ilike(term)) |
        (Event.source_ip.ilike(term)) |
        (Event.destination_ip.ilike(term)) |
        (Event.process.ilike(term)) |
        (Event.raw_log.ilike(term))
    ).limit(10).all()

    indicators = db.query(Indicator).filter(
        (Indicator.value.ilike(term)) |
        (Indicator.threat_actor.ilike(term))
    ).limit(10).all()

    assets = db.query(Asset).filter(
        (Asset.hostname.ilike(term)) |
        (Asset.ip.ilike(term)) |
        (Asset.owner.ilike(term))
    ).limit(10).all()

    return {
        "incidents": [{"id": i.id, "incident_id": i.incident_id, "title": i.title, "severity": i.severity} for i in incidents],
        "alerts": [{"id": a.id, "alert_id": a.alert_id, "title": a.title, "severity": a.severity} for a in alerts],
        "events": [{"id": e.id, "event_type": e.event_type, "hostname": e.hostname, "username": e.username, "ip": e.source_ip} for e in events],
        "indicators": [{"id": ind.id, "value": ind.value, "type": ind.type, "reputation": ind.reputation} for ind in indicators],
        "assets": [{"id": ast.id, "hostname": ast.hostname, "ip": ast.ip, "risk_score": ast.risk_score} for ast in assets]
    }
