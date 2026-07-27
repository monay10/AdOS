# Brief Improvement — Making the NEXT Brief Better From What the Last Campaign Learned

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP** — closes **B-2**. Single-shot brief
> generation is ✅ **SHIPPED** (`domains/marketing-intelligence/src/brief/service.ts:43-96`),
> but **no learning-conditioned improvement of the brief exists**. A brief is generated
> **once**, from the mission alone, and is never revisited with what past campaigns
> taught. The retrieval components this design depends on already exist as
> 🔶 **BUILT (UNWIRED)** code; the generation-time wiring that would feed them into the
> next brief does **not** exist. This document specifies that wiring. The loop is
> **OPEN** today, and this document says so wherever it matters.

---

## 0. The one-paragraph truth

AdOS produces a Marketing Brief by submitting the mission's fields to the AI Manager
and returning the result — a **single `ai.submit(...)` call**, conditioned on the
mission and nothing else (`domains/marketing-intelligence/src/brief/service.ts:47-62`).
The service constructor receives a repository, an event bus, and the AI Manager port —
**no Company Brain port, no experience engine, no pattern library**
(`brief/service.ts:37-41`; `apps/web/src/app.ts` never passes one). So the very first
"thinking" step of every campaign starts **from a blank page**: it cannot see the
similar campaigns the agency has already run, the winning patterns it has already
proven, or the anti-patterns it has already paid to learn. The stores that hold those
learnings are written at mission completion (`apps/web/src/routes.ts:1146-1170`) but
are **write-only relative to generation**. This document specifies **Brief Improvement**:
retrieving accumulated learnings *before* the next brief is generated and conditioning
the brief prompt on them. It is the concrete closing of the **B-2** learning loop named
in [`../../book-a/BOOK_A_WALKTHROUGH.md`](../../book-a/BOOK_A_WALKTHROUGH.md).

---

## 1. Target design — the closed loop

### 1.1 The differentiator, made concrete

Competitors do **Prompt → LLM → Output**. Every brief they generate is amnesiac. AdOS
is designed so that **before** the model writes the next brief, the system first
*retrieves what worked* and conditions the brief on it. This is the single place where
the product promise —

> *"AdOS uses the agency's corporate memory to produce human-approved first drafts and
> improves each campaign by learning from the last."*

— stops being aspirational and becomes a mechanism. Brief Improvement is where **"each
campaign learns from the last"** is literally true, because the artifact that steers the
entire downstream pipeline (creative → campaign → report) is itself steered by prior
outcomes.

### 1.2 The retrieval-then-condition sequence

The target flow inserts a **retrieval phase** ahead of the existing generation call.
Nothing about the shipped generation call is discarded; a labelled context stack is
assembled first, then handed to the same AI Manager submission.

```
Mission fields ─┐
                ├─▶ Context Engine ──▶ conditioned brief prompt ──▶ ai.submit ──▶ Brief
Learnings ──────┘   (assemble, in order)
   ├─ experience-engine.findSimilar(vertical, context, k)   ← similar past campaigns
   ├─ pattern-library.bestFor(vertical)                      ← proven winning structures
   ├─ winners  (patterns/experiences with strong evidence)  ← do more of this
   └─ anti-patterns (below-break-even experiences)           ← avoid this
```

The assembly order and labelling are already defined by the Context Engine — see
[`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md) and
[`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md).
Brief Improvement is the **first consumer** of that stack: it is memory injection
applied specifically to the brief.

### 1.3 What each signal contributes to the next brief

| Signal | Source (existing code) | What it changes in the next brief |
|---|---|---|
| **Similar past campaigns** | `experience.findSimilar({vertical, context, k})` — `domains/company-brain/src/experience-engine.ts:22-34` | Grounds `positioning` and `keyMessages` in approaches that already returned above break-even in this vertical |
| **Best patterns** | `patterns.bestFor(domain)` — `domains/company-brain/src/pattern-library.ts:18-22` | Seeds `recommendedChannels` and channel structure with proven winning shapes |
| **Winners** | high-evidence `Pattern` / positive `Experience` (`rank()` — `pattern-library.ts:35-38`) | Biases `budgetAllocation` toward the channel mixes that produced ROAS |
| **Anti-patterns** | below-break-even `Experience` (`reason: 'Below break-even'` — `routes.ts:1152`) | Adds explicit "avoid" guidance so the model does not repeat a known loss |
| **Prompt/model suggestion** | `learning.suggest(promptKey)` — `packages/ai-manager/src/runtime/learning.ts:38-46` | Selects the prompt version / model that historically scored best for `marketing.brief` |

The brief's output schema is unchanged (`brief/service.ts:14-26`): the same seven
fields — `objective`, `targetAudience`, `positioning`, `keyMessages`,
`recommendedChannels`, `budgetAllocation`, `kpis` — are still produced. What changes is
that they are now **written with evidence in the prompt**, not from the mission alone.

### 1.4 Conditioning via the Context Engine (not a bespoke path)

Brief Improvement must **not** grow its own retrieval logic inside the brief service.
The `ExecutiveContextBuilder` already assembles exactly this stack in the mandated
order — Prompt → Mission → Company Brain → Executive Memory → Decision Memory →
Experience Engine — and emits one labelled system message per source
(`domains/executive-memory/src/context-builder.ts:37-86`). Brief Improvement's target
design is: build the context via that component, then submit. This keeps one assembly
path for the whole system and makes the brief's inputs **auditable** — the model sees a
clean `[PROVEN EXPERIENCE]` / `[MARKETING KNOWLEDGE]` stack, not an opaque blob
(`context-builder.ts:82,61`).

### 1.5 A worked example — the third restaurant campaign

Concrete illustration of what changes. The design is roadmap; the numbers are
illustrative of the mechanism, not measured results.

**Setup.** The agency has already run two campaigns in the `restaurant` vertical. Both
were recorded at completion (`routes.ts:1146-1162`):

| Prior run | `context` | `result.roas` | `reason` | Recorded as |
|---|---|---|---|---|
| Campaign #1 | `{channels:['instagram','tiktok']}` | `3.1` | Positive return | winning experience + pattern |
| Campaign #2 | `{channels:['google_search']}` | `0.7` | Below break-even | anti-pattern experience |

**Today (✅ single-shot).** A third restaurant client arrives. `generate(context)` fires
one `ai.submit` conditioned on the mission alone (`brief/service.ts:47-62`). The brief
has no way to know that `google_search` lost money last time or that
`instagram + tiktok` returned 3.1× — it may cheerfully recommend `google_search` again.
The agency re-pays to relearn its own lesson.

**Closed loop (❌ target).** Before submitting, the service retrieves:

- `experience.findSimilar({vertical:'restaurant', context:{...}, k:3})` → returns
  Campaign #1 first (Jaccard overlap on channels; `experience-engine.ts:22-34`).
- `patterns.bestFor('restaurant')` → returns the `instagram+tiktok` structure top-ranked
  (`rank()` weights its evidence by sample size; `pattern-library.ts:35-38`).
- Anti-pattern filter → surfaces Campaign #2 as `[AVOID]`.

The `marketing.brief` prompt now carries `[PROVEN EXPERIENCE]` and `[AVOID]` messages.
The resulting brief's `recommendedChannels` and `budgetAllocation` lean toward the proven
mix and away from the known loss — **without any human re-typing the lesson**. The brief
still enters the same `strategy_and_budget` gate; a human still approves it. What changed
is that the human is now approving a draft that already reflects the agency's own history.

---

## 2. Today — what the code actually does

**Tier legend:** ✅ SHIPPED · 🔶 BUILT (UNWIRED) · ❌ ROADMAP.

### 2.1 ✅ SHIPPED — single-shot brief generation

The brief is generated once, from the mission, with no read-back. This is real and it
works — it is simply **not** learning-conditioned.

| Fact | Evidence |
|---|---|
| Brief = one AI Manager submission | `brief/service.ts:47-62` |
| Conditioned on mission fields only (client, industry, brandVoice, product, missionBrief, budget) | `brief/service.ts:51-60` |
| Schema passed as prompt text (not enforced) | `brief/service.ts:61`, `responseSchema` |
| Output validated structurally, then persisted | `brief/service.ts:72-88` |
| Provenance recorded (`taskId, capability, model, engine, latencyMs`) | `brief/service.ts:78-84` |
| **No** Company Brain / experience / pattern port in the constructor | `brief/service.ts:37-41` |

The constructor is the proof that the loop is open:

```ts
constructor(
  private readonly repo: MarketingBriefRepository,
  private readonly bus: EventBus,
  private readonly ai: AIManagerPort,   // ← nothing that can read prior learnings
) {}
```

### 2.2 ✅ SHIPPED — the learnings are being *recorded*

At mission completion the app writes experiences, patterns, and knowledge-graph facts.
The raw material for Brief Improvement **already accumulates**:

| Written at completion | Evidence |
|---|---|
| `experience.record({vertical, context, result:{roas,ctr,roi}, reason, learned})` | `routes.ts:1146-1156` |
| `patterns.capture({domain, name, structure, evidence:{sampleSize,metric,value}})` | `routes.ts:1157-1162` |
| Knowledge-graph nodes/relations (mission → campaign → report) | `routes.ts:1163-1170` |
| Below-break-even runs labelled as anti-patterns | `routes.ts:1152` (`reason: 'Below break-even'`) |

### 2.3 🔶 BUILT (UNWIRED) — the retrieval readers already exist

The retrieval side of the loop is **coded and unit-tested**, but no live app path calls
it at brief time:

| Component | State | Evidence |
|---|---|---|
| `findSimilar` (vertical filter + Jaccard rank, deterministic) | 🔶 exists, not read into generation | `experience-engine.ts:22-34` |
| `bestFor` (evidence × sample-size, reuse-nudged rank) | 🔶 exists, not read into generation | `pattern-library.ts:18-22,35-38` |
| `ExecutiveContextBuilder` (assembles the ordered, labelled stack) | 🔶 exists, unwired | `context-builder.ts:37-86` |
| `InMemoryLearningEngine.suggest` (best prompt/model for a key) | 🔶 exists, unwired | `learning.ts:38-46` |

> **The gap in one line:** the *writers* run (2.2) and the *readers* exist (2.3), but
> **nothing joins them at brief-generation time**. The brief service takes no brain
> port (2.1), so the readers are never invoked before a brief is written.

### 2.4 ❌ ROADMAP — brief improvement / re-analysis

There is **no** analyzer of the brief, **no** re-generation path, and **no**
learning-conditioned improvement. A brief is generated once and never revisited. This
matches the concept ledger: *Brief Improvement — no re-analysis path*; *Brief Analysis —
brief is generated once; no analyzer*. Neither exists in code today.

---

## 3. To build — closing the loop

This section is a design specification. Everything here is ❌ **ROADMAP** (the wiring)
built on top of 🔶 components that already exist. No present-tense product claim is made.

### 3.1 Give the brief service a read port

The minimal, non-breaking change: pass a **read-only** brain/context port into the brief
service alongside the existing three dependencies. The generation call stays; a
retrieval step is inserted before it.

```
MarketingBriefService(repo, bus, ai, context)     // context = read-only retrieval port
  generate(context):
    learnings = context.retrieve({ vertical, brandId, missionId, k })   // 🔶 exists
    messages  = conditionBriefPrompt(missionVars, learnings)            // ❌ to build
    result    = ai.submit({ ...briefTask, messages })                   // ✅ unchanged
```

`context.retrieve` is the `ExecutiveContextBuilder.build(...)` call
(`context-builder.ts:37-86`); `conditionBriefPrompt` is the only genuinely new code —
it appends the labelled learning messages to the `marketing.brief` prompt. Because the
builder already orders and labels sources, the "new" surface is small.

### 3.2 The four learning inputs to retrieve

| Input | Call | Ledger tier |
|---|---|---|
| Similar past campaigns | `brain.experience.findSimilar({vertical, context, k:3})` | 🔶 BUILT (UNWIRED) |
| Best proven patterns | `brain.patterns.bestFor(vertical)` | 🔶 BUILT (UNWIRED) |
| Winners (do-more) | top-ranked patterns/experiences by `rank()` | 🔶 (selection = ❌ thin glue) |
| Anti-patterns (avoid) | experiences with `reason:'Below break-even'` | 🔶 (filter = ❌ thin glue) |

Winners and anti-patterns are not new stores — they are **views** over experiences and
patterns already recorded (2.2), selected by evidence. The rank function that orders
them already exists (`pattern-library.ts:35-38`). See sibling
[`./PATTERN_DETECTION.md`](./PATTERN_DETECTION.md) for how patterns are captured and
ranked, and [`./BEST_PRACTICES.md`](./BEST_PRACTICES.md) for how proven best-practice
signals are distilled from the pattern library for reuse.

### 3.3 Prompt conditioning contract

The conditioned brief prompt must keep the mission variables authoritative and treat
learnings as **evidence, not overrides**. The brand's own voice, rules, and banned words
still win — see [`../1-ai-foundations/BRAND_INJECTION.md`](../1-ai-foundations/BRAND_INJECTION.md).
Suggested message stack (all `role:'system'`, labelled, per `context-builder.ts:89-91`):

| Order | Label | Body |
|---|---|---|
| 1 | `[PROMPT]` | The versioned `marketing.brief` instruction |
| 2 | `[MISSION]` | The client objective in natural language |
| 3 | `[MARKETING KNOWLEDGE]` | `bestHook`, `bestHeadline`, ROAS over N campaigns for the vertical |
| 4 | `[PROVEN EXPERIENCE]` | Top-k `findSimilar` learnings — "do more of this" |
| 5 | `[AVOID]` | Below-break-even anti-patterns — "do not repeat this" |

Item 5 is the one label not yet emitted by the builder; adding it is part of this build.

### 3.4 Selecting the best prompt/model for the brief

When the Learning Engine is wired, `learning.suggest('marketing.brief')` returns the
prompt version and model that scored best on prior briefs (`learning.ts:38-46`), fed by
the EMA reward it accumulates from outcomes (`learning.ts:18-36`, `ema` at
`learning.ts:49-51`). Brief Improvement should consult it to pick the `promptRef.version`
before submitting (`brief/service.ts:50`). This makes the **prompt itself** improve
campaign-over-campaign, not just its inputs. See the sibling scoring/learning docs in
this part and the Prompt Registry design in
[`../1-ai-foundations/PROMPT_ORCHESTRATOR.md`](../1-ai-foundations/PROMPT_ORCHESTRATOR.md).

### 3.5 Guardrails the closed loop must respect

| Guardrail | Why | Reference |
|---|---|---|
| Retrieval is **read-only** at brief time | Generation must never mutate learnings; recording stays at completion | `routes.ts:1146-1170` |
| Empty memory ⇒ identical to today | First-ever campaign in a vertical has no experiences (`findSimilar` returns `[]`) — the brief must degrade to the shipped single-shot path | `experience-engine.ts:28-33` |
| Learnings are evidence, brand rules are law | The model may not adopt a past pattern that violates brand voice/banned words | [`../1-ai-foundations/BRAND_INJECTION.md`](../1-ai-foundations/BRAND_INJECTION.md) |
| Determinism preserved | `findSimilar`/`bestFor` are deterministic; conditioning must not introduce nondeterminism beyond the model itself | `experience-engine.ts:41-47` |
| Human approval unchanged | The improved brief still enters the same `strategy_and_budget` gate | `../../book-a/BOOK_A_WALKTHROUGH.md` |
| Tenant scope must be added | The Company Brain is currently unscoped (global maps) — brief-time retrieval must filter by tenant | `PRODUCT_TRUTH.md` §2.6 |

The last row matters: `PRODUCT_TRUTH.md` records that the Company Brain has **no tenant
scoping** today. Closing the loop for a multi-tenant deployment requires tenant-scoped
retrieval, or one tenant's learnings could condition another's brief. This is a
prerequisite of the build, not an afterthought.

### 3.6 Build checklist

| # | Step | New vs existing |
|---|---|---|
| 1 | Add read-only context port to `MarketingBriefService` constructor | ❌ new (small) |
| 2 | Call `ExecutiveContextBuilder.build(...)` before `ai.submit` | 🔶 exists — wire it |
| 3 | Add `[AVOID]` anti-pattern message from below-break-even experiences | ❌ new (small) |
| 4 | Consult `learning.suggest('marketing.brief')` for prompt/model | 🔶 exists — wire it |
| 5 | Tenant-scope brain retrieval | ❌ new |
| 6 | Fall back to single-shot when memory is empty | ❌ new (guard) |
| 7 | Extend `mission-processing` tests to assert learning conditioning | ❌ new (test) |

Most of the work is **wiring and small glue**, because the expensive pieces —
similarity retrieval, pattern ranking, ordered context assembly, reward learning —
already exist as 🔶 code. That is the honest strength of this design: the flagship
differentiator is closer than it looks, but it is **not shipped**.

### 3.7 Why the brief is the right place to close B-2 first

B-2 could in principle be closed at any generation stage — brief, creative, or campaign.
Brief Improvement argues it should be closed at the **brief** first, for three reasons:

1. **Leverage.** The brief is upstream of everything. Its `positioning`,
   `recommendedChannels`, and `budgetAllocation` are read by the creative and campaign
   services downstream. Conditioning the brief propagates one retrieval into every later
   artifact — a single wiring with system-wide reach.
2. **Lowest blast radius.** The brief schema is stable and small (seven fields,
   `brief/service.ts:14-26`) and the change is additive: on empty memory the conditioned
   path is byte-identical to the shipped path (3.5). That makes it the safest stage to
   wire first and validate.
3. **Cleanest evidence fit.** The learnings that accumulate today — channel mixes and
   ROAS by vertical (`routes.ts:1146-1162`) — map directly onto brief fields
   (channels → `recommendedChannels`, ROAS → `budgetAllocation`). No new store is needed;
   the recorded data already answers the brief's questions.

### 3.8 Relationship to the other learning-engine documents

| Sibling doc | Its role | How Brief Improvement depends on it |
|---|---|---|
| [`./PATTERN_DETECTION.md`](./PATTERN_DETECTION.md) | How winning structures are captured and ranked | Supplies the `bestFor` winners injected at step 4 of §1.3 |
| [`./BEST_PRACTICES.md`](./BEST_PRACTICES.md) | How proven best-practice signals are distilled for reuse | Supplies the distilled "do-more" guidance in `[PROVEN EXPERIENCE]` |
| [`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md) | The ordered, labelled context stack | Provides the assembly path Brief Improvement consumes (§1.4) |
| [`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md) | Feeding memory back into generation, generally | Brief Improvement is its first concrete consumer |

Brief Improvement is deliberately **thin**: it is memory injection (foundations) applied
to the brief, using patterns and best practices (siblings) as its evidence. It invents no
new retrieval or ranking of its own — that is what keeps the build small and honest.

---

## 4. Status ledger (this document)

| Concept | Tier | Evidence |
|---|---|---|
| Single-shot brief generation | ✅ SHIPPED | `brief/service.ts:43-96` |
| Mission injection into the brief | ✅ SHIPPED | `brief/service.ts:47-62` |
| Provenance on the brief | ✅ SHIPPED | `brief/service.ts:78-84` |
| Learnings recorded at completion | ✅ SHIPPED (write-only) | `routes.ts:1146-1170` |
| `findSimilar` retrieval | 🔶 BUILT (UNWIRED) | `experience-engine.ts:22-34` |
| `bestFor` pattern ranking | 🔶 BUILT (UNWIRED) | `pattern-library.ts:18-22` |
| Ordered context assembly | 🔶 BUILT (UNWIRED) | `context-builder.ts:37-86` |
| Prompt/model suggestion | 🔶 BUILT (UNWIRED) | `learning.ts:38-46` |
| **Learning-conditioned brief improvement** | ❌ ROADMAP | no code; brief generated once |
| Brief re-analysis / re-generation | ❌ ROADMAP | no analyzer, no re-gen path |
| Anti-pattern `[AVOID]` injection | ❌ ROADMAP | label not emitted today |

---

## 5. Value contribution

**Revenue ↑ — this is where "each campaign learns from the last" becomes real.**

The brief is the artifact that steers the entire downstream pipeline: creative, campaign
draft, budget split, and report all inherit its `positioning`, `recommendedChannels`,
and `budgetAllocation`. Improving the brief with prior winners and anti-patterns is
therefore the **highest-leverage** point at which learning can compound — a better brief
lifts every stage that follows it. Today that leverage is **unused**: every campaign's
first thinking step starts amnesiac (2.1), so the agency re-pays to discover what it
already knows. Closing the loop turns accumulated ROAS evidence into a **compounding
win-rate** — briefs bias budget toward proven channel mixes and away from below-break-even
ones, campaign over campaign. It also **reduces production time**: a brief grounded in
similar past campaigns needs fewer human revision cycles at the `strategy_and_budget`
gate, because it starts closer to what the agency already knows works. This is the
flagship differentiator (B-2) made concrete — and, truthfully, it is **not built yet**.

| Value lever | Mechanism | Direction |
|---|---|---|
| Compounding win-rate | Budget biased toward proven mixes, away from below-break-even ones, campaign over campaign | Revenue ↑ |
| Fewer revision cycles | Brief starts grounded in similar past campaigns, closer to approvable on first pass | Production time ↓ |
| No re-paying to relearn | Anti-patterns are surfaced as `[AVOID]`, so known losses are not repeated | Revenue ↑ |
| System-wide reach | One brief-time wiring propagates into creative, campaign, and report downstream | Revenue ↑ |

The honest caveat that governs every row: these levers are **latent**. The recording
side runs today and the retrieval side exists unwired, but the join that would realize
this value is roadmap. The value is real in design, unbanked in production.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
