# Book D · Part 1 — Campaign Recording — Validation

> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Governing document:
> [`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

Validation of Part 1 — the **Raw** layer: what a Performance Record is and how it is written.
Result: **✅ PASS**.

---

## 1. Scope validated

| # | Document | Purpose | Tier focus |
|---|---|---|---|
| D001 | [`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md) | The four governing laws | governing |
| D002 | [`PERFORMANCE_RECORD.md`](PERFORMANCE_RECORD.md) | The record schema, field-by-field tier | ✅/❌ |
| D003 | [`RECORDING_PIPELINE.md`](RECORDING_PIPELINE.md) | The shipped write fan-out + durability caveat | ✅ |

## 2. Checks

| Check | Result | Notes |
|---|---|---|
| Four laws declared | ✅ PASS | Evidence-not-Knowledge, Raw→Aggregate→Recommendation, Sample Size, Freshness-before-Frequency all stated in D001 and honored downstream. |
| "AI never learns / company accumulates" framing | ✅ PASS | Central to D001; the AI speaks as "based on the last N campaigns", never "I learned". |
| No new AI | ✅ PASS | Recording is deterministic; no model added. |
| ✅ anchor grounded | ✅ PASS | `recordLearning` fan-out — journal [routes.ts:1118](../../apps/web/src/routes.ts#L1118), execMemory [:1136](../../apps/web/src/routes.ts#L1136), experience [:1146](../../apps/web/src/routes.ts#L1146), patterns [:1156](../../apps/web/src/routes.ts#L1156), graph [:1165](../../apps/web/src/routes.ts#L1165) — cited accurately as ✅ SHIPPED. |
| Field-level honesty | ✅ PASS | D002 tags ✅ ROAS/ROI/CTR/channels/vertical vs ❌ Creative/Audience/Offer/Hook/Headline/CTA/Season/Budget; CPM correctly ❌ (not computed anywhere). |
| Durability caveat stated | ✅ PASS | Brain/journal/exec-memory volatile in-memory ([app.ts:89](../../apps/web/src/app.ts#L89)); only Reports persist ([repositories.ts:193](../../apps/web/src/db/repositories.ts#L193)). |
| Rollup-not-invoked caveat | ✅ PASS | `enrich`/`mergeMarketing` never called at record time — records land raw, un-aggregated. |
| Vocabulary law | ✅ PASS | "Learning" used only as code identifier or in the meta-rule; preferred terms throughout. |
| PRODUCT_TRUTH untouched; value-prop deferred | ✅ PASS | The upgraded value proposition appears in D001 only as an explicit ❌ ROADMAP target. |
| Three-tier / citation accuracy | ✅ PASS | All 14 cited paths exist. |
| Boundary discipline | ✅ PASS | 100% local, own-data, human-sovereign, no external benchmarks. |
| Documentation-only hygiene | ✅ PASS | Only `book-d/` files added; no tracked code/test modified. |
| Forbidden legacy label | ✅ PASS | Absent. |

## 3. Verdict

**✅ PASS.** Part 1 establishes the Raw layer honestly: the write pipes are real and shipping,
but the record is thin and volatile — and the book says so plainly.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
