import json
import os
from typing import Dict, Any
from fpdf import FPDF

class PDFReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(220, 38, 38) # Critical Red
        self.cell(0, 10, "SENTINEL AI SOC - INCIDENT INVESTIGATION REPORT", border=False, new_x="LMARGIN", new_y="NEXT", align="C")
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, "CONFIDENTIAL - SECURITY OPERATIONS CENTER TELEMETRY DATA", border=False, new_x="LMARGIN", new_y="NEXT", align="C")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}} | Sentinel AI SOC Platform", align="C")

class ReportGeneratorService:
    @staticmethod
    def generate_json_report(incident_data: Dict[str, Any], investigation_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "report_title": f"Incident Report: {incident_data.get('incident_id')} - {incident_data.get('title')}",
            "generated_at": incident_data.get("updated_at", ""),
            "executive_summary": investigation_data.get("incident_summary", ""),
            "incident_details": {
                "incident_id": incident_data.get("incident_id"),
                "severity": incident_data.get("severity"),
                "status": incident_data.get("status"),
                "risk_score": incident_data.get("risk_score"),
                "assigned_to": incident_data.get("assigned_to")
            },
            "timeline": incident_data.get("timeline", []),
            "evidence": investigation_data.get("evidence_analysis", []),
            "attack_hypothesis": investigation_data.get("attack_hypothesis", ""),
            "mitre_mapping": investigation_data.get("mitre_mapping", []),
            "recommended_investigation": investigation_data.get("recommended_investigation", []),
            "recommended_response": investigation_data.get("recommended_response", [])
        }

    @staticmethod
    def generate_pdf_report(incident_data: Dict[str, Any], investigation_data: Dict[str, Any], output_path: str) -> str:
        pdf = PDFReport()
        pdf.alias_nb_pages()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Title Section
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 10, f"Incident: {incident_data.get('incident_id')} - {incident_data.get('title')}", new_x="LMARGIN", new_y="NEXT")

        # Metadata Table
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_fill_color(241, 245, 249)
        pdf.cell(45, 8, "Severity:", border=1, fill=True)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(45, 8, str(incident_data.get("severity")), border=1)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(45, 8, "Risk Score:", border=1, fill=True)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(45, 8, f"{incident_data.get('risk_score')}/100", border=1, new_x="LMARGIN", new_y="NEXT")

        pdf.ln(5)

        # Executive Summary
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 8, "1. Executive Summary", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(0, 5, investigation_data.get("incident_summary", "N/A"))
        pdf.ln(4)

        # Evidence Analysis
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "2. Grounded Evidence Analysis", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        for item in investigation_data.get("evidence_analysis", []):
            pdf.multi_cell(0, 5, f"- {item}")
        pdf.ln(4)

        # MITRE Mapping
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "3. MITRE ATT&CK Mapping", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        for m in investigation_data.get("mitre_mapping", []):
            pdf.cell(0, 5, f"- [{m.get('technique_id')}] {m.get('name')} (Tactic: {m.get('tactic')})", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

        # Recommended Response
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "4. Recommended Response & Remediation", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 9)
        for resp in investigation_data.get("recommended_response", []):
            pdf.multi_cell(0, 5, f"- [SIMULATED ACTION] {resp}")

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        pdf.output(output_path)
        return output_path
