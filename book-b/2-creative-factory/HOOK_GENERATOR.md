# Hook Generator

**Owner:** Office of the Chief AI Architect
**Source of truth:** ../../PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Status:** Official

> **Implementation status:** ⚠️ **PARTIAL / ❌ ROADMAP** — there is **no dedicated
> hook generator today**. A hook is not a separate output: hooks emerge *implicitly*
> inside the single `creative.set` shot that emits all six copy fields at once
> (`domains/creative-studio/src/creative/service.ts:38-89`). `bestHook` exists only
> as a **stored** Company Brain merge field
> (`domains/company-brain/src/in-memory-company-brain.ts:111`), never **generated**
> by a hook engine. A standalone hook stage producing multiple distinct, testable
> angles is **❌ ROADMAP** design.

Governing reference: ../1-ai-foundations/AI_CONSTITUTION.md
Sibling docs (this part): HEADLINE_GENERATOR.md · COPY_GENERATOR.md
Book A cross-reference: ../../book-a/CREATIVE_WORKFLOW.md (Concept / Headline stages)

---

## 0. What a "hook" is (and is not, in AdOS)

A **hook** is the attention-grabbing angle at the very front of an ad — the promise,
tension, or pattern-interrupt that earns the first second of attention and, with it,
the click. It is upstream of the headline: one strong angle ("the objection nobody
names") can be expressed as many headlines; a weak angle cannot be rescued by
polish downstream.

Two scope boundaries, both binding:

- **Copy only.** AdOS Creative Studio *"produces copy ONLY; it never touches
  campaigns or ad platforms"* (`domains/creative-studio/src/creative/creative-set.ts`
  header; PRODUCT_TRUTH.md §2.4). This doc specifies **text hooks / angles**. Image,
  thumbnail, and video hooks are **out of scope** — no vision or image engine exists
  (PRODUCT_TRUTH.md §4; ../1-ai-foundations/AI_CONSTITUTION.md), and nothing here
  implies one.
- **A hook is not yet a distinct artifact.** Today the pipeline emits one
  `CreativeSet` with six fields (`headline`, `adCopy`, `cta`, `socialPost`,
  `landingPage`, `email` — `creative-set.ts:43-50`). No field is named `hook`; no
  service produces an angle set. The hook, when it exists at all, is *baked into*
  `headline` / `adCopy` as a side effect of one generation call.

| Term | Meaning in AdOS | Where it lives today |
|---|---|---|
| `hook` / `angle` | Attention-grabbing front-of-ad promise or tension | ❌ no field, no engine — implicit in the single shot |
| `headline` | One headline string | ✅ `content.headline` (`creative-set.ts:43`) |
| `bestHook` | A **stored** qualitative winner on a `MarketingInsight` | ⚠️ `in-memory-company-brain.ts:111` (recorded, not generated) |

---

## 1. Target design — a hook stage that produces multiple distinct angles

The target architecture inserts a **Hook Stage** between the approved brief and the
copy stages, so the pipeline tests *angles* before committing production effort to
*copy*. This mirrors the Book B differentiator — decomposing the single
`Prompt → LLM → Output` shot into a small agent pipeline
(../1-ai-foundations/AI_CONSTITUTION.md) — applied to the front of the ad.

### 1.1 Position in the creative pipeline (target)

```
 Marketing Brief (approved)
        │
        ▼
 ┌──────────────┐   N distinct angles, each labeled + rationale
 │ Hook Stage   │──────────────────────────────┐
 │ (angles)     │                               │
 └──────────────┘                               ▼
        │                              Part 4 SCORING selects winner(s)
        ▼                                       │
 HEADLINE_GENERATOR (per winning hook) ◄────────┘
        │
        ▼
 COPY_GENERATOR ─► CreativeSet ─► Human approval gate
```

The Hook Stage does **not** replace `creative.set`; it feeds it. The winning
angle(s) become framing inputs to `HEADLINE_GENERATOR.md` and `COPY_GENERATOR.md`,
which remain the owners of `headline` and `adCopy`.

### 1.2 Target output — an angle set, not one string

The target artifact is an **angle set**: a small list of *distinct* hooks, each
carrying enough metadata for Part 4 scoring and for a human to choose between them.

| Field | Type | Purpose |
|---|---|---|
| `angle` | `string` | The hook itself (one sentence / opening line) |
| `mechanism` | `enum` | Angle family: `problem` · `curiosity` · `proof` · `contrast` · `urgency` · `identity` |
| `rationale` | `string` | Why this angle fits the brief's audience + objective |
| `provenance` | `object` | `{taskId, capability, model, engine, latencyMs}` — same shape every AdOS artifact carries |

**Distinctness is the point.** N near-duplicates are worthless; the value is N
*different* mechanisms so the winner-selection step in Part 4 has real variance to
sort. Enforcing that distinctness is a design requirement (see §3.4), not a claim of
current behavior.

### 1.3 The six angle mechanisms (target vocabulary)

The Hook Stage's value is *spread*: it must reach for structurally different ways to
open, not six phrasings of one idea. The target `mechanism` enum names the families a
distinct angle set should span. This is a design vocabulary — none of it is labeled
or produced by code today.

| `mechanism` | What it leads with | Illustrative opening frame |
|---|---|---|
| `problem` | The pain the audience already feels | *"You're paying for clicks that never convert."* |
| `curiosity` | An open loop the reader must close | *"The one line most ads bury — and shouldn't."* |
| `proof` | Concrete result / number / evidence | *"3x the click-through on the same budget."* |
| `contrast` | Us-vs-the-usual, before/after | *"Not another dashboard. An agency that runs itself."* |
| `urgency` | A reason the moment matters now | *"Every week unoptimized is spend you won't get back."* |
| `identity` | Who the reader is / wants to be | *"For operators who refuse to babysit campaigns."* |

The illustrative frames above are documentation examples, **not** generated output.
A distinct angle set (§1.2) draws from *different* rows so Part 4 scoring has real
variance to rank.

### 1.4 Contract sketch (target, not implemented)

```ts
// ❌ ROADMAP — illustrative target shape; no such port exists today.
interface HookStagePort {
  generate(ctx: CreativeContext, opts: { count: number }): Promise<HookAngleSet>;
}
type HookMechanism =
  | 'problem' | 'curiosity' | 'proof' | 'contrast' | 'urgency' | 'identity';
interface HookAngle { angle: string; mechanism: HookMechanism; rationale: string; }
interface HookAngleSet { angles: HookAngle[]; provenance: Provenance; }
```

This shape deliberately reuses the existing `CreativeContext`
(`creative-set.ts` — `productName`, `brandVoice`, `objective`, `targetAudience`,
`positioning`, `keyMessages`) so the Hook Stage needs no new upstream data. Reusing
the shipped context object keeps the build additive: the stage slots in front of
`creative.set` without changing what the brief must supply.

### 1.5 Where the Hook Stage sits among its siblings

The Hook Stage is the first of the three per-asset copy generators this part
specifies. It owns *angle*; its siblings own the text that expresses the winning
angle.

| Stage | Owns | Doc | Tier today |
|---|---|---|---|
| Hook | The attention angle (N candidates) | this doc | ⚠️/❌ |
| Headline | The headline string per winning angle | HEADLINE_GENERATOR.md | ⚠️/❌ |
| Copy | Body `adCopy` (and the other four fields) | COPY_GENERATOR.md | ⚠️/❌ |

All three are decompositions of the same single `creative.set` shot
(`creative/service.ts:38-89`) that ships today; none is a live standalone engine.

---

## 2. Today — hooks are implicit in the single creative shot (⚠️)

Everything in this section is **live behavior**, tier-tagged, with cites. Nothing
here is a dedicated hook generator, because none exists.

### 2.1 One shot emits all six fields; the hook is a side effect

`CreativeStudioService.generate()` makes **one** `ai.submit(...)` call with
`promptRef { key: 'creative.set', version: 1 }` and returns a single `CreativeSet`
(`domains/creative-studio/src/creative/service.ts:38-89`). The enforced-shape schema
requires exactly `headline, adCopy, cta, socialPost, landingPage, email`
(`service.ts:10-21`) — **no `hook` / `angle` field is requested or returned**.

Whatever "hook" an ad has today is whatever the model happened to lead the
`headline` or `adCopy` with in that one pass. There is:

- **no angle enumeration** — one output, not N;
- **no mechanism labeling** — the model is not asked to vary or name angle families;
- **no distinctness guarantee** — nothing compares candidate angles because there is
  only ever one.

| Property | Target (§1) | Today |
|---|---|---|
| Distinct angles produced | N (≥3) | 1 (implicit) |
| Angle labeled by `mechanism` | ✅ | ❌ |
| Selectable by scoring | ✅ (feeds Part 4) | ❌ |
| Separate artifact / port | `HookStagePort` | ❌ — folded into `creative.set` |
| Tier | ❌ ROADMAP | ⚠️ implicit-only |

### 2.2 `bestHook` is a stored field, not a generated one (⚠️)

The only place the word "hook" appears as a first-class datum is the Company Brain's
`MarketingInsight`, whose merge keeps *"the better-performing qualitative winners
from the larger sample"*:

```ts
// domains/company-brain/src/in-memory-company-brain.ts:110-112
bestHook:     next.sampleSize >= prev.sampleSize ? next.bestHook     : prev.bestHook,
bestHeadline: next.sampleSize >= prev.sampleSize ? next.bestHeadline : prev.bestHeadline,
```

This is **recording, not generation**. `bestHook` is a value written *into* memory at
mission completion and merged by sample weight; no engine reads it back to *produce*
a new hook, and no code derives it from generated candidates. Per the concept ledger,
`bestHook` / `bestHeadline` are **stored merge fields only** — there is no winner
*detector* behind them (see Part 4). Treating `bestHook` as evidence of a hook
generator would be false.

### 2.3 Worked trace — where a hook "happens" today

To make the implicit-only status concrete, here is the actual path a hook travels in
the shipped product. Nothing in this trace is a hook engine; it is the ordinary
single-shot creative flow.

| # | What happens | Code |
|---|---|---|
| 1 | Approved brief becomes a `CreativeContext` (objective, positioning, key messages) | `creative-set.ts` (`CreativeContext`) |
| 2 | Human "Concept" framing tunes those variables (editorial, no AI) | ../../book-a/CREATIVE_WORKFLOW.md §Stage 2 |
| 3 | **One** `ai.submit({ promptRef: 'creative.set' })` call runs | `creative/service.ts:42-55` |
| 4 | Model returns six fields; a hook, if any, is baked into `headline`/`adCopy` | `service.ts:10-21` schema |
| 5 | Set is validated for the six fields — **not** for any angle | `service.ts:102-123` |
| 6 | Set is saved + published; goes to the human approval gate | `service.ts:80-88` |

At no step is an angle enumerated, labeled, scored, or chosen. The "hook" is an
emergent property of step 4, invisible to the system as a distinct thing.

### 2.4 What "Concept / Headline" mean in Book A (no contradiction)

../../book-a/CREATIVE_WORKFLOW.md names a **Concept** stage and a **Headline** stage.
Book A is explicit that `Concept` is an *"editorial framing of the `CreativeContext`
before the model"* and that several stage names are *"editorial phases of producing
that one copy set, not separate engines"* (CREATIVE_WORKFLOW.md §0). The Concept
stage is the closest thing to a hook in the shipped product — and it is a human
framing step feeding the single generation, **not** an AI hook generator. This doc
does not upgrade that claim.

---

## 3. To build — decompose the single shot into a hook stage

The build is the same move the AI Constitution specifies pipeline-wide: split one
opaque generation into a named, inspectable stage. Nothing below exists today; all of
it is **❌ ROADMAP** unless it reuses a **🔶 BUILT (UNWIRED)** component named as such.

### 3.1 Step 1 — add a `hook.angles` prompt + service

Introduce a `HookStageService` that submits a *distinct* task
(`promptRef { key: 'hook.angles' }`) taking the existing `CreativeContext` and an
angle `count`, returning the `HookAngleSet` of §1.2. This is a new service parallel
to `CreativeStudioService`, not an edit to `creative.set`. Effort: **❌ ROADMAP**.

### 3.2 Step 2 — request N labeled, distinct angles

The prompt instructs the model to emit N angles spanning different `mechanism`
values, each with a one-line `rationale`. The **schema-injection-as-prompt-text**
mechanism already shipped in the live path (`apps/web/src/ai-live.ts:142-144`) can
carry the angle-set shape into the prompt; note that injection is **descriptive, not
enforced** on the live path today. Enforced shape validation for the angle set is
the **🔶 BUILT (UNWIRED)** `SchemaValidationEngine`
(`packages/ai-manager/src/runtime/validation-engine.ts:62-118`) — it exists in the
codebase and is unit-tested, but no running app path instantiates it; wiring it to
guard the angle set is Book B build work.

### 3.3 Step 3 — feed the winner to headline/copy (ties to Part 4 Scoring)

The Hook Stage produces candidates; it does **not** pick the winner. Selection is
owned by **Part 4 Scoring / winner selection**, which is **❌ ROADMAP** today (no
detector, no scoring code — the concept ledger records `bestHook`/`bestHeadline` as
stored fields, not detector output). The target flow:

1. Hook Stage emits N labeled angles.
2. Part 4 scoring ranks them (and, once the learning loop closes, weights them by
   recorded `bestHook` performance — see below).
3. The winning angle becomes a framing variable into `HEADLINE_GENERATOR.md`, then
   `COPY_GENERATOR.md`.

### 3.4 Step 4 — close the loop so hooks learn (design goal, not shipped)

The headline promise of Book B is that the agency's memory *improves each campaign
by learning from the last* — but today the memory is **recorded, not read back into
generation**. `bestHook` is written at completion (§2.2) and **no generator consumes
it**: the creative service takes no Company Brain port (`creative/service.ts:38-55`
accepts only `repo`, `bus`, `ai`). Closing this loop for hooks means having the Hook
Stage read prior `bestHook` insights as priors when proposing new angles. The
generation-time wiring does **not** exist; this is a labeled design goal, consistent
with Book A walkthrough gap **B-2 (learning read-back)**. Do not read this as shipped.

### 3.5 Illustrative target output (documentation example only)

For one brief — *offline-first AI advertising OS, audience = agency operators,
objective = trials* — a target angle set of `count: 4` might look like the following.
This is a **hand-written illustration of the target shape**, not code output; no
`hook.angles` task exists to produce it.

| `mechanism` | `angle` | `rationale` |
|---|---|---|
| `problem` | *"Your best campaigns die the moment you stop babysitting them."* | Names the operator's daily pain from the brief's audience |
| `contrast` | *"Not another dashboard — an agency OS that runs the campaign."* | Separates from the category the audience already rejects |
| `proof` | *"Same budget, local-only AI, first drafts in one pass."* | Grounds in a shipped, truthful capability (offline single-shot) |
| `identity` | *"For operators who'd rather approve than assemble."* | Speaks to the self-image implied by the objective |

Four *different* mechanisms, one shared brief — exactly the variance Part 4 scoring
needs and exactly what the single shot cannot produce today.

### 3.6 Build sequencing & risks

| Order | Build item | Depends on | Risk if skipped |
|---|---|---|---|
| 1 | `HookStageService` + `hook.angles` prompt | shipped `ai.submit` path | none — additive front stage |
| 2 | Distinctness enforcement across angles | step 1 | N near-duplicates → scoring has nothing to rank |
| 3 | Schema-enforced angle-set shape (wire `validation-engine.ts`) | step 1 | malformed sets reach the copy stages |
| 4 | Winner selection (Part 4) | steps 1-3 | angles produced but never chosen |
| 5 | `bestHook` read-back as prior | Part 3 memory loop | hooks never learn; gap B-2 stays open |

The dependency chain is why the hook stage is **first** in this part: headline and
copy quality are capped by the angle they express, so decomposing the hook unblocks
the most downstream value per unit of build effort.

### 3.7 Build ledger

| Build item | Tier | Note / evidence |
|---|---|---|
| `HookStageService` + `hook.angles` prompt | ❌ ROADMAP | no service exists; parallel to `creative/service.ts` |
| N distinct labeled angles (`mechanism`) | ❌ ROADMAP | today one implicit hook only |
| Schema-enforced angle-set shape | 🔶 BUILT (UNWIRED) | `validation-engine.ts:62-118` — exists unwired; wiring is Book B work |
| Winner selection over angles | ❌ ROADMAP (Part 4) | no detector; `bestHook` is a stored field only (`in-memory-company-brain.ts:111`) |
| Read `bestHook` back as a prior | ❌ ROADMAP | generator takes no brain port (`creative/service.ts:38-55`); Book A gap B-2 |
| Image / video / thumbnail hooks | ❌ ROADMAP | out of scope — no vision engine (PRODUCT_TRUTH.md §4) |

---

## 4. Boundaries restated (so nothing is over-claimed)

- **No dedicated hook generator ships today.** The single `creative.set` shot emits
  six copy fields in one call (`creative/service.ts:38-89`); a hook is not a separate
  output.
- **`bestHook` is stored, never generated** (`in-memory-company-brain.ts:111`), and
  nothing reads it back into generation.
- **Copy only** — image / video hooks are out of scope (PRODUCT_TRUTH.md §2.4, §4).
- **Winner selection is ❌ ROADMAP** and lives in Part 4, not here.

---

## 5. Value contribution

- **Revenue ↑** — the hook is the highest-leverage word in an ad. Testing several
  *distinct* angles instead of shipping the one the model happened to lead with lets
  the strongest angle win, lifting **CTR** (one of the six shipped KPIs) and, through
  it, downstream conversions on the same media spend.
- **Production-time ↓** — an instant slate of labeled angles replaces the manual
  brainstorm that a human strategist would otherwise run before writing a single
  headline, and gives the copy stages a pre-chosen direction so fewer regeneration
  cycles are needed.

Both effects are **design intent** of the ROADMAP hook stage, not current behavior:
today the agency gets exactly one implicit hook per creative shot.

---

## 6. Cross-references

| Topic | Document |
|---|---|
| The single creative shot this stage decomposes | ../../book-a/CREATIVE_WORKFLOW.md |
| Governing AI principles / two-stack reality | ../1-ai-foundations/AI_CONSTITUTION.md |
| Sibling: headline string per winning angle | HEADLINE_GENERATOR.md |
| Sibling: body copy for the winning angle | COPY_GENERATOR.md |
| Winner selection over angles (scoring) | Part 4 — Optimization |
| Learning read-back (`bestHook` as prior) | Part 3 — Learning Engine |
| Full capability truth (what ships vs roadmap) | ../../PRODUCT_TRUTH.md |

**One-line summary:** today a hook is an invisible side effect of the single
`creative.set` shot and `bestHook` is only a stored merge field; the Hook Generator
is the ROADMAP stage that turns "one implicit hook" into "several distinct, labeled,
scoreable angles" — lifting CTR and cutting production time once built.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
