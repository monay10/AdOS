# Book C · Part 1 — The Why Contract — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 1 fixes **what an explanation *is*** in AdOS — the contract every later part and every
AI output must honor. It is a **design & architecture specification**; every capability is
tiered **✅ / 🔶 / ❌**, and the human stays the final authority. Documentation only.

> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| C001 | [`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md) | The governing laws of the Trust Layer | governing |
| C002 | [`EXPLAINABILITY_MODEL.md`](EXPLAINABILITY_MODEL.md) | Anatomy of an explanation + the 8-field Explainability Contract | ✅/🔶/❌ |
| C003 | [`EVIDENCE_ENGINE.md`](EVIDENCE_ENGINE.md) | `BrainEvidenceEngine` — the Evidence First Law in code | 🔶 |
| C004 | [`CONFIDENCE_MODEL.md`](CONFIDENCE_MODEL.md) | `HeuristicConfidenceEngine` + Confidence ≠ Truth | 🔶 |
| — | [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. The four laws this part establishes

1. **Evidence First Law** — no output is a "recommendation" unless it can show evidence:
   Recommendation → Evidence → Confidence → Alternatives → Decision. Never "the LLM said so".
2. **Confidence ≠ Truth** — confidence is the system's belief; truth is the real outcome.
   Closing the gap is **Book D's** job.
3. **Explainability Contract** — the 8-field minimum (Recommendation / Why? / Evidence /
   Confidence / Alternative considered / Brand rules checked / Memory consulted / Human
   action required) that becomes the UI standard.
4. **Evidence is descriptive, not prescriptive** — past data informs but never forces.

## 3. Honest baseline

- **✅ SHIPPED:** the Decision Journal already records, reads back, and displays a decision's
  evidence/confidence/alternatives on the mission detail page — the real, if in-memory,
  explainability surface today.
- **🔶 BUILT (UNWIRED):** `BrainEvidenceEngine` and `HeuristicConfidenceEngine` — the true
  grounded-reasoning engines — exist and are unit-tested but no live path reaches them.
  Wiring them is the core Book C build.
- **❌ ROADMAP:** the full 8-field contract as a first-class UI surface.

## 4. Value contribution

Explainability is AdOS's **Trust Layer**: it wins and retains accounts by proving the AI's
reasoning from the agency's own campaign memory (revenue ↑), and it cuts the reviewer's
"do I believe this?" time by putting evidence and confidence in front of the decision
(production time ↓).

## 5. Governance

[`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md) governs this
part and all of Book C. Every addition must tier-tag each capability, trace ✅ claims to
code, and re-run [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) before release.

**Status: ✅ Released — The Why Contract v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
