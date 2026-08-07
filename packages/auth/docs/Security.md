# MRERR Auth — Security Policy & Controls

The MRERR Platform implements defensive security-in-depth principles.

## Secret Management
All sensitive variables (`BETTER_AUTH_SECRET`, `DATABASE_URL`) are parsed and strictly runtime-validated in the `@mrerr/env` package before startup. Hardcoding secrets or committing them to git is strictly forbidden.

## Sibling Subdomain Isolation
To prevent sibling compromised subdomains from stealing active dashboard sessions, cookie sharing is disabled by default. The cookie scope behaves as a **Host-Only Cookie** restricted solely to `dashboard.mrerr.com`. Wildcards like `Domain=.mrerr.com` are omitted.

## Built-in Rate Limiting
Rate limiting is enabled on Better Auth endpoints. Limits allow a maximum of 10 requests per 1-minute window on sign-in and signup attempts, mitigating automated credential stuffing, verification abuse, and dictionary attacks.
