from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Event Schemas
class EventBase(BaseModel):
    timestamp: datetime
    source: str
    event_type: str
    hostname: Optional[str] = None
    username: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    process: Optional[str] = None
    command_line: Optional[str] = None
    raw_log: str
    event_metadata: Optional[Dict[str, Any]] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# Alert Schemas
class AlertBase(BaseModel):
    alert_id: str
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    source: str
    detection_rule: Optional[str] = None
    mitre_technique: Optional[str] = None
    event_count: int
    risk_score: float

class AlertResponse(AlertBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Incident Schemas
class IncidentBase(BaseModel):
    incident_id: str
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    risk_score: float
    confidence: float
    assigned_to: str

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    assigned_to: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    events_count: Optional[int] = 0
    alerts_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class IncidentDetailResponse(IncidentResponse):
    events: List[EventResponse] = []
    alerts: List[AlertResponse] = []

# Asset Schemas
class AssetResponse(BaseModel):
    id: int
    hostname: str
    ip: Optional[str]
    operating_system: Optional[str]
    owner: Optional[str]
    criticality: str
    risk_score: float
    status: str

    model_config = ConfigDict(from_attributes=True)

# Indicator Schemas
class IndicatorResponse(BaseModel):
    id: int
    value: str
    type: str
    reputation: str
    confidence: float
    first_seen: datetime
    last_seen: datetime
    threat_actor: Optional[str]
    indicator_metadata: Optional[Dict[str, Any]]

    model_config = ConfigDict(from_attributes=True)

# Detection Rule Schemas
class DetectionRuleResponse(BaseModel):
    id: int
    rule_id: str
    name: str
    description: Optional[str]
    severity: str
    mitre_technique: Optional[str]
    enabled: bool
    rule_definition: Dict[str, Any]
    last_triggered: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

# MITRE Technique Schemas
class MitreTechniqueResponse(BaseModel):
    id: int
    technique_id: str
    name: str
    tactic: str
    description: Optional[str]

    model_config = ConfigDict(from_attributes=True)

# Investigation Schemas
class InvestigationResponse(BaseModel):
    id: int
    incident_id: int
    ai_summary: str
    confidence: float
    findings: Dict[str, Any]
    recommendations: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Response Action Schemas
class ResponseActionCreate(BaseModel):
    action: str
    target: str
    details: Optional[str] = None

class ResponseActionResponse(BaseModel):
    id: int
    incident_id: int
    action: str
    status: str
    target: str
    details: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Report Schemas
class ReportResponse(BaseModel):
    id: int
    incident_id: int
    title: str
    executive_summary: str
    details_json: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Search Result Schema
class SearchCategoryResult(BaseModel):
    incidents: List[Dict[str, Any]] = []
    alerts: List[Dict[str, Any]] = []
    events: List[Dict[str, Any]] = []
    indicators: List[Dict[str, Any]] = []
    assets: List[Dict[str, Any]] = []
