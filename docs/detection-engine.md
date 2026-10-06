# Detection Engine Specification

## Dynamic Sigma-Inspired Rule Engine
The detection engine evaluates incoming SIEM telemetry logs against structured, dynamic JSON rule definitions stored in `detection-rules/`.

## Built-In Detection Rules
1. **Brute Force Authentication (`RULE-001` / `T1110`)**: Triggers when $\ge 5$ failed login attempts occur within a 5-minute window.
2. **Suspicious Encoded PowerShell Execution (`RULE-002` / `T1059.001`)**: Detects execution of `powershell.exe` with `-EncodedCommand`, `-w hidden`, or `DownloadString` parameters.
3. **Privileged Account Creation (`RULE-003` / `T1136`)**: Detects CLI execution of `net user /add` or privilege elevation commands targeting Administrators/sudoers.
4. **Suspicious Login (`RULE-004` / `T1078`)**: Detects login success immediately following multiple authentication failures.
5. **Malicious Outbound Connection (`RULE-005` / `T1071`)**: Detects network socket connections to known threat actor IP indicators.
6. **Excessive Failed Auth Spike (`RULE-006` / `T1110.001`)**: Detects global directory-wide authentication failure spikes.
7. **Potential Data Exfiltration (`RULE-007` / `T1041`)**: Detects anomalous outbound network byte transfer spikes.
