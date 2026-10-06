from typing import Dict, Any, List
from app.models.all_models import Incident, Alert, Asset, Indicator

class RiskEngine:
    @classmethod
    def calculate_incident_risk(cls, incident: Incident) -> Dict[str, Any]:
        """
        Calculates a deterministic 0-100 risk score with transparent justification factors.
        """
        base_score = 0.0
        reasons = []

        # 1. Alert Severities Factor (max 40 pts)
        has_critical = any(a.severity == "CRITICAL" for a in incident.alerts)
        has_high = any(a.severity == "HIGH" for a in incident.alerts)
        has_medium = any(a.severity == "MEDIUM" for a in incident.alerts)

        if has_critical:
            base_score += 40.0
            reasons.append("Critical severity alerts present in correlation chain (+40)")
        elif has_high:
            base_score += 28.0
            reasons.append("High severity alerts triggered (+28)")
        elif has_medium:
            base_score += 15.0
            reasons.append("Medium severity alerts triggered (+15)")

        # 2. Privileged User Account Factor (max 20 pts)
        has_priv_user = any("admin" in (e.username or "").lower() or "root" in (e.username or "").lower() for e in incident.events)
        if has_priv_user:
            base_score += 20.0
            reasons.append("Privileged account involved (Administrator / root) (+20)")

        # 3. Suspicious PowerShell / Execution Factor (max 15 pts)
        has_powershell = any("powershell" in (e.process or "").lower() or "enc" in (e.command_line or "").lower() for e in incident.events)
        if has_powershell:
            base_score += 15.0
            reasons.append("Suspicious PowerShell / obfuscated code execution (+15)")

        # 4. Outbound C2 / Malicious Indicator (max 15 pts)
        has_malicious_indicator = any(a.mitre_technique == "T1071" or "bad_ip" in a.description.lower() or "185.220" in a.description for a in incident.alerts)
        if has_malicious_indicator:
            base_score += 15.0
            reasons.append("Communication with known malicious C2 IP indicator (+15)")

        # 5. Volume / Event Count Scale (max 10 pts)
        evt_cnt = len(incident.events)
        if evt_cnt >= 15:
            base_score += 10.0
            reasons.append(f"High event correlation volume ({evt_cnt} events) (+10)")
        elif evt_cnt >= 5:
            base_score += 5.0
            reasons.append(f"Moderate event correlation volume ({evt_cnt} events) (+5)")

        score = min(100.0, round(base_score, 1))
        
        severity = "CRITICAL" if score >= 85 else ("HIGH" if score >= 65 else ("MEDIUM" if score >= 40 else "LOW"))

        return {
            "score": score,
            "severity": severity,
            "reasons": reasons,
            "formula": "Alert Severity (40) + Privileged User (20) + Suspicious Execution (15) + Threat Intel C2 (15) + Event Volume (10)"
        }
