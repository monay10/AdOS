# Book F · Part 3 — Orchestration Control

How the pipeline is sequenced, how state is managed, and how failure is handled — deterministic
control that enforces the First Law on AdOS's shipped state machine.

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

| Doc | Covers | Tier |
|---|---|---|
| [`SEQUENCING_AND_STATE.md`](SEQUENCING_AND_STATE.md) | Enforcing the First Law + Determinism on the state machine | ✅/❌ |
| [`FAILURE_AND_RECOVERY.md`](FAILURE_AND_RECOVERY.md) | Bounded self-repair, idempotency, and the recovery gap | ✅/❌ |
| [`PART_3_VALIDATION.md`](PART_3_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_3_RELEASE.md`](PART_3_RELEASE.md) | Release summary | — |

## Reading order

1. **`SEQUENCING_AND_STATE.md`** — how the pipeline is ordered and how the First Law is enforced.
2. **`FAILURE_AND_RECOVERY.md`** — how it repairs, retries, and recovers — deterministically.

## The one thing to remember

Control means predictability: a fixed order, bounded retries, and recoverable state — never an
autonomous agent improvising its own path. The biggest gap to close is the destructive, terminal
`fail()`. *Orchestration coordinates intelligence; it does not create intelligence.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
