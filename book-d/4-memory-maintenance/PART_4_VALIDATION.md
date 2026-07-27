# Book D · Part 4 — Memory Maintenance — Validation

> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Governing document:
> [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

Validation of Part 4 — keeping the memory trustworthy over time. Result: **✅ PASS**.

---

## 1. Scope validated

| # | Document | Purpose | Tier focus |
|---|---|---|---|
| D008 | [`MERGE_AND_VERSIONING.md`](MERGE_AND_VERSIONING.md) | Combine records; evolve versions | 🔶/✅ |
| D009 | [`DECAY_AND_FRESHNESS.md`](DECAY_AND_FRESHNESS.md) | Make recent evidence count (owns Law 4) | 🔶/❌ |
| D010 | [`ARCHIVE_AND_DURABILITY.md`](ARCHIVE_AND_DURABILITY.md) | Retention + survive restart | ❌ |

## 2. Checks

| Check | Result | Notes |
|---|---|---|
| Merge honesty | ✅ PASS | Graph prop-merge ✅ ([knowledge-graph.ts:17](../../domains/company-brain/src/knowledge-graph.ts#L17)); sample-weighted `mergeMarketing`/`mergeSop` and `attachOutcome` correctly 🔶. |
| Version honesty | ✅ PASS | Prompt Registry versioning 🔶 ([in-memory-prompt-registry.ts:79](../../domains/prompt-registry/src/in-memory-prompt-registry.ts#L79)); SOP version gate cited. |
| Law 4 owned | ✅ PASS | D009 gives the "2019: 500 vs last-90-days: 43" example; ranks by sample size + recency + sector/campaign similarity; names Book E as consumer without designing it. |
| Freshness data-vs-scoring split | ✅ PASS | Timestamps ✅ stored ([memory.ts:21](../../domains/executive-memory/src/memory.ts#L21)); `recall` ignores `createdAt` ([memory.ts:35](../../domains/executive-memory/src/memory.ts#L35)) → freshness scoring correctly ❌. |
| Durability truth stated | ✅ PASS | Brain/journal/exec-memory volatile in-memory in prod ([app.ts:89](../../apps/web/src/app.ts#L89)); Reports persist ([repositories.ts:193](../../apps/web/src/db/repositories.ts#L193)); named as THE foundational build item. |
| Archive truth stated | ✅ PASS | No memory eviction; the 50-entry cap is the dashboard feed ([app.ts:67](../../apps/web/src/app.ts#L67)), not memory — stated plainly. |
| Law 3 interplay | ✅ PASS | Freshness never overrides sample-size honesty; both stamps travel together. |
| Law 1 | ✅ PASS | Merge/decay/archive move facts, never fabricate conclusions. |
| Vocabulary law | ✅ PASS | "Learning" only as `learning.ts` code path. |
| Citation accuracy | ✅ PASS | All 10 cited paths exist. |
| Cross-refs | ✅ PASS | All internal + back-ref to Part 3 resolve. |
| Boundary discipline | ✅ PASS | Local durable storage (local Postgres, no cloud), own-data only. |
| Documentation-only hygiene | ✅ PASS | Only `book-d/` files added. |
| Forbidden legacy label | ✅ PASS | Absent. |

## 3. Verdict

**✅ PASS.** Part 4 is candid about the biggest structural gap in Performance Memory: the
derived memory is volatile and unpruned today. It merges facts cleanly, weighs freshness over
frequency, and names durable persistence as the prerequisite for the whole book to deliver.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
