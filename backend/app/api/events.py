from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.all_models import Event
from app.schemas.schemas import EventResponse
from app.services.log_ingestion import LogIngestionService
from app.services.detection_engine import DetectionEngine
from app.services.correlation_engine import CorrelationEngine

router = APIRouter(prefix="/events", tags=["Security Events & Ingestion"])

class LogIngestReq(BaseModel):
    raw_log: str
    source_hint: Optional[str] = "windows"

@router.get("", response_model=List[EventResponse])
def list_events(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.timestamp.desc()).limit(limit).all()

@router.post("/ingest")
def ingest_log(req: LogIngestReq, db: Session = Depends(get_db)):
    # 1. Ingest & Save Event
    event = LogIngestionService.ingest_and_save(db, req.raw_log, req.source_hint or "windows")

    # 2. Trigger Detection Engine against recent events
    recent_events = db.query(Event).order_by(Event.timestamp.desc()).limit(50).all()
    new_alerts = DetectionEngine.evaluate_events(db, recent_events)

    # 3. Trigger Correlation Engine if new alerts generated
    new_incidents = []
    if new_alerts:
        new_incidents = CorrelationEngine.correlate_alerts_and_events(db, new_alerts, recent_events)

    return {
        "status": "INGESTED",
        "event_id": event.id,
        "event_type": event.event_type,
        "hostname": event.hostname,
        "username": event.username,
        "alerts_generated": len(new_alerts),
        "incidents_correlated": len(new_incidents)
    }
