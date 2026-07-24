# @ados/web — AdOS Onboarding App (Phase 1)

The customer-facing web app. Phase 1 delivers the **Customer Onboarding** journey
end-to-end: a customer signs in and, without leaving the app, creates their
Workspace → Client → Brand → Product → and states their first **Mission**.

Fully offline: a single Node HTTP server, server-rendered screens, no CDN, no
build step for the frontend, no external runtime dependencies beyond the AdOS
workspace packages. Every screen goes through the existing application services,
so data is persisted, domain events fire, and everything is logged and
tenant-isolated.

## Run

From the repo root — builds what's needed, then starts:

```bash
pnpm start                             # http://localhost:4000
```

(Equivalently `pnpm web`. If you've already run `pnpm build`, you can also
`pnpm --filter @ados/web start` to skip the build.)

Environment:

| Var              | Default        | Purpose                                            |
| ---------------- | -------------- | -------------------------------------------------- |
| `PORT`           | `4000`         | Listen port                                        |
| `SESSION_SECRET` | random         | HMAC secret for session cookies (set in prod)      |
| `LOG_LEVEL`      | `info`         | pino log level                                     |
| `LOG_PRETTY`     | `false`        | `true` for human-readable logs                     |

## Screens

Login · Dashboard · Create Workspace · Create Client · Create Brand ·
Create Product · Create Mission — plus tenant-scoped list views for Clients,
Brands, Products and Missions. The left nav also lists the later-phase screens
(Marketing Brief, Creative Studio, Campaigns, Analytics, Reports, Settings)
marked **soon**.

## Notes

- **Persistence** is in-memory (per running process), so data lives for the
  server's lifetime. A durable Postgres adapter is a later phase.
- **Auth** establishes a tenant from the company name and signs the session
  cookie; it does not yet verify a password. Real authentication is a later
  phase.
- Tenant isolation is enforced everywhere via `TenantContext`; each request runs
  inside the signed-in tenant's scope.

## Test

```bash
pnpm --filter @ados/web test
```

`src/onboarding.test.ts` drives the whole journey over HTTP with a cookie jar and
asserts persistence, the full event chain, tenant isolation, and error handling.
