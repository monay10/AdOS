# Book B · Part 2 — Creative Factory

The stages that turn a brief into on-brand ad copy. **Today AdOS generates all creative
in a single `creative.set` shot (copy only, no images); the Creative Factory decomposes
that shot into specialized, testable stages.**

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is
> a **design & architecture specification**. Every capability is tagged **✅ SHIPPED**,
> **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Read
> [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) for
> the tier model.
>
> **Hard boundaries:** creative is **copy only** (no image/vision/video), and AdOS uses
> **no crawlers, scrapers, connectors, or document ingestion** — persona and competitor
> stages reason only over agency-held or user-supplied inputs with **local** AI.

---

## Contents

| Doc | Stage | Tier |
|---|---|---|
| [`BRIEF_ANALYSIS.md`](BRIEF_ANALYSIS.md) | Analyze the brief | ❌ |
| [`PERSONA_BUILDER.md`](PERSONA_BUILDER.md) | Audience personas | ❌ |
| [`COMPETITOR_ANALYZER.md`](COMPETITOR_ANALYZER.md) | Competitor positioning | ❌ |
| [`HOOK_GENERATOR.md`](HOOK_GENERATOR.md) | Hooks / angles | ⚠️/❌ |
| [`HEADLINE_GENERATOR.md`](HEADLINE_GENERATOR.md) | Headlines | ⚠️ |
| [`COPY_GENERATOR.md`](COPY_GENERATOR.md) | Body & asset copy (shipped core) | ✅/⚠️ |
| [`CTA_GENERATOR.md`](CTA_GENERATOR.md) | Calls-to-action | ⚠️ |
| [`CREATIVE_BRIEF_GENERATOR.md`](CREATIVE_BRIEF_GENERATOR.md) | Strategy→creative handoff | ✅/⚠️ |
| [`CREATIVE_QA.md`](CREATIVE_QA.md) | QA before human review | ❌ auto / ✅ human |
| [`PART_2_VALIDATION.md`](PART_2_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_2_RELEASE.md`](PART_2_RELEASE.md) | Release summary | — |

## Reading order

1. Inputs to creative: `BRIEF_ANALYSIS.md` → `PERSONA_BUILDER.md` → `COMPETITOR_ANALYZER.md` → `CREATIVE_BRIEF_GENERATOR.md`.
2. Generation: `HOOK_GENERATOR.md` → `HEADLINE_GENERATOR.md` → `COPY_GENERATOR.md` → `CTA_GENERATOR.md`.
3. `CREATIVE_QA.md` — quality-assure before the `creative_assets` human gate.

## The one thing to remember

The shipped win is real: **AI drafts every copy asset from the brief in one shot.** Part
2 is the plan to make that one shot into a *factory* — specialized, multi-variant,
quality-checked stages — without ever leaving the copy-only, local-only, no-external-data
boundaries the product holds today.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
