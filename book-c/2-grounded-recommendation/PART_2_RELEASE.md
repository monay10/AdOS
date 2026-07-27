# Book C · Part 2 — The Because — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 2 turns the Part 1 contract into a concrete **"because"** — the grounded surfaces that
justify a recommendation from the agency's own campaign memory. It is a **design &
architecture specification**; every capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| C005 | [`DECISION_JOURNAL.md`](DECISION_JOURNAL.md) | The ✅ shipped anchor — record, read back, display | ✅ |
| C006 | [`PERFORMANCE_ROLLUPS.md`](PERFORMANCE_ROLLUPS.md) | Per-sector CTR/ROAS-over-N — the "183 campaigns" evidence | 🔶 |
| C007 | [`ALTERNATIVES_AND_TRADEOFFS.md`](ALTERNATIVES_AND_TRADEOFFS.md) | Why this option, not the others | ✅/🔶 |
| C008 | [`DECISION_EXPLANATION.md`](DECISION_EXPLANATION.md) | Explaining an existing decision, never inventing one | 🔶/✅ |
| — | [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 2 establishes

- **The shipped anchor is real:** the Decision Journal already records a decision's
  evidence, confidence, alternatives, and outcome, reads them back, and renders them on the
  mission detail page — AdOS's live "why did it decide this" surface (in-memory today).
- **The quantified evidence primitive exists, dormant:** a per-vertical CTR/ROAS-over-N
  rollup is built and unit-tested but never populated or read in the live app. Wiring it is
  how "+18% CTR in finance over the last 183 campaigns" becomes real — as *descriptive*
  evidence, weighted by sample size.
- **Trade-offs are first-class:** chosen/rejected/alternatives already ride in the journal;
  the design enriches each alternative with its own evidence and confidence so the human
  compares, then decides.
- **Explanation renders reasoning, it does not invent it:** numbers come from deterministic
  sources; local AI only phrases them — the same pattern already shipping for report
  narratives.

## 3. Honest limitations

- The per-sector rollup and attribute-grouped querying are **not on the live path** today;
  only a coarse per-client ROAS summary ships.
- Journal evidence/confidence are still **hand-rolled literals**, not yet produced by the
  real engines (that upgrade is Part 1's 🔶 work).
- All live stores are **in-memory**; durable persistence is ❌ ROADMAP.
- Metrics/rollups are **own-data only** — no vendor telemetry, no external benchmarks.

## 4. Value contribution

A recommendation a client can *see the reasons for* — grounded in the agency's own results —
is the Trust Layer's revenue engine (wins/retains accounts) and its speed engine (the human
approves faster when the evidence is already on the page).

## 5. Governance

[`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md)
governs this part. Every addition must tier-tag each capability, trace ✅ claims to code, and
re-run [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) before release.

**Status: ✅ Released — The Because v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
