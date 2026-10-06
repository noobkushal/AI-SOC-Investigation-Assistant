from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import DetectionRule
from app.schemas.schemas import DetectionRuleResponse

router = APIRouter(prefix="/detection-rules", tags=["Detection Rules"])

@router.get("", response_model=List[DetectionRuleResponse])
def list_detection_rules(db: Session = Depends(get_db)):
    from app.services.detection_engine import DetectionEngine
    DetectionEngine.sync_rules_to_db(db)
    return db.query(DetectionRule).all()

@router.put("/{rule_id}/toggle", response_model=DetectionRuleResponse)
def toggle_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = db.query(DetectionRule).filter((DetectionRule.rule_id == rule_id) | (DetectionRule.id == int(rule_id) if rule_id.isdigit() else False)).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Detection rule not found")
    
    rule.enabled = not rule.enabled
    db.commit()
    db.refresh(rule)
    return rule
