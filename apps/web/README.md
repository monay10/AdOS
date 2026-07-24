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

**Phase 1 — Onboarding:** Login · Dashboard · Create Workspace · Create Client ·
Create Brand · Create Product · Create Mission, plus tenant-scoped list views for
Clients, Brands, Products and Missions.

**Phase 2 — Mission Processing:** Mission detail with **Generate Marketing Brief**
(Marketing Intelligence via the AI Manager) → **Executive Approve / Reject** →
Dashboard pending-approvals + Marketing Brief list. Offline by default: the app
injects an `OfflineAIManager` (a drop-in `AIManagerPort`) so briefs generate with
no model server attached; swap in `@ados/ai-manager` for a real local engine.

**Phase 3 — Creative:** once the brief is approved, the Mission unlocks the
**Creative Studio** section — **Generate Creative** produces headline, ad copy,
CTA, social post, landing page and email, followed by **Executive Creative
Review** (approve / reject). Creative Studio list screen + a Dashboard creatives
count. Brief and creative reviews are tracked independently via the Mission's
`strategy_and_budget` and `creative_assets` approval gates.

The left nav lists the remaining later-phase screens (Campaigns, Analytics,
Reports, Settings) marked **soon**.

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
