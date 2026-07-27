# Book D · Part 1 — Campaign Recording — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 1 is the **Raw** layer of Performance Memory — what is recorded when a campaign finishes,
and the machinery that writes it. It is a **design & architecture specification**; every
capability is tiered **✅ / 🔶 / ❌**. Documentation only.

> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| D001 | [`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md) | The four governing laws of Performance Memory | governing |
| D002 | [`PERFORMANCE_RECORD.md`](PERFORMANCE_RECORD.md) | The Performance Record, field by field | ✅/❌ |
| D003 | [`RECORDING_PIPELINE.md`](RECORDING_PIPELINE.md) | The shipped write fan-out + honest limits | ✅ |
| — | [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 1 establishes

- **The governing laws:** memory stores facts not conclusions; every recommendation flows
  Raw → Aggregate → Recommendation; every recommendation carries its sample size; recent
  evidence is weighed on freshness, not just frequency.
- **The write pipes are real:** every completed campaign already fans out to the Decision
  Journal, Executive Memory, Experience Engine, Pattern Library, and Knowledge Graph. "Campaign
  → Performance Record" ships today.
- **The record is thin and volatile — honestly:** only ROAS/ROI/CTR + channel strings +
  vertical reach memory; the richer descriptors (hook, audience, offer, creative, season…) are
  not captured; CPM is not even computed; and the derived memory is in-memory and lost on
  restart while only the KPI reports persist.

## 3. Honest limitations

- Recording writes raw stores but never triggers aggregation (`enrich`/`mergeMarketing` is
  uncalled), so nothing is summarized at record time.
- Brain/journal/executive-memory are **volatile in-memory even in production**; durable
  persistence is ❌ ROADMAP.
- Recording is a manual action, not a completion webhook.

## 4. Value contribution

A faithful, complete Performance Record is the raw material of every future edge: the more
truthfully each finished campaign is captured, the more the agency can later prove and reuse
(revenue), and the less each new campaign starts from a blank page (production time).

## 5. Governance

[`PERFORMANCE_MEMORY_CONSTITUTION.md`](PERFORMANCE_MEMORY_CONSTITUTION.md) governs this part
and all of Book D. Every addition must tier-tag each capability, trace ✅ claims to code, and
re-run [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) before release.

**Status: ✅ Released — Campaign Recording v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
