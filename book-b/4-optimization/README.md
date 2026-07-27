# Book B · Part 4 — Optimization

The checks and controls that make AdOS's output continuously better and safer. Part 4
**closes the last two Book A gaps** — **B-1** (enforce brand safety against generated
copy) and **B-3** (non-destructive AI revision) — and keeps the **human as the final
authority** everywhere.

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is
> a **design & architecture specification**. Every capability is tagged **✅ SHIPPED**,
> **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Read
> [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) for
> the tier model.
>
> **Principle:** every check is **advisory input to a human**. AdOS **never
> auto-approves** and is not an autonomous agent; the human always decides. Metrics are
> the agency's **own data** — no vendor telemetry.

---

## Contents

| Doc | Control | Tier |
|---|---|---|
| [`REVISION_ENGINE.md`](REVISION_ENGINE.md) | Non-destructive AI revision (**B-3**) | ❌ AI / ✅ human |
| [`BRAND_SAFETY.md`](BRAND_SAFETY.md) | Enforce bannedWords (**B-1**) | 🔶 / ❌ |
| [`TONE_CHECKER.md`](TONE_CHECKER.md) | On-brand tone | ❌ |
| [`READABILITY.md`](READABILITY.md) | Clear copy | ❌ |
| [`COMPLIANCE.md`](COMPLIANCE.md) | Advisory screening | ❌ |
| [`SCORING.md`](SCORING.md) | Score variants/prompts/models | 🔶 / ❌ |
| [`HUMAN_REVIEW.md`](HUMAN_REVIEW.md) | The human gate (shipped) | ✅ |
| [`AI_SUGGESTIONS.md`](AI_SUGGESTIONS.md) | Advisory suggestions | ❌ |
| [`OPTIMIZATION_METRICS.md`](OPTIMIZATION_METRICS.md) | Proof of improvement | ❌ |
| [`PART_4_VALIDATION.md`](PART_4_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_4_RELEASE.md`](PART_4_RELEASE.md) | Release summary | — |

## Reading order

1. `HUMAN_REVIEW.md` — the shipped gate everything else augments.
2. Safety & quality checks: `BRAND_SAFETY.md` → `TONE_CHECKER.md` → `READABILITY.md` → `COMPLIANCE.md`.
3. Acting on the checks: `SCORING.md` → `AI_SUGGESTIONS.md` → `REVISION_ENGINE.md`.
4. `OPTIMIZATION_METRICS.md` — is the loop actually improving output?

## The one thing to remember

Two of these are the flagship's highest-value fixes: **Brand Safety** stops the product
shipping copy that violates a brand's banned words (today it can), and the **Revision
Engine** turns a destructive "reject → fail" into a non-destructive improvement loop. Both
rest on code that already exists — the work is to enforce it, safely, with the human still
holding the pen.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
