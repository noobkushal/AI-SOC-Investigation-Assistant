from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import Incident, ResponseAction
from app.schemas.schemas import ResponseActionCreate, ResponseActionResponse

router = APIRouter(prefix="/incidents", tags=["Simulated Response Actions"])

@router.post("/{incident_id}/response", response_model=ResponseActionResponse)
def trigger_simulated_response(incident_id: str, req: ResponseActionCreate, db: Session = Depends(get_db)):
    query = db.query(Incident).filter(Incident.incident_id == incident_id)
    if incident_id.isdigit():
        query = db.query(Incident).filter((Incident.incident_id == incident_id) | (Incident.id == int(incident_id)))
    inc = query.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Safe Simulation Record
    resp = ResponseAction(
        incident_id=inc.id,
        action=req.action,
        status="SIMULATED",
        target=req.target,
        details=req.details or f"Simulated {req.action} automated action executed safely by analyst for target {req.target}."
    )
    db.add(resp)
    db.commit()
    db.refresh(resp)
    return resp

@router.get("/{incident_id}/responses", response_model=List[ResponseActionResponse])
def get_incident_response_history(incident_id: str, db: Session = Depends(get_db)):
    query = db.query(Incident).filter(Incident.incident_id == incident_id)
    if incident_id.isdigit():
        query = db.query(Incident).filter((Incident.incident_id == incident_id) | (Incident.id == int(incident_id)))
    inc = query.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    return db.query(ResponseAction).filter(ResponseAction.incident_id == inc.id).order_by(ResponseAction.created_at.desc()).all()
