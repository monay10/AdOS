# Book E · Part 1 — Creative Scoring — Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — validated, aligned to `../../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)

Part 1 defines **how a creative is scored** — the foundation of Book E's judgement layer. It is
a **design & architecture specification**; every capability is tiered **✅ / 🔶 / ❌**.
Documentation only.

> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 1. Deliverables

| # | Document | Purpose | Tier |
|---|---|---|---|
| E001 | [`CREATIVE_INTELLIGENCE_CONSTITUTION.md`](CREATIVE_INTELLIGENCE_CONSTITUTION.md) | The governing laws of creative judgement | governing |
| E002 | [`CREATIVE_SCORING_MODEL.md`](CREATIVE_SCORING_MODEL.md) | The multi-dimensional, reproducible scoring model | 🔶/❌ |
| — | [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation report — **PASS** | — |
| — | [`README.md`](README.md) | Part index & reading order | — |

## 2. What Part 1 establishes

- **The laws of judgement:** evidence is not judgement; a score is reproducible, multi-dimensional,
  built on Evidence + Rules + Heuristics (never an LLM opinion), with no hidden weights.
- **A score you can read:** Overall decomposes into Brand Fit · Policy Fit · Clarity · Readability
  · Specificity · Persuasiveness · Evidence Support · Confidence — each shown separately, each
  weighted by a documented percentage.
- **Copy-only, honestly:** scoring applies to the six copy fields; Visual/Video/Carousel scoring
  is out of scope against the product's copy-only boundary.

## 3. Honest baseline

- **No code scores a creative today** — the `CreativeSet` has no score field; creative scoring is
  ❌ ROADMAP.
- **The Evidence + Rules + Heuristics machinery exists — unwired:** pattern rank, confidence,
  sample-size weighting, and EMA are all real deterministic code, but sit behind the LiveAIManager
  bypass (🔶). Wiring them into a creative scorer is the Part 1 build.
- The only live scoring in the shipped app is a per-client mean ROAS.

## 4. Value contribution

A transparent, reproducible score lets the agency defend its creative in front of clients
(revenue) and pick the strongest option quickly instead of debating by taste (production time) —
with the human always choosing direction.

## 5. Governance

[`CREATIVE_INTELLIGENCE_CONSTITUTION.md`](CREATIVE_INTELLIGENCE_CONSTITUTION.md) governs this part
and all of Book E. Every addition must tier-tag each capability, trace ✅ claims to code, and
re-run [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) before release.

**Status: ✅ Released — Creative Scoring v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
