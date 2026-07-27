# Persona Builder — Structured Audience Personas for Creative Targeting

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP (ABSENT)** — no persona builder exists in
> AdOS today. The only trace in the codebase is a single **unused event constant**,
> `INTEL_PERSONA_BUILT_V1` (`domains/marketing-intelligence/src/events.ts:10`), which
> is **never emitted** and has **no producing code**. Everything in the "Target design"
> and "To build" sections below is specification, not shipped behavior.

---

## 1. Purpose

A **persona** is a structured, reusable description of a slice of a brand's audience —
who they are, what they want, what they fear, where they pay attention, and the language
that moves them. Creative that is written **at a named persona** is sharper than creative
written at a vague crowd.

Today, AdOS carries audience as **one free-text string**. There is no way to (a) turn
that string into structured, reusable personas, or (b) select a persona to steer a
`CreativeSet`. The **Persona Builder** is the specified stage that would derive structured
personas from data the agency **already holds**, and feed them into the
[Context Engine](../1-ai-foundations/CONTEXT_ENGINE.md) so that every downstream
generator (brief, creative, campaign) can target a specific audience instead of an
undifferentiated one.

### 1.1 Hard boundary — local inputs only

The Persona Builder is specified to build personas from **exactly one source of data:
what the agency already owns.** It performs **no external data ingestion**, opens **no
connectors**, and does **no document Q&A**. This is not a limitation to be lifted later —
it is a **constitutional constraint**. AdOS is 100% local, offline-capable, air-gap
capable; it has no external audience data feed, no data-broker integration, and no
document knowledge base (`PRODUCT_TRUTH.md` §2.1, §2.5). The Persona Builder must never
imply otherwise.

Permitted inputs (all already in the workspace):

| Input | Source (code) | Nature |
|---|---|---|
| Brand audience string | `domains/agency-os/src/brand/brand.ts:25` (`profile.targetAudience`) | Free text |
| Brand mission | `brand.ts:22` (`profile.mission`) | Free text |
| Brand values | `brand.ts:23` (`profile.values`) | String list |
| Brand voice | `brand.ts:24` (`profile.voice`) | Free text |
| Product name / description | `domains/agency-os/src/product/product.ts` | Free text |
| Mission brief (operator objective) | `domains/agency-os/src/mission/mission.ts` | Free text |
| **Local AI** | `apps/web/src/ai-factory.ts:23-57` (Ollama / OpenAI-compatible local) | Structuring engine |

Forbidden inputs (would violate the AI Constitution and `PRODUCT_TRUTH.md` §2.5):
external audience datasets, ad-platform audience APIs, connector-hub feeds
(`domains/connector-hub` is a 0-importer stub), scraped web data, or uploaded document
corpora. **None of these exist and none may be added under this feature.**

---

## 2. Target design

### 2.0 Why a single string is not enough

The competitor pattern is **Prompt → LLM → Output**: an audience sentence goes straight
into a generation prompt and out comes copy. AdOS is designed instead as a small
**agent pipeline** in which audience is *structured before it is used*. A free-text
audience field fails the pipeline in three concrete ways:

| Problem with free text | Consequence at generation |
|---|---|
| No structure | The generator cannot distinguish a goal from a pain point from a channel; it re-parses the sentence every run |
| No reuse | Each mission re-describes the audience from scratch; nothing is carried brand-to-mission |
| No selection | A brand serving several audiences collapses to one blurred string; creative cannot be aimed at one of them |

The Persona Builder exists to convert that sentence into structured, named, reusable,
selectable objects — **without** reaching outside the agency's own data to do it.

### 2.1 Where the stage sits

The Persona Builder is a **pre-brief structuring stage**. It runs on data that already
exists at Brand/Product/Mission level and emits structured personas that the
[Context Engine](../1-ai-foundations/CONTEXT_ENGINE.md) folds into the prompt context for
generation.

```
Brand.profile.targetAudience (free text)   ┐
Brand.profile.mission / values / voice     ├─► [Persona Builder] ──► Persona[] (structured)
Product.name / description                 │         (local AI)          │
Mission.brief (operator objective)         ┘                            ▼
                                                          [Context Engine] ──► generation
                                                    (../1-ai-foundations/CONTEXT_ENGINE.md)
```

The builder **does not replace** the free-text field; it **structures** it. The operator
keeps writing a plain audience description; the builder turns that description (plus
mission, product, values) into named, reusable persona objects the operator can review,
edit, and select.

### 2.2 Specified persona shape (design, not code)

A persona is a structured record derived **entirely** from local inputs. Illustrative
target shape:

| Field | Meaning | Derived from (local only) |
|---|---|---|
| `id` | Stable identifier | Generated |
| `name` | Human-readable label ("Time-pressed parent") | AI-structured from `targetAudience` + mission |
| `demographics` | Age band, role, context | AI-structured from `targetAudience` |
| `goals` | What this persona is trying to achieve | AI inference from product + mission |
| `painPoints` | What frustrates them | AI inference from product + mission |
| `motivations` | What moves them to act | AI inference from values + mission |
| `channels` | Where they pay attention | AI inference (no external data — a hypothesis, not a measurement) |
| `toneCues` | Language register that resonates | AI inference from `profile.voice` + `targetAudience` |
| `provenance` | `{ taskId, capability, model, engine, latencyMs }` | Standard AI provenance (`ai-live.ts`) |

Two honesty rules bind this shape:

1. **`channels` and any behavioral guess are hypotheses, not observations.** With no
   external data, the builder cannot *measure* where an audience is; it can only propose
   a structured guess from the agency's own description. The field must be labeled as a
   derived hypothesis for human review, never as verified audience data.
2. **Every persona is human-editable and human-approved.** Consistent with the
   human-gated pipeline (`PRODUCT_TRUTH.md` §1.3), a generated persona is a **first
   draft** an operator confirms — it is not authoritative on generation.

### 2.2b Illustrative structuring (design example — not code)

To make the boundary concrete, here is how a single free-text audience field would be
structured using **only** local inputs. The inputs shown all already exist on the Brand,
Product, and Mission.

**Local inputs (already on file):**

- `brand.profile.targetAudience` = `"Adults 25-45 within 10km valuing appearance and health"`
- `brand.profile.mission` = `"help busy people look and feel their best"`
- `brand.profile.values` = `["care", "results", "trust"]`
- `product.description` = `"a monthly skincare and wellness membership"`

**Structured persona the builder would derive (a draft for human review):**

| Field | Derived value (illustrative) | Basis (local only) |
|---|---|---|
| `name` | "Appearance-conscious professional, 25-45" | `targetAudience` |
| `demographics` | Adults 25-45, within 10km, self-care oriented | `targetAudience` |
| `goals` | Look and feel their best without a large time cost | `mission` + `product` |
| `painPoints` | Too busy for a complex routine | `product` (membership convenience) — inference |
| `motivations` | Visible results, trustworthy care | `values` |
| `toneCues` | Warm, results-oriented, non-clinical | `voice` + `targetAudience` |
| `channels` | *(hypothesis)* local social, short-form video | inference — **not measured** |

Every value traces to something the agency already wrote down. Nothing is fetched. The
`channels` row is explicitly a hypothesis for the operator to confirm or overwrite,
because AdOS holds no external audience-behavior data to measure it against.

### 2.3 How it steers creative

Once approved, a selected persona becomes **context** for the existing generators. The
`CreativeSet` service (`domains/creative-studio/.../creative/service.ts`) and the
MarketingBrief service (`domains/marketing-intelligence/.../brief/service.ts`) would
receive the structured persona through the Context Engine rather than a bare
`targetAudience` string, so headline/adCopy/CTA/socialPost/landingPage/email are written
at a named audience. Crucially this is an **input-shaping** change: it feeds richer
context into the *same single-shot generation call* AdOS already makes; it does **not**
add per-asset generators, quality scoring, or a learning loop (those remain separately
scoped and are not claimed here).

---

## 3. Today

**What actually exists is one free-text field and a dead constant. Nothing more.**

### 3.1 ✅ SHIPPED — free-text audience, single string

Audience is captured today as a single free-text string, in two places:

| Location | Field | Cite |
|---|---|---|
| Brand profile | `profile.targetAudience: string` (default `''`) | `domains/agency-os/src/brand/brand.ts:25`, `:64` |
| Marketing brief output | `targetAudience: string` | `domains/marketing-intelligence/src/brief/marketing-brief.ts:42` |

The Brand field is set/edited as plain text — e.g. the brand test updates it to
`'young professionals'` (`domains/agency-os/src/brand/brand.test.ts:83,89`). The brief's
`targetAudience` is likewise a single string the AI emits as part of the brief
(`brief/service.ts:16-19`).

There is **no structure**: no goals, no pain points, no channels, no tone cues, no persona
objects, no persona list, no persona selection, no persona reuse. Audience is a sentence,
not a model.

> **Note (traceability):** the brief generator does not even pass the brand's audience
> string into its prompt — `brief/service.ts:51-60` forwards `clientName`, `industry`,
> `brandVoice`, `brandValues`, `productName`, `productDescription`, `missionBrief`, and
> `budget`, but **not** `targetAudience`. The brief's own `targetAudience` is therefore
> AI-invented per run rather than carried from the Brand. This underlines the absence: no
> component owns audience as first-class, reusable data. Audience is described, then
> discarded, then re-invented — the exact pattern the Persona Builder is designed to end.

The practical effect for an operator today:

| Wanted | Available today |
|---|---|
| Name and reuse an audience across missions | ❌ — audience is re-typed / re-invented each time |
| Target a specific segment of a multi-audience brand | ❌ — one string only |
| Give creative structured goals/pains/tone to write toward | ❌ — a sentence, not a model |
| Confirm/edit an AI-proposed audience before it steers copy | ❌ — no proposal step exists |

### 3.2 ❌ ROADMAP — no persona builder, only a dead event constant

The **only** trace of a persona concept anywhere in the codebase:

```
domains/marketing-intelligence/src/events.ts:10
  INTEL_PERSONA_BUILT_V1: 'intel.persona.built.v1',
```

This constant is part of an event **contract** declaration
(`MARKETING_INTELLIGENCE_EVENTS`). Its status:

| Fact | Detail |
|---|---|
| Emitted anywhere? | ❌ No — no code publishes `intel.persona.built.v1` |
| Producing service? | ❌ None — no persona builder service, no persona aggregate |
| Persona data type? | ❌ None — no `Persona` interface/class exists |
| Subscribed/consumed? | ❌ No handler acts on it |
| Net effect | A declared event name for a stage that was never built |

This mirrors the broader stub pattern documented in `PRODUCT_TRUTH.md` §4/§5, where
several domains carry event-name constants with **0 importers** and no engine behind them.
`INTEL_PERSONA_BUILT_V1` is exactly such a placeholder: a name reserving a future
capability, with nothing behind it.

### 3.3 Today — status ledger

| Capability | Tier | Evidence |
|---|---|---|
| Free-text audience string (Brand) | ✅ SHIPPED | `brand.ts:25,64` |
| Free-text audience string (Brief output) | ✅ SHIPPED | `marketing-brief.ts:42` |
| Structured persona objects | ❌ ROADMAP | none — no `Persona` type |
| Persona builder service / stage | ❌ ROADMAP | none — no producing code |
| `intel.persona.built.v1` emission | ❌ ROADMAP | `events.ts:10` declared, never emitted |
| Persona selection steering creative | ❌ ROADMAP | generators take a string, not a persona |
| External audience data / connectors | ❌ ROADMAP (forbidden) | `PRODUCT_TRUTH.md` §2.5 |

---

## 4. To build

All items in this section are **specification**. None are implemented.

### 4.1 The persona stage (❌ ROADMAP)

1. **Define a `Persona` structured type** (the shape in §2.2) as a first-class record in
   `domains/marketing-intelligence`, owned per Brand and reusable across missions.
2. **Add a builder service** that assembles a prompt from **local inputs only**
   (`brand.profile.targetAudience`, `mission`, `values`, `voice`; `product` fields;
   `Mission.brief`) and issues **one** `ai.submit` call — reusing the existing single-shot,
   local-only inference path (`apps/web/src/ai-factory.ts:23-57`, `ai-live.ts`) with
   standard provenance. No new engine, no cloud, no external fetch.
3. **Emit `INTEL_PERSONA_BUILT_V1`** (`events.ts:10`) when a persona is built, giving the
   already-declared constant a producer for the first time.
4. **Human review gate.** Generated personas are drafts; an operator edits and confirms
   them, consistent with the human-gated pipeline (`PRODUCT_TRUTH.md` §1.3).
5. **Feed the Context Engine.** Approved personas are handed to the
   [Context Engine](../1-ai-foundations/CONTEXT_ENGINE.md) so brief/creative generation
   receives structured audience context instead of a bare string. This is the wiring that
   makes personas *do* something.

### 4.1b Suggested build sequence (design)

A phased path that keeps every intermediate state honest and testable:

| Phase | Deliverable | Result tier after phase |
|---|---|---|
| 1 | `Persona` type + repository (no AI yet); operator hand-authors personas | Structured data exists, still human-authored |
| 2 | Builder service issues one local `ai.submit` to draft personas from local inputs | AI-drafted, human-reviewed personas |
| 3 | Emit `INTEL_PERSONA_BUILT_V1` on build/approve | Event contract (`events.ts:10`) finally has a producer |
| 4 | Context Engine consumes approved personas | Personas steer brief/creative generation |

Nothing in phases 1–4 introduces cloud calls, external data, or per-token cost: every AI
step reuses the shipped local inference path (`ai-factory.ts:23-57`).

### 4.2 Explicitly out of scope for this feature

To keep the boundary honest, the Persona Builder does **not** introduce any of the
following (each is forbidden or separately scoped):

| Not included | Why |
|---|---|
| External audience datasets / data brokers | No external ingestion (`PRODUCT_TRUTH.md` §2.5) — forbidden |
| Connectors / connector-hub feeds | Stub, 0 importers (`PRODUCT_TRUTH.md` §4) — forbidden |
| Document upload / audience Q&A over docs | No document Q&A exists (`PRODUCT_TRUTH.md` §2.1) — forbidden |
| Measured/observed audience behavior | No telemetry source; personas are derived hypotheses only |
| Competitor-derived personas | Competitor Analyzer is separate roadmap, no code |
| Per-asset creative generators | Out of scope — creative remains a single `creative.set` call |

### 4.3 Build ledger

| Work item | Tier | Note |
|---|---|---|
| `Persona` structured type | ❌ ROADMAP | new domain type, local-derived |
| Persona builder service (single local `ai.submit`) | ❌ ROADMAP | reuses shipped local inference path |
| Producer for `intel.persona.built.v1` | ❌ ROADMAP | constant exists (`events.ts:10`), producer does not |
| Human persona review/approval | ❌ ROADMAP | mirrors existing approval discipline |
| Context Engine intake of personas | ❌ ROADMAP | depends on `../1-ai-foundations/CONTEXT_ENGINE.md` wiring |

---

## 5. Relationship to Book A and the Context Engine

- **Book A — Brand domain** ([`../../book-a/BRAND_DOMAIN.md`](../../book-a/BRAND_DOMAIN.md)):
  documents `profile.targetAudience` as today's single free-text audience field and
  already **flags structured personas as Roadmap**. This document is the Book B
  specification of that flagged item; the two agree — personas are not built today.
- **Context Engine** ([`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md)):
  the Persona Builder produces one of the context inputs the Context Engine is designed to
  assemble (Prompt → Mission → Brain → Memory → Experience). Personas would enter as
  structured audience context. Both remain design-stage; neither is on the live generation
  path today.

### 5.1 Position in the creative factory

Within Book B's creative-factory part, the Persona Builder is an **upstream input
shaper**. It sits before the brief and creative stages and enriches what they receive; it
is not itself a generator and does not add generation stages. It answers the question
*"who are we writing to?"* with structured, reusable data, so that the existing
single-shot generators write to a named audience instead of a blur. Because it feeds the
Context Engine rather than calling generators directly, adding personas requires **no
change to the shape of the generation call** — only richer context inside it.

### 5.2 What this document does not claim

For the avoidance of doubt, this document does **not** claim that AdOS today:

- builds, stores, or selects personas of any kind;
- emits `intel.persona.built.v1`;
- derives audience structure from the free-text field;
- pulls audience data from any external source, connector, or document.

Each of the above is ❌ ROADMAP or forbidden. The one shipped fact is the free-text
`targetAudience` string (`brand.ts:25`, `marketing-brief.ts:42`).

No claim in this document contradicts Book A or `PRODUCT_TRUTH.md`.

---

## 6. Value contribution

| Lever | How the Persona Builder moves it |
|---|---|
| **Revenue ↑** | Sharper targeting. Creative written at a named persona (goals, pains, tone cues) converts better than copy aimed at a vague "target audience" sentence, improving campaign outcomes the agency can sell as results. |
| **Production time ↓** | Reusable personas. A persona is built once per brand from data already on file, then reused across every mission and creative set — removing the repeated per-brief re-guessing of audience and giving operators a confirmed, editable starting point instead of a blank string. |

Because the builder consumes only data the agency already holds and reuses the existing
local single-shot inference path, it adds targeting value **without** adding external
dependencies, cost, or cloud exposure.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
