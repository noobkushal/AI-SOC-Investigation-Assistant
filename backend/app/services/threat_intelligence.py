from typing import Dict, Any

class ThreatIntelService:
    KNOWN_INDICATORS = {
        "185.220.101.5": {
            "value": "185.220.101.5",
            "type": "IP",
            "reputation": "MALICIOUS",
            "confidence": 98.0,
            "threat_actor": "APT29 / Cozy Bear",
            "category": "Command and Control (C2)",
            "first_seen": "2026-01-15T08:00:00Z",
            "last_seen": "2026-10-06T12:00:00Z",
            "sources": ["VirusTotal", "AlienVault OTX", "AbuseIPDB"]
        },
        "198.51.100.44": {
            "value": "198.51.100.44",
            "type": "IP",
            "reputation": "SUSPICIOUS",
            "confidence": 75.0,
            "threat_actor": "Unknown Scanner",
            "category": "Scanning Host",
            "first_seen": "2026-05-10T11:20:00Z",
            "last_seen": "2026-10-05T19:30:00Z",
            "sources": ["Shodan", "GreyNoise"]
        },
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": {
            "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "type": "hash",
            "reputation": "MALICIOUS",
            "confidence": 99.0,
            "threat_actor": "Cobalt Strike Beacon",
            "category": "Trojan / Payload",
            "first_seen": "2026-03-01T00:00:00Z",
            "last_seen": "2026-10-06T14:00:00Z",
            "sources": ["VirusTotal", "Hybrid Analysis"]
        },
        "malicious-c2-domain.com": {
            "value": "malicious-c2-domain.com",
            "type": "domain",
            "reputation": "MALICIOUS",
            "confidence": 95.0,
            "threat_actor": "FIN7",
            "category": "Phishing / C2",
            "first_seen": "2026-08-01T10:00:00Z",
            "last_seen": "2026-10-06T10:00:00Z",
            "sources": ["URLhaus", "Cisco Talos"]
        }
    }

    @classmethod
    def lookup(cls, indicator_value: str) -> Dict[str, Any]:
        cleaned = indicator_value.strip().lower()
        
        # Exact local database match
        for key, data in cls.KNOWN_INDICATORS.items():
            if key.lower() == cleaned:
                return data

        # Safe non-fabricating fallback response
        return {
            "value": indicator_value,
            "type": "IP" if "." in indicator_value and len(indicator_value.split(".")) == 4 else "unknown",
            "reputation": "UNKNOWN",
            "confidence": 0.0,
            "threat_actor": "None Identified",
            "category": "Unclassified Indicator",
            "first_seen": "N/A",
            "last_seen": "N/A",
            "sources": ["Local Intelligence Cache"],
            "message": "Threat intelligence enrichment unavailable for this unlisted indicator."
        }
