# Book D · Part 1 — Campaign Recording

The **Raw** layer of Performance Memory: what a Performance Record is, and the machinery that
writes every finished campaign into the company's memory.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Start with the
> governing document,
> [`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md) | The four governing laws + the full pipeline | governing |
| [`PERFORMANCE_RECORD.md`](PERFORMANCE_RECORD.md) | The record schema, field by field (what is / isn't captured) | ✅/❌ |
| [`RECORDING_PIPELINE.md`](RECORDING_PIPELINE.md) | The shipped write fan-out + durability caveat | ✅ |
| [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_1_RELEASE.md`](PART_1_RELEASE.md) | Release summary | — |

## Reading order

1. **`PERFORMANCE_MEMORY_CONSTITUTION.md`** — the laws that govern all of Book D.
2. **`PERFORMANCE_RECORD.md`** — the fact we capture (and the facts we don't yet).
3. **`RECORDING_PIPELINE.md`** — how a finished campaign is written to memory today.

## The one thing to remember

The AI never learns — the **company** accumulates memory. Part 1 is where that memory begins:
one faithful Performance Record per finished campaign. Facts in; conclusions come later.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
