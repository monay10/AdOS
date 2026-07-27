# BOOK A — Agency Core

The authoritative documentation of the **advertising-agency domain** at the heart of
**AdOS — the Enterprise AI Operating System for Advertising**. Book A models the
entities, lifecycles, state machines, and business rules **exactly as the code
implements them today**, and is the foundation the later books (starting with the AI
Campaign Factory) build on.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book A
> *describes* `domains/` source — it does not change it. No document here promises a
> capability AdOS does not implement today; every absent or future capability appears
> only under explicit **Roadmap** labels.
>
> **AdOS v2 value rule (applied throughout):** every capability must **increase the
> agency's revenue OR reduce its production time.**
>
> **The product shape that governs everything here:** AdOS is offline-first and 100%
> local-AI; it takes a client's advertising **Mission** through a **human-gated
> pipeline** (brief → creative copy → campaign **draft** → report → executive
> dashboard) and remembers what works in a marketing-performance **Company Brain**. It
> **drafts**; it **never launches live ads**.

---

## Contents

| Doc | What it is |
|---|---|
| [`BOOK_A_AGENCY_CONSTITUTION.md`](BOOK_A_AGENCY_CONSTITUTION.md) | **Start here.** The governing charter — operating model, all lifecycles, terminology, state machines, entity relationships, business rules |
| [`CLIENT_DOMAIN.md`](CLIENT_DOMAIN.md) | The Client aggregate |
| [`BRAND_DOMAIN.md`](BRAND_DOMAIN.md) | The Brand aggregate |
| [`CAMPAIGN_LIFECYCLE.md`](CAMPAIGN_LIFECYCLE.md) | Idea → Archive campaign lifecycle |
| [`MISSION_ENGINE.md`](MISSION_ENGINE.md) | The Mission model, state machine, and gates |
| [`CREATIVE_WORKFLOW.md`](CREATIVE_WORKFLOW.md) | The creative (copy-only) workflow |
| [`APPROVAL_ENGINE.md`](APPROVAL_ENGINE.md) | The approval mechanisms |
| [`AGENCY_REPORTING.md`](AGENCY_REPORTING.md) | The reporting surfaces & KPIs |
| [`BOOK_A_VALIDATION.md`](BOOK_A_VALIDATION.md) | Validation report — ✅ PASS |
| [`BOOK_A_RELEASE.md`](BOOK_A_RELEASE.md) | Release summary, statistics, known limitations, roadmap |

## Reading order

1. **Everyone:** `BOOK_A_AGENCY_CONSTITUTION.md` (terminology, state machines, entity map).
2. **Domain modelers:** `CLIENT_DOMAIN.md` → `BRAND_DOMAIN.md`.
3. **Delivery flow:** `CAMPAIGN_LIFECYCLE.md` → `MISSION_ENGINE.md` → `CREATIVE_WORKFLOW.md`.
4. **Governance & output:** `APPROVAL_ENGINE.md` → `AGENCY_REPORTING.md`.

## The domain at a glance

```
Workspace → Client → { Brand, Product, Project, Mission }
Mission → { MarketingBrief, CreativeSet, CampaignDraft, CampaignReport, ExecutiveReport }
Standalone → Approval · Asset · PerformanceReport
```

- **Mission state machine:** `submitted → planning → awaiting_approval → planning →
  executing → completed` (`fail()` from any non-terminal; `paused` reserved).
- **Approval gates:** `strategy_and_budget`, `creative_assets`, `campaign_launch`
  (advisory array; no tiered authority).
- **The six deterministic KPIs:** `CTR · CPC · CPA · CPL · ROAS · ROI` (inputs hand-entered).
- **Executive verdict:** `exceeded · on_track · at_risk`.

## Honest boundaries (documented, never shown as shipped)

Drafts only (no live launch), no external connectors (manual KPI inputs), offline-
deterministic AI by default, in-memory learning, `bannedWords` stored-but-unenforced,
and — as **Roadmap** — the mission-type taxonomy, distinct approval types & escalation,
an immutable audit trail, additional dashboards, image AI, enforced RBAC, and a durable
learning store. See `BOOK_A_RELEASE.md` §7–8 and [`../ROADMAP.md`](../ROADMAP.md).

## Next step

Before Book B, a **paper walkthrough** of 2–3 real agency scenarios is run against these
lifecycles to catch gaps without writing code — then **Book B — AI Campaign Factory**
builds on the hardened foundation.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
