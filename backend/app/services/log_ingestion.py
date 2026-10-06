import json
import re
import csv
from io import StringIO
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.all_models import Event

class LogIngestionService:
    @staticmethod
    def parse_windows_log(raw: str) -> Dict[str, Any]:
        """Parse Windows Event Log (JSON or Key-Value format)"""
        try:
            data = json.loads(raw)
            event_id = str(data.get("EventID", data.get("event_id", "")))
            
            event_type = "unknown_windows_event"
            if event_id == "4625":
                event_type = "login_failure"
            elif event_id == "4624":
                event_type = "login_success"
            elif event_id == "4720":
                event_type = "account_creation"
            elif event_id == "4688":
                event_type = "process_creation"

            return {
                "timestamp": datetime.fromisoformat(data.get("TimeCreated", datetime.now(timezone.utc).isoformat())),
                "source": "windows",
                "event_type": data.get("event_type", event_type),
                "hostname": data.get("Computer", data.get("hostname", "WORKSTATION-01")),
                "username": data.get("TargetUserName", data.get("username", "admin")),
                "source_ip": data.get("IpAddress", data.get("source_ip", "192.168.1.50")),
                "destination_ip": data.get("DestIpAddress", data.get("destination_ip", "10.0.0.1")),
                "process": data.get("NewProcessName", data.get("process", "powershell.exe")),
                "command_line": data.get("CommandLine", data.get("command_line", "")),
                "raw_log": raw,
                "event_metadata": data
            }
        except Exception:
            # Fallback regex parsing for raw Windows text
            username = "admin"
            if "TargetUserName:" in raw:
                match = re.search(r"TargetUserName:\s*(\w+)", raw)
                if match: username = match.group(1)
            
            ip = "192.168.1.50"
            match_ip = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", raw)
            if match_ip: ip = match_ip.group(0)

            return {
                "timestamp": datetime.now(timezone.utc),
                "source": "windows",
                "event_type": "login_failure" if "4625" in raw or "Failed" in raw else "system_event",
                "hostname": "WORKSTATION-01",
                "username": username,
                "source_ip": ip,
                "destination_ip": "10.0.0.1",
                "process": "powershell.exe" if "powershell" in raw.lower() else "system",
                "command_line": raw,
                "raw_log": raw,
                "event_metadata": {"parser": "text_fallback"}
            }

    @staticmethod
    def parse_linux_auth(raw: str) -> Dict[str, Any]:
        """Parse Linux /var/log/auth.log lines"""
        try:
            data = json.loads(raw)
            return {
                "timestamp": datetime.fromisoformat(data.get("timestamp", datetime.now(timezone.utc).isoformat())),
                "source": "linux",
                "event_type": data.get("event_type", "login_failure"),
                "hostname": data.get("hostname", "sec-srv-01"),
                "username": data.get("username", "root"),
                "source_ip": data.get("source_ip", "10.0.4.15"),
                "destination_ip": data.get("destination_ip", "10.0.4.1"),
                "process": data.get("process", "sshd"),
                "command_line": data.get("command_line", ""),
                "raw_log": raw,
                "event_metadata": data
            }
        except Exception:
            # Regex parser for Linux auth.log
            # e.g.: Oct 6 14:02:11 sec-srv-01 sshd[1420]: Failed password for root from 192.168.1.50 port 54102 ssh2
            user_match = re.search(r"for (invalid user )?(\w+)", raw)
            username = user_match.group(2) if user_match else "root"
            
            ip_match = re.search(r"from (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", raw)
            source_ip = ip_match.group(1) if ip_match else "192.168.1.50"

            event_type = "login_failure" if "Failed password" in raw else ("login_success" if "Accepted" in raw else "auth_event")

            return {
                "timestamp": datetime.now(timezone.utc),
                "source": "linux",
                "event_type": event_type,
                "hostname": "sec-srv-01",
                "username": username,
                "source_ip": source_ip,
                "destination_ip": "10.0.4.1",
                "process": "sshd",
                "command_line": raw,
                "raw_log": raw,
                "event_metadata": {"parser": "linux_regex"}
            }

    @staticmethod
    def parse_web_log(raw: str) -> Dict[str, Any]:
        """Parse Nginx / Apache web server access log format or JSON"""
        try:
            data = json.loads(raw)
            return {
                "timestamp": datetime.fromisoformat(data.get("timestamp", datetime.now(timezone.utc).isoformat())),
                "source": "web_server",
                "event_type": data.get("event_type", "network_connection"),
                "hostname": data.get("hostname", "web-gateway-01"),
                "username": data.get("username", "anonymous"),
                "source_ip": data.get("source_ip", "185.220.101.5"),
                "destination_ip": data.get("destination_ip", "10.0.0.10"),
                "process": "nginx",
                "command_line": data.get("request", "GET /api/v1/data HTTP/1.1"),
                "raw_log": raw,
                "event_metadata": data
            }
        except Exception:
            return {
                "timestamp": datetime.now(timezone.utc),
                "source": "web_server",
                "event_type": "network_connection",
                "hostname": "web-gateway-01",
                "username": "anonymous",
                "source_ip": "185.220.101.5",
                "destination_ip": "10.0.0.10",
                "process": "nginx",
                "command_line": raw,
                "raw_log": raw,
                "event_metadata": {"parser": "web_fallback"}
            }

    @classmethod
    def ingest_raw_log(cls, raw: str, source_hint: str = "windows") -> Dict[str, Any]:
        if source_hint == "linux" or "sshd" in raw or "/var/log" in raw:
            return cls.parse_linux_auth(raw)
        elif source_hint == "web" or "HTTP/" in raw or "GET " in raw:
            return cls.parse_web_log(raw)
        else:
            return cls.parse_windows_log(raw)

    @classmethod
    def ingest_and_save(cls, db: Session, raw_log: str, source_hint: str = "windows") -> Event:
        parsed = cls.ingest_raw_log(raw_log, source_hint)
        event = Event(**parsed)
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
