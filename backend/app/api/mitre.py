from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.all_models import MitreTechnique, Alert
from app.schemas.schemas import MitreTechniqueResponse

router = APIRouter(prefix="/mitre", tags=["MITRE ATT&CK"])

@router.get("/techniques", response_model=List[MitreTechniqueResponse])
def list_mitre_techniques(db: Session = Depends(get_db)):
    return db.query(MitreTechnique).all()

@router.get("/matrix")
def get_mitre_matrix(db: Session = Depends(get_db)):
    techniques = db.query(MitreTechnique).all()
    alerts = db.query(Alert).all()

    alert_tech_counts = {}
    for a in alerts:
        if a.mitre_technique:
            alert_tech_counts[a.mitre_technique] = alert_tech_counts.get(a.mitre_technique, 0) + 1

    tactics = {
        "Credential Access": [],
        "Execution": [],
        "Persistence": [],
        "Command and Control": [],
        "Defense Evasion": [],
        "Exfiltration": []
    }

    for t in techniques:
        item = {
            "technique_id": t.technique_id,
            "name": t.name,
            "tactic": t.tactic,
            "description": t.description,
            "active_alerts_count": alert_tech_counts.get(t.technique_id, 0)
        }
        if t.tactic in tactics:
            tactics[t.tactic].append(item)
        else:
            tactics[t.tactic] = [item]

    return tactics
