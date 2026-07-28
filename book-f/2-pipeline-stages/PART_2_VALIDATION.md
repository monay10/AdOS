# Book F · Part 2 — Pipeline Stages — Validation

> **Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). Governing document:
> [`../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md`](../1-orchestration-foundations/AI_ORCHESTRATION_CONSTITUTION.md).
>
> **Laws:** *No component executes outside the orchestration pipeline · orchestration is
> deterministic · every stage has one responsibility · the orchestrator never changes evidence ·
> the human gate is a first-class stage, not an exception · observable by design.*

Validation of Part 2 — the pipeline stages. Result: **✅ PASS**.

---

## 1. Scope validated

| # | Document | Stages | Tier focus |
|---|---|---|---|
| F004 | [`MISSION_AND_PLANNING.md`](MISSION_AND_PLANNING.md) | Mission, Planner | ✅/❌ |
| F005 | [`MEMORY_AND_GENERATION.md`](MEMORY_AND_GENERATION.md) | Memory, Generation | 🔶/✅ |
| F006 | [`SCORING_AND_EXPLANATION.md`](SCORING_AND_EXPLANATION.md) | Scoring, Explanation | 🔶/❌ |
| F007 | [`REVIEW_REVISION_APPROVAL.md`](REVIEW_REVISION_APPROVAL.md) | Review, Revision, Approve | ✅/❌ |

## 2. Checks

| Check | Result | Notes |
|---|---|---|
| One responsibility per stage | ✅ PASS | Each stage doc keeps its job distinct (Mission holds work; Planner orders; Memory supplies; Generation drafts; Scoring evaluates; Explanation explains; Review/Revision/Approve are human). |
| Mission ✅ / Planner ❌ | ✅ PASS | State machine ✅ ([mission.ts:79](../../domains/agency-os/src/mission/mission.ts#L79)); Planner ❌ (cognitive-core contract [engines.ts:18](../../packages/cognitive-core/src/engines.ts#L18), unwired; `nextStep()` is a static hint). |
| Never Changes Evidence | ✅ PASS | Memory reads Book D evidence and passes it immutably; Scoring/Explanation read, never edit. |
| Generation grounded | ✅ PASS | Live single-shot ✅ ([ai-live.ts:34](../../apps/web/src/ai-live.ts#L34)); governed inference/repair 🔶 ([manager.ts:229](../../packages/ai-manager/src/runtime/manager.ts#L229)). |
| Scoring/Explanation reference E/C | ✅ PASS | References Books E/C rather than duplicating; safety/constitution stages 🔶 ([manager.ts:256](../../packages/ai-manager/src/runtime/manager.ts#L256)). |
| Human Gate first-class | ✅ PASS | F007 owns it: approve/requestApproval ✅ ([mission.ts:188](../../domains/agency-os/src/mission/mission.ts#L188)); honest that reject → destructive `fail()` ([mission.ts:209](../../domains/agency-os/src/mission/mission.ts#L209)) violates the law; Revision-as-branch is the ❌ design. |
| Determinism | ✅ PASS | Planner/pipeline framed as deterministic step-ordering, not an autonomous agent. |
| No new intelligence | ✅ PASS | Every stage invokes an existing engine; none is created here. |
| Invariant sentence | ✅ PASS | Present verbatim in all four docs. |
| Citation accuracy | ✅ PASS | All cited paths exist; all cross-book links resolve. |
| Documentation-only hygiene | ✅ PASS | Only `book-f/` files added. |
| Forbidden legacy label | ✅ PASS | Absent. |

## 3. Verdict

**✅ PASS.** Part 2 defines each pipeline stage with a single responsibility, keeps evidence
immutable, and is candid that the human gate — first-class on approval — still models rejection
as a destructive failure today, which the design fixes.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
