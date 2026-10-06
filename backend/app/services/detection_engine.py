import os
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Event, Alert, DetectionRule

RULES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "detection-rules")

class DetectionEngine:
    @staticmethod
    def load_rules_from_disk() -> List[Dict[str, Any]]:
        rules = []
        if os.path.exists(RULES_DIR):
            for fname in os.listdir(RULES_DIR):
                if fname.endswith(".json"):
                    fpath = os.path.join(RULES_DIR, fname)
                    try:
                        with open(fpath, "r", encoding="utf-8") as f:
                            rule = json.load(f)
                            rules.append(rule)
                    except Exception as e:
                        print(f"Error loading rule {fname}: {e}")
        return rules

    @classmethod
    def sync_rules_to_db(cls, db: Session):
        disk_rules = cls.load_rules_from_disk()
        for r in disk_rules:
            existing = db.query(DetectionRule).filter(DetectionRule.rule_id == r["rule_id"]).first()
            if not existing:
                db_rule = DetectionRule(
                    rule_id=r["rule_id"],
                    name=r["name"],
                    description=r.get("description", ""),
                    severity=r.get("severity", "MEDIUM"),
                    mitre_technique=r.get("mitre_technique", "T1059"),
                    enabled=r.get("enabled", True),
                    rule_definition=r
                )
                db.add(db_rule)
        db.commit()

    @classmethod
    def evaluate_events(cls, db: Session, events: List[Event]) -> List[Alert]:
        cls.sync_rules_to_db(db)
        active_rules = db.query(DetectionRule).filter(DetectionRule.enabled == True).all()
        
        generated_alerts = []
        
        for rule in active_rules:
            rule_def = rule.rule_definition
            rule_id = rule.rule_id
            conds = rule_def.get("conditions", {})
            
            # Rule 1 & Rule 6: Sliding window threshold (Brute Force / Excessive Failures)
            if "threshold" in conds:
                target_event_type = conds.get("event_type", "login_failure")
                window_mins = conds.get("window_minutes", 5)
                threshold = conds.get("threshold", 5)
                
                matching_events = [e for e in events if e.event_type == target_event_type]
                if len(matching_events) >= threshold:
                    # Group by IP / User if specified
                    first_evt = matching_events[0]
                    alert_code = f"ALT-{uuid.uuid4().hex[:6].upper()}"
                    
                    risk = 85.0 if rule.severity == "CRITICAL" else (70.0 if rule.severity == "HIGH" else 45.0)
                    
                    alert = Alert(
                        alert_id=alert_code,
                        title=rule.name,
                        description=f"{rule.description} ({len(matching_events)} events detected targeting host {first_evt.hostname})",
                        severity=rule.severity,
                        status="New",
                        source="DetectionEngine",
                        detection_rule=rule.name,
                        mitre_technique=rule.mitre_technique,
                        event_count=len(matching_events),
                        risk_score=risk
                    )
                    db.add(alert)
                    db.commit()
                    db.refresh(alert)
                    
                    rule.last_triggered = datetime.now(timezone.utc)
                    db.commit()
                    generated_alerts.append(alert)

            # Rule 2: Keywords / Process match (Suspicious PowerShell)
            elif "keywords" in conds:
                process_match = conds.get("process_match", "")
                keywords = conds.get("keywords", [])
                
                matched_evts = []
                for e in events:
                    cmd = (e.command_line or "") + " " + (e.process or "") + " " + e.raw_log
                    if process_match and process_match.lower() in cmd.lower():
                        if any(kw.lower() in cmd.lower() for kw in keywords):
                            matched_evts.append(e)
                    elif not process_match and any(kw.lower() in cmd.lower() for kw in keywords):
                        matched_evts.append(e)
                        
                if matched_evts:
                    alert_code = f"ALT-{uuid.uuid4().hex[:6].upper()}"
                    alert = Alert(
                        alert_id=alert_code,
                        title=rule.name,
                        description=f"{rule.description} (Target: {matched_evts[0].username} on {matched_evts[0].hostname})",
                        severity=rule.severity,
                        status="New",
                        source="DetectionEngine",
                        detection_rule=rule.name,
                        mitre_technique=rule.mitre_technique,
                        event_count=len(matched_evts),
                        risk_score=92.0 if rule.severity == "CRITICAL" else 75.0
                    )
                    db.add(alert)
                    db.commit()
                    db.refresh(alert)
                    rule.last_triggered = datetime.now(timezone.utc)
                    db.commit()
                    generated_alerts.append(alert)

            # Rule 5: Known bad IPs (Outbound C2)
            elif "known_bad_ips" in conds:
                bad_ips = set(conds.get("known_bad_ips", []))
                matched_evts = [e for e in events if (e.source_ip in bad_ips or e.destination_ip in bad_ips)]
                
                if matched_evts:
                    alert_code = f"ALT-{uuid.uuid4().hex[:6].upper()}"
                    bad_ip = matched_evts[0].destination_ip if matched_evts[0].destination_ip in bad_ips else matched_evts[0].source_ip
                    alert = Alert(
                        alert_id=alert_code,
                        title=rule.name,
                        description=f"{rule.description} (Connected to malicious IP: {bad_ip})",
                        severity=rule.severity,
                        status="New",
                        source="DetectionEngine",
                        detection_rule=rule.name,
                        mitre_technique=rule.mitre_technique,
                        event_count=len(matched_evts),
                        risk_score=95.0
                    )
                    db.add(alert)
                    db.commit()
                    db.refresh(alert)
                    rule.last_triggered = datetime.now(timezone.utc)
                    db.commit()
                    generated_alerts.append(alert)

        return generated_alerts
