# Memory Injection — Feeding the Company Brain & Executive Memory Back Into Generation

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`AI_CONSTITUTION.md`](./AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ✅ **SHIPPED (Series 2 · 2026-07-28) — first read-back
> closed; the Company Brain is no longer write-only.** On mission completion the
> per-vertical `MarketingInsight` is written and sample-weighted-merged
> (`apps/web/src/routes.ts:1215`, `in-memory-company-brain.ts:100`); a **new** campaign's
> brief generation now **reads that aggregate back** (`routes.ts:946`, `brain.marketing(vertical)`)
> and injects a deterministic summary — "across N past campaigns in {vertical}, average
> ROAS was Xx at Y% CTR" — into the brief prompt context
> (`marketing-intelligence/.../brief/service.ts:60`), proven end-to-end by
> `apps/web/src/performance-memory.test.ts`. This is **descriptive context only**: it
> reads history and builds context; it does **not** learn, rank, recommend, or optimize.
>
> **Still 🔶/❌ (the deferred remainder of B-2):** reading back Executive Memory, the
> Pattern Library, and the Experience Engine; similarity/semantic retrieval; freshness
> decay; multi-dimensional aggregation; and any recommendation/ranking. Those remain
> specification below — a first read-back is closed, not the whole loop.

---

## 0. The one-paragraph truth

AdOS records everything it learns from each finished campaign into three in-memory
stores — the **Decision Journal**, **Executive Memory**, and the **Company Brain**
(experience engine, pattern library, knowledge graph). That write path runs today
(`apps/web/src/routes.ts:1118-1177`). But **not one generator reads any of it back**.
The marketing-brief and creative services are constructed with only a repository, an
event bus, and the AI Manager — no Company Brain port is passed to them
(`apps/web/src/app.ts:84-88`; constructors at `brief/service.ts:38-41`,
`creative/service.ts:32-36`). So the promise *"AdOS improves each campaign by learning
from the last"* is **not closed today**: the brain and memory are **write-only relative
to generation**. This doc specifies the missing wiring. Until it lands, memory injection
is roadmap, and this document says so in present tense everywhere it matters.

---

## 1. Target design — how memory injection SHOULD work

### 1.1 The loop we are closing

Competitors do **Prompt → LLM → Output**. AdOS is designed so that, *before* the model
ever writes a word, the generation prompt is enriched with what the agency already
proved works for this brand and this vertical. That is the difference between a tool
that starts from zero every time and an operating system whose output compounds.

```
Mission objective
      │
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CONTEXT ASSEMBLY  (the read-back this doc specifies)                 │
│                                                                       │
│   brain.dna(brandId) ─────────────┐                                  │
│   brain.brand(brandId) ───────────┤                                  │
│   brain.marketing(vertical) ──────┤──►  labelled system messages ──┐ │
│   brain.experience.findSimilar()──┤                                │ │
│   brain.patterns.bestFor(vertical)┘                                │ │
│   execMemory.recall({role,k}) ─────────────────────────────────────┤ │
│   journal.recall({sessionId,k}) ───────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┼─┘
                                                                       ▼
                                                          brief / creative prompt
                                                                       │
                                                                       ▼
                                                            ai.submit(...) → draft
                                                                       │
                                                                       ▼
                                                    human approval  (unchanged)
                                                                       │
                                                                       ▼
                                        mission completion → RECORD  (already shipped)
                                                                       │
                                                                       └── feeds the
                                                                           NEXT loop
```

The right-hand recording arrow exists today. The left-hand **CONTEXT ASSEMBLY** block
is what must be wired.

### 1.2 What each retrieval contributes to the prompt

| Source | Port / method | What it returns | How it enters the prompt |
|---|---|---|---|
| Company DNA | `CompanyBrainPort.dna(brandId)` | tone, values, writing style, risk appetite | `[COMPANY DNA]` system message |
| Brand profile | `CompanyBrainPort.brand(brandId)` | audience, forbidden words | `[BRAND]` system message |
| Vertical marketing knowledge | `CompanyBrainPort.marketing(vertical)` | best hook, best headline, ROAS over N campaigns | `[MARKETING KNOWLEDGE]` system message |
| Similar past campaigns | `experience.findSimilar({vertical, context, k})` | the `k` most similar prior experiences + what was learned | `[PROVEN EXPERIENCE]` system message |
| Best winning patterns | `patterns.bestFor(vertical)` | ranked reusable structures (evidence-weighted) | `[PROVEN PATTERN]` system message |
| Executive memory | `ExecutiveMemoryPort.recall({role, k})` | in-memory CMO memory of prior campaigns | `[CMO MEMORY]` system message |
| Recent decisions | `DecisionMemoryPort.recall({sessionId, k})` | why the agency chose what it chose | `[RECENT DECISIONS]` system message |

The design intent is a **clean, auditable context stack** — one labelled system message
per source — so a reviewer can see exactly which memory shaped which draft, never an
opaque blob. This is precisely the assembly order the (unwired) Executive Context
Builder already implements: *Prompt → Mission → Company Brain → Executive Memory →
Decision Memory → Experience Engine → messages*
(`domains/executive-memory/src/context-builder.ts:37-86`).

### 1.3 Retrieval semantics (already coded, see §3)

- **Similarity** is a hard filter on `vertical` then a Jaccard ranking over the
  campaign context's `key=value` pairs — deterministic, offline, no vector DB required
  (`domains/company-brain/src/experience-engine.ts:22-34,42-47`). A production adapter
  may swap in vector similarity behind the same port without touching callers.
- **Pattern ranking** weights evidence value by sample size and nudges by proven reuse:
  `value * min(1, sampleSize/100) + reuseCount*0.1`
  (`domains/company-brain/src/pattern-library.ts:35-38`).

Both are intentionally simple and deterministic, which suits the offline-first,
air-gap-capable posture of AdOS — the read-back adds **zero** cloud dependency and
**zero** per-token cost.

### 1.4 Worked example — the same brief, before and after injection

Consider a restaurant-vertical mission whose objective is *"launch our new weekend
brunch menu."* Two prior brunch campaigns for this brand have already completed and been
recorded.

**Today (❌ read-back absent).** The brief generator sends only the flat mission fields
(`brief/service.ts:51-60`). The model sees, in effect:

```
[PROMPT] Write a marketing brief.
[VARS]   clientName=Cafe Lumen · industry=restaurant · brandVoice=warm, unfussy
         missionBrief=launch our new weekend brunch menu · budget=8000
```

Nothing about what worked last time. The model guesses from scratch.

**Target (memory injected).** The context builder prepends the labelled memory stack
(`context-builder.ts:37-86`) so the model additionally sees:

```
[COMPANY DNA]        Tone: warm, unfussy. Values: hospitality, craft. Risk appetite: low.
[BRAND]              Cafe Lumen — audience: local families 25-45. Forbidden words: cheap, discount.
[MARKETING KNOWLEDGE] restaurant: best hook "first 3s food", best headline
                     "Weekends taste better", ROAS 3.4 over 12 campaigns.
[PROVEN EXPERIENCE]  • 15s video, food in first 3s, "reserve now" CTA → 3.4x ROAS on Instagram.
                     • Static carousel of dishes underperformed (0.8x); avoid.
[PROVEN PATTERN]     • restaurant: Instagram+Meta launch → measure → reallocate (evidence 3.4, reused 2×).
[CMO MEMORY]         • Brunch launches peak Thu-Fri; front-load spend before the weekend.
```

Same model, same offline engine, same single `ai.submit` call — but the draft now starts
from the agency's proven winners for *this* brand and vertical. That is the entire value
of B-2 in one screen: the loop turns recorded outcomes into a better first draft.

### 1.5 Relationship to brand safety (B-1) and revision (B-3)

Memory injection is a **read** concern; it is distinct from, but complementary to, the
other two Book A gaps:

- **B-1 (bannedWords enforcement).** The `[BRAND]` message surfaces the brand's
  forbidden words into the prompt as *guidance*, which nudges the model away from them.
  That is **not** enforcement — hard rejection of banned copy remains the separate,
  currently-unwired safety concern (`executive-memory/src/governance.ts`,
  `ai-manager` safety engine). Injection improves the odds; it does not replace the
  gate.
- **B-3 (non-destructive revision).** Injected memory also strengthens the *first*
  draft, reducing how often a human must request revision at the `creative_assets` gate.
  Fewer revision cycles is a direct production-time win layered on top of the revenue
  win.

---

## 2. Today — what the code actually does (✅ write / ❌ read)

### 2.1 ✅ SHIPPED — recording works (write path)

At mission completion the route handler records into all three stores in one pass
(`apps/web/src/routes.ts:1118-1177`):

| # | Store | Call | Cite |
|---|---|---|---|
| 1 | Decision Journal | `app.journal.record({... decision, evidence, outcome ...})` | `routes.ts:1118-1133` |
| 2 | Executive Memory | `app.execMemory.remember({role:'cmo', category:'campaign', content, importance})` | `routes.ts:1136-1143` |
| 3 | Company Brain — experience | `app.brain.experience.record({vertical, context:{channels}, result:{roas,ctr,roi}, learned})` | `routes.ts:1146-1155` |
| 3 | Company Brain — pattern | `app.brain.patterns.capture({domain:vertical, structure, evidence})` | `routes.ts:1156-1161` |
| 3 | Company Brain — graph | `app.brain.graph.upsertNode(...)` / `graph.relate(...)` | `routes.ts:1162-1170` |

The stores themselves are instantiated on the app and are real:
`this.brain = new InMemoryCompanyBrain()`, `this.execMemory = new
InMemoryExecutiveMemory()`, `this.journal = new InMemoryDecisionJournal()`
(`apps/web/src/app.ts:89-91`). Recording emits events
(`EXPERIENCE_RECORDED`, `PATTERN_CAPTURED`, `MEMORY_UPDATED`, `routes.ts:1173-1177`).

> **Caveat carried from PRODUCT_TRUTH.md:** these stores are **in-memory** and the
> Company Brain is **unscoped** (global `Map`s, no `tenant_id`) —
> `domains/company-brain/src/in-memory-company-brain.ts:32-37`. Durability and tenant
> scoping of the brain are their own roadmap items and are **not** claimed here.

### 2.2 ❌ ABSENT — no generator reads any of it back

The generators are wired with three dependencies and **none of them is a brain,
memory, or journal port**:

| Generator | Constructor | Ports actually received | Cite |
|---|---|---|---|
| Marketing brief | `MarketingBriefService(repo, bus, ai)` | repository, event bus, AI Manager | `brief/service.ts:38-41`; wired `app.ts:84` |
| Creative set | `CreativeStudioService(repo, bus, ai)` | repository, event bus, AI Manager | `creative/service.ts:32-36`; wired `app.ts:85` |

The prompt variables each generator sends are **flat mission/brand fields only** — no
retrieved memory of any kind:

- Brief `variables`: `clientName, industry, brandVoice, brandValues, productName,
  productDescription, missionBrief, budget` (`brief/service.ts:51-60`). Note
  `brandVoice`/`brandValues` are passed straight from the mission context — **not**
  read from `brain.dna(...)`.
- Creative `variables`: `productName, brandVoice, objective, targetAudience,
  positioning, keyMessages` (`creative/service.ts:46-53`). No `findSimilar`, no
  `bestFor`, no `recall`.

App wiring confirms the asymmetry: at `apps/web/src/app.ts:84-88` the five AI services
are each constructed with `(repos.*, bus, ai)` — the brain/execMemory/journal created
one block later (`app.ts:89-91`) are handed to the **route handlers for recording**,
never to the **generators for reading**.

> **State of the loop: OPEN.** Memory flows *in* at completion and never flows *out* at
> generation. The B-2 promise — *"improves each campaign by learning from the last"* —
> is therefore **not closed today**.

### 2.3 Status of this doc's topic in one line

| Sub-capability | Tier | Cite |
|---|---|---|
| Memory **recording** at completion | ✅ SHIPPED (write-only, in-memory) | `routes.ts:1118-1177` |
| Memory **read-back** into brief/creative generation | ❌ ROADMAP | absence at `brief/service.ts:47-62`, `creative/service.ts:42-55`, `app.ts:84-88` |
| Reader components (context builder, experience engine, pattern library) | 🔶 BUILT (UNWIRED) | see §3 |

---

## 3. Built-unwired — the readers already exist (🔶)

The hard part is done: the retrieval code exists, is unit-tested, and sits in the repo.
It is simply not on any live app path. Book B build work is **wiring**, not greenfield.

### 3.1 🔶 Experience Engine — `findSimilar`

`domains/company-brain/src/experience-engine.ts:13-47`.
`InMemoryExperienceEngine` implements `ExperienceEnginePort`. `record(...)` is the
method the completion path already calls; `findSimilar({vertical, context, k})`
(`:22-34`) is the **read** method **no generator calls**. It hard-filters by `vertical`,
ranks surviving experiences by Jaccard overlap of `key=value` context pairs
(`:42-47`), and returns the top `k`. Deterministic and offline. **Dormant** at
generation time.

### 3.2 🔶 Pattern Library — `bestFor`

`domains/company-brain/src/pattern-library.ts:9-38`.
`InMemoryPatternLibrary` implements `PatternLibraryPort`. `capture(...)` is called at
completion; `bestFor(domain)` (`:18-22`) returns the vertical's winning structures
ranked by evidence-weighted confidence (`rank`, `:35-38`), and `markReused(id)`
(`:28-31`) increments proven reuse. The read methods are **never invoked from
generation** — **dormant**.

### 3.3 🔶 Executive Context Builder — the assembler

`domains/executive-memory/src/context-builder.ts:26-91`.
`ExecutiveContextBuilder.build(request)` **already assembles exactly the labelled
system-message stack §1 specifies**, in the mandated order (`:37-86`): it renders the
prompt, appends the mission, pulls `brain.dna` / `brain.brand` / `brain.marketing`,
`executiveMemory.recall`, `decisions.recall`, and `brain.experience.findSimilar`, each
as a `[LABEL]` system message via the `sys(...)` helper (`:89-91`). It takes
`CompanyBrainPort`, `ExecutiveMemoryPort`, `DecisionMemoryPort`, `PromptRegistryPort`
in its constructor (`:26-35`). **Nothing in `apps/web` instantiates it.** This is the
single most important 🔶 asset for closing B-2 — the read-back is largely *written*,
just not *called*.

### 3.4 Unwired-reader summary

| Component | File | Read method(s) dormant at generation |
|---|---|---|
| Experience Engine | `company-brain/src/experience-engine.ts:22-34` | `findSimilar` |
| Pattern Library | `company-brain/src/pattern-library.ts:18-22` | `bestFor`, `markReused` |
| Executive Context Builder | `executive-memory/src/context-builder.ts:37-86` | `build` (assembles all of the above) |
| Executive Memory | recorded via `execMemory.remember` (`routes.ts:1136`) | `recall` (read side unused by generators) |
| Decision Journal | recorded via `journal.record` (`routes.ts:1118`) | `recall` (read side unused by generators) |

Every row is real code, on no live path. Per the AI Constitution's two-stack model,
these belong to the **UNWIRED stack** — built, tested, dormant.

---

## 4. To build — the wiring that closes the loop

This is the **flagship differentiator** and the explicit resolution of **Book A
walkthrough gap B-2 (learning read-back)** — see
[`../../book-a/BOOK_A_AGENCY_CONSTITUTION.md`](../../book-a/BOOK_A_AGENCY_CONSTITUTION.md).
Nothing below is shipped; all of it is 🔶 wiring of existing readers plus a small ❌
adapter surface.

### 4.1 Wiring steps (spec)

1. **Give the generators a read port.** Extend the brief and creative service
   constructors from `(repo, bus, ai)` to `(repo, bus, ai, context)` where `context`
   is an `ExecutiveContextBuilderPort` (or a narrower `MemoryContextPort`). Wire it at
   `apps/web/src/app.ts:84-85` by passing the already-instantiated `this.brain`,
   `this.execMemory`, `this.journal` into an `ExecutiveContextBuilder`. **Tier: 🔶**
   (the builder exists; only construction + injection are new).

2. **Assemble context before `ai.submit`.** In `generate(...)`, call
   `context.build({ promptKey, missionId, brandId, vertical, role:'cmo', variables })`
   to obtain the labelled system messages, and prepend them to the messages the AI
   Manager sends. The `vertical`/`brandId` needed are already available on the mission
   context that flows into the brief service. **Tier: 🔶.**

3. **Mark reuse for feedback.** When a retrieved pattern demonstrably shapes an
   approved draft, call `patterns.markReused(id)`
   (`pattern-library.ts:28-31`) so the evidence-weighted rank reflects proven reuse —
   turning retrieval into a live ranking signal. **Tier: 🔶.**

4. **Keep human approval unchanged.** Injection changes *what the model sees*, never the
   gate. All existing gates (`strategy_and_budget`, `creative_assets`,
   `campaign_launch`) and the approval workflow (`approval.ts`, `routes.ts:478-481`)
   remain exactly as Book A documents them. **Tier: ✅ (unchanged).**

### 4.1a Proposed read port (spec, ❌ new type)

A minimal port keeps the generators decoupled from the full context builder. The
generator depends on a narrow read interface; the app binds it to the existing
`ExecutiveContextBuilder`:

```
interface MemoryContextPort {
  // Returns labelled system messages to prepend before ai.submit(...).
  build(request: {
    promptKey: string;
    missionId?: string;
    brandId?: string;
    vertical?: string;
    role: 'cmo';
    variables?: Record<string, unknown>;
  }): Promise<AIMessage[]>;
}
```

`ExecutiveContextBuilder` already satisfies this shape (`context-builder.ts:37`), so the
"new" type is only a narrowing interface plus its injection — no new retrieval logic.

### 4.1b Failure & empty-memory behaviour (spec)

The read-back must **never** block a draft. For a brand-new brand with no recorded
history, every retrieval returns empty (`findSimilar` yields `[]` when no experience
matches — `experience-engine.ts:28-33`; the builder simply pushes no message for an
empty source — `context-builder.ts:71,82`). The generator therefore degrades gracefully
to exactly today's behaviour: a cold-start draft. Injection is **additive** — it can
only help; its absence for a given source is silent, not an error. A retrieval error
must be caught and treated as empty, preserving the single-shot generation contract.

### 4.2 Adapter/roadmap surface (❌)

| Item | Tier | Note |
|---|---|---|
| Vector-similarity adapter behind `ExperienceEnginePort` | ❌ ROADMAP | port allows it; only the deterministic Jaccard adapter exists today (`experience-engine.ts:9-11`) |
| Tenant-scoping of the Company Brain | ❌ ROADMAP | brain is global/unscoped today (`in-memory-company-brain.ts:32-37`); scoping is prerequisite for multi-tenant read-back |
| Durable brain/memory stores | ❌ ROADMAP | in-memory today; persistence is a separate build |
| Relevance/injection-budget controls (how many `k`, token budget) | ❌ ROADMAP | `k` values are hard-coded in the builder (`context-builder.ts:70,81`) |

### 4.3 Definition of done for B-2

- [ ] Brief and creative services receive a context port (`app.ts:84-85`).
- [ ] `context.build(...)` runs before every `ai.submit` in both generators.
- [ ] A generated draft's provenance can be traced to the specific memory messages that
      shaped it (auditable stack, one label per source).
- [ ] `markReused` fires on approval of a pattern-shaped draft.
- [ ] Book A B-2 marked resolved.

Until every box is checked, this document's topic remains **❌ ROADMAP** and must be
described as such.

### 4.4 Consolidated tier ledger for this topic

| Element | Tier | Evidence |
|---|---|---|
| Recording into journal / memory / brain at completion | ✅ SHIPPED | `routes.ts:1118-1177` |
| Stores instantiated on the app | ✅ SHIPPED | `app.ts:89-91` |
| Human approval gates (unchanged by injection) | ✅ SHIPPED | `approval.ts`, `routes.ts:478-481` |
| Experience Engine `findSimilar` read | 🔶 BUILT (UNWIRED) | `experience-engine.ts:22-34` |
| Pattern Library `bestFor` / `markReused` read | 🔶 BUILT (UNWIRED) | `pattern-library.ts:18-31` |
| Executive Context Builder `build` (full stack) | 🔶 BUILT (UNWIRED) | `context-builder.ts:37-86` |
| Read port injected into brief/creative generators | ❌ ROADMAP | absence at `app.ts:84-85`, `brief/service.ts:38-41` |
| Context assembled before `ai.submit` | ❌ ROADMAP | absence at `brief/service.ts:47-62` |
| Vector-similarity adapter | ❌ ROADMAP | only Jaccard adapter today |
| Brain tenant-scoping / durability | ❌ ROADMAP | `in-memory-company-brain.ts:32-37` |

The line is precise: **all reading logic that matters is 🔶 (coded, dormant); only the
injection call and the port are ❌ (new).** That is why B-2 is high-leverage — most of
it is already written.

---

## 5. Cross-references

- Governing reference: [`AI_CONSTITUTION.md`](./AI_CONSTITUTION.md) (two-stack model:
  WIRED vs UNWIRED).
- Context assembly detail: [`CONTEXT_ENGINE.md`](./CONTEXT_ENGINE.md) *(if present in
  this part; describes the Prompt→Mission→Brain→Memory→Experience order the builder
  implements).*
- Recording side (write path): the mission-completion learning step documented in
  [`../3-learning-engine/`](../3-learning-engine/).
- Book A motivating gap: **B-2 learning read-back** —
  [`../../book-a/BOOK_A_AGENCY_CONSTITUTION.md`](../../book-a/BOOK_A_AGENCY_CONSTITUTION.md).
- Source of truth: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) · Known limits:
  [`../../KNOWN_LIMITATIONS.md`](../../KNOWN_LIMITATIONS.md) · Roadmap:
  [`../../ROADMAP.md`](../../ROADMAP.md).

---

## 6. Value contribution

**Revenue ↑ — this is the compounding differentiator.**

Every rival that does Prompt → LLM → Output starts each campaign from a blank slate.
The moment memory injection is wired, AdOS starts each campaign from **the agency's own
proven winners for that brand and vertical**: the best hook, the best headline, the
patterns that returned above break-even, and the CMO's recorded memory of what worked.

- **Higher win-rate that compounds.** Draft *n+1* is conditioned on the measured
  outcomes of drafts *1…n*. Win-rate rises with campaign count instead of staying flat —
  a moat that widens the longer a client stays, and one competitors cannot copy because
  it is built from the client's *own* results.
- **Less rework, faster approval (production time ↓ as a secondary effect).** First
  drafts anchored on proven patterns need fewer human revision cycles at the
  `creative_assets` gate.
- **Zero marginal cost to the promise.** The retrieval is deterministic and offline
  (`experience-engine.ts`, `pattern-library.ts`) — closing the loop adds **no** cloud
  dependency, API key, or per-token billing, fully consistent with the 100%-local,
  air-gap-capable posture.

The recording engine that makes this possible already runs. Closing the read-back is
the single highest-leverage build in Book B: it converts a write-only archive into a
compounding advantage, and it is the literal fulfilment of the product promise
*"improves each campaign by learning from the last."*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
