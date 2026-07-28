# Book F · Part 2 — Pipeline Stages

Each stage of the orchestration pipeline, one responsibility at a time — Mission, Planner,
Memory, Generation, Scoring, Explanation, Human Review, Revision, Approve — mapped to the book
that owns it.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document:
> [`../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md).
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## Contents

| Doc | Stages | Tier |
|---|---|---|
| [`MISSION_AND_PLANNING.md`](MISSION_AND_PLANNING.md) | Mission · Planner | ✅/❌ |
| [`MEMORY_AND_GENERATION.md`](MEMORY_AND_GENERATION.md) | Memory · Generation | 🔶/✅ |
| [`SCORING_AND_EXPLANATION.md`](SCORING_AND_EXPLANATION.md) | Scoring · Explanation | 🔶/❌ |
| [`REVIEW_REVISION_APPROVAL.md`](REVIEW_REVISION_APPROVAL.md) | Human Review · Revision · Approve | ✅/❌ |
| [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_2_RELEASE.md`](PART_2_RELEASE.md) | Release summary | — |

## Reading order

1. **`MISSION_AND_PLANNING.md`** — the unit of work and the (roadmap) planner.
2. **`MEMORY_AND_GENERATION.md`** — supply evidence, produce the draft.
3. **`SCORING_AND_EXPLANATION.md`** — evaluate it, explain it.
4. **`REVIEW_REVISION_APPROVAL.md`** — the human stages, first-class in the flow.

## The one thing to remember

Each stage does exactly one job and passes the work on. The human stages are part of the normal
flow, not error handling. *Orchestration coordinates intelligence; it does not create
intelligence.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
