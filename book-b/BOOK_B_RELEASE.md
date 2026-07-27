# BOOK B — AI Campaign Factory — Flagship Release

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — all 4 parts validated PASS, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

Book B is the **flagship** of AdOS v2: the complete design & architecture of the AI
system that turns AdOS from a "prompt → LLM → output" tool into a small **AI-agent
pipeline** — Campaign Brief → Planning → Research → Memory → Brand → Prompt Orchestrator
→ Generation → Quality → Brand Safety → Revision → Approval → Learning → Optimization.

It exists to support one promise, truthfully:

> *"AdOS uses the agency's corporate memory to produce human-approved first drafts and
> improves each campaign by learning from the last."*

Book B is **documentation only**, and it is scrupulously honest about what that promise
requires: every capability is tagged **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌
ROADMAP**. Nothing unbuilt is claimed as shipped.

---

## 1. The three tiers (the spine of the book)

| Tier | Meaning |
|---|---|
| **✅ SHIPPED** | Runs in the live app today; cited to wired code. |
| **🔶 BUILT (UNWIRED)** | Code exists and is unit-tested, but no running path reaches it. Wiring it is Book B build work. |
| **❌ ROADMAP** | No implementation; pure specification. |

The flagship story is honest and strong: a large part of the agent architecture is **🔶
already coded** (a tested-but-dormant runtime in `packages/ai-manager/src/runtime/**`,
`domains/executive-memory/**`, `domains/prompt-registry/**`); the rest is **❌ to design**.
Book B is the blueprint **and** the wiring plan.

## 2. The four parts

| Part | Directory | Content docs | ~Lines | Focus |
|---|---|---|---|---|
| 1 · AI Foundations | [`1-ai-foundations/`](1-ai-foundations/) | 9 | ~3,718 | How AI works: injection, orchestration, validation, retry, quality |
| 2 · Creative Factory | [`2-creative-factory/`](2-creative-factory/) | 9 | ~3,328 | Decomposing single-shot creative into staged generators |
| 3 · Learning Engine | [`3-learning-engine/`](3-learning-engine/) | 9 | ~3,370 | The differentiator: close the learning loop |
| 4 · Optimization | [`4-optimization/`](4-optimization/) | 9 | ~3,446 | Safety, quality, revision, scoring — human-gated |

**36 content documents + 4 part-validations + 4 part-releases + 5 READMEs = 49 documents,
~14,900 lines.** Each part carries its own validation (all **PASS**) and release.

## 3. What is ✅ SHIPPED today (the honest baseline)

- **100% local inference** — Ollama + OpenAI-compatible local engines, no cloud, no API
  key, no per-token billing; deterministic offline stub by default.
- **Single-shot generation** of brief → creative (six copy fields, copy only) → campaign
  draft → report → executive dashboard, each one AI call.
- **Mission + language injection**, **schema-as-text injection**, **JSON extraction**,
  **one self-repair retry**.
- **In-memory recording** of every completed campaign to the Company Brain / Executive
  Memory / Decision Journal.
- **Human approval** gating every AI output.

## 4. The flagship gaps Book B closes (all designed, none yet shipped)

| Gap | Book A origin | Book B home | Status |
|---|---|---|---|
| **B-1** Enforce brand `bannedWords` against generated copy | Walkthrough Scenario 2 | Part 4 `BRAND_SAFETY.md` | 🔶 code exists unwired → design to enforce |
| **B-2** Read the Company Brain back into generation (close the learning loop) | Walkthrough Scenario 3 | Part 1 `MEMORY_INJECTION.md` + Part 3 `BRIEF_IMPROVEMENT.md` | ❌ readers exist unwired → design to wire |
| **B-3** Non-destructive AI revision (not `mission.fail()`) | Walkthrough Scenario 2 | Part 4 `REVISION_ENGINE.md` | ❌ AI / ✅ human → design to reconcile |

These three are the highest-value work in AdOS v2, and Book B specifies each one against
real, cited code.

## 5. Inviolable boundaries (held across all 4 parts)

- **100% local** — no cloud, no API keys, no per-token billing, air-gap capable; any
  engine failover stays local.
- **Copy only** — no image/vision/speech/video generation (declared capabilities have no
  engine).
- **No external data** — no connectors, crawlers, scrapers, or document ingestion;
  persona/competitor/trend reasoning is over agency-held or user-supplied inputs only.
- **No vendor telemetry** — all learning/optimization metrics are the agency's own
  in-memory data + hand-entered KPIs.
- **Human-sovereign** — every AI check is advisory; AdOS **never auto-approves** and is
  not an autonomous agent.

## 6. Validation

All four part-validation reports record **PASS** across cross references, three-tier
discipline, truth alignment, code-citation accuracy, boundary discipline, Book A/Part
consistency, and documentation-only hygiene. Every cross reference across all 49 documents
resolves; the forbidden legacy label "Advertising Operating System" appears nowhere as a
product name.

## 7. What comes next

Book B is the blueprint; **building it is engineering work governed by
`../PRODUCT_TRUTH.md` and `../bizops/RELEASE_GOVERNANCE.md`.** The natural first build
increments are the three gap-closers (B-1, B-2, B-3), each of which wires code that
largely already exists. As each ships, its Book B tier moves ✅ and PRODUCT_TRUTH.md is
updated to match — documentation and product advancing together, never ahead.

---

## 8. Governance

`1-ai-foundations/AI_CONSTITUTION.md` is binding on every Book B artifact. Any addition
must tier-tag each capability, trace ✅ claims to code, and re-run the relevant part
validation before release. Later books (Analytics, Marketplace, AI Studio, …) build on
Book B.

**Status: ✅ Released — AI Campaign Factory v1.0.0 (flagship).**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
