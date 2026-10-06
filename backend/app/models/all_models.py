from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

incident_events_association = Table(
    'incident_events',
    Base.metadata,
    Column('incident_id', Integer, ForeignKey('incidents.id', ondelete="CASCADE")),
    Column('event_id', Integer, ForeignKey('events.id', ondelete="CASCADE"))
)

incident_alerts_association = Table(
    'incident_alerts',
    Base.metadata,
    Column('incident_id', Integer, ForeignKey('incidents.id', ondelete="CASCADE")),
    Column('alert_id', Integer, ForeignKey('alerts.id', ondelete="CASCADE"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="SOC Analyst Tier 2")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    source = Column(String(50), index=True) # e.g. windows, linux, web
    event_type = Column(String(100), index=True) # e.g. login_failure, process_creation
    hostname = Column(String(100), index=True)
    username = Column(String(100), index=True)
    source_ip = Column(String(50), index=True)
    destination_ip = Column(String(50), index=True)
    process = Column(String(255))
    command_line = Column(Text)
    raw_log = Column(Text, nullable=False)
    event_metadata = Column(JSON, nullable=True)

    incidents = relationship("Incident", secondary=incident_events_association, back_populates="events")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(20), index=True, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), index=True, default="New") # New, Investigating, Resolved, Suppressed
    source = Column(String(50), default="DetectionEngine")
    detection_rule = Column(String(100), index=True)
    mitre_technique = Column(String(50), index=True)
    event_count = Column(Integer, default=1)
    risk_score = Column(Float, default=50.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    incidents = relationship("Incident", secondary=incident_alerts_association, back_populates="alerts")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(20), index=True, default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), index=True, default="New") # New, Investigating, Confirmed, Contained, Resolved, False Positive
    risk_score = Column(Float, default=75.0)
    confidence = Column(Float, default=90.0)
    assigned_to = Column(String(100), default="Unassigned")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    events = relationship("Event", secondary=incident_events_association, back_populates="incidents")
    alerts = relationship("Alert", secondary=incident_alerts_association, back_populates="incidents")
    investigations = relationship("Investigation", back_populates="incident", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="incident", cascade="all, delete-orphan")
    response_actions = relationship("ResponseAction", back_populates="incident", cascade="all, delete-orphan")

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(String(255), unique=True, index=True, nullable=False)
    type = Column(String(50), index=True, nullable=False) # IP, domain, URL, hash, hostname
    reputation = Column(String(50), default="UNKNOWN") # MALICIOUS, SUSPICIOUS, CLEAN, UNKNOWN
    confidence = Column(Float, default=80.0)
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    threat_actor = Column(String(100), nullable=True)
    indicator_metadata = Column(JSON, nullable=True)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String(100), unique=True, index=True, nullable=False)
    ip = Column(String(50), index=True)
    operating_system = Column(String(100))
    owner = Column(String(100))
    criticality = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Float, default=30.0)
    status = Column(String(50), default="ACTIVE") # ACTIVE, ISOLATED, MAINTENANCE

class DetectionRule(Base):
    __tablename__ = "detection_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(20), default="MEDIUM")
    mitre_technique = Column(String(50))
    enabled = Column(Boolean, default=True)
    rule_definition = Column(JSON, nullable=False)
    last_triggered = Column(DateTime, nullable=True)

class MitreTechnique(Base):
    __tablename__ = "mitre_techniques"

    id = Column(Integer, primary_key=True, index=True)
    technique_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    tactic = Column(String(100), index=True, nullable=False)
    description = Column(Text)

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    ai_summary = Column(Text, nullable=False)
    confidence = Column(Float, default=90.0)
    findings = Column(JSON, nullable=False) # evidence analysis, attack hypothesis, false positives
    recommendations = Column(JSON, nullable=False) # next steps, containment steps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="investigations")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    details_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="reports")

class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False) # isolate_endpoint, disable_user, block_ip, etc.
    status = Column(String(50), default="SIMULATED") # SIMULATED, COMPLETED, FAILED
    target = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="response_actions")
