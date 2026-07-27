# A008 — Agency Reporting

**Owner:** Office of the Chief Product Architect
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** ../PRODUCT_TRUTH.md
**Governing reference:** BOOK_A_AGENCY_CONSTITUTION.md

---

## 0. Purpose and scope

This document defines the **reporting surfaces** of the AdOS advertising-agency
platform: what each dashboard shows, where its data comes from, how it refreshes,
and which KPIs it carries. It conforms to the agency charter in
`BOOK_A_AGENCY_CONSTITUTION.md` and to the entity facts documented across Book A
(`CAMPAIGN_LIFECYCLE.md`, `MISSION_ENGINE.md`, `CREATIVE_WORKFLOW.md`,
`APPROVAL_ENGINE.md`).

AdOS ships **three real reporting artifacts**, each a persisted domain aggregate at
the tail of the human-gated pipeline:

| Real dashboard | Backed by | Domain source (evidence) |
|---|---|---|
| **Executive dashboard** (CEO view) | `ExecutiveReport` | `domains/executive-ai/src/dashboard/executive-report.ts` |
| **Campaign dashboard** | `CampaignReport` + `computeKpis()` | `domains/analytics-engine/src/report/campaign-report.ts`, `domains/analytics-engine/src/report/kpi.ts` |
| **Client dashboard** | `PerformanceReport` snapshot | `domains/agency-os/src/report/report.ts` |

Everything else in this document — **Creative**, **AI**, **Profit**, and **Mission**
dashboards, plus **live data ingestion** — is **Roadmap / proposed v2 design**, not
shipped. Each is labelled as such and mapped to the real data it would draw from.

> **⚠️ The single most important truth in this document.** The six campaign KPIs are
> **deterministic** and their inputs — `impressions`, `clicks`, `conversions`,
> `leads`, `spend`, `revenue` — are **hand-entered by a human through a form**, not
> ingested from Meta / Google / TikTok / LinkedIn or any ad platform. **There are no
> connectors.** In this document "refresh" therefore means **recompute on newly
> hand-entered inputs**, never a live feed. See
> `apps/web/src/routes.ts` (analytics phase form handler) and PRODUCT_TRUTH.md §2.5.

There is **no usage, consumption, or per-token metric anywhere** in AdOS — inference
is 100% local and unmetered (PRODUCT_TRUTH.md §6.1).

---

## 1. Reporting model overview

The three real reports sit at distinct phases of the mission pipeline documented in
`CAMPAIGN_LIFECYCLE.md`:

```
Mission
  └─ MarketingBrief → CreativeSet → CampaignDraft
        └─ CampaignReport   ← Campaign dashboard  (6 deterministic KPIs + AI narrative)
        └─ ExecutiveReport  ← Executive dashboard (single AI synthesis, verdict)
  PerformanceReport (standalone, client-facing) ← Client dashboard (saved snapshot)
```

- The **Campaign dashboard** reports one campaign draft's measured results.
- The **Executive dashboard** synthesizes the whole mission into a CEO-level verdict
  via a **single AI call**.
- The **Client dashboard** is a **saved, immutable snapshot** assembled by the caller
  for presentation to a client.

All three are DDD `AggregateRoot`s with a `generate()` factory, `restore()`, and
`snapshot()`. Money is stored in minor units `{amountMinor, currency}`.

---

## 2. Executive dashboard (REAL) — `ExecutiveReport` / CEO view

**Definition.** The final synthesis of a mission. A **single AI Manager call**
turns the mission objective plus the campaign report into a headline executive view.
It is **not an agent** and runs no loop (PRODUCT_TRUTH.md §2.3);
`domains/executive-ai/src/dashboard/service.ts` performs exactly one synthesis call.

### 2.1 Content (exact shape)

Backed by `DashboardContent` in
`domains/executive-ai/src/dashboard/executive-report.ts`.

| Field | Type | Meaning |
|---|---|---|
| `headline` | string | One-line executive headline |
| `executiveSummary` | string | Narrative summary of the mission outcome |
| `verdict` | `MissionVerdict` | Overall call — enum below |
| `keyResults[]` | `KeyResult[]` | Each `{metric, value, unit, verdict}` |
| `decisions[]` | string[] | Decisions taken / recommended |
| `nextActions[]` | string[] | Recommended follow-up actions |

`verdict` enum (`MissionVerdict`): `exceeded` · `on_track` · `at_risk`. These three
values are the only permitted verdicts.

Each `keyResult` carries its own `verdict` string alongside `metric`, `value`, and
`unit`, letting the CEO view flag individual KPIs.

Every `ExecutiveReport` also carries `provenance{taskId, capability, model, engine,
latencyMs}` so the synthesis is **reproducible and auditable** (not a live audit
trail — see §8).

### 2.2 Metrics

| Metric | Source | Notes |
|---|---|---|
| `verdict` | AI synthesis over report KPIs | One of `exceeded` / `on_track` / `at_risk` |
| `keyResults[].value` / `unit` | Derived from `CampaignReport` KPIs passed in via `ExecutiveContext.kpis` | Values originate from **hand-entered** campaign inputs (§4) |
| `decisions` / `nextActions` | AI synthesis | Advisory text; no automation is triggered |

No usage/consumption/token metric is present. The `verdict` and narrative are the
only synthesized fields; the underlying numbers trace back to hand-entered inputs.

### 2.3 Refresh rules

| Trigger | Behavior |
|---|---|
| Analytics phase completes (a `CampaignReport` exists) | Executive phase can run |
| Operator runs the CEO Dashboard (executive phase) | One AI synthesis call generates a fresh `ExecutiveReport` |
| Underlying campaign inputs change | Requires re-running analytics **then** re-generating the executive view — nothing recomputes automatically |

There is **no live refresh**. The Executive dashboard is regenerated on demand and
reflects the campaign inputs as they were **hand-entered** at analytics time. It
does not poll any source.

### 2.4 KPIs surfaced

The Executive dashboard does not compute new KPIs; it **re-presents** the six
campaign KPIs (§4) as `keyResults` under a single `verdict`, plus qualitative
`decisions` and `nextActions`.

---

## 3. Campaign dashboard (REAL) — `CampaignReport`

**Definition.** The output of the analytics phase for one `CampaignDraft`:
**six deterministic KPIs** plus an **AI-generated narrative**. Backed by
`domains/analytics-engine/src/report/campaign-report.ts` and
`domains/analytics-engine/src/report/kpi.ts`.

### 3.1 The six deterministic KPIs

`computeKpis()` is **pure, deterministic domain math** — the same inputs always
produce the same KPIs (`domains/analytics-engine/src/report/kpi.ts`). Division by
zero returns `0` (safe divide).

| KPI | Formula | Unit | Notes |
|---|---|---|---|
| `ctr` | `clicks / impressions × 100` | `%` | Click-through rate |
| `cpc` | `spend / clicks` | `<currency>_minor` | Cost per click, minor units |
| `cpa` | `spend / conversions` | `<currency>_minor` | Cost per acquisition |
| `cpl` | `spend / leads` | `<currency>_minor` | Cost per lead |
| `roas` | `revenue / spend` | `x` | Return on ad spend |
| `roi` | `(revenue − spend) / spend × 100` | `%` | Return on investment |

Money-based KPIs (`cpc`, `cpa`, `cpl`) are expressed in **minor currency units** to
avoid float drift; `roas` is a multiple (`x`), and `ctr`/`roi` are percentages.

### 3.2 Inputs — hand-entered, not ingested

`CampaignMetrics` (`domains/analytics-engine/src/report/kpi.ts`):

| Input | Type | Source |
|---|---|---|
| `impressions` | number | **Hand-entered form field** |
| `clicks` | number | **Hand-entered form field** |
| `conversions` | number | **Hand-entered form field** |
| `leads` | number | **Hand-entered form field** |
| `spend` | Money `{amountMinor, currency}` | **Hand-entered form field** |
| `revenue` | Money `{amountMinor, currency}` | **Hand-entered form field** |

The analytics-phase route handler in `apps/web/src/routes.ts` reads these directly
from `req.body` (`impressions`, `clicks`, `conversions`, `leads`, `spend`,
`revenue`, `currency`). **There is no ad-platform connector** feeding them
(PRODUCT_TRUTH.md §2.5; `domains/connector-hub/src/events.ts` is an unwired stub with
zero importers).

### 3.3 The AI narrative

Only the `narrative` is AI-generated — `ReportNarrative{summary, highlights[],
recommendations[]}` in `campaign-report.ts`. The KPIs themselves are never AI-derived.

| Field | Source |
|---|---|
| `summary` | AI |
| `highlights[]` | AI |
| `recommendations[]` | AI |
| `kpis[]` | Deterministic `computeKpis()` |

### 3.4 Metrics

| Metric | Source | Notes |
|---|---|---|
| `ctr`, `cpc`, `cpa`, `cpl`, `roas`, `roi` | `computeKpis(CampaignMetrics)` | Deterministic; inputs hand-entered |
| `summary` / `highlights` / `recommendations` | AI narrative | Reproducible via `provenance` |

No usage/consumption/token metric exists.

### 3.5 Refresh rules

| Trigger | Behavior |
|---|---|
| Operator submits the analytics form with new `impressions`/`clicks`/`conversions`/`leads`/`spend`/`revenue` | `computeKpis()` **recomputes** all six KPIs and a new `CampaignReport` is generated |
| No new inputs submitted | KPIs are unchanged — nothing polls or streams |

**"Refresh" = recompute on newly hand-entered inputs.** The Campaign dashboard has
**no live feed** and does not connect to any ad platform. A refreshed report reflects
exactly the numbers a human last typed into the form.

---

## 4. Client dashboard (REAL) — `PerformanceReport` snapshot

**Definition.** A **saved, immutable, client-facing snapshot** of how a client's
work performed. Backed by `domains/agency-os/src/report/report.ts`. It is a presented
artifact — the report you would show a client — never mutated after generation.

### 4.1 Content (exact shape)

| Field | Type | Meaning |
|---|---|---|
| `title` | string | Report title (required, non-empty) |
| `period` | string | Reporting period; defaults to `'All time'` when blank |
| `metrics[]` | `ReportMetric[]` | Each a pre-formatted `{label, value}` pair |
| `summary` | string | Narrative summary |
| `generatedBy` / `generatedAt` | string | Provenance of the snapshot |

`ReportMetric` is a **pre-formatted `{label, value}` string pair** — values are
assembled by the caller, so this aggregate imports no other context. It is not a
live query surface; it is a frozen snapshot.

### 4.2 Metrics

| Metric | Source | Notes |
|---|---|---|
| `metrics[].label` / `value` | Assembled by the caller from the client's missions/campaigns/results | Values ultimately trace to **hand-entered** campaign inputs (§3.2) |
| `summary` | Caller-supplied narrative | Immutable once saved |

No usage/consumption/token metric exists.

### 4.3 Refresh rules

| Trigger | Behavior |
|---|---|
| Caller generates a new `PerformanceReport` | A fresh immutable snapshot is created |
| After generation | The snapshot **never changes** — `PerformanceReport` is immutable |

The Client dashboard does **not** refresh live. Each snapshot is a point-in-time
record built from data that originated as **hand-entered** campaign inputs; showing
newer numbers means generating a new snapshot.

### 4.4 KPIs surfaced

Whatever `{label, value}` metrics the caller assembles — typically a curated subset
of the six campaign KPIs (§3.1) plus period totals. No new KPI math runs inside
`PerformanceReport`.

---

## 5. Value contribution (real dashboards)

Per the AdOS v2 value rule, every surface must **increase agency revenue** or
**reduce production time**.

| Dashboard | Revenue ↑ | Production-time ↓ |
|---|---|---|
| **Executive** | The `verdict` + `decisions` close the loop into the Company Brain, improving future win rates → **revenue** | **One AI synthesis call replaces manual executive-report assembly** → **time** |
| **Campaign** | Deterministic `roas`/`roi` expose winning vs losing spend, informing where budget wins → **revenue** | Instant KPI math + AI narrative replaces spreadsheet reporting → **time** |
| **Client** | A polished, trustworthy client snapshot supports retention and upsell → **revenue** | Saved snapshots remove repeated manual report writing → **time** |

**Closing the loop.** Reporting is what feeds the marketing-performance
**Company Brain** (PRODUCT_TRUTH.md §1.10): measured outcomes become remembered
patterns, so the next mission starts smarter. That improvement in future win rates is
the revenue contribution; the single executive synthesis replacing hand assembly is
the time contribution.

---

## 6. Roadmap dashboards (⚠️ proposed v2 — NOT shipped)

The following dashboards are **proposed v2 views**, not shipped features. Each is
mapped to the **real data it could draw from today**, but none exists as a built
surface. They are documented here so future work has a truthful anchor; do not read
any row below as a present-tense capability.

### 6.1 Profit dashboard (⚠️ Roadmap)

| Aspect | Proposal |
|---|---|
| Concept | Profitability rollup across campaigns |
| Maps to real data | `roi` and `roas` from the existing six KPIs (§3.1) — **no new metric required** |
| Metrics | Aggregated `roi` / `roas`; margin views would need a cost model that does **not** exist today |
| Refresh | Would recompute only on **newly hand-entered** campaign inputs — no live feed |
| KPIs | `roas` (`x`), `roi` (`%`) — deterministic, already shipped |
| Status | **Roadmap** — a proposed aggregation view over existing KPIs |

### 6.2 Mission dashboard (⚠️ Roadmap)

| Aspect | Proposal |
|---|---|
| Concept | Portfolio rollup of mission status |
| Maps to real data | Mission status state machine (`domains/agency-os/src/mission/mission.ts`) — `submitted`/`planning`/`awaiting_approval`/`executing`/`completed`/`failed` |
| Metrics | Counts by status, gates awaiting approval, completion rate |
| Refresh | On mission state transitions — derived, not a live external feed |
| KPIs | Mission completion %, missions `awaiting_approval` (proposed) |
| Status | **Roadmap** — a status rollup, not a shipped dashboard. Note `paused` is declared but never entered |

### 6.3 AI dashboard (⚠️ Roadmap)

| Aspect | Proposal |
|---|---|
| Concept | Visibility into AI generation provenance |
| Maps to real data | `provenance{taskId, capability, model, engine, latencyMs}` already carried by `MarketingBrief`, `CreativeSet`, `CampaignDraft`, `CampaignReport`, `ExecutiveReport` |
| Metrics | Model/engine used, `latencyMs`, capability per artifact |
| Refresh | On new AI artifact generation — derived from stored provenance |
| KPIs | Latency distribution, engine mix (proposed) |
| Status | **Roadmap** — provenance is stored, but no view aggregates it. **No token/usage/cost metric** — inference is local and unmetered |

### 6.4 Creative dashboard (⚠️ Roadmap)

| Aspect | Proposal |
|---|---|
| Concept | Inventory and performance of creative output |
| Maps to real data | `CreativeSet` inventory (`domains/creative-studio/src/creative/creative-set.ts`) — the six copy outputs (`headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, `email`) |
| Metrics | Count of generated creative sets, coverage of the six outputs |
| Refresh | On new creative generation (the `creative_assets` gate) — no live feed |
| KPIs | None deterministic today; creative-to-outcome linkage would require new modeling |
| Status | **Roadmap** — CreativeSet is **copy only, no images** (PRODUCT_TRUTH.md §2.4); a creative-performance view is proposed, not built |

---

## 7. Roadmap separation

Everything in this section is **Roadmap** and MUST NOT be presented as shipped.

**Proposed v2 dashboards (see §6):**

| Item | Nearest real data | Status |
|---|---|---|
| Profit dashboard | `roi` / `roas` KPIs | Roadmap |
| Mission dashboard | Mission status state machine | Roadmap |
| AI dashboard | AI `provenance` metadata | Roadmap |
| Creative dashboard | `CreativeSet` inventory | Roadmap |

**Live data ingestion — explicitly Roadmap:**

| Item | Reality today | Evidence |
|---|---|---|
| Ad-platform connectors (Meta / Google / TikTok / LinkedIn) | **None** — inputs hand-entered via a form | PRODUCT_TRUTH.md §2.5; `domains/connector-hub/src/events.ts` (stub, 0 importers) |
| Live / streaming KPI refresh | Absent — "refresh" = recompute on new hand-entered inputs | `domains/analytics-engine/src/report/kpi.ts` |
| Usage / consumption / per-token metrics | Absent — local, unmetered inference | PRODUCT_TRUTH.md §6.1 |
| Durable, queryable reporting warehouse | Absent by default — persistence is opt-in (SQLite/Postgres); default in-memory | PRODUCT_TRUTH.md §2.10 |

The bridge from Roadmap to shipped for any live-ingestion dashboard is a real
`connector-hub` implementation. Until that exists, **every KPI in AdOS is computed
from numbers a human typed into a form.**

---

## 8. Honest notes and discrepancies

To keep this document truthful (truth over neatness):

- **All six KPI inputs are hand-entered.** No dashboard in AdOS reads from an ad
  platform. Repeat wherever KPIs appear: refresh = recompute on new manual input.
- **KPIs are deterministic; only narratives/verdicts are AI.** `computeKpis()` and
  the executive `verdict` inputs are pure math over hand-entered numbers; the AI
  layer adds `summary`/`highlights`/`recommendations`/`decisions`/`nextActions`.
- **Provenance ≠ audit trail.** Every AI artifact stores
  `provenance{taskId, capability, model, engine, latencyMs}` for reproducibility, but
  AdOS has **no immutable / tamper-evident audit store** (PRODUCT_TRUTH.md §2.7). The
  proposed AI dashboard (§6.3) reads provenance, not an audit log.
- **No RBAC on reports.** Roles are defined but never enforced; reporting surfaces are
  **tenant-scoped only**, not permission-scoped (PRODUCT_TRUTH.md §2.6).
- **Persistence is opt-in.** By default reports live in in-memory repositories;
  durable storage engages only when `DATABASE_URL` is set (PRODUCT_TRUTH.md §2.10).
- **Company Brain is a marketing-performance memory, not a document library** — the
  loop reporting closes feeds metric/pattern memory, not document Q&A
  (PRODUCT_TRUTH.md §2.1).

---

## 9. Cross-references

- `BOOK_A_AGENCY_CONSTITUTION.md` — governing charter (state machines, ER map)
- `CAMPAIGN_LIFECYCLE.md` — where each report sits in the pipeline
- `MISSION_ENGINE.md` — Mission status (source for the proposed Mission dashboard)
- `CREATIVE_WORKFLOW.md` — CreativeSet (source for the proposed Creative dashboard)
- `APPROVAL_ENGINE.md` — the gates guarding the phases that precede reporting
- `../PRODUCT_TRUTH.md` — source of truth
- `../ROADMAP.md`, `../KNOWN_LIMITATIONS.md`, `../ARCHITECTURE.md`

**Domain source evidence:**
`domains/executive-ai/src/dashboard/executive-report.ts` ·
`domains/analytics-engine/src/report/campaign-report.ts` ·
`domains/analytics-engine/src/report/kpi.ts` ·
`domains/agency-os/src/report/report.ts` ·
`apps/web/src/routes.ts` (analytics-phase form handler)

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
