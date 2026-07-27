# Book B · Part 1 — AI Foundations

How AdOS's AI actually works — and the agent architecture it is designed to become.
This is the foundation for the Creative Factory (Part 2), Learning Engine (Part 3), and
Optimization (Part 4).

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Part 1
> is a **design & architecture specification**. Every capability is tagged **✅ SHIPPED**,
> **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped.
>
> **The AI law:** AdOS runs **100% local** — Ollama + OpenAI-compatible local engines
> only, **no cloud, no API keys, no per-token billing**, air-gap capable. The default is
> a deterministic offline stub; genuine model prose requires a locally-run engine.

---

## The three tiers (read `AI_CONSTITUTION.md` first)

- **✅ SHIPPED** — runs in the live app today (cited to wired code).
- **🔶 BUILT (UNWIRED)** — code exists and is unit-tested but no running path reaches it;
  wiring it is Book B build work.
- **❌ ROADMAP** — no implementation; pure specification.

## Contents

| Doc | Topic | Tier |
|---|---|---|
| [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md) | **Start here** — governing charter | — |
| [`CONTEXT_ENGINE.md`](CONTEXT_ENGINE.md) | Context assembly | 🔶 |
| [`PROMPT_ORCHESTRATOR.md`](PROMPT_ORCHESTRATOR.md) | Prompt building & registry | ⚠️✅ + 🔶 |
| [`MEMORY_INJECTION.md`](MEMORY_INJECTION.md) | Learning read-back (B-2) | ❌ (readers 🔶) |
| [`BRAND_INJECTION.md`](BRAND_INJECTION.md) | Brand voice & rules (B-1) | ⚠️✅ + 🔶/❌ |
| [`MISSION_INJECTION.md`](MISSION_INJECTION.md) | Mission objective | ✅ |
| [`VALIDATION_PIPELINE.md`](VALIDATION_PIPELINE.md) | Output validation | ⚠️✅ + 🔶 |
| [`RETRY_ENGINE.md`](RETRY_ENGINE.md) | Self-repair & retry | ⚠️✅ + 🔶 |
| [`AI_QUALITY_RULES.md`](AI_QUALITY_RULES.md) | Quality contract | ❌ scoring |
| [`PART_1_VALIDATION.md`](PART_1_VALIDATION.md) | Validation — ✅ PASS | — |
| [`PART_1_RELEASE.md`](PART_1_RELEASE.md) | Release summary | — |

## Reading order

1. `AI_CONSTITUTION.md` — the three-tier model, two-stack reality, the local law.
2. The injections: `MISSION_INJECTION.md` (✅) → `BRAND_INJECTION.md` → `MEMORY_INJECTION.md`.
3. The machinery: `CONTEXT_ENGINE.md` → `PROMPT_ORCHESTRATOR.md` → `VALIDATION_PIPELINE.md` → `RETRY_ENGINE.md`.
4. `AI_QUALITY_RULES.md` — what "good output" means.

## The one thing to remember

Today AdOS generates a first draft from the **mission** in a single shot. The flagship
work is to wrap that in the agent pipeline — **inject brand + memory**, **validate &
repair against schema**, and **close the learning loop** so each campaign improves on the
last. Much of that machinery already exists in the codebase (🔶); Part 1 maps exactly
what is shipped, what is built-but-unwired, and what is still to design.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
