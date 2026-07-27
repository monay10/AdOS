# Book C · Part 3 — Provenance & Trust

Making the Trust Layer trustworthy end to end: trace every output to its inputs, enforce the
Evidence First Law, and measure whether the explanations hold up — all without ever taking
the pen from the human.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document:
> [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`PROVENANCE_AND_LINEAGE.md`](PROVENANCE_AND_LINEAGE.md) | Tracing an output to the model, brief, and (roadmap) prompt/context | ✅/❌ |
| [`CONSTITUTION_CHECKER.md`](CONSTITUTION_CHECKER.md) | The gate that withholds unsupported recommendations | 🔶 |
| [`INTELLIGENCE_METRICS.md`](INTELLIGENCE_METRICS.md) | Coverage, calibration, evidence strength, faithfulness | ❌ |
| [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_3_RELEASE.md`](PART_3_RELEASE.md) | Release summary | — |

## Reading order

1. **`PROVENANCE_AND_LINEAGE.md`** — can we trace a recommendation to what produced it?
2. **`CONSTITUTION_CHECKER.md`** — the gate that keeps unsupported recommendations off the human's desk.
3. **`INTELLIGENCE_METRICS.md`** — is the Trust Layer actually working?

## The one thing to remember

A gate that withholds, not approves. The `ConstitutionChecker` can stop a recommendation
that has no evidence from ever being called a recommendation — but the human always makes
the decision. Trust is enforced *for* the human, never *instead of* them.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
