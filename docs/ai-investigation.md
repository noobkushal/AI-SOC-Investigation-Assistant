# AI Investigation Assistant & Guardrails

## Evidence Grounding Architecture
The AI Investigation Assistant operates strictly as an assistant to the SOC analyst. It receives structured evidence payloads from the database and is prevented from fabricating facts, IP reputations, or non-existent telemetry events.

## Guardrail Rules
- **Observed Evidence vs. Inference**: Clear distinction in output between empirical telemetry facts and analytical inferences.
- **Safety**: Autonomous execution of destructive commands is disabled. All response triggers are simulated (`"status": "SIMULATED"`).
- **Fallback Engine**: If `OPENAI_API_KEY` is not provided or API calls fail/timeout, an evidence-grounded reasoning engine automatically generates structured findings.
