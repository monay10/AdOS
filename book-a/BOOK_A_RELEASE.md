# BOOK A — Agency Core — Release

> **Owner:** Office of the Chief Product Architect
> **Status:** ✅ Released — validated, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

BOOK A is the **Agency Core** of AdOS v2 — the authoritative documentation of the
advertising-agency domain **as the code implements it today**. It defines the entities,
lifecycles, state machines, and business rules of AdOS — the **Enterprise AI Operating
System for Advertising** — and it is the foundation the later books (starting with the
AI Campaign Factory) build on. It is **documentation only**: it describes `domains/`
source, it does not change it, and it promises nothing the product does not implement
today; every absent or future capability is carried under an explicit **Roadmap** label.

**Binding rule honoured throughout:** every capability described serves the AdOS v2
value test — **increase the agency's revenue OR reduce its production time.**

---

## 1. Deliverables

| # | Document | Purpose |
|---|---|---|
| A001 | [`BOOK_A_AGENCY_CONSTITUTION.md`](BOOK_A_AGENCY_CONSTITUTION.md) | Governing charter: operating model, all lifecycles, terminology, state machines, entity relationships, business rules, success metrics |
| A002 | [`CLIENT_DOMAIN.md`](CLIENT_DOMAIN.md) | The Client aggregate — contacts, industries, relationships, status transitions, validation; billing/CRM/health as Roadmap |
| A003 | [`BRAND_DOMAIN.md`](BRAND_DOMAIN.md) | The Brand aggregate — identity, voice, rules (dos/donts/bannedWords), assets, AI usage, performance-memory linkage |
| A004 | [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md) | Idea → Archive lifecycle mapped to the real pipeline; draft is terminal (never launched) |
| A005 | [`MISSION_ENGINE.md`](MISSION_ENGINE.md) | The real Mission model + state machine + gates; the mission-type taxonomy as a labelled v2 proposal |
| A006 | [`CREATIVE_WORKFLOW.md`](CREATIVE_WORKFLOW.md) | Brief → Ready → Archive creative flow grounded in the six-field copy-only CreativeSet |
| A007 | [`APPROVAL_ENGINE.md`](APPROVAL_ENGINE.md) | The generic Approval aggregate + Mission gates; no tiered authority; audit-vs-timeline distinction |
| A008 | [`AGENCY_REPORTING.md`](AGENCY_REPORTING.md) | Executive / Campaign / Client dashboards (real) + proposed views; the six deterministic KPIs |
| A009 | [`BOOK_A_VALIDATION.md`](BOOK_A_VALIDATION.md) | Validation report — **PASS** |
| — | [`README.md`](README.md) | Package index and reading order |

---

## 2. Statistics

| Metric | Value |
|---|---|
| Content documents (A001–A008) | 8 |
| Total documents (incl. validation, release, README) | 11 |
| Approx. content lines | ~3,650 |
| Aggregates documented | 14 |
| Lifecycles / state machines | 5 (Mission, Campaign, Creative, Approval, Project) |
| Deterministic KPIs | 6 (CTR, CPC, CPA, CPL, ROAS, ROI) |
| Validation result | ✅ PASS |

## 3. Entities

Documented aggregate hierarchy (all faithful to `domains/` source):

```
Workspace → Client → { Brand, Product, Project, Mission }
Mission → { MarketingBrief, CreativeSet, CampaignDraft, CampaignReport, ExecutiveReport }
Standalone → Approval · Asset · PerformanceReport
```

Each is a DDD `AggregateRoot` (typed id, private props, factory returning
`Result`/plain object for AI artifacts, `restore`, `snapshot`, domain events); AI
artifacts carry `provenance{taskId, capability, model, engine, latencyMs}`.

## 4. Lifecycles & state machines

- **Mission:** `submitted → planning → awaiting_approval → planning → executing →
  completed`; `fail()` from any non-terminal; `paused` reserved/dormant. `approve()`
  returns to `planning`; the next phase's generator advances it.
- **Approval (generic):** `draft|revision_requested → in_review → approved | rejected |
  revision_requested`, with an append-only timeline.
- **Project:** `active ↔ paused ↔ completed`, `archived` only via `archive()`.
- **Approval gates:** `strategy_and_budget`, `creative_assets`, `campaign_launch`
  (the two remaining union values reserved). The gate array is advisory metadata; no
  tiered authority.
- **Campaign:** Idea → Brief → Research → Creative → Review → Approval → **Draft
  (terminal)** → Reporting → Archive.

## 5. Business rules (highlights)

- A campaign **draft is never launched** — there is no launch method or ad-platform
  integration; live launch is Roadmap.
- The Creative Studio produces **copy only** (six outputs) — no image/visual AI.
- KPIs are **deterministic**; their inputs are **hand-entered via a form**, not
  ingested from ad platforms.
- `subscription` pricing requires a `period`; Mission `brief` needs ≥10 characters.
- Brand `bannedWords` are **stored but not enforced** against generated copy today.

## 6. Validation

`BOOK_A_VALIDATION.md` records a full **PASS** across cross references, terminology,
lifecycle consistency, entity consistency, truth alignment, Roadmap labels, honest-
discrepancy discipline, and the AdOS v2 value rule.

## 7. Known limitations (of the documented product surface)

- **Drafts only** — no live campaign launch or optimization.
- **No external connectors** — analytics inputs are manual; no Meta/Google/CRM sync.
- **AI is offline-deterministic by default** — genuine model prose requires a locally
  run engine; there is no cloud inference.
- **Learning is in-memory** — Company Brain / Executive Memory are functional but not
  yet backed by a durable store.
- **No enforced RBAC, no immutable audit trail, no document Q&A, no autonomous agents,
  no image AI** — all Roadmap.
- **Persistence is opt-in** — in-memory by default; SQLite/Postgres via `DATABASE_URL`.

## 8. Roadmap (documented, never shown as shipped)

Live ad launch & optimization; external connectors / live metric ingestion; the
mission-type taxonomy (Creative/Research/Optimization/Analysis/Reporting/QA/Review);
distinct Legal/Brand/Client approval types, escalation, and a true immutable audit
trail; the Creative/AI/Profit/Mission dashboards; image/vision AI; enforced RBAC /
permission-aware AI; a durable learning store; billing/CRM/health-scoring in the client
domain; `bannedWords` enforcement. Product roadmap is owned by `../ROADMAP.md` and
`../PRODUCT_TRUTH.md`; Book A never restates it as shipped.

## 9. What comes next

Per the agreed process, the immediate next step is **not** Book B but a **paper
walkthrough** of 2–3 real agency scenarios (client arrives → brief → AI drafts →
approval → reporting) run against these lifecycles, to surface gaps before any code is
written. That hardened foundation then feeds **Book B — AI Campaign Factory**.

---

## 10. Governance

`BOOK_A_AGENCY_CONSTITUTION.md` is binding on every artifact here. Any future addition
must trace each capability claim to `../PRODUCT_TRUTH.md` or carry it under an explicit
Roadmap label — and must re-run the validation in `BOOK_A_VALIDATION.md` before release.

**Status: ✅ Released — Agency Core v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
