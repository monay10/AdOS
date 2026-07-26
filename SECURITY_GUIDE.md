# AdOS — Security Guide

Operator-facing security guidance. The verification of each control is in
`SECURITY_REPORT.md`; this guide is how to run AdOS securely.

## Controls (all on by default)

- **Authentication** — production `AUTH_MODE=password` uses Argon2id
  (`@node-rs/argon2`) with constant-time verification. Never run the dev
  passwordless login in production.
- **Tenant isolation** — `TenantContext` scopes every query, event, job and
  storage key. A tenant cannot see another tenant's data.
- **Brute-force / rate limiting** — an `(ip, email)` pair locks after 5 failures
  / 15 min (429 + Retry-After); a success resets it.
- **Security headers on every response** — CSP (`default-src 'self'`,
  `frame-ancestors 'none'`), `X-Content-Type-Options`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy`, COOP/CORP, and HSTS over HTTPS.
- **CSRF** — state-changing forms carry a token.
- **Session** — signed cookie; set a stable `SESSION_SECRET`. Keep
  `AUTH_SECURE_COOKIES=true` (HTTPS).

## Hardening checklist

- [ ] `AUTH_MODE=password`, `AUTH_SECURE_COOKIES=true`, HTTPS/HSTS in front.
- [ ] Strong random `SESSION_SECRET` from a secrets manager (not in code/env
      files committed to git).
- [ ] Postgres reachable only from app hosts; least-privilege DB user.
- [ ] Backup encryption key stored separately from archives.
- [ ] Enforce unique company names (tenant-slug collision prevention).
- [ ] `/metrics` and internal endpoints not exposed publicly.
- [ ] Local inference engine bound to localhost / private network only.
- [ ] Keep dependencies patched (all permissive-licensed; small surface).

## Data & privacy

AdOS is **offline-first**: the AI Manager only talks to a **local** inference
engine. No prompts, content or customer data leave your infrastructure — there
is no cloud provider and no API key anywhere in the system.

## Incident response

See `RUNBOOK.md` for playbooks and `DISASTER_RECOVERY.md` for recovery. On
suspected compromise: rotate `SESSION_SECRET` (invalidates sessions), rotate DB
and backup keys, review the audit event stream (every domain action is recorded
with `tenantId` + `actor`).
