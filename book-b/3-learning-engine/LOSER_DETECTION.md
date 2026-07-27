# Loser Detection

> **Owner:** Office of the Chief AI Architect
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)
> **Governing reference:** [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Status:** Official

**Implementation status:** ❌ **ROADMAP** — no loser detector exists anywhere in the
codebase (there is not even a `worst*` primitive, unlike the winner side which at least
stores merge fields). The one adjacent signal — the `ExecutiveReport` verdict `at_risk`
plus low KPIs (`ROAS < 1`, negative `ROI`) — is produced today, but **nothing consumes
it** to flag, stop, or learn from a losing campaign.

---

## 1. What "loser detection" means

Loser detection is the mirror image of [`WINNER_DETECTION.md`](./WINNER_DETECTION.md).
Where winner detection asks *"which campaign/creative over-performed, and what pattern
should we repeat?"*, loser detection asks the opposite and more urgent question:

> *"Which campaign or creative is under-performing, what anti-pattern caused it, how do
> we stop spending on it, and how do we make sure the next generation never repeats the
> mistake?"*

It exists to turn a bad result into a **negative constraint** — a documented "do not do
this" — instead of letting the failure evaporate at the end of a mission. In an agency,
a loser caught early saves budget; a loser fed back into memory saves the next campaign
from repeating it. Both map directly to the AdOS value rule (see §7).

A complete loser-detection capability has four responsibilities:

| # | Responsibility | One-line description |
|---|---|---|
| 1 | **Threshold evaluation** | Score each campaign/creative against loser thresholds over the six real KPIs and the `at_risk` verdict. |
| 2 | **Anti-pattern capture** | Extract *why* it lost (channel mix, offer, hook, audience) as a structured negative pattern. |
| 3 | **Suppression** | Feed anti-patterns into the next generation as negative constraints (avoid-lists), not just positive exemplars. |
| 4 | **Corrective action** | Convert a confirmed loser into a decision: stop, revise, or spin a corrective mission. |

None of the four exist today. This document is a clean design specification; §5 states the
absence plainly and §6 specifies what to build.

---

## 2. The raw signals a detector would read (these are ✅ SHIPPED)

Loser detection is ❌ ROADMAP, but the **inputs** it would consume are real and shipped.
A detector does not need new measurement — it needs a consumer. The signals already on
the live path:

| Signal | Where it is produced | Tier |
|---|---|---|
| Six ad KPIs `ctr / cpc / cpa / cpl / roas / roi` | `domains/analytics-engine/src/report/kpi.ts:38-50` (pure deterministic math) | ✅ SHIPPED |
| `CampaignReport` narrative + highlights | `domains/analytics-engine/src/report/service.ts:36-91` | ✅ SHIPPED |
| `ExecutiveReport` verdict `exceeded \| on_track \| at_risk` | `domains/executive-ai/src/dashboard/executive-report.ts:30`; enum enforced `dashboard/service.ts:14` | ✅ SHIPPED |
| `ExecutiveReport.nextActions[]` (free text) | `domains/executive-ai/src/dashboard/service.ts:19` | ✅ SHIPPED |
| In-memory recording to Company Brain at mission completion | `apps/web/src/routes.ts:1118-1177` | ✅ SHIPPED (write-only) |

The KPI math is worth noting precisely because it makes loser thresholds trivial to
define. `roas` is computed as `revenue / spend` and `roi` as `(revenue - spend) / spend
* 100` (`kpi.ts:46-48`). A campaign with `roas < 1` is, by construction, spending more
than it returns; a campaign with negative `roi` is losing money. These are unambiguous,
deterministic loser conditions — the data to detect a loser is already sitting in every
`CampaignReport`. What is missing is any code that reads it and acts.

---

## 3. Target design

### 3.1 Loser thresholds (over the real KPIs + verdict)

The detector would classify a campaign/creative into a **severity band** by evaluating
its shipped KPIs and verdict against declared thresholds. Thresholds are policy, not
model output, so they stay deterministic and auditable — consistent with the offline-first
constitution.

| Band | Trigger (illustrative defaults, all over shipped fields) | Meaning |
|---|---|---|
| `critical_loser` | `roas < 1` **or** `roi < 0` **and** verdict `at_risk` | Losing money; stop candidate. |
| `loser` | verdict `at_risk` **or** `roas < target_roas` | Under target; revise candidate. |
| `watch` | verdict `on_track` but a single KPI (e.g. `cpa`, `cpl`) breaches its ceiling | Monitor; not yet a loser. |
| `not_a_loser` | verdict `exceeded` / `on_track` and no KPI breach | Passes; hand to winner detection. |

Key design rules:

- **Thresholds are per-objective.** A `cpa` that is a loser for a low-margin e-commerce
  product may be fine for a high-ticket B2B lead. The `target_*` values would derive from
  the mission objective and the product's pricing (`domains/agency-os/src/product/product.ts:30`),
  not a global constant.
- **The verdict is a signal, not the whole answer.** `at_risk` is a coarse, AI-synthesized
  label; the KPIs are exact. The detector combines them: verdict narrows attention, KPIs
  confirm severity. This avoids both false alarms (a low `ctr` on an over-delivering
  campaign) and misses (a quietly unprofitable campaign the AI narrated optimistically).
- **Determinism.** Classification is pure arithmetic over shipped numeric fields — no LLM
  call. This mirrors how `computeKpis` is deterministic (`kpi.ts:35-37`) and keeps loser
  detection reproducible and testable.

### 3.2 Anti-pattern capture

A loser is only useful if the agency learns *why* it lost. The detector would extract a
structured **anti-pattern** — the negative twin of the winning-pattern record that the
Company Brain already stores (`domains/company-brain/src/pattern-library.ts`).

An anti-pattern record would carry:

| Field | Example | Source |
|---|---|---|
| `dimension` | `channel_mix` / `offer` / `hook` / `audience` / `budget_split` | derived from `CampaignDraft` |
| `descriptor` | `"20% discount CTA on premium brand"` | creative + brand fields |
| `severity` | `critical_loser` | §3.1 band |
| `evidence` | `"ROAS 0.4x, ROI -60% over this mission"` | shipped KPIs |
| `constraint` | `"avoid discount framing for premium voice"` | inferred rule |

The winning `pattern-library.ts` ranks positive patterns (`rank()` at `pattern-library.ts:35`,
sorted descending at `:21`). Loser detection would add the symmetric negative store — the
`worst*` primitive that **does not exist today** — so the brain records both what to
repeat and what to avoid.

### 3.3 Suppression as a negative constraint

Captured anti-patterns are worthless unless the next generation reads them. This is where
loser detection joins the headline Book B problem: **the learning loop is write-only
relative to generation.** Today the generators take no brain port (see §5). The target
design routes anti-patterns into generation as an **avoid-list**:

```
CampaignReport / ExecutiveReport
        │  (roas<1, roi<0, verdict at_risk)
        ▼
   Loser Detector ──▶ Anti-Pattern Capture ──▶ Company Brain (negative store)
                                                        │
                                                        ▼
                                        Best Practices (negative constraints)
                                                        │
        next mission: Brief / Creative generation ◀─────┘
                (prompt carries "avoid: <anti-patterns>")
```

Winner detection contributes positive exemplars ("do this"); loser detection contributes
negative constraints ("never do this"). Together they are the two inputs to a Best
Practices layer. Loser detection is arguably the higher-value half: avoiding a known
failure is cheaper and more certain than reproducing a past success.

### 3.4 Corrective action

A confirmed `critical_loser` should not simply be recorded — it should **trigger a
decision**. The target design links the detector to
[`RECOMMENDATION_ENGINE.md`](./RECOMMENDATION_ENGINE.md): a loser produces a concrete
recommended action (stop / revise / spin a corrective mission), which is the missing
bridge Book A flagged as the `at_risk` dead end (§4). The detector classifies; the
recommendation engine turns the classification into a proposed next step; the human
approval workflow (`domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481`)
gates whether it happens.

---

## 4. Book A context — the `at_risk` dead end

This capability is motivated directly by
[`../../book-a/BOOK_A_WALKTHROUGH.md`](../../book-a/BOOK_A_WALKTHROUGH.md), **Scenario 3
— Under-performing campaign & the learning loop**. That walkthrough runs an e-commerce
mission that lands on an `ExecutiveReport` with verdict **`at_risk`**, then documents the
gap in its own words:

> **[GAP] `at_risk` is a dead end.** The `ExecutiveReport` renders a verdict and
> `nextActions[]`, but nothing consumes them — there is no mechanism to turn a
> recommended next action into a new mission.

That is precisely the hole loser detection fills. Two adjacent Scenario 3 gaps are also
in scope:

- **No comparison / no structured iteration** — "an `at_risk` result triggers no
  structured 'iterate / try variant B' path." Loser detection supplies the classification
  that such a path would branch on.
- **Read-back is undefined** — the same walkthrough notes learning is *written* but its
  read-back into the next generation is unspecified. Anti-pattern suppression (§3.3) is
  the negative-constraint half of closing that loop.

[`../../book-a/AGENCY_REPORTING.md`](../../book-a/AGENCY_REPORTING.md) documents how the
`CampaignReport` and `ExecutiveReport` surface the KPIs and verdict a client sees. Loser
detection consumes exactly those artifacts — it adds no new reporting, only a consumer of
the reporting that already ships.

---

## 5. Today (the honest state)

**❌ ROADMAP. There is no loser detector, in any form.** Concretely:

| Claim | Reality | Evidence |
|---|---|---|
| A component that flags under-performing campaigns | **Absent** | grep: no `loser`, no `detect*` consumer of reports |
| A `worst*` / negative-pattern primitive | **Absent** | `pattern-library.ts` ranks winners only (`:21,:35`); no negative store |
| Anything that reads `verdict === 'at_risk'` and acts | **Absent** | verdict enum defined (`dashboard/service.ts:14`) and rendered; no consumer |
| Anything that reads `roas < 1` / `roi < 0` and acts | **Absent** | `kpi.ts:46-48` computes them; no threshold check downstream |
| `nextActions[]` turned into a decision | **Absent** | field exists (`dashboard/service.ts:19`); Book A confirms it is a dead end |
| Anti-patterns fed into generation | **Absent** | generators take no brain/anti-pattern port |

The verdict `at_risk` **does exist and is produced** — it is one of three enum values the
`ExecutiveReport` can carry (`domains/executive-ai/src/dashboard/executive-report.ts:30`)
and it is validated on the live path (`dashboard/service.ts:14,116-117`). But producing a
label is not detecting a loser. Today `at_risk` is displayed to a human and then the
mission ends. Nothing branches on it, nothing records an anti-pattern from it, nothing
suppresses the losing pattern in the next campaign. It is, in Book A's exact words, a dead
end.

Note the asymmetry with the winner side: winner detection is *also* ❌ ROADMAP, but the
brain at least stores positive merge fields (e.g. `bestHook` / `bestHeadline`) that a
future detector could rank. Loser detection has **even less** — there is no `worst*` field
to build on. The negative store must be created from scratch.

---

## 6. To build

Ordered by dependency. All items are ❌ ROADMAP unless a cited component already exists
unwired.

| Step | Work item | Tier | Note |
|---|---|---|---|
| 1 | **Loser threshold evaluator** — pure function over `ComputedKpi[]` + `verdict` → severity band (§3.1) | ❌ ROADMAP | Deterministic; mirrors `computeKpis` purity. No LLM. |
| 2 | **Anti-pattern extractor** — loser → structured negative record (§3.2) | ❌ ROADMAP | Symmetric to `pattern-library.ts`; needs a `worst*` store. |
| 3 | **Negative store in Company Brain** — persist anti-patterns alongside winning patterns | ❌ ROADMAP | Extends `company-brain`; ranks by severity × recency. |
| 4 | **Suppression injection** — pass anti-patterns into brief/creative generation as an avoid-list | ❌ ROADMAP | Requires the generation-time brain read-back that is Book B's headline goal; generators take no brain port today. |
| 5 | **Corrective-action bridge** — hand a `critical_loser` to the Recommendation Engine | ❌ ROADMAP | Closes Book A's `at_risk` → action → mission gap. |

Dependencies and ties:

- **Depends on the learning read-back loop.** Steps 1–3 (detect, capture, store) can be
  built without touching generation. Step 4 (suppression) cannot land until the
  generation-time memory read-back — described across the Learning Engine part — exists;
  until then anti-patterns accumulate write-only, exactly like today's winning patterns.
- **Feeds Best Practices as negative constraints.** The output of steps 2–3 is the
  negative half of a Best Practices layer; winner detection supplies the positive half.
- **Ties to the Recommendation Engine.** Step 5 is the boundary with
  [`RECOMMENDATION_ENGINE.md`](./RECOMMENDATION_ENGINE.md): loser detection *classifies*,
  the recommendation engine *proposes the next step*, the approval workflow *gates it*.
- **Consumes only shipped inputs.** No new measurement is required — every input (KPIs,
  verdict, `nextActions[]`, brain recording) is already ✅ SHIPPED (§2). Loser detection
  is a consumer to build, not a data source to invent.

---

## 7. Value contribution

Loser detection serves **both** halves of the AdOS value rule, and is one of the highest-
leverage capabilities in the Learning Engine because failure is cheaper to avoid than
success is to reproduce.

- **Revenue ↑ — cutting losers faster saves budget.** A campaign with `roas < 1` or
  negative `roi` is actively destroying money every day it runs. Today that condition is
  computed and even labeled `at_risk`, but nothing stops it — the loss continues until a
  human happens to notice. A detector that flags the loss the moment the report lands, and
  routes it to a stop/revise decision, converts wasted spend back into deployable budget.
  Money not lost is money earned.

- **Production-time ↓ — stop reworking doomed concepts.** Without anti-pattern capture,
  the agency repeats its own mistakes: the same losing hook, offer, or channel mix gets
  regenerated because nothing told the next mission to avoid it. Feeding anti-patterns
  into generation as negative constraints stops the team (and the AI) from re-drafting
  concepts that already failed, cutting the rework cycle on every subsequent campaign.

The compounding effect: winner detection makes good campaigns more likely; loser detection
makes bad campaigns less likely. An agency memory that records only wins is half-blind —
loser detection supplies the other half, and it is the half that protects the budget.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
