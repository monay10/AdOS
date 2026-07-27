# Book C · Part 3 — Provenance & Trust — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 3 makes the Trust Layer **trustworthy end to end**: it traces outputs to their inputs,
enforces the Evidence First Law without ever replacing the human, and measures whether the
explanations actually hold up. It is a **design & architecture specification**; every
capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| C009 | [`PROVENANCE_AND_LINEAGE.md`](PROVENANCE_AND_LINEAGE.md) | Trace an output to the model, brief, and (roadmap) prompt/context that made it | ✅/❌ |
| C010 | [`CONSTITUTION_CHECKER.md`](CONSTITUTION_CHECKER.md) | Gate that withholds unsupported recommendations | 🔶 |
| C011 | [`INTELLIGENCE_METRICS.md`](INTELLIGENCE_METRICS.md) | Coverage, calibration, evidence strength, faithfulness | ❌ |
| — | [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 3 establishes

- **Traceability, honestly scoped:** every artifact already records the model/engine that
  made it and its brief→campaign→report lineage (✅ thin); the prompt-version and
  brand/mission/memory context needed to complete the contract's "Memory consulted" and
  "Brand rules checked" fields are **❌ ROADMAP** — the design says exactly what to add.
- **Enforcement, not automation:** the `ConstitutionChecker` (🔶) turns the Evidence First
  Law from aspiration into a gate — a recommendation that cannot show evidence does not
  reach the human as a recommendation. It **withholds or flags; it never auto-approves.**
- **Measurement over own data:** explanation coverage, confidence calibration, evidence
  strength, and rationale faithfulness — all ❌ ROADMAP, all defined to run over the
  agency's own in-memory data with **no vendor telemetry**.

## 3. Honest limitations

- Provenance is **shallow** today (model/brief only); prompt-version + context linkage is
  not built.
- The `ConstitutionChecker` is **unwired** — consumed only by the dormant runtime and tests.
- Every metric in C011 is **❌ ROADMAP**; the journal records the raw fields, but no metric
  is computed today.
- Confidence **calibration** (comparing confidence to outcome) is measured here but
  **improved** in Book D.

## 4. Value contribution

Trust is the product. Traceable, gated, measurable explanations let the agency stand behind
every recommendation in front of a client (revenue: premium positioning, account retention)
and focus reviewer attention on the weakly-supported ones (time saved).

## 5. Governance

[`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md)
governs this part. Every addition must tier-tag each capability, trace ✅ claims to code, and
re-run [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) before release.

**Status: ✅ Released — Provenance & Trust v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
