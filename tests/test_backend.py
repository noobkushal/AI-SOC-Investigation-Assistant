import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_login():
    response = client.post("/api/auth/token", data={"username": "analyst", "password": "password123"})
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["user"]["username"] == "analyst"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "critical_alerts" in data
    assert "active_incidents" in data
    assert data["copilot_precision"] == 94.2

def test_list_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0

def test_list_incidents():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    incidents = response.json()
    assert len(incidents) > 0
    assert incidents[0]["incident_id"] in ["INC-8042", "INC-1042"]

def test_incident_timeline():
    response = client.get("/api/incidents/INC-8042/timeline")
    assert response.status_code == 200
    timeline = response.json()
    assert len(timeline) > 0

def test_ai_investigation():
    response = client.post("/api/incidents/INC-8042/investigate")
    assert response.status_code == 200
    inv = response.json()
    assert inv["confidence"] == 94.2
    assert "findings" in inv

def test_threat_intel_lookup():
    response = client.post("/api/threat-intel/lookup", json={"value": "185.220.101.5"})
    assert response.status_code == 200
    data = response.json()
    assert data["reputation"] == "MALICIOUS"

def test_mitre_matrix():
    response = client.get("/api/mitre/matrix")
    assert response.status_code == 200
    matrix = response.json()
    assert "Credential Access" in matrix

def test_simulated_response():
    response = client.post("/api/incidents/INC-8042/response", json={"action": "isolate_endpoint", "target": "WORKSTATION-01"})
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "SIMULATED"
