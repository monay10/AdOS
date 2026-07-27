# Book C · Part 2 — The Because — Validation

> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Governing document:
> [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

Validation of Part 2 — the documents that turn the contract into a concrete, grounded
"because". Result: **✅ PASS**.

---

## 1. Scope validated

| # | Document | Purpose | Tier focus |
|---|---|---|---|
| C005 | [`DECISION_JOURNAL.md`](DECISION_JOURNAL.md) | The shipped explainability anchor | ✅ |
| C006 | [`PERFORMANCE_ROLLUPS.md`](PERFORMANCE_ROLLUPS.md) | "N campaigns in sector X had Y% CTR" | 🔶 |
| C007 | [`ALTERNATIVES_AND_TRADEOFFS.md`](ALTERNATIVES_AND_TRADEOFFS.md) | Why THIS, not THAT | ✅/🔶 |
| C008 | [`DECISION_EXPLANATION.md`](DECISION_EXPLANATION.md) | Explaining an existing decision (not inventing one) | 🔶/✅ |

## 2. Checks

| Check | Result | Notes |
|---|---|---|
| ✅ anchor grounded | ✅ PASS | Decision Journal round trip — write [routes.ts:1118](../../apps/web/src/routes.ts#L1118), read [routes.ts:832](../../apps/web/src/routes.ts#L832), render [pages.ts:294](../../apps/web/src/views/pages.ts#L294) — cited accurately; in-memory caveat stated. |
| The "183 campaigns" primitive honest | ✅ PASS | Per-vertical rollup ([in-memory-company-brain.ts:100](../../domains/company-brain/src/in-memory-company-brain.ts#L100)) correctly 🔶 and flagged as *never populated live* (`enrich({kind:'marketing'})` uncalled in `apps/web`); coarse per-client rollup ([routes.ts:1461](../../apps/web/src/routes.ts#L1461)) correctly ✅. |
| Explanation ≠ invention | ✅ PASS | C008 frames explanation as rendering existing reasoning; local AI phrases facts (narrative pattern [service.ts:24](../../domains/analytics-engine/src/report/service.ts#L24)) and never fabricates evidence. |
| Alternatives grounded | ✅ PASS | chosen/rejected/alternatives shown to already exist in the journal record; prompt-variant A/B ([in-memory-prompt-registry.ts:79](../../domains/prompt-registry/src/in-memory-prompt-registry.ts#L79)) kept distinct from campaign-decision alternatives. |
| Three-tier discipline | ✅ PASS | Every capability tagged; nothing unbuilt claimed shipped. |
| Code-citation accuracy | ✅ PASS | All 13 cited paths exist in the repo. |
| Descriptive-not-prescriptive | ✅ PASS | Invariant sentence present verbatim in all four docs; sample-size honesty emphasized in C006. |
| Book B/C/D/E boundary | ✅ PASS | Confidence calibration and the learning loop explicitly deferred to Book D. |
| Boundary discipline | ✅ PASS | Own-data-only rollups, 100% local, human-sovereign, no vendor telemetry. |
| Value contribution | ✅ PASS | Each doc carries a note. |
| Documentation-only hygiene | ✅ PASS | Only `book-c/` files added; no tracked code/test modified. |
| Forbidden legacy label | ✅ PASS | Absent. |

## 3. Verdict

**✅ PASS.** Part 2 gives every recommendation a grounded "because" — from the shipped
journal, to per-sector performance evidence, to honest trade-offs, to explanations that
render reasoning rather than invent it.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
