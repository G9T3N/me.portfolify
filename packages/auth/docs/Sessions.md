# MRERR Auth — Session Management

Active user sessions are maintained using secure, cookie-based sessions.

## Session Configuration
* **Lifespan**: Session cookie is configured with an expiration age of 7 days.
* **Refresh rate**: Sessions are refreshed automatically once every 24 hours.
* **Cookie Attributes**:
  * `HttpOnly`: Enforced `true` to block access to cookies via client-side javascript (mitigating XSS session theft).
  * `SameSite`: Enforced to `"lax"` to prevent Cross-Site Request Forgery (CSRF).
  * `Secure`: Enforced `true` in production (HTTPS-Only), allowing `false` in development (HTTP) for local testing.

## Database Tracking
Active session identifiers are tracked in the PostgreSQL `sessions` table. Active sessions can be inspected, revoked, or queried by system administrators. Logging out automatically updates the table and deletes the client-side cookie.
