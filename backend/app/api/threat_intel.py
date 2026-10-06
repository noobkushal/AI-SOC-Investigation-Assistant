from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import Indicator
from app.schemas.schemas import IndicatorResponse
from app.services.threat_intelligence import ThreatIntelService

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

class IndicatorLookupReq(BaseModel):
    value: str

@router.post("/lookup")
def lookup_indicator(req: IndicatorLookupReq):
    return ThreatIntelService.lookup(req.value)

@router.get("/indicators", response_model=List[IndicatorResponse])
def list_indicators(db: Session = Depends(get_db)):
    return db.query(Indicator).order_by(Indicator.last_seen.desc()).all()
