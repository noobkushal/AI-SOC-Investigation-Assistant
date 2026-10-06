import os
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.all_models import Report, Incident, Investigation
from app.schemas.schemas import ReportResponse
from app.services.report_generator import ReportGeneratorService
from app.services.ai_investigator import AIInvestigatorService

router = APIRouter(prefix="/reports", tags=["Reports"])

class GenerateReportReq(BaseModel):
    incident_id: str
    format: str = "pdf" # pdf or json

@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.created_at.desc()).all()

@router.post("/generate")
def generate_report(req: GenerateReportReq, db: Session = Depends(get_db)):
    query = db.query(Incident).filter(Incident.incident_id == req.incident_id)
    if req.incident_id.isdigit():
        query = db.query(Incident).filter((Incident.incident_id == req.incident_id) | (Incident.id == int(req.incident_id)))
    inc = query.first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    inv = db.query(Investigation).filter(Investigation.incident_id == inc.id).order_by(Investigation.created_at.desc()).first()
    
    incident_dict = {
        "incident_id": inc.incident_id,
        "title": inc.title,
        "severity": inc.severity,
        "status": inc.status,
        "risk_score": inc.risk_score,
        "assigned_to": inc.assigned_to,
        "updated_at": inc.updated_at.isoformat() if inc.updated_at else "",
        "timeline": [
            {"timestamp": e.timestamp.isoformat(), "event": f"{e.event_type} on {e.hostname}"} for e in inc.events
        ]
    }

    inv_dict = {
        "incident_summary": inv.ai_summary if inv else "Multi-stage incident involving brute force and unauthorized privilege escalation.",
        "evidence_analysis": inv.findings.get("evidence_analysis", []) if inv and inv.findings else [],
        "attack_hypothesis": inv.findings.get("attack_hypothesis", "") if inv and inv.findings else "",
        "mitre_mapping": inv.findings.get("mitre_mapping", []) if inv and inv.findings else [],
        "recommended_investigation": inv.recommendations.get("recommended_investigation", []) if inv and inv.recommendations else [],
        "recommended_response": inv.recommendations.get("recommended_response", []) if inv and inv.recommendations else []
    }

    if req.format.lower() == "pdf":
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "scratch", "reports")
        os.makedirs(reports_dir, exist_ok=True)
        filename = f"Report_{inc.incident_id}.pdf"
        output_file = os.path.join(reports_dir, filename)
        
        ReportGeneratorService.generate_pdf_report(incident_dict, inv_dict, output_file)
        
        # Save record in DB
        report_record = Report(
            incident_id=inc.id,
            title=f"Incident PDF Report - {inc.incident_id}",
            executive_summary=inv_dict["incident_summary"],
            details_json={"pdf_path": output_file, "filename": filename}
        )
        db.add(report_record)
        db.commit()
        db.refresh(report_record)

        return {
            "id": report_record.id,
            "incident_id": inc.incident_id,
            "download_url": f"/api/reports/download/{report_record.id}",
            "filename": filename
        }
    else:
        json_rep = ReportGeneratorService.generate_json_report(incident_dict, inv_dict)
        report_record = Report(
            incident_id=inc.id,
            title=f"Incident JSON Report - {inc.incident_id}",
            executive_summary=inv_dict["incident_summary"],
            details_json=json_rep
        )
        db.add(report_record)
        db.commit()
        db.refresh(report_record)
        return json_rep

@router.get("/download/{report_id}")
def download_pdf_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not report.details_json or "pdf_path" not in report.details_json:
        raise HTTPException(status_code=404, detail="Report PDF file not found")
    
    pdf_path = report.details_json["pdf_path"]
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF file no longer exists on disk")
        
    return FileResponse(pdf_path, media_type="application/pdf", filename=report.details_json.get("filename", "incident_report.pdf"))
