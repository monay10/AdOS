# Book D · Part 4 — Memory Maintenance

Keeping Performance Memory **trustworthy as it grows**: merging records, versioning, weighing
freshness over frequency, and making the memory durable enough to compound.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document:
> [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## Contents

| Doc | Covers | Tier |
|---|---|---|
| [`MERGE_AND_VERSIONING.md`](MERGE_AND_VERSIONING.md) | Combining records for a key; evolving versions | 🔶/✅ |
| [`DECAY_AND_FRESHNESS.md`](DECAY_AND_FRESHNESS.md) | Recency weighting — Freshness before Frequency | 🔶/❌ |
| [`ARCHIVE_AND_DURABILITY.md`](ARCHIVE_AND_DURABILITY.md) | Retention + surviving a restart | ❌ |
| [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_4_RELEASE.md`](PART_4_RELEASE.md) | Release summary | — |

## Reading order

1. **`MERGE_AND_VERSIONING.md`** — how records for the same key combine without distortion.
2. **`DECAY_AND_FRESHNESS.md`** — why recent evidence can outweigh a bigger pile of old evidence.
3. **`ARCHIVE_AND_DURABILITY.md`** — the biggest gap: memory that survives a restart.

## The one thing to remember

A memory that is never maintained does not compound — it rots. The most important item here is
blunt: today the derived Performance Memory is **volatile and unpruned**. Making it durable is
the prerequisite for everything Book D promises.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
