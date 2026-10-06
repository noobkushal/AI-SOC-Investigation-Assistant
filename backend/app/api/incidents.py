from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.models.all_models import Incident, Event, Alert
from app.schemas.schemas import IncidentResponse, IncidentDetailResponse, IncidentUpdate

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if severity and severity.lower() != "all":
        query = query.filter(Incident.severity == severity.upper())
    if status and status.lower() != "all":
        query = query.filter(Incident.status == status)

    incidents = query.order_by(Incident.created_at.desc()).all()
    
    result = []
    for inc in incidents:
        res = IncidentResponse.model_validate(inc)
        res.events_count = len(inc.events)
        res.alerts_count = len(inc.alerts)
        result.append(res)
    return result

@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    query = db.query(Incident).filter(Incident.incident_id == incident_id)
    if incident_id.isdigit():
        query = db.query(Incident).filter((Incident.incident_id == incident_id) | (Incident.id == int(incident_id)))
    inc = query.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    res = IncidentDetailResponse.model_validate(inc)
    res.events_count = len(inc.events)
    res.alerts_count = len(inc.alerts)
    return res

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: str, update_data: IncidentUpdate, db: Session = Depends(get_db)):
    query = db.query(Incident).filter(Incident.incident_id == incident_id)
    if incident_id.isdigit():
        query = db.query(Incident).filter((Incident.incident_id == incident_id) | (Incident.id == int(incident_id)))
    inc = query.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if update_data.status:
        inc.status = update_data.status
    if update_data.severity:
        inc.severity = update_data.severity
    if update_data.assigned_to:
        inc.assigned_to = update_data.assigned_to

    db.commit()
    db.refresh(inc)
    return inc

@router.get("/{incident_id}/timeline")
def get_incident_timeline(incident_id: str, db: Session = Depends(get_db)):
    query = db.query(Incident).filter(Incident.incident_id == incident_id)
    if incident_id.isdigit():
        query = db.query(Incident).filter((Incident.incident_id == incident_id) | (Incident.id == int(incident_id)))
    inc = query.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    timeline_items = []
    
    for evt in inc.events:
        timeline_items.append({
            "id": f"evt-{evt.id}",
            "timestamp": evt.timestamp.isoformat(),
            "type": "EVENT",
            "title": f"Security Telemetry Event: {evt.event_type}",
            "description": f"Host: {evt.hostname} | User: {evt.username} | IP: {evt.source_ip}",
            "raw_log": evt.raw_log,
            "severity": "INFORMATIONAL" if "success" in evt.event_type else "HIGH"
        })

    for alt in inc.alerts:
        timeline_items.append({
            "id": f"alt-{alt.id}",
            "timestamp": alt.created_at.isoformat(),
            "type": "ALERT",
            "title": f"Rule Triggered: {alt.title}",
            "description": alt.description,
            "mitre_technique": alt.mitre_technique,
            "severity": alt.severity
        })

    # Sort chronologically
    timeline_items.sort(key=lambda x: x["timestamp"])
    return timeline_items
