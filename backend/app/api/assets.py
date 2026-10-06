from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.all_models import Asset
from app.schemas.schemas import AssetResponse

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.get("", response_model=List[AssetResponse])
def list_assets(db: Session = Depends(get_db)):
    return db.query(Asset).order_by(Asset.risk_score.desc()).all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter((Asset.hostname == asset_id) | (Asset.id == int(asset_id) if asset_id.isdigit() else False)).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset
