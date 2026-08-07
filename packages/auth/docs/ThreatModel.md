# MRERR Auth — Threat Model

| Threat | Risk | Mitigation | Residual Risk |
|---|---|---|---|
| **Credential Stuffing / Dictionary Attacks** | High | Built-in rate limiting restricts authentication endpoints to max 10 requests per minute. | Very Low (Legitimate slower attacks, mitigated by password policies). |
| **XSS Session Hijacking** | High | Session identifiers are issued exclusively as `HttpOnly` cookies, preventing Javascript read access. | Low (Severe browser-level exploitation). |
| **Cross-Site Request Forgery (CSRF)** | High | Cookie `SameSite` policy is enforced to `"lax"`. Better Auth also validates custom CSRF headers. | Minimal. |
| **User Enumeration via Auth Errors** | Medium | Sign-in error payloads return generic "Invalid credentials" messages, hiding whether the email exists. | Minimal. |
| **Sibling Subdomain Session Theft** | Medium | Cookie domain wildcarding is disabled; active cookies act strictly as host-only cookies for `dashboard.mrerr.com`. | Very Low. |
| **Unauthorized Direct API Requests** | High | All server-side route loaders and actions enforce session verification and permissions checks. | Minimal. |
