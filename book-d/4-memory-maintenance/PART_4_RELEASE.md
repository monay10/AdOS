# Book D · Part 4 — Memory Maintenance — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 4 keeps Performance Memory **trustworthy as it grows**: merging records, versioning,
weighing freshness over frequency, and — most importantly — making the memory durable. It is a
**design & architecture specification**; every capability is tiered **✅ / 🔶 / ❌**.
Documentation only.

> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| D008 | [`MERGE_AND_VERSIONING.md`](MERGE_AND_VERSIONING.md) | Combine records for a key; evolve versions | 🔶/✅ |
| D009 | [`DECAY_AND_FRESHNESS.md`](DECAY_AND_FRESHNESS.md) | Recency weighting — owns Freshness before Frequency | 🔶/❌ |
| D010 | [`ARCHIVE_AND_DURABILITY.md`](ARCHIVE_AND_DURABILITY.md) | Retention + surviving a restart | ❌ |
| — | [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 4 establishes

- **Merge is mostly built, mostly unwired:** the only merge on a live path is the Knowledge
  Graph property-merge (✅); the sample-weighted rollup merges, outcome attachment, and prompt
  versioning are 🔶.
- **Freshness before Frequency, operationalized:** recent evidence isn't devalued by volume of
  old evidence; ranking blends sample size, recency, and sector/campaign similarity — the
  foundation Book E will optimize on. Freshness *data* exists; freshness *scoring* is ❌.
- **The foundational gap named honestly:** the brain, executive memory, and decision journal
  are volatile in-memory even in production and are never pruned. Only KPI reports persist.
  Until the memory stores are made durable, Performance Memory cannot compound across restarts.

## 3. Honest limitations

- **No archive/eviction anywhere** — memory grows unbounded; the only cap is a display buffer.
- **Derived memory is volatile** — lost on restart; durable persistence is ❌ ROADMAP and is
  the prerequisite for the rest of Book D to deliver value.
- **Freshness scoring on read is ❌** — timestamps are stored but ignored by `recall`.

## 4. Value contribution

Durable, well-merged, freshness-aware memory is what makes the compounding promise real —
volatile memory resets the agency's hard-won edge to zero on every restart. Maintenance is the
difference between a memory that grows more valuable and one that quietly rots (revenue and
production-time both depend on it).

## 5. Governance

[`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md)
governs this part. Every addition must tier-tag each capability, trace ✅ claims to code, and
re-run [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) before release.

**Status: ✅ Released — Memory Maintenance v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
