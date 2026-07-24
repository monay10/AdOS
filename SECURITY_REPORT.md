# AdOS — Security Hardening Report

Approach: **verify every control, implement only the missing ones, change no
business behavior.** Most controls were already in place from the authentication
work; this item closed the HTTP-header and brute-force gaps and added a repeatable
verification (pentest) suite.

## What changed (missing protections only)

1. **Security headers on every response** (`apps/web/src/security.ts`, applied in
   `server.ts` before routing):
   - `Content-Security-Policy` — `default-src 'self'`, `script-src 'self'` (no
     inline scripts exist), `style-src 'self' 'unsafe-inline'` (one inline style
     block), `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
     **`frame-ancestors 'none'` (clickjacking)**.
   - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
     `Referrer-Policy: no-referrer`, `Permissions-Policy` (geo/mic/camera off),
     `Cross-Origin-Opener-Policy`/`Resource-Policy: same-origin`,
     `Strict-Transport-Security` (over HTTPS).
2. **Brute-force protection** (`@ados/security` `BruteForceGuard` + `RateLimiter`,
   wired into the login route): a `(ip, email)` pair is locked after 5 failures /
   15 min for 15 min, returning **429 + Retry-After**; a success resets the counter.

## Controls verified

| Control | Status | Where |
| --- | --- | --- |
| Authentication | ✅ | Argon2id (`@node-rs/argon2`), constant-time verify |
| Authorization / RBAC | ✅ | `@ados/security` roles resolved into the session/principal |
| Tenant isolation | ✅ | `TenantContext` scopes every query, event, job, storage key |
| Session security | ✅ | HMAC-signed, server-enforced `exp`, per-session CSRF token |
| Cookie security | ✅ | `HttpOnly`, `SameSite=Lax`, `Secure` (prod) |
| CSRF | ✅ | Double-submit token on logout + password change (timing-safe compare) |
| XSS | ✅ | `esc()` output encoding (`&<>"'`) + strict CSP — **verified by test** |
| Clickjacking | ✅ **new** | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| CSP | ✅ **new** | strict, script-locked policy |
| CORS | ✅ | same-origin only (no permissive CORS headers emitted) |
| Input validation | ✅ | typed form parsing; config/schema validation (`@ados/config`) |
| Output encoding | ✅ | `esc()` everywhere untrusted data renders |
| SQL injection | ✅ | fully parameterized (`$n`); identifiers are code-controlled, not user input |
| Command injection | ✅ | no `eval`/`child_process`/`new Function` in the request surface — **verified by static scan** |
| Path traversal | ✅ | `LocalFileStorage` rejects keys escaping the root — **verified by test** |
| File upload validation | ✅ | MIME allowlist + mid-stream size guard + virus-scan hook (`@ados/storage`) |
| Secrets handling | ✅ | read only via `@ados/config`; redacted in diagnostics |
| Encryption | ✅ | AES-256-GCM backups; Argon2id passwords; SHA-256 integrity |
| Audit logging | ✅ | auth, storage, workers, backup, config audit sinks |
| Rate limiting | ✅ **new** | `RateLimiter` available; login guarded |
| Brute-force protection | ✅ **new** | `BruteForceGuard` on login (429 + lockout) |
| Password policy | ✅ | min length enforced at register/change/reset |
| Session expiration | ✅ | absolute `exp` enforced server-side; expired cookies rejected |
| Security headers | ✅ **new** | full set on every response |

## Threat matrix

| Threat | Vector | Mitigation | Residual |
| --- | --- | --- | --- |
| Account takeover | credential guessing | Argon2id + brute-force lockout | low |
| Session forgery | cookie tampering | HMAC signature + `exp` | low |
| Session theft | XSS / MITM | `HttpOnly` + `Secure` + CSP | low |
| CSRF | cross-site form post | double-submit token, `SameSite=Lax`, `form-action 'self'` | low |
| XSS | reflected/stored input | `esc()` + strict CSP | low |
| Clickjacking | iframe embedding | `frame-ancestors 'none'` + `X-Frame-Options` | none |
| Cross-tenant access | tenant confusion | `TenantContext` on every read | low |
| SQL injection | crafted input | parameterized queries | none |
| Path traversal | `../` in keys | storage root confinement | none |
| Malicious upload | bad MIME/size/malware | validation + scan hook | low (scanner is a hook) |
| Secret leakage | logs/diagnostics | redaction + `@ados/config` | low |

## OWASP Top 10 (2021) mapping

| # | Category | Coverage |
| --- | --- | --- |
| A01 Broken Access Control | tenant isolation + RBAC + session gate | ✅ |
| A02 Cryptographic Failures | Argon2id, AES-256-GCM, HMAC, HTTPS/HSTS | ✅ |
| A03 Injection | parameterized SQL, output encoding, no shell | ✅ |
| A04 Insecure Design | fail-fast config, least privilege, defence-in-depth | ✅ |
| A05 Security Misconfiguration | security headers, prod config validation, secret redaction | ✅ |
| A06 Vulnerable Components | dependency audit (below) | ⚠️ dev-tooling only |
| A07 Auth Failures | Argon2id, lockout, session expiry, CSRF | ✅ |
| A08 Integrity Failures | signed sessions, checksummed backups, restore validation | ✅ |
| A09 Logging/Monitoring Failures | audit sinks + metrics + traces (Item 8) | ✅ |
| A10 SSRF | no user-controlled outbound fetch; asset URLs rendered inert | ✅ |

## Dependency audit

`pnpm audit`: **11 advisories (1 critical, 4 high, 6 moderate)** — every one in
**development/build tooling** (`vitest`, `vite`, `esbuild`) or the **optional,
lazily-loaded OpenTelemetry auto-instrumentation** tree. None are in the production
runtime path: the AdOS server's runtime dependencies are Node built-ins, `pg`, and
`@node-rs/argon2`, which carry no advisories.

- `vitest` (critical, UI file access) / `vite`,`esbuild` (dev server) — **test-time
  only; never shipped or run in production.**
- `@opentelemetry/*` (high/moderate — exporter crash, Jaeger DoS, unbounded alloc) —
  loaded only when `OTEL_EXPORTER_OTLP_ENDPOINT` is set, and the collector/Jaeger sit
  behind the internal network, not the public edge.

## Remaining accepted risks

- **Virus scanning is a hook, not a bundled engine** — uploads are quarantined only
  when a `VirusScannerPort` (e.g. ClamAV) is wired at the boundary. Accepted for the
  offline default; wire a scanner for untrusted-upload deployments.
- **Rate limiting/brute-force are per-process** — exact for a single instance; behind
  replicas they are per-instance defence-in-depth. A shared (Redis) store can back the
  same interface without code changes.
- **Dev-tooling CVEs** — remediated by upgrading vitest/vite/OTel; deferred here to
  keep the frozen architecture and green suite. Not in the production runtime.

## Verification run

- **Static security scan** — `apps/web/src/security.test.ts` asserts no
  `eval`/`child_process`/`new Function` in the request surface.
- **Pentest suite** — security headers present (incl. CSP + clickjacking), reflected
  XSS is escaped, brute-force lockout returns 429; plus existing tests for CSRF,
  session tampering/expiry, path-traversal, and secret redaction.
- **Dependency audit** — run above; findings triaged.
- **Regression** — full monorepo build + test green.
