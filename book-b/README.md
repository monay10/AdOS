# BOOK B — AI Campaign Factory (Flagship)

The complete design & architecture of the AI system at the heart of **AdOS — the
Enterprise AI Operating System for Advertising**. Book B turns AdOS from a "prompt → LLM
→ output" tool into a small **AI-agent pipeline** that produces human-approved first
drafts from the agency's own corporate memory and improves each campaign by learning from
the last.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book B is a
> **design & architecture specification**, not a claim of shipped capability. Every
> capability is tagged **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing
> unbuilt is claimed as shipped.
>
> **Start here:** [`1-ai-foundations/AI_CONSTITUTION.md`](1-ai-foundations/AI_CONSTITUTION.md)
> — the tier model, the two-stack reality, and the 100%-local law that govern the whole book.

---

## The pipeline Book B specifies

```
Campaign Brief → Planning → Research → Memory → Brand → Prompt Orchestrator →
Generation → Quality → Brand Safety → Revision → Approval → Learning → Optimization
```

Today only a few stages ship (generation, mission injection, human approval); much of the
rest is **🔶 already coded but unwired**, and some is **❌ to design**. Book B maps exactly
which is which — and how to wire it.

## The four parts

| Part | What it covers |
|---|---|
| [`1-ai-foundations/`](1-ai-foundations/) | **How AI works** — context, prompt orchestration, mission/brand/memory injection, validation, retry, quality rules |
| [`2-creative-factory/`](2-creative-factory/) | **Production** — decomposing today's single-shot creative into staged, testable generators |
| [`3-learning-engine/`](3-learning-engine/) | **The differentiator** — pattern/winner/loser/trend detection, recommendations, brief improvement, learning metrics |
| [`4-optimization/`](4-optimization/) | **Getting better** — revision, brand safety, tone, readability, compliance, scoring, human review, suggestions, metrics |

Each part has its own `README.md`, a validation report (all **✅ PASS**), and a release.
The flagship summary is [`BOOK_B_RELEASE.md`](BOOK_B_RELEASE.md).

## The three gap-closers (the highest-value work)

- **B-1 — Brand Safety** ([`4-optimization/BRAND_SAFETY.md`](4-optimization/BRAND_SAFETY.md)):
  enforce `bannedWords` against generated copy (today stored but not enforced; code exists
  unwired).
- **B-2 — Close the learning loop** ([`1-ai-foundations/MEMORY_INJECTION.md`](1-ai-foundations/MEMORY_INJECTION.md)
  + [`3-learning-engine/BRIEF_IMPROVEMENT.md`](3-learning-engine/BRIEF_IMPROVEMENT.md)):
  read the Company Brain back into generation (today write-only).
- **B-3 — Non-destructive revision** ([`4-optimization/REVISION_ENGINE.md`](4-optimization/REVISION_ENGINE.md)):
  replace the destructive gate-reject `fail()` with an AI-assisted revision loop.

## Inviolable boundaries

**100% local** (no cloud/API/per-token) · **copy only** (no image/vision/speech) · **no
external data** (no connectors/crawlers/ingestion) · **no vendor telemetry** (own data
only) · **human-sovereign** (never auto-approves).

## The one thing to remember

AdOS already has the foundations — local AI, single-shot generation, campaign memory,
human approval — and a surprising amount of the agent architecture **already exists in the
codebase, just unwired**. Book B is the honest, code-grounded blueprint for turning those
pieces into the compounding-learning campaign factory the product promises.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
