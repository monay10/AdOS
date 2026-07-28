# Book F · Part 2 — Pipeline Stages — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 2 defines **each stage of the pipeline** — Mission, Planner, Memory, Generation, Scoring,
Explanation, Human Review, Revision, Approve — each with one responsibility, each mapped to the
book that owns it. It is a **design & architecture specification**; every capability is tiered
**✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## 1. Deliverables

| # | Document | Stages | Tier |
|---|---|---|---|
| F004 | [`MISSION_AND_PLANNING.md`](MISSION_AND_PLANNING.md) | Mission (✅ state machine) · Planner (❌ contract only) | ✅/❌ |
| F005 | [`MEMORY_AND_GENERATION.md`](MEMORY_AND_GENERATION.md) | Memory (🔶 context/evidence) · Generation (✅ single-shot) | 🔶/✅ |
| F006 | [`SCORING_AND_EXPLANATION.md`](SCORING_AND_EXPLANATION.md) | Scoring (Book E) · Explanation (Book C) | 🔶/❌ |
| F007 | [`REVIEW_REVISION_APPROVAL.md`](REVIEW_REVISION_APPROVAL.md) | Human Review · Revision · Approve | ✅/❌ |
| — | [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 2 establishes

- **One job per stage:** Mission holds the work; Planner orders the steps; Memory supplies
  evidence; Generation drafts; Scoring evaluates; Explanation explains; Review/Revision/Approve
  are the human's. No stage does another's job.
- **Evidence stays immutable:** the Memory stage reads Book D's evidence and passes it downstream
  unchanged; Scoring and Explanation read, never edit.
- **The human gate is first-class:** approval is a normal pipeline stage — AdOS's strongest
  human-sovereign guarantee — and Part 2 is honest that rejection still uses a destructive
  `fail()` today, which the Revision-branch design replaces.

## 3. Honest limitations

- The **Planner is ❌ roadmap** (contract only); the **Memory / Scoring / Explanation** stages are
  **🔶** and bypassed by the live app; **Revision-as-a-branch** is ❌ (today reject = terminal
  failure).
- Only the Mission state machine, single-shot generation, and the approval gates are ✅ live.

## 4. Value contribution

Clean, single-responsibility stages make the pipeline auditable and safe to wire incrementally —
each stage can be lit up on its own without destabilising the others (production time), and the
first-class human gate keeps accountability with the agency (revenue and trust).

## 5. Governance

[`../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md)
governs this part. Every addition must tier-tag each capability, trace ✅ claims to code, and
re-run [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) before release.

**Status: ✅ Released — Pipeline Stages v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
