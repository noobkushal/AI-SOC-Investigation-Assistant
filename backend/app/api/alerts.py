from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.all_models import Alert
from app.schemas.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity and severity.lower() != "all":
        query = query.filter(Alert.severity == severity.upper())
    if status and status.lower() != "all":
        query = query.filter(Alert.status == status)
    
    return query.order_by(Alert.created_at.desc()).all()

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter((Alert.alert_id == alert_id) | (Alert.id == int(alert_id) if alert_id.isdigit() else False)).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
