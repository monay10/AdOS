# The Prompt Orchestrator — Turning Context Into the Model Call

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`AI_CONSTITUTION.md`](./AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ⚠️ **PARTIAL — shipped + built-unwired.** A minimal
> orchestrator ships today (a hardcoded `ROLES` map compiled by `buildMessages`,
> `apps/web/src/ai-live.ts:123-154`). The full versioned **Prompt Registry** it is
> meant to become is **🔶 BUILT (UNWIRED)** — it exists and is unit-tested at
> `domains/prompt-registry/src/in-memory-prompt-registry.ts:55-92` but no live app
> path imports it; prompts are hardcoded instead.

---

## 1. What the Prompt Orchestrator is

Every competitor pattern reduces to **Prompt → LLM → Output**: a single string is
concatenated in business logic and handed to a model. AdOS is designed differently.
The **Prompt Orchestrator** is the layer that sits between the assembled *context*
(mission fields, brand, memory, schema, language) and the actual *model call*. Its
job is to decide **which prompt, which version, which role, and which shape** the
model sees — and to do so from a governed, versioned catalogue rather than from
literals scattered through services.

A complete Prompt Orchestrator has five responsibilities:

| # | Responsibility | What it means |
|---|---|---|
| 1 | **Versioned templates** | Every prompt is a first-class record with a `key`, a `version`, and `{{variable}}` slots — never a string literal in a service. |
| 2 | **Render** | Interpolate request variables into the chosen template to produce the message array the model receives. |
| 3 | **Role / model selection** | Pick the system persona and (optionally) the model for the capability being served. |
| 4 | **A/B scoring** | Record an outcome reward per prompt version so the winning version emerges from real results, not a guess. |
| 5 | **Schema + language injection** | Constrain output shape (JSON Schema) and output language deterministically at compose time. |

Responsibilities 1–4 are the domain of the **Prompt Registry**. Responsibility 5 is
partly shipped inside the live message builder. Today those two halves are **not
connected**: the live path performs (3) and (5) from hardcoded material, while the
Registry that would supply (1), (2), and (4) sits dormant beside it.

The contract that defines this layer states the intent in one line:

> *"Prompts are NEVER hardcoded in business logic; agents/capabilities reference
> them by key."* — `packages/contracts/src/ai/prompt.ts:6-7`

Today's code violates that intent on purpose, as a starting point. Closing the gap is
this document's build spec.

### 1.1 Shipped orchestrator vs. the target — at a glance

| Dimension | Today (⚠️ PARTIAL ✅) | Target (registry wired) |
|---|---|---|
| Prompt storage | object literal in source (`ai-live.ts:123-134`) | versioned records in the registry (`prompt.ts:9-19`) |
| Number of prompts per artifact | exactly one | many versions, A/B-selected |
| Body tuning | requires a code edit + redeploy | `publish` a new version at runtime |
| Variable binding | ad-hoc `- key: value` block (`:157-162`) | `{{var}}` interpolation into the body (`:87-92`) |
| Version awareness | `promptRef.version` **dropped** (`:138`) | `selectActive` honours it (`:79-84`) |
| Feedback | none | EMA `score` off approvals (`:66-75`) |
| Language + schema inject | ✅ present (`:139-144`) | ✅ preserved as a decorator |

---

## 2. Where the orchestrator sits in the pipeline

Book B specifies AdOS as a small agent pipeline (see [`AI_CONSTITUTION.md`](./AI_CONSTITUTION.md)):

```
Campaign Brief → Planning → Research → Memory → Brand →
  ┌───────────────────────────────────────────────┐
  │  PROMPT ORCHESTRATOR  (this document)          │
  │  context ──► select template ──► render ──►    │
  │  inject schema+language ──► role/model ──►     │
  │  message array                                 │
  └───────────────────────────────────────────────┘
        │
        ▼
   Generation (local engine) → Quality → Brand Safety → Revision → Approval → Learning
```

The orchestrator is the **last step before the model** and the **first step after**
context assembly. Everything upstream (the Context Engine — see §6) decides *what the
model should know*; the orchestrator decides *how that knowledge is phrased into an
actual model call*. The Learning Engine downstream feeds A/B rewards back into the
orchestrator's `score` so the next call uses a better-performing prompt version.

---

## 3. Today — what ships (⚠️ PARTIAL ✅)

The live path is `apps/web` → `ai-factory.ts` → `LiveAIManager` (`ai-live.ts:26`,
local engines only) or the deterministic `OfflineAIManager` default
(`apps/web/src/ai.ts:13`). Inside `LiveAIManager`, the entire prompt-composition
step is a single function, `buildMessages` (`ai-live.ts:136-154`), fed by a hardcoded
map. This is a **real, working orchestrator** — just a minimal one.

### 3.1 The hardcoded `ROLES` map

Five system personas are compiled into the source as an object literal
(`ai-live.ts:123-134`), one per pipeline artifact:

| `promptRef.key` | Persona (system role, verbatim intent) | Artifact served |
|---|---|---|
| `marketing.brief` | senior marketing strategist | MarketingBrief |
| `creative.set` | senior advertising creative director | CreativeSet |
| `campaign.draft` | paid-media campaign planner | CampaignDraft |
| `analytics.report` | performance-marketing analyst | CampaignReport |
| `executive.dashboard` | chief marketing officer | ExecutiveReport |

Each of the five services submits a `promptRef` when it calls `ai.submit(...)` — for
example the brief service passes `promptRef: { key: 'marketing.brief', version: 1 }`
(`domains/marketing-intelligence/src/brief/service.ts:50`). So the **calling
convention is already registry-shaped**: services name a `key` *and a `version`*.
But `buildMessages` uses only `request.promptRef.key` to index the literal `ROLES`
map (`ai-live.ts:138`) — the `version` is **ignored**, and the prompt body comes from
the hardcoded string, not from any stored template. The versioning intent is wired at
the call site and dropped at the compose site.

### 3.2 `buildMessages` — the shipped compose step

`buildMessages(request, language)` (`ai-live.ts:136-154`) assembles the message array
in four deterministic moves:

| Move | Code | Behaviour |
|---|---|---|
| **Role selection** | `ai-live.ts:138` | `ROLES[promptRef.key]`, falling back to `'You are a helpful assistant.'` when the key is unknown. |
| **Language injection** | `ai-live.ts:139-141` | Appends `"Write ALL natural-language text values in {language}. Keep JSON keys in English."` when a language is resolved. Drives bilingual TR/EN output. |
| **Schema-as-text injection** | `ai-live.ts:142-144` | Appends the request's `responseSchema` serialized as JSON with an instruction to *"Return ONLY a single JSON object that satisfies this JSON Schema"*. |
| **Variables block** | `ai-live.ts:147-151` + `formatVariables` `:157-162` | Renders request variables as a readable `- key: value` list into the **user** turn. |

The composed result is `[system, user, ...request.messages]` (`ai-live.ts:153`): a
single system message carrying role + language + schema, one user message carrying the
context block, and any caller-supplied turns appended after.

**Worked example — the message array a brief actually produces today.** When the brief
service submits `promptRef: { key: 'marketing.brief', version: 1 }` with a resolved
language of Turkish and a `responseSchema`, `buildMessages` composes:

```
system: "You are a senior marketing strategist. Produce a concise, actionable
         marketing brief.
         Write ALL natural-language text values in Turkish. Keep JSON keys in English.
         Return ONLY a single JSON object that satisfies this JSON Schema
         (no prose, no markdown fences): {…schema…}"
user:   "Here is the context:
         - objective: <mission objective>
         - brandVoice: <flat brand voice string>
         …
         Respond with the JSON object."
```

Note what is present (role, language, schema, mission variables) and what is absent
(no template version body, no `{{var}}` interpolation, no brand rules or memory). The
`version: 1` the service passed never influenced a single character of the output — it
was read past at `ai-live.ts:138`. That single dropped field is the seam §5 restores.

**Two honest limits of the shipped step**, both important to Book B:

1. **Schema injection is advisory, not enforced** (⚠️ PARTIAL ✅). The schema is
   passed to the model *as prompt text* (`ai-live.ts:142-144`); nothing validates the
   reply against it here. JSON is merely *extracted* from the reply afterward
   (`extractJson`, `ai-live.ts:179-198`) with a single self-repair retry
   (`ai-live.ts:49-67`). Schema-**enforced** validation exists only in the unwired
   stack (`packages/ai-manager/src/runtime/validation-engine.ts:62-118`).
2. **Prompts are literals.** There is no template store, no interpolation of
   `{{variables}}` into a prompt body, no version selection, and no scoring on the
   live path. Variables are rendered into a generic user block, not into a tuned,
   versioned template.

### 3.3 Shipped orchestrator — status ledger

| Capability | Tier | Evidence |
|---|---|---|
| Role selection from `promptRef.key` | ✅ SHIPPED | `ai-live.ts:123-134,138` |
| `buildMessages` message assembly | ✅ SHIPPED | `ai-live.ts:136-154` |
| Language injection | ✅ SHIPPED | `ai-live.ts:139-141` |
| Schema injection **as prompt text** | ⚠️ PARTIAL ✅ (not enforced) | `ai-live.ts:142-144` |
| Variables → user context block | ✅ SHIPPED | `ai-live.ts:147-162` |
| Versioned templates / render `{{var}}` | 🔶 BUILT (UNWIRED) | see §4 |
| A/B version selection + scoring | 🔶 BUILT (UNWIRED) | see §4 |

---

## 4. Built-unwired — the Prompt Registry (🔶)

The full orchestrator that AdOS is designed around **already exists in the codebase,
is unit-tested, and is not on any live path**. It is the `InMemoryPromptRegistry`
(`domains/prompt-registry/src/in-memory-prompt-registry.ts`), implementing the
`PromptRegistryPort` contract (`packages/contracts/src/ai/prompt.ts:21-28`).

> **Wiring status:** `apps/web` never imports `domains/prompt-registry`. The registry
> is instantiated only by unit tests and (optionally) by `ai-manager` internals. It is
> **built-and-tested-but-inactive**: the architecture is present; wiring it into the
> live pipeline is Book B build work. Nothing in §4 runs in the shipped app today.

### 4.1 The template record

A prompt is a versioned, scorable record (`prompt.ts:9-19`):

| Field | Type | Purpose |
|---|---|---|
| `key` | `string` | Logical name, e.g. `creative.set`, `ceo.system`. |
| `version` | `number` | Monotonic version — the unit of A/B testing. |
| `content` | `string` | Template body carrying `{{variable}}` slots. |
| `score?` | `number` (0..100) | A/B performance, accumulated by the Learning Engine. |
| `metadata?` | `Record<string,unknown>` | Free-form routing/experiment tags. |
| `active` | `boolean` | Whether the version is eligible to serve. |
| `createdAt` | `string` | Publish timestamp (injected clock for deterministic tests). |

### 4.2 What the registry can already do

| Method | Location | Behaviour (built, tested) |
|---|---|---|
| `publish` | `:24-32` | Stores a template under `key → version → template`, stamped `active` + `createdAt`. Supports many versions per key. |
| `list` | `:34-38` | Returns all versions of a key, newest-version first. |
| `get` | `:40-53` | Returns an exact version, or — when no version is given — the **ACTIVE** version via `selectActive`. |
| `render` | `:55-64` | Fetches the chosen template and **interpolates** `{{var}}` slots with request variables, returning an `AIMessage[]` (system turn first; `---` separators split multi-role templates). |
| `score` | `:66-75` | Records an A/B outcome reward, updating the version's score by an **exponential moving average** (`prior*0.8 + reward*0.2`). |

Two pure helpers complete the design:

- **`selectActive`** (`:79-84`) — the **A/B winner selector**: highest `score` wins;
  ties and never-scored versions fall back to the latest version. This is how a
  better-performing prompt version becomes the one served, *without a code change*.
- **`interpolate`** (`:87-92`) — replaces `{{ var }}` placeholders from a variables
  map, leaving unknown placeholders untouched.

### 4.3 The loop the registry is designed to close

Because `get`/`render` default to `selectActive`, and `score` moves each version's EMA
toward its real outcomes, the registry is a self-improving selector:

```
publish v1, v2, v3  ──►  selectActive() serves the current winner
        ▲                              │
        │                              ▼
   score(key, ver, reward)  ◄──  outcome of the generated artifact
   (EMA: prior*0.8 + reward*0.2)
```

Over many missions the highest-`score` version wins traffic automatically. **None of
this executes today** — no live caller invokes `render` or `score`; the winning-version
machinery sits idle. Compare the shipped path (§3), which has one hardcoded string per
key, no versions, and no scoring.

### 4.4 Registry capability ledger

| Capability | Tier | Evidence |
|---|---|---|
| Versioned template store | 🔶 BUILT (UNWIRED) | `in-memory-prompt-registry.ts:24-53` |
| `{{var}}` render / interpolation | 🔶 BUILT (UNWIRED) | `:55-64`, `:87-92` |
| A/B winner selection (`selectActive`) | 🔶 BUILT (UNWIRED) | `:79-84` |
| EMA A/B scoring (`score`) | 🔶 BUILT (UNWIRED) | `:66-75` |
| Registry-driven live prompts | ❌ not wired | `apps/web` imports none of the above |

---

## 5. To build — wiring the registry into the live path

The build goal is to **replace the hardcoded `ROLES` + literal schema/role material in
`buildMessages` with registry-served, versioned templates**, while preserving the
already-good language and schema-injection behaviour. Sequenced:

### Step 1 — Seed the registry from today's constants
Publish the five `ROLES` personas (`ai-live.ts:123-134`) as `key`/`version 1`
templates via `publish`, so the current behaviour is reproduced *from the store* with
zero output change. The call sites already pass `promptRef.version`
(`brief/service.ts:50`), so no service signature changes.

### Step 2 — Route `buildMessages` through `render`
Have `LiveAIManager` hold a `PromptRegistryPort` and, in place of
`ROLES[promptRef.key]`, call `registry.render(key, variables, version)`
(`in-memory-prompt-registry.ts:55-64`). Move campaign context out of the ad-hoc
`formatVariables` block and into `{{variable}}` slots inside the template body so
prompts become **tunable without redeploys**.

### Step 3 — Keep language + schema injection as a compose stage
Retain the shipped language line (`ai-live.ts:139-141`) and schema-as-text append
(`:142-144`) as a **post-render decorator** over the registry output. (Turning schema
*advisory* text into schema-*enforced* validation is a separate build — the engine
exists unwired at `validation-engine.ts:62-118`; see the Validation Pipeline doc.)

### Step 4 — Default to the A/B winner
Call `render`/`get` **without** an explicit version so `selectActive` (`:79-84`) serves
the current winner. Pin a version only for a controlled experiment via `metadata`.

### Step 5 — Feed outcomes back with `score`
On artifact approval/rejection in the pipeline
(`domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481`),
translate the human verdict into a reward and call `registry.score(key, version, reward)`
(`:66-75`). This closes the A/B loop — the winning prompt version emerges from real
approvals. (This composes with, but is distinct from, the broader campaign-memory
read-back gap tracked as Book A gap **B-2**.)

### Build ledger

| Build task | From (today) | To (target) | Tier now |
|---|---|---|---|
| Prompt source | hardcoded `ROLES` `ai-live.ts:123-134` | `publish`ed templates | 🔶 → ✅ |
| Compose | `buildMessages` literals `:136-154` | `registry.render` `:55-64` | 🔶 → ✅ |
| Version choice | `version` ignored `:138` | `selectActive` `:79-84` | 🔶 → ✅ |
| Scoring | none | `score` on approval `:66-75` | 🔶 → ✅ |
| Schema enforcement | advisory text `:142-144` | validation engine | 🔶 (separate doc) |

### What deliberately does **not** change

To keep the wiring honest and low-risk, three shipped behaviours are preserved
verbatim so activating the registry cannot regress live output:

1. **The five service call sites are untouched.** They already submit `promptRef`
   (`brief/service.ts:50`); Step 1 seeds the registry so the *same* keys resolve to the
   *same* text on day one.
2. **The offline deterministic default is unaffected.** `OfflineAIManager`
   (`apps/web/src/ai.ts:13`) never calls `buildMessages`; wiring lives entirely in the
   `LiveAIManager` local-engine path.
3. **No cloud, no API key, no telemetry** is introduced — the registry is a local,
   in-memory adapter (`in-memory-prompt-registry.ts:18-22`) with an injected clock;
   it makes no network call.

### Risks and how the design contains them

| Risk | Containment |
|---|---|
| A bad prompt version wins traffic | `score` uses an EMA (`:73`) so a single poor outcome cannot flip the winner; `selectActive` (`:79-84`) needs a sustained score edge. |
| Registry empty for a key at call time | Preserve the shipped fallback `'You are a helpful assistant.'` (`ai-live.ts:138`) as a hard default when `get` throws `NotFoundError` (`:43`). |
| Output drift on rollout | Step 1 reproduces today's exact strings as `version 1`, so the first live run is byte-identical. |

---

## 6. How orchestration composes with the Context Engine

The orchestrator does **not** decide *what facts* the model should know — that is the
**Context Engine** (Prompt → Mission → Brain → Memory → Experience), which itself is
🔶 BUILT (UNWIRED) at `domains/executive-memory/src/context-builder.ts:37-86`. The two
compose cleanly:

| Layer | Owns | Output |
|---|---|---|
| **Context Engine** (🔶) | *What the model knows* — mission fields, brand voice/rules, recalled memory, prior-campaign experience | a variables map + evidence |
| **Prompt Orchestrator** (⚠️/🔶) | *How that is phrased* — template selection, render, role, schema+language | an `AIMessage[]` model call |

In the target design the Context Engine produces the variables map; the orchestrator's
`render(key, variables, version)` interpolates it into the winning template. Today the
seam is stubbed: the shipped path receives only the flattened **mission** variables
(mission injection, `brief/service.ts:47-62`) plus a flat `brandVoice` value — brand
rules/safety and memory recall are **not** injected, because the Context Engine that
would supply them is unwired. Wiring the registry (§5) and wiring the Context Engine
are complementary halves of the same seam.

---

## 7. Value contribution

| Lever | Mechanism | Effect |
|---|---|---|
| **Production time ↓** | Reusable, versioned, tuned prompts served from the registry (`render`, `:55-64`) replace re-authoring prompt strings in code. Prompt improvements ship as a `publish`, not a redeploy. | Faster iteration on every artifact; fewer engineering cycles per prompt change. |
| **Revenue ↑** | A/B scoring (`score` EMA, `:66-75`) + winner selection (`selectActive`, `:79-84`) route generation to the **highest-performing prompt version** automatically, off real campaign approvals. | Better first-draft creative and campaign quality → higher approval-through rate and better-performing output → agency revenue. |

Both levers are **latent today**: the machinery exists (🔶) but the live path still uses
one static string per artifact (⚠️ PARTIAL ✅). The value is unlocked by the §5 wiring —
that is the point of documenting the gap precisely rather than claiming it closed.

---

## 8. Related Book B documents

- Governing reference: [`AI_CONSTITUTION.md`](./AI_CONSTITUTION.md) — the two-stack
  (WIRED vs UNWIRED) reality and the three-tier status model.
- Source of truth: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md).
- Roadmap: [`../../ROADMAP.md`](../../ROADMAP.md) · Known limits:
  [`../../KNOWN_LIMITATIONS.md`](../../KNOWN_LIMITATIONS.md).
- Book A gaps referenced: **B-2** (learning read-back) — see
  [`../../book-a/BOOK_A_AGENCY_CONSTITUTION.md`](../../book-a/BOOK_A_AGENCY_CONSTITUTION.md).

---

## 9. Appendix — cited source map

Every claim in this document traces to one of the following real repository paths.

| Concern | Path | Lines | Tier |
|---|---|---|---|
| Live message builder (`buildMessages`) | `apps/web/src/ai-live.ts` | 136-154 | ⚠️ PARTIAL ✅ |
| Hardcoded `ROLES` map | `apps/web/src/ai-live.ts` | 123-134 | ✅ SHIPPED |
| Language injection | `apps/web/src/ai-live.ts` | 139-141 | ✅ SHIPPED |
| Schema-as-text injection | `apps/web/src/ai-live.ts` | 142-144 | ⚠️ PARTIAL ✅ |
| Variables block / `formatVariables` | `apps/web/src/ai-live.ts` | 147-162 | ✅ SHIPPED |
| JSON extraction + self-repair | `apps/web/src/ai-live.ts` | 49-67, 179-198 | ✅ SHIPPED |
| Service submits `promptRef` (+version) | `domains/marketing-intelligence/src/brief/service.ts` | 47-62 | ✅ SHIPPED |
| Offline deterministic default | `apps/web/src/ai.ts` | 13 | ✅ SHIPPED |
| Prompt template contract | `packages/contracts/src/ai/prompt.ts` | 9-30 | contract |
| Registry `publish`/`list`/`get` | `domains/prompt-registry/src/in-memory-prompt-registry.ts` | 24-53 | 🔶 BUILT (UNWIRED) |
| Registry `render` (`{{var}}`) | `domains/prompt-registry/src/in-memory-prompt-registry.ts` | 55-64 | 🔶 BUILT (UNWIRED) |
| Registry `score` (EMA) | `domains/prompt-registry/src/in-memory-prompt-registry.ts` | 66-75 | 🔶 BUILT (UNWIRED) |
| `selectActive` (A/B winner) | `domains/prompt-registry/src/in-memory-prompt-registry.ts` | 79-84 | 🔶 BUILT (UNWIRED) |
| `interpolate` helper | `domains/prompt-registry/src/in-memory-prompt-registry.ts` | 87-92 | 🔶 BUILT (UNWIRED) |
| Context Engine (composes upstream) | `domains/executive-memory/src/context-builder.ts` | 37-86 | 🔶 BUILT (UNWIRED) |
| Schema-enforced validation | `packages/ai-manager/src/runtime/validation-engine.ts` | 62-118 | 🔶 BUILT (UNWIRED) |
| Approval hook (score feedback point) | `apps/web/src/routes.ts` | 478-481 | ✅ SHIPPED |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
