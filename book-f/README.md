# BOOK F — AI Orchestration Platform (the management layer)

The layer that runs all the other books. A–E gave AdOS Production (B), Explanation (C),
Performance Memory (D), and Creative Judgement (E) — but no system to run them in the right
order. **Book F is that system**: the managed pipeline that turns six independent books into one
enterprise-scale platform.

> **Book F coordinates the other layers; it adds NO new intelligence.** It engages the right
> intelligence layer at the right time.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book F is a **design
> & architecture specification**, not a claim of shipped capability. Every capability is tagged
> **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as
> shipped.
>
> **Start here:**
> [`1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md)
> — the six governing laws.

---

## Where Book F sits — and completes the core

| Book | Layer |
|---|---|
| A — Agency | Workflow |
| B — Factory | Production |
| C — Campaign Intelligence | Explanation |
| D — Performance Memory | Performance memory |
| E — Creative Intelligence | Creative judgement |
| **F — AI Orchestration** | **Orchestration** *(this book)* |

**A–F together are the product's core operating system.** Later books — **G (Analytics)** shows,
it does not decide; **H (Marketplace)** is ecosystem, not core — build ON this core and must not
change it.

## The pipeline Book F manages

```
Mission → Planner → Memory → Generation → Scoring → Explanation → Human Review → Revision → Approve
```

## The six governing laws

1. **No component executes outside the orchestration pipeline** (the First Law).
2. **Orchestration is Deterministic** — Same Mission + Same Context + Same Memory → Same Pipeline.
3. **Every Stage Has One Responsibility.**
4. **The Orchestrator Never Changes Evidence** — Book D's evidence is immutable.
5. **The Human Gate is a First-Class Stage**, not an exception (Review → Approved | Revision).
6. **Observable by Design** — every run records Mission ID · Pipeline Version · Stages Executed ·
   Duration · Evidence Used · Human Decisions · Final Outcome.

> **Orchestration coordinates intelligence; it does not create intelligence.**

## The four parts

| Part | What it covers |
|---|---|
| [`1-orchestration-foundations/`](1-orchestration-foundations/) | The laws, the two orchestrations, the canonical pipeline |
| [`2-pipeline-stages/`](2-pipeline-stages/) | Each stage, one responsibility at a time |
| [`3-orchestration-control/`](3-orchestration-control/) | Sequencing, state, determinism, recovery |
| [`4-orchestration-integrity/`](4-orchestration-integrity/) | Observability, and A–F as one managed platform |

Each part has its own `README.md`, a validation report (all **✅ PASS**), and a release. The
flagship summary is [`BOOK_F_RELEASE.md`](BOOK_F_RELEASE.md).

## The honest baseline

AdOS already has **both halves of orchestration — disconnected.** A shipped, manual, human-gated
mission workflow on a real state machine; and a built-but-unwired governed 12-stage pipeline
(`AIManager`) with a frozen execution trace, running only in tests while the live app bypasses it.
Book F is the code-grounded design to **unify them** — make the governed pipeline the engine
behind the workflow — plus the Planner (roadmap), non-destructive Revision (roadmap), and the
observable run record (roadmap). The First Law is the goal; today it is not met, and Book F says
so plainly.

## Inviolable boundaries

**100% local** · **copy only** · **no external data** · **no vendor telemetry** (own data only) ·
**human-sovereign** (the human gate is first-class; AdOS never auto-approves) · **not an
autonomous agent** (deterministic orchestration, no self-improvised paths).

## The one thing to remember

> *Orchestration coordinates intelligence; it does not create intelligence.*

Book F is what turns six books into one manageable enterprise platform — evidence first, then
judgement, then human decision, and now: the right component, in the right order.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
