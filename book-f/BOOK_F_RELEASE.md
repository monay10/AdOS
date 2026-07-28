# BOOK F — AI Orchestration Platform — Release (the management layer)

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — all 4 parts validated PASS, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

Book F is the **orchestration** layer — the design & architecture of the managed pipeline that
runs all of AdOS's other books in the right order, turning six independent capabilities into one
enterprise-scale platform.

> **Book F coordinates the other layers; it adds NO new intelligence.** With A–F, AdOS has its
> **core operating system**.

Book F is **documentation only** and scrupulously honest: every capability is tagged **✅
SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as shipped.

---

## 1. The six governing laws

| Law | Statement |
|---|---|
| **First Law** | No component executes outside the orchestration pipeline. |
| **Deterministic** | Same Mission + Same Context + Same Memory → Same Pipeline. |
| **One Responsibility** | Every stage does exactly one job. |
| **Never Changes Evidence** | Book D's evidence is immutable; the orchestrator reads, routes, sequences — never edits. |
| **Human Gate First-Class** | Human approval is a normal stage (Review → Approved \| Revision), not an exception. |
| **Observable by Design** | Every run records Mission ID · Pipeline Version · Stages Executed · Duration · Evidence Used · Human Decisions · Final Outcome. |

> **Orchestration coordinates intelligence; it does not create intelligence.**

**The pipeline:** Mission → Planner → Memory → Generation → Scoring → Explanation → Human Review →
Revision → Approve.

## 2. The three tiers (the spine)

| Tier | Meaning |
|---|---|
| **✅ SHIPPED** | Runs in the live app today; cited to wired code. |
| **🔶 BUILT (UNWIRED)** | Code exists and is unit-tested, but no running path reaches it. |
| **❌ ROADMAP** | No implementation; pure specification. |

**The central truth:** AdOS has **two disconnected orchestrations** — a ✅ manual, route-driven,
human-gated mission workflow ([routes.ts:732](../apps/web/src/routes.ts#L732)) on a real Mission
state machine ([mission.ts:79](../domains/agency-os/src/mission/mission.ts#L79)); and a 🔶 governed
12-stage `AIManager` pipeline ([manager.ts:156](../packages/ai-manager/src/runtime/manager.ts#L156))
with a frozen `ExecutionTrace`, instantiated only in tests. The live app runs `LiveAIManager`/
`OfflineAIManager` ([ai-factory.ts:39](../apps/web/src/ai-factory.ts#L39)) which **bypass every
governed stage.** Book F is the design to unify them.

## 3. The four parts

| Part | Directory | Content docs | ~Lines | Focus |
|---|---|---|---|---|
| 1 · Orchestration Foundations | [`1-orchestration-foundations/`](1-orchestration-foundations/) | 3 | ~1,266 | Laws, model, pipeline |
| 2 · Pipeline Stages | [`2-pipeline-stages/`](2-pipeline-stages/) | 4 | ~1,553 | One responsibility per stage |
| 3 · Orchestration Control | [`3-orchestration-control/`](3-orchestration-control/) | 2 | ~784 | Sequencing, state, recovery |
| 4 · Orchestration Integrity | [`4-orchestration-integrity/`](4-orchestration-integrity/) | 2 | ~818 | Observability + the platform |

**11 content documents + 4 part-validations + 4 part-releases + 5 READMEs = 24 documents.** Each
part carries its own validation (all **PASS**) and release.

## 4. What is ✅ SHIPPED today (the honest baseline)

- **The manual orchestration** — the human-gated mission workflow (brief → approve → creative →
  approve → campaign → approve → report → executive → learn) on the Mission state machine.
- **Bounded self-repair** on both AI paths ([ai-live.ts:49](../apps/web/src/ai-live.ts#L49)) and
  partial idempotency ([routes.ts:1096](../apps/web/src/routes.ts#L1096)).
- **Thin provenance** ([creative-set.ts:53](../domains/creative-studio/src/creative/creative-set.ts#L53))
  and the **event bus + activity feed** ([app.ts:119](../apps/web/src/app.ts#L119)).
- **The composition root** ([app.ts:45](../apps/web/src/app.ts#L45)).

## 5. The 🔶 machinery Book F wires (already coded, dormant)

The governed 12-stage `AIManager` pipeline (safety → context → evidence → confidence → route →
inference/repair → safety → constitution → journal → learning → brain-enrich), its canonical
walking-skeleton sequence, the rich `ExecutionTrace`
([kernel.ts:204](../packages/ai-manager/src/runtime/kernel.ts#L204)), the orchestrator ports
([ports.ts](../packages/ai-manager/src/ports.ts)), and the pipeline event stream — all built,
tested, and unwired.

## 6. What is ❌ ROADMAP

The **Planner** ([engines.ts:18](../packages/cognitive-core/src/engines.ts#L18), contract only);
enforcing the **First Law** (single pipeline, no direct calls, no bypass); **non-destructive
Revision** (today reject → destructive terminal `fail()`); **full cross-stage idempotency**; and
the live **observable run record**.

## 7. Inviolable boundaries (held across all 4 parts)

- **100% local** — no cloud, no API keys, no per-token billing.
- **Copy only** · **no external data** · **no vendor telemetry** (own data only).
- **Human-sovereign** — the human gate is first-class; AdOS never auto-approves.
- **Not an autonomous agent** — deterministic orchestration, fixed stage order, no self-improvised
  paths.

## 8. Validation

All four part-validation reports record **PASS** across the six laws, three-tier discipline,
code-citation accuracy, the invariant sentence, boundary discipline, Book A–F separation
(references B–E, never duplicates), and documentation-only hygiene. Every cross-reference across
the 24 documents resolves; the forbidden legacy label "Advertising Operating System" appears
nowhere as a product name; PRODUCT_TRUTH.md was not modified.

## 9. What comes next

Book F is the blueprint; **building it is engineering work governed by `../PRODUCT_TRUTH.md` and
`../bizops/RELEASE_GOVERNANCE.md`.** The wiring throughline: make the governed pipeline the live
engine behind the mission workflow → add the deterministic Planner → make Revision non-destructive
→ surface the observable run record. With that, the First Law is met and A–F run as one managed
platform. **Book G (Analytics)** then consumes the run records — it shows, it does not decide —
and **Book H (Marketplace)** adds the ecosystem around the core.

---

## 10. Governance

[`1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md)
is binding on every Book F artifact; orchestration is itself governed by
[`../bizops/RELEASE_GOVERNANCE.md`](../bizops/RELEASE_GOVERNANCE.md). Any addition must tier-tag
each capability, trace ✅ claims to code, and re-run the relevant part validation before release.

**Status: ✅ Released — AI Orchestration Platform v1.0.0. The A–F core operating system is
specified.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
