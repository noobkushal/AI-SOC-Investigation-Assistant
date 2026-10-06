# Security Architecture & Best Practices

## Security Controls
1. **Password Hashing**: Passwords stored using bcrypt with secure salt generation. No plaintext passwords stored anywhere in database or logs.
2. **JWT Authentication**: Industry-standard OAuth2 Bearer token authentication with configurable expiration.
3. **Parameterized Queries**: All database queries executed via SQLAlchemy ORM, eliminating SQL injection vulnerability.
4. **Input Validation**: Strict schema enforcement via Pydantic v2.
5. **CORS Configuration**: Restrictive CORS middleware policy.
6. **Secrets Management**: No hardcoded API keys in repository. Managed strictly via environment variables (`.env`).
7. **Simulated Action Execution**: High-risk containment actions (endpoint isolation, credential revocation) operate in simulated prototype mode.
