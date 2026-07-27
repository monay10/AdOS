# Book D · Part 2 — Pattern Discovery — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 2 is the **Aggregate** layer of Performance Memory — the machinery that summarizes many
raw Performance Records into reusable, per-dimension evidence. It is a **design & architecture
specification**; every capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| D004 | [`PATTERN_LIBRARY.md`](PATTERN_LIBRARY.md) | Captured patterns and their ranking | ✅/🔶 |
| D005 | [`PERFORMANCE_AGGREGATIONS.md`](PERFORMANCE_AGGREGATIONS.md) | The aggregation layer — AdOS's core IP | 🔶/❌ |
| — | [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 2 establishes

- **The aggregation layer is the IP:** raw records become per-dimension summaries — counts,
  sample-weighted averages, sample size, recency — the layer that must sit between a campaign
  and any recommendation. Skipping it (Campaign → Recommendation) is forbidden.
- **Patterns are captured but never consulted:** every completed campaign writes a pattern
  (✅), but the ranking that would surface the strongest ones is unwired (🔶) — the library
  grows and is never read.
- **The rollups exist but are never populated:** the sample-weighted marketing/SOP merges are
  built and tested, but the `enrich` path that feeds them is never called live.
- **Aggregation is honest evidence, not a verdict:** "in finance, N campaigns averaged X% CTR"
  is descriptive; calling one option "best" is Part 3's job.

## 3. Honest limitations

- The **only grouping key that exists is `vertical`.** Aggregation by audience, offer, hook,
  day, hour, season, or campaign-type is ❌ ROADMAP — the keys do not exist and depend on the
  richer Performance Record from Part 1.
- Current merges are **sample-weighted only**; freshness weighting (Law 4) is ❌ to add.
- The whole aggregation path is 🔶 — populated and read by no live route today.

## 4. Value contribution

Aggregation is what turns scattered campaign results into reusable, defensible evidence. It is
the difference between "we ran a lot of campaigns" and "we can prove what works in your sector"
— the compounding edge the agency sells (revenue) and the head start on every new brief
(production time).

## 5. Governance

[`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md)
governs this part. Every addition must tier-tag each capability, trace ✅ claims to code, and
re-run [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) before release.

**Status: ✅ Released — Pattern Discovery v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
