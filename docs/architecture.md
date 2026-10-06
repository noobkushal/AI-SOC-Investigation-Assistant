# System Architecture - AI SOC Investigation Assistant

## Overview
The AI SOC Investigation Assistant is a real-time, evidence-grounded Security Operations Center (SOC) platform engineered to ingest security telemetry logs, detect malicious behavior via dynamic Sigma-inspired rules, correlate related alerts into unified incidents, score risk transparently, generate AI investigation copilot analyses, and execute safe simulated response actions.

```
+-----------------------------------------------------------------------------------+
|                            REACT + TYPESCRIPT FRONTEND                            |
|             (Google Stitch "Obsidian Sentinel" Dark-Adapted UI/UX)                |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ (REST API / JWT Auth)
+-----------------------------------------------------------------------------------+
|                               FASTAPI BACKEND API                                 |
|  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  |
|  │ Log Ingestion Svc   │   │  Detection Engine   │   │   Correlation Engine    │  |
|  └─────────────────────┘   └─────────────────────┘   └─────────────────────────┘  |
|  ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  |
|  │  Risk Engine (0-100)│   │  AI Investigator    │   │  Threat Intel Service   │  |
|  └─────────────────────┘   └─────────────────────┘   └─────────────────────────┘  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                        SQLALCHEMY DATA LAYER (SQLite / Postgres)                  |
|  - Users          - Events           - Alerts          - Incidents                |
|  - Assets         - Indicators       - Rules           - Investigations           |
+-----------------------------------------------------------------------------------+
```

## Data Schema Relationships
- **Events**: Store normalized SIEM telemetry logs (timestamp, source, event_type, hostname, username, source_ip, destination_ip, process, command_line, raw_log).
- **Alerts**: Dynamic rule triggers linked to correlated events with assigned severity, MITRE technique, and initial risk score.
- **Incidents**: Aggregated threat campaigns correlating multiple alerts and events across common entity keys (Host, User, IP) and temporal proximity.
- **Investigations**: Evidence-grounded AI copilot analysis results containing summary, hypothesis, MITRE mapping, confidence score, and remediation steps.
