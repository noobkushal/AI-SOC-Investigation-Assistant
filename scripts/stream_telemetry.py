import time
import random
import sys
import httpx
from datetime import datetime, timezone

API_URL = "http://127.0.0.1:8000/api/events/ingest"

HOSTNAMES = ["WORKSTATION-01", "DC-PRIMARY-01", "SEC-SRV-01", "WEB-GATEWAY-01", "FINANCE-PC-04"]
USERS = ["admin", "alex.chen", "sarah.j", "devops_user", "root", "guest_user"]
IPS = ["192.168.1.50", "10.0.4.15", "185.220.101.5", "198.51.100.44", "45.154.255.120"]

def generate_random_event():
    evt_type = random.choice(["login_success", "login_failure", "process_creation", "network_connection", "account_creation"])
    host = random.choice(HOSTNAMES)
    user = random.choice(USERS)
    ip = random.choice(IPS)

    if evt_type == "login_failure":
        raw = f'{{"EventID": 4625, "TimeCreated": "{datetime.now(timezone.utc).isoformat()}", "TargetUserName": "{user}", "IpAddress": "{ip}", "Computer": "{host}"}}'
    elif evt_type == "login_success":
        raw = f'{{"EventID": 4624, "TimeCreated": "{datetime.now(timezone.utc).isoformat()}", "TargetUserName": "{user}", "IpAddress": "{ip}", "Computer": "{host}"}}'
    elif evt_type == "process_creation":
        cmd = "powershell.exe -EncodedCommand SQBFA..." if random.random() < 0.3 else "cmd.exe /c whoami"
        raw = f'{{"EventID": 4688, "TimeCreated": "{datetime.now(timezone.utc).isoformat()}", "NewProcessName": "powershell.exe", "CommandLine": "{cmd}", "TargetUserName": "{user}", "Computer": "{host}"}}'
    elif evt_type == "network_connection":
        raw = f'{{"timestamp": "{datetime.now(timezone.utc).isoformat()}", "source_ip": "{ip}", "destination_ip": "185.220.101.5", "hostname": "{host}", "event_type": "network_connection"}}'
    else:
        raw = f'{{"EventID": 4720, "TimeCreated": "{datetime.now(timezone.utc).isoformat()}", "TargetUserName": "new_user_{random.randint(100,999)}", "SubjectUserName": "{user}", "Computer": "{host}"}}'

    return raw

def main():
    print("Starting Real-Time SIEM Telemetry Streamer...")
    print(f"Streaming live events to {API_URL} every 3 seconds...\n")
    
    with httpx.Client(timeout=10.0) as client:
        count = 0
        while True:
            raw_log = generate_random_event()
            try:
                resp = client.post(API_URL, json={"raw_log": raw_log, "source_hint": "windows"})
                if resp.status_code == 200:
                    data = resp.json()
                    count += 1
                    print(f"[{count}] Live Event Ingested: {data['event_type']} on {data['hostname']} (Alerts Triggered: {data['alerts_generated']})")
            except Exception as e:
                print(f"Ingestion error: {e}")
            
            time.sleep(3)

if __name__ == "__main__":
    main()
