# Book F · Part 1 — Orchestration Foundations

The foundations of the management layer: the laws of orchestration, the two orchestrations that
exist today, and the canonical pipeline that unifies AdOS's six books into one managed process.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Start with the
> governing document, [`AI_ORCHESTRATION_CONSTITUTION.md`](AI_ORCHESTRATION_CONSTITUTION.md).
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`AI_ORCHESTRATION_CONSTITUTION.md`](AI_ORCHESTRATION_CONSTITUTION.md) | The six governing laws | governing |
| [`ORCHESTRATION_MODEL.md`](ORCHESTRATION_MODEL.md) | The two orchestrations + the unification goal | ✅/🔶 |
| [`ORCHESTRATION_PIPELINE.md`](ORCHESTRATION_PIPELINE.md) | The canonical pipeline, stage by stage | 🔶/✅ |
| [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_1_RELEASE.md`](PART_1_RELEASE.md) | Release summary | — |

## Reading order

1. **`AI_ORCHESTRATION_CONSTITUTION.md`** — the laws that govern all of Book F.
2. **`ORCHESTRATION_MODEL.md`** — the two orchestrations, and why they must become one.
3. **`ORCHESTRATION_PIPELINE.md`** — the canonical pipeline, stage by stage.

## The one thing to remember

AdOS already has both halves — a shipped human-gated workflow and a built-but-unwired governed
pipeline — but they are disconnected. Book F is the design to make them one.
*Orchestration coordinates intelligence; it does not create intelligence.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
