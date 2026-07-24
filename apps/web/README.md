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

**Phase 7 — Projects:** a **Projects** nav item with a create form (a project
belongs to a Brand, and through it a Client) and a **Project Dashboard** —
status control (active/paused/completed) + archive, goals, members, an
artifact-rollup (missions/briefs/creatives/campaigns/reports counts), the owned
missions, and a timeline of what has happened. Missions can be assigned to a
project (optional selector on the Mission form); the project then owns them and
their downstream briefs/creatives/campaigns/reports.

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

**Phase 4 — Campaign:** once the creative is approved, the Mission unlocks the
**Campaign Builder** — **Generate Campaign Draft** produces a structured plan
(budget split, per-channel audiences/ad sets, schedule) which stays a *draft*,
followed by **Executive Launch Approval** (approve / reject). Campaigns list
screen + a Dashboard campaigns count. Uses the Mission's `campaign_launch` gate.

**Phase 5 — Analytics:** once the campaign is approved, the Mission unlocks the
**Analytics** section — enter the campaign's results and **Generate Analytics
Report** computes deterministic KPIs (CTR/CPC/CPA/CPL/ROAS/ROI), renders KPI
cards + bar charts, and adds an AI executive summary + recommendations. Analytics
list screen + a Dashboard reports count. KPI math is pure and division-by-zero
safe; only the narrative is AI-generated.

**Phase 6 — Company Brain Learning:** once the analytics report exists, the
Mission offers **Record learning to Company Brain** — the outcome is written
across every knowledge store (Decision Journal → Executive Memory → Company
Brain Experience → Pattern Library → Knowledge Graph) and the mission is
completed. The recorded decision, confidence, outcome and captured stores render
on the Mission, and a Dashboard "Brain Learnings" count grows. This is the
compounding-company loop: every finished mission makes the company smarter.

**Phase 8 — Approval Workflow:** a first-class **Approvals** section for routing
any decision through an explicit state machine: **Draft → In Review → Approved /
Rejected / Revision Requested**, where a *Revision Requested* request returns to
*In Review* when resubmitted. Create an approval (optionally tied to a project),
then submit / approve / reject / request-revision — each with an optional note.
Every transition appends to the request's **timeline** and emits a domain event
(`approval.created/submitted/approved/rejected/revision_requested.v1`), so each
decision is auditable and other contexts can react. Approvals list screen +
detail page with the timeline + a Dashboard approvals count.

**Phase 9 — Asset Library:** an **Assets** section — a reusable library of
creative organised under a client (and optionally a brand + project). Add an
asset by pasting its content (text for **copy**/**document**, or an http(s)/
`data:` URL for an **image**/**link** — no binary multipart, so it stays fully
offline), give it comma-separated **tags**, and it lands as version 1. The
detail page **previews** the current version by kind (images inline, copy/docs
as text, links as a safe anchor — a pasted `javascript:` URL is rendered inert),
lets you **add tags** and **add new versions** (history is never overwritten),
and the library screen **searches** by name or tag. Each change emits a domain
event (`asset.created/version_added/tag_added.v1`) and a Dashboard assets count
grows.

**Phase 10 — CEO Dashboard:** once a Mission has an analytics report, it unlocks
a **CEO Dashboard** section — **Generate CEO Dashboard** submits the whole
picture (objective + report KPIs) to the AI Manager (reasoning task via
`promptRef`, never a model directly) and produces the executive synthesis: a
headline **verdict** (exceeded / on track / at risk), **key results**,
**decisions** and **next actions**, carrying AI provenance so it is
reproducible. Generation is idempotent. A dedicated **Executive** nav item lists
every generated dashboard, and a Dashboard "CEO Dashboards" count grows. Offline
by default (the injected `OfflineAIManager` answers the `executive.dashboard`
prompt); emits `exec.dashboard.generated.v1`.

**Phase 11 — Settings:** a **Settings** screen for the tenant's workspace
configuration — edit the workspace **name**, **currency**, **timezone** and
**locale** and it persists on the Workspace aggregate. Renaming emits
`workspace.updated.v1`; changing settings emits `workspace.settings_changed.v1`
(the rename event is skipped when the name is unchanged). A saved banner confirms
the write, and tenants with more than one workspace get a switcher. Read-only
account context (signed-in user + tenant) is shown alongside.

**Phase 12 — First Live Pilot:** the whole product proven in one customer
session — sign-in → workspace → client → brand → product → **project** →
**mission** → brief → creative → campaign → analytics → **CEO dashboard** →
**learning** (mission completes), plus the **asset library**, an **approval**
and **settings** — all driven through the real HTTP server exactly as a person
clicks it. `src/pilot.test.ts` runs the full journey end-to-end and asserts
persistence in every context, the complete event chain, the project-dashboard
timeline, the populated home dashboard, and tenant isolation. This is the
"can a real customer run their first day on AdOS?" test — and it passes.

**Phase 13 — Reports:** a **Reports** section for saved **client performance
reports**. Pick a client (optionally narrowed to one project), give the report a
title and period, and AdOS aggregates that client's work into a deterministic,
timestamped snapshot — missions, completed count, campaigns, total budget,
blended **avg ROAS** and the CEO-verdict rollup — with a one-line summary. The
report is immutable once generated (the artifact you show a client), listed on
the Reports screen and viewable in full, and it emits
`performance.report.generated.v1`. Distinct from **Analytics** (per-campaign
KPIs) and the **CEO Dashboard** (per-mission executive synthesis): Reports is the
client/portfolio-level rollup.

Every customer-facing screen is now built; the left nav has no **soon** items
left.

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
