# The Context Engine

**Owner:** Office of the Chief AI Architect
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md)
**Governing reference:** [AI_CONSTITUTION.md](AI_CONSTITUTION.md)

> **Implementation status:** 🔶 **BUILT (UNWIRED)** — the context-assembly
> architecture exists and is unit-tested in the repository
> (`domains/executive-memory/src/context-builder.ts:37-86`), but **no running app
> path instantiates it**. Today the live pipeline assembles flat mission variables
> only. Wiring the full engine onto the live path is Book B build work.

---

## 0. What this document covers

The **Context Engine** is the component that assembles *everything the model needs
before a single token is generated*. Competitors ship **Prompt → LLM → Output**. AdOS
is designed around a richer contract: before generation, gather the mission, the
brand, the agency's memory and proven patterns, the versioned prompt template, the
output language, and the response schema — then hand the model a clean, labelled
context stack instead of a bare instruction.

This document is deliberately split into three layers, and they must never blur:

1. **Target design** — what a context engine *should* assemble, and why grounding
   produces better first drafts.
2. **Today** — precisely what the code does on the live path right now (✅), and the
   richer builder that already exists but is dormant (🔶).
3. **To build** — the wiring plan that makes the context engine live, including the
   exact point at which the Book A **B-2 learning-read-back gap** gets closed.

Every claim is tier-tagged with one of `✅ SHIPPED`, `🔶 BUILT (UNWIRED)`, or
`❌ ROADMAP (ABSENT)`, per the AI Constitution.

---

## 1. Target design — what a context engine assembles

Generation quality is bounded by what the model can see. A model asked to "write ad
copy for a client" with no grounding must invent a voice, guess an audience, and
ignore every lesson the agency has already paid to learn. A model handed the brand's
tone, its forbidden words, the winning hook from the last twelve campaigns, and a
versioned prompt template produces a **first draft that is closer to approvable** — it
needs fewer human revision cycles and it sounds like the client, not like a generic
assistant.

The Context Engine is the disciplined answer to "what does the model get to see?" It
assembles the following layers, in a mandated order, each as a **labelled** system
message so the stack is auditable rather than an opaque blob:

| # | Layer | What it contributes | Why it matters |
|---|---|---|---|
| 1 | **Prompt template** | The versioned base instruction / role | Consistency; A/B-testable prompts; no ad-hoc wording |
| 2 | **Mission** | The client objective in natural language | The generation is *about* something concrete |
| 3 | **Brand / Company DNA** | Tone, values, writing style, risk appetite, audience, forbidden words | On-brand voice; guardrails visible pre-generation |
| 4 | **Memory (executive + decision)** | What this role/executive already knows; recent decisions and their reasons | Continuity; no repeating rejected ideas |
| 5 | **Experience / patterns** | Proven approaches for this vertical (best hook, best headline, ROAS) | Compounding: each campaign benefits from the last |
| 6 | **Language** | Output language directive (TR/EN) | Correct locale without a separate pass |
| 7 | **Response schema** | The JSON shape the caller expects | Machine-usable output; fewer malformed drafts |

The ordering matters: the **prompt** frames the task, the **mission** anchors it, the
**brand** constrains it, **memory and experience** enrich it, and **language + schema**
shape the emission. This is the "Context → Prompt Orchestrator → Generation" segment of
the AdOS agent pipeline described in the AI Constitution.

**Design principle — labelled, not concatenated.** Each source contributes its own
`[LABEL]`-prefixed system message. A model that sees `[BRAND]`, `[CEO MEMORY]`, and
`[PROVEN EXPERIENCE]` as distinct blocks can weigh them; a reviewer auditing why a
draft came out the way it did can read the exact context stack that produced it. This
is the difference between *grounding* and *prompt-stuffing*.

### 1.1 Worked example — the assembled context stack

To make the target concrete, here is the shape of the labelled stack the engine
produces for a creative-generation task on a fitness-supplement brand. Each block is a
separate `system` message; the helper that formats them is `sys(label, body)`
(`context-builder.ts:89-91`):

```
[PROMPT]        You are a senior advertising creative director. Produce a set of ad creatives...
[MISSION]       Grow trial sign-ups for the new pre-workout line among 25–40 gym-goers.
[COMPANY DNA]   Tone: bold, direct. Values: honesty, results. Writing style: punchy. Risk appetite: medium.
[BRAND]         PeakFuel — audience: committed lifters 25–40. Forbidden words: miracle, guaranteed, cure.
[MARKETING KNOWLEDGE]  supplements: best hook "the 3pm crash is a lie", best headline "Train past the wall", ROAS 4.2 over 18 campaigns.
[CREATIVE MEMORY]      • Long-form testimonials outperformed hype copy last quarter.
[RECENT DECISIONS]     • Dropped the "limited time" angle — reason: eroded brand trust.
[PROVEN EXPERIENCE]    • Problem-first hooks beat benefit-first hooks in this vertical.
```

Contrast this with the single flat block the live path produces today (a role
sentence, a language line, a schema blob, and a `- key: value` variable dump). The
labelled stack is what lets the model reuse the winning hook, avoid the forbidden
words, and not re-propose the "limited time" angle that was already rejected — none of
which is possible when those facts never reach the prompt.

### 1.2 Why the order is mandated

The sequence is not cosmetic. The **prompt** must come first so the model knows its job
before it reads data. The **mission** anchors that job to a concrete objective. The
**brand** constrains *how* the job may be done (voice + forbidden words) before any
creative facts arrive, so guardrails frame the enrichment rather than trailing it.
**Memory and experience** enrich last among the substantive layers, because they are
suggestions to weigh, not constraints to obey. Language and schema shape the emission
and belong at the boundary. A model reading these in order builds intent → subject →
constraints → enrichment → format, which mirrors how a senior human strategist briefs a
copywriter.

---

## 2. Today — what the code actually does

There are two stacks in the repository, and only one of them executes.

### 2.1 The WIRED path assembles flat mission variables only ✅ SHIPPED

Every AI artifact in the live pipeline is produced by a service calling
`ai.submit(...)` exactly once. The Marketing Brief service is representative
(`domains/marketing-intelligence/src/brief/service.ts:47-62`): it passes a flat
`variables` bag —

```
variables: {
  clientName, industry, brandVoice, brandValues,
  productName, productDescription, missionBrief, budget,
}
```

— plus a `promptRef` (`{ key: 'marketing.brief', version: 1 }`) and a
`responseSchema`. That is the entire context. Note what is present and what is absent:

| Target layer | On the live path today | Evidence |
|---|---|---|
| Prompt template | ✅ hardcoded role string, keyed by `promptRef.key` | `apps/web/src/ai-live.ts:123-134` (`ROLES` map) |
| Mission | ✅ but *flattened* — `missionBrief` is one string variable, not a mission object | `brief/service.ts:58` |
| Brand | ⚠️ partial — only `brandVoice` / `brandValues` as flat strings; no forbidden words, no DNA | `brief/service.ts:54-55` |
| Memory (executive/decision) | ❌ not read into generation | — |
| Experience / patterns | ❌ not read into generation | — |
| Language | ✅ injected as a directive | `ai-live.ts:139-141` |
| Response schema | ⚠️ injected as *prompt text*, not enforced | `ai-live.ts:142-144` |

The live "context assembly" happens in two small functions in `ai-live.ts`:

- `buildMessages` (`ai-live.ts:137-154`) — selects a role string from the hardcoded
  `ROLES` map, appends the language directive and the schema-as-text, and builds a
  single `system` + single `user` turn.
- `formatVariables` (`ai-live.ts:157-162`) — renders the flat `variables` bag as a
  `- key: value` list dropped into the user turn.

So the model sees: one role sentence, one language line, one schema blob, and a
key/value dump of mission fields. **That is the shipped Context Engine.** It is real,
it works, and it grounds the draft in the mission — but it reads **nothing** from the
Company Brain, Executive Memory, Decision Memory, or the pattern/experience libraries
at generation time.

> **Tier for the wired path:** the flat-variable assembly is `✅ SHIPPED`. The absence
> of memory/experience/brand-rule reads at generation time is exactly the Book A
> **B-2 learning-read-back gap**.

### 2.2 The richer `ExecutiveContextBuilder` exists — but is dormant 🔶 BUILT (UNWIRED)

The repository already contains a full, ordered context engine:
**`domains/executive-memory/src/context-builder.ts:37-86`**. Its `build(request)`
method assembles the mandated stack **Prompt → Mission → Company Brain → Executive
Memory → Decision Memory → Experience Engine**, each as a labelled system message via a
`sys(label, body)` helper (`context-builder.ts:89-91`). Concretely, what the code
already does:

| Step | Source | What it emits | Code |
|---|---|---|---|
| 1 | Prompt Registry | Renders the versioned prompt for `promptKey` with `variables` | `context-builder.ts:41-44` |
| 2 | Mission | `[MISSION]` — the objective in the user's words | `context-builder.ts:47-50` |
| 3 | Company DNA | `[COMPANY DNA]` — tone, values, writing style, risk appetite | `context-builder.ts:53-54` |
| 3 | Brand | `[BRAND]` — name, target audience, **forbidden words** | `context-builder.ts:55-58` |
| 3 | Marketing knowledge | `[MARKETING KNOWLEDGE]` — best hook, best headline, ROAS over N campaigns | `context-builder.ts:59-62` |
| 4 | Executive Memory | `[<ROLE> MEMORY]` — top-k recalled memories for the role | `context-builder.ts:65-71` |
| 5 | Decision Memory | `[RECENT DECISIONS]` — recent decisions on this mission + reasons | `context-builder.ts:74-77` |
| 6 | Experience Engine | `[PROVEN EXPERIENCE]` — similar past campaigns' learnings | `context-builder.ts:80-83` |

This is the target design, already coded. It depends on ports it accepts by
constructor injection (`context-builder.ts:27-35`): `PromptRegistryPort`,
`CompanyBrainPort`, `ExecutiveMemoryPort`, `DecisionMemoryPort`, and an optional
`MissionProvider`. It returns `AIMessage[]` — exactly the shape `ai.submit`'s message
list expects.

**Why it is dormant.** `ExecutiveContextBuilder` is **never instantiated by the running
app**. The live services (`brief/service.ts`, and the four sibling services for
creative/campaign/report/executive) do not construct it, do not import it, and take no
`CompanyBrainPort`. Its inputs — the brand reads, the memory recalls, the experience
lookups — never reach the model on the live path. It is imported only by the
executive-memory domain's own internals and its tests. Per the AI Constitution's
two-stack reality, it lives in the **UNWIRED stack**: built, tested, and inactive.

> **Tier:** `🔶 BUILT (UNWIRED)`. The architecture exists at
> `domains/executive-memory/src/context-builder.ts:37-86`; wiring it into the live
> pipeline is Book B build work. It is not shipped and it is not on the live path.

### 2.3 The same flat shape across all five services

The Marketing Brief service in §2.1 is not a special case — it is the template. All
five pipeline stages assemble context the same flat way and call `ai.submit` once:

| Stage | Service | Prompt key | Context assembled today |
|---|---|---|---|
| Brief | `marketing-intelligence/.../brief/service.ts` | `marketing.brief` | flat mission + `brandVoice`/`brandValues` vars |
| Creative | `creative-studio/.../creative/service.ts` | `creative.set` | flat brief/brand vars |
| Campaign | `campaign-engine/.../draft/service.ts` | `campaign.draft` | flat brief/budget vars |
| Report | `analytics-engine/.../report/service.ts` | `analytics.report` | flat metric vars |
| Executive | `executive-ai/.../dashboard/service.ts` | `executive.dashboard` | flat report vars |

Because the shape is uniform, the wiring in §3 is uniform too: teaching one service to
call the Context Engine before `submit` is the pattern for all five. That uniformity is
what makes this a tractable, single-mechanism build rather than five bespoke changes.

### 2.4 Side-by-side: shipped vs. built-unwired

| Dimension | Live path (✅ shipped) | `ExecutiveContextBuilder` (🔶 unwired) |
|---|---|---|
| Prompt source | Hardcoded `ROLES` map (`ai-live.ts:123-134`) | Rendered from Prompt Registry (`context-builder.ts:41-44`) |
| Mission | Flattened to a `missionBrief` string | `[MISSION]` from a `MissionProvider` |
| Brand voice | `brandVoice` flat string | `[COMPANY DNA]` + `[BRAND]` incl. forbidden words |
| Memory | none | `[<ROLE> MEMORY]` top-k recall |
| Decisions | none | `[RECENT DECISIONS]` |
| Experience / patterns | none | `[PROVEN EXPERIENCE]` similar campaigns |
| Message structure | 1 system + 1 user turn | N labelled system messages |
| Instantiated by app? | Yes (`ai-live.ts`) | **No** |

The gap between these two columns *is the scope of the Context Engine build.*

---

## 3. To build — the wiring plan

The Context Engine build closes the distance between §2.1 and §2.2: make the running
app assemble the full, labelled context stack before generation. Nothing here requires
new inference capability — the engine, the readers, and the memory stores already exist
in the repo. The work is **wiring**, plus a few narrowly-scoped additions.

### 3.1 Build ledger

| Work item | Tier | Note |
|---|---|---|
| Instantiate `ExecutiveContextBuilder` in the app composition root | 🔶 | Class exists (`context-builder.ts:26`); app never constructs it (`apps/web/src/app.ts` wiring) |
| Inject `CompanyBrainPort` into the generation services | 🔶 | Ports exist; services (`brief/service.ts:40`) take only `AIManagerPort` today |
| Feed **brand + brain reads** into the prompt (closes **B-2**) | 🔶 | Reader code exists in `context-builder.ts:53-62`; generation-time wiring does not |
| Route the builder's `AIMessage[]` into `ai.submit({ messages })` | 🔶 | `ai.submit` already accepts a `messages` array (`ai-live.ts:152-153`) |
| Wire the **Prompt Registry** as the prompt source (replace `ROLES` map) | 🔶 | Registry built-unwired; see [PROMPT_ORCHESTRATOR.md](PROMPT_ORCHESTRATOR.md) |
| Tenant-scope the Company Brain reads | ❌ | Brain is currently a global unscoped `Map` (`in-memory-company-brain.ts:32-37`) — must scope before it feeds tenant-facing generation |
| Per-artifact context profiles (which layers each of the 5 services needs) | ❌ | Design: brief vs. creative vs. campaign need different layer subsets |
| Context-stack provenance (record which memories/patterns grounded a draft) | ❌ | Extends existing `provenance{...}` on every artifact |

### 3.2 Wiring sequence (design)

1. **Compose the builder.** In the app's composition root, construct one
   `ExecutiveContextBuilder` with the already-built ports: the Prompt Registry, the
   Company Brain, Executive Memory, Decision Memory, and a `MissionProvider` backed by
   the mission repository. All five dependencies exist in the repo today; none is new
   inference code. (🔶)

2. **Give the generation services a context step.** Each of the five services
   (`brief`, `creative`, `campaign`, `report`, `executive`) currently builds a flat
   `variables` bag and calls `ai.submit`. The change: before `submit`, call
   `contextBuilder.build({ promptKey, missionId, brandId, vertical, role, tenantId,
   variables })`, and pass the resulting `AIMessage[]` as `ai.submit({ ..., messages })`.
   The `messages` channel already exists and is appended after the built turn
   (`ai-live.ts:152-153`), so this is additive — no breaking change to the wired path.
   (🔶)

3. **Close B-2 at exactly this point.** The moment step 2 lands for `brandId`/`vertical`,
   the model begins **reading** the brand's DNA and forbidden words
   (`context-builder.ts:53-58`) and the vertical's best hook / best headline / ROAS
   (`context-builder.ts:59-62`, `context-builder.ts:80-83`) that the pipeline already
   *records* at mission completion (`routes.ts:1118-1177`). The write-only memory
   becomes read-at-generation. This is the **B-2 learning-read-back** loop closing — and
   it closes *here, in the Context Engine*, not in a separate learning component. (🔶)

4. **Swap the prompt source.** Replace the hardcoded `ROLES` map (`ai-live.ts:123-134`)
   with the Prompt Registry render already performed at `context-builder.ts:41-44`, so
   prompts become versioned and A/B-scoreable. Coordinate with
   [PROMPT_ORCHESTRATOR.md](PROMPT_ORCHESTRATOR.md). (🔶)

5. **Scope before you serve.** The Company Brain is a global unscoped store today
   (`in-memory-company-brain.ts:32-37`). Reading it into tenant-facing generation
   *requires* tenant scoping first, or one tenant's memory grounds another's drafts.
   This is a hard prerequisite, not an optimization. (❌ — no scoping code exists yet.)

### 3.3 Failure modes the wiring must handle

Making the engine live introduces real assembly-time considerations that the design
must address up front:

| Concern | Design response |
|---|---|
| A source is empty (no DNA, no memories yet) | The builder already emits a block **only if** the source returns data (`context-builder.ts:53-83` are all guarded); an empty brain degrades gracefully to the mission-only stack — never an error |
| Context length grows unbounded | Recall is already top-k bounded (`k:5` memories, `k:5` decisions, `k:3` experiences — `context-builder.ts:70,75,81`); the design keeps k small and tunable per artifact |
| A source read is slow or fails | Reads are local in-process today; the wiring must treat a failed enrichment read as *skip-and-continue*, never as a generation-blocking error — a grounded-less draft beats no draft |
| One tenant's memory leaks into another's draft | Hard-blocked until §3.2 step 5 tenant-scoping lands; this is why scoping is a prerequisite, not a follow-up |

### 3.4 What this build does NOT include

To stay honest about the tier line:

- It does **not** add schema *enforcement*. The schema remains injected as prompt text
  (`ai-live.ts:142-144`); the schema-enforced validation pipeline is a separate
  built-unwired concern (see [VALIDATION_PIPELINE.md](VALIDATION_PIPELINE.md)).
- It does **not** enforce banned words. `[BRAND]` *shows* forbidden words to the model
  (`context-builder.ts:57`), which reduces violations, but true enforcement (Book A gap
  **B-1**) is the Brand Safety engine's job, unwired at `governance`/`safety-engine`.
  Showing ≠ enforcing.
- It does **not** add any cloud, API-key, or telemetry dependency. Every read is from
  local in-process stores; generation stays 100% local, air-gap capable.
- It does **not** turn the pipeline autonomous. Every artifact still passes through the
  human approval gates `strategy_and_budget` / `creative_assets` / `campaign_launch`
  unchanged.

---

## 4. Interfaces and contracts (reference)

For implementers, the relevant already-defined shapes:

| Contract | Role | Location |
|---|---|---|
| `ExecutiveContextBuilderPort` | The port the app wires to | `@ados/contracts` (implemented by `context-builder.ts:26`) |
| `ExecutiveContextRequest` | `{ promptKey?, missionId?, brandId?, vertical?, role, tenantId, variables? }` | `@ados/contracts` |
| `CompanyBrainPort` | `dna()`, `brand()`, `marketing()`, `experience.findSimilar()` | `@ados/contracts`; impl `in-memory-company-brain.ts` |
| `ExecutiveMemoryPort` | `recall({ tenantId, role, query?, k })` | `@ados/contracts` |
| `DecisionMemoryPort` | `recall({ sessionId, k })` | `@ados/contracts` |
| `PromptRegistryPort` | `render(key, variables)` | `@ados/contracts`; impl `prompt-registry/src/in-memory-prompt-registry.ts` |
| `AIMessage` | `{ role, content }` — the builder's output element | `@ados/contracts` |

Note that `build()` returns `AIMessage[]`, and `ai.submit` accepts a `messages` array
that `buildMessages` appends verbatim (`ai-live.ts:152-153`). The two halves are
**already shape-compatible** — the missing piece is genuinely just the call site.

---

## 5. Value contribution

**Production-time ↓ (less rework).** The single largest cost in an agency pipeline is
human revision cycles. A first draft grounded in the brand's tone, forbidden words, and
the vertical's proven hook/headline lands closer to approvable on the first pass, so
reviewers spend fewer rounds at the `creative_assets` and `strategy_and_budget` gates.
The context is assembled once, deterministically, before generation — no extra model
calls, no cloud cost.

**Revenue ↑ (on-brand, memory-grounded drafts).** Drafts that *sound like the client*
and that reuse what has already worked (best hook, best headline, highest-ROAS
approaches) convert human approvals into launched-quality campaigns faster and raise the
quality ceiling of what the agency can produce per unit of time. The Context Engine is
the mechanism by which "each campaign learns from the last" stops being aspirational —
it is the exact place the recorded memory (`routes.ts:1118-1177`) re-enters generation.

**Where the value lands in the pipeline.** The two revision-heavy gates are
`strategy_and_budget` and `creative_assets`. A context-grounded first draft attacks
rework at exactly those gates: brand-correct voice reduces creative-assets rounds, and
memory-grounded strategy (proven hooks, prior decisions) reduces strategy-and-budget
rounds. Neither adds a model call, a network hop, or a token cost — the engine is a
pure pre-generation assembly step over local stores.

**Truthful framing.** Today this value is *latent*: the recording happens, the reader
exists (`context-builder.ts:37-86`), but the two are not connected on the live path. The
Context Engine build is what converts the latent value into realized value, and it is
the highest-leverage 🔶 wiring task in Book B because it closes the headline B-2 gap.

---

## 6. Cross-references

- Governing reference: [AI_CONSTITUTION.md](AI_CONSTITUTION.md)
- Prompt source for step 4: [PROMPT_ORCHESTRATOR.md](PROMPT_ORCHESTRATOR.md)
- Schema enforcement (out of scope here): [VALIDATION_PIPELINE.md](VALIDATION_PIPELINE.md)
- Source of truth: [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md)
- Roadmap: [../../ROADMAP.md](../../ROADMAP.md) · Known limits: [../../KNOWN_LIMITATIONS.md](../../KNOWN_LIMITATIONS.md)
- Book A agency constitution: [../../book-a/BOOK_A_AGENCY_CONSTITUTION.md](../../book-a/BOOK_A_AGENCY_CONSTITUTION.md)

---

## 7. Status summary

| Capability | Tier | Evidence |
|---|---|---|
| Flat mission-variable context assembly (live) | ✅ SHIPPED | `brief/service.ts:47-62`, `ai-live.ts:137-162` |
| Language injection into context | ✅ SHIPPED | `ai-live.ts:139-141` |
| Schema injected as prompt text (not enforced) | ⚠️ PARTIAL ✅ | `ai-live.ts:142-144` |
| Hardcoded prompt-role selection | ⚠️ PARTIAL ✅ | `ai-live.ts:123-134` |
| Full ordered context builder (Prompt→Mission→Brain→Memory→Experience) | 🔶 BUILT (UNWIRED) | `context-builder.ts:37-86` |
| Brand DNA + forbidden-words read into context | 🔶 BUILT (UNWIRED) | `context-builder.ts:53-58` |
| Experience / pattern read into context | 🔶 BUILT (UNWIRED) | `context-builder.ts:59-62,80-83` |
| Wiring the builder onto the live path (closes B-2) | 🔶 TO BUILD | services take no brain port today |
| Tenant-scoped brain reads | ❌ ROADMAP | brain is a global `Map` (`in-memory-company-brain.ts:32-37`) |
| Per-artifact context profiles | ❌ ROADMAP | design only |
| Context-stack provenance | ❌ ROADMAP | extends existing `provenance{...}` |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
