# Book C · Part 1 — The Why Contract

What an explanation **is** in AdOS. Part 1 defines the contract every recommendation must
honor before it can call itself a recommendation.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Start with the
> governing document, [`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md) | The four governing laws of the Trust Layer | governing |
| [`EXPLAINABILITY_MODEL.md`](EXPLAINABILITY_MODEL.md) | Recommendation→Evidence→Confidence→Alternatives→Decision→Outcome + the 8-field contract | ✅/🔶/❌ |
| [`EVIDENCE_ENGINE.md`](EVIDENCE_ENGINE.md) | `BrainEvidenceEngine` — evidence gathered, not authored | 🔶 |
| [`CONFIDENCE_MODEL.md`](CONFIDENCE_MODEL.md) | `HeuristicConfidenceEngine` + Confidence ≠ Truth | 🔶 |
| [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_1_RELEASE.md`](PART_1_RELEASE.md) | Release summary | — |

## Reading order

1. **`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`** — the laws that govern everything else.
2. **`EXPLAINABILITY_MODEL.md`** — the shape of an explanation and the 8-field contract.
3. **`EVIDENCE_ENGINE.md`** — where the evidence comes from.
4. **`CONFIDENCE_MODEL.md`** — how sure the system is, and why that is not the same as being right.

## The one thing to remember

AdOS is the **Trust Layer** on top of the factory: it does not just produce recommendations,
it can explain every one using the agency's own campaign memory. Part 1 is the promise that
no recommendation ever arrives as "the LLM said so."

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
