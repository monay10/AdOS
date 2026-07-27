# Mission Injection — Turning the Client's Objective into a First Draft

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |
| **Governing reference** | [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md) |

> **Implementation status:** ✅ **SHIPPED.** Mission Injection is the one injection
> that fully works on the live app path today. The client's natural-language
> objective and budget are flattened into prompt variables and handed to the AI
> Manager at generation time (`domains/marketing-intelligence/src/brief/service.ts:47-62`;
> variables block `apps/web/src/ai-live.ts:157-162`). Everything else in Book B's
> injection stack (memory, brand rules, learned patterns) should join this
> foundation — but only Mission Injection is live.

---

## 1. Why this document exists

AdOS runs a **Mission**: *a client states a business objective in natural language
and the AI Company runs it autonomously* through a human-gated pipeline
(`domains/agency-os/src/mission/mission.ts:73-79`). Before any AI can produce a
brief, ad copy, a campaign draft, or an executive summary, the system must first
**inject the Mission** — the client's intent, budget, target, and deadline — into
the generation request.

Mission Injection is therefore the *root* of the entire generation stack. It is
the step that converts a one-line objective into the structured context a model
needs to reason about. Book B specifies a layered injection pipeline —
`Mission → Brain → Memory → Brand → Prompt Orchestrator → Generation` — and this
document covers the **first and only fully-wired layer** of that stack.

The honest headline: **Mission Injection is the solid foundation the other
injections should join.** The memory injection, brand-rule injection, and learned
-pattern injection are all designed and (mostly) coded, but not yet on the live
path — they are documented in their own sibling files. This one runs today.

For the Mission's full state model, lifecycle, and gates, see Book A →
[`../../book-a/MISSION_ENGINE.md`](../../book-a/MISSION_ENGINE.md). This document
never redefines the Mission; it describes how the Mission's fields reach a prompt.

---

## 2. Target design — what Mission context feeds generation

The Mission aggregate carries the fields a generator needs to turn intent into a
first draft. The target design injects each of them:

| Mission field | Source on the aggregate | What it contributes to generation |
|---|---|---|
| **Brief text** (NL objective) | `mission.brief` (`mission.ts`) | The client's stated objective in their own words — the primary reasoning input |
| **Budget** | `mission.budget` — `{ amountMinor, currency, period }` | Spend envelope that constrains channel mix and budget allocation |
| **Target metric** | `mission.targetMetric` — `{ metric, target }` | The success measure the campaign must move (one of the six KPIs) |
| **Deadline** | `mission.deadline` (ISO date string) | The time horizon the plan must fit |
| **Approval gates** | `mission.approvalGates` | Which human sign-offs the pipeline must respect: `strategy_and_budget`, `creative_assets`, `campaign_launch` |

The design intent is that a single generation request carries **all** of these, so
the model reasons under the same constraints a human strategist would: *"Produce a
brief that hits this target, within this budget, by this deadline."* The gates are
not injected into the prompt (the model does not decide approvals) — they govern
what the pipeline does with the generated artifact **after** the model returns, and
are enforced by the human approval workflow (Book A →
[`APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md)).

### 2.1 The injection path (target)

```
Mission aggregate
   │  mission.brief, mission.budget, mission.targetMetric, mission.deadline
   ▼
MarketingContext            (domain-shaped request object)
   │
   ▼
service.ai.submit({ variables: { … } })   ← mission fields flattened here
   │
   ▼
AI Manager → buildMessages()               ← formatVariables() renders a
   │                                          key/value block into the user turn
   ▼
Local model (or offline deterministic stub) → structured first draft
```

The principle is **flatten, don't nest**: the Mission's fields are lifted into a
flat `variables` map keyed by plain names (`missionBrief`, `budget`, …) rather than
passed as a nested object, because the prompt renderer emits one readable
`- key: value` line per variable (`apps/web/src/ai-live.ts:157-162`). Flat keys
produce a clean, model-legible context block.

---

## 3. Today — how the wired path does it ✅ SHIPPED

This section describes **live behavior**. Every claim traces to wired code.

### 3.1 The Mission fields that flow today

When a human triggers brief generation, the web layer reads the Mission and
assembles a `MarketingContext`, flattening the Mission's fields alongside client,
brand, and product context (`apps/web/src/routes.ts:921-935`):

```ts
const generated = await app.briefs.generate({
  tenantId: session.tenantId,
  missionId: id,
  clientId: mission.clientId,
  clientName: client.name,
  industry: client.industry,
  brandVoice: brand.profile.voice,
  brandValues: [...brand.profile.values],
  productName: product.name,
  productDescription: product.description,
  missionBrief: mission.brief,                 // ← the NL objective
  ...(mission.budget
    ? { budget: { amountMinor, currency, period } }  // ← the budget envelope
    : {}),
});
```

The Marketing Brief Service then submits those fields to the AI Manager as prompt
**variables** (`domains/marketing-intelligence/src/brief/service.ts:47-62`):

```ts
result = await this.ai.submit<MarketingBriefContent>({
  capability: 'reasoning',
  submittedBy: 'marketing-intelligence.brief',
  promptRef: { key: 'marketing.brief', version: 1 },
  variables: {
    clientName: context.clientName,
    industry: context.industry,
    brandVoice: context.brandVoice,
    brandValues: context.brandValues,
    productName: context.productName,
    productDescription: context.productDescription,
    missionBrief: context.missionBrief,   // ← mission objective injected
    budget: context.budget,               // ← mission budget injected
  },
  responseSchema: BRIEF_SCHEMA,
});
```

### 3.2 How a variable becomes prompt text

The AI Manager's live path turns the `variables` map into a readable context block
in the user turn (`apps/web/src/ai-live.ts:157-162`):

```ts
function formatVariables(vars: Record<string, unknown>): string {
  return Object.entries(vars)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join('\n');
}
```

That block is prepended to the user message as *"Here is the context: …"*
(`apps/web/src/ai-live.ts:147-151`), under a role/system instruction selected by
the `promptRef` (`ai-live.ts:123-134`). The model therefore sees the client's
objective and budget as explicit, labeled context — not buried in a template.

This same variable mechanism carries **language injection** (`ai-live.ts:139-141`)
and **schema-as-text injection** (`ai-live.ts:142-144`), so Mission Injection
composes cleanly with the other shipped prompt-shaping steps.

### 3.2.1 Worked example — what the model actually sees

Given a Mission whose objective is *"Grow trial sign-ups for our new B2B
analytics plan"* with a budget of ₺50,000/month, the injected user turn renders
approximately as:

```
Here is the context:
- clientName: Northwind Analytics
- industry: B2B SaaS
- brandVoice: confident, data-driven, no hype
- brandValues: transparency, rigor
- productName: Insight Plan
- productDescription: self-serve analytics for mid-market teams
- missionBrief: Grow trial sign-ups for our new B2B analytics plan
- budget: {"amountMinor":5000000,"currency":"TRY","period":"month"}

Respond with the JSON object.
```

Two properties of this rendering matter. First, the `filter` on
`ai-live.ts:158` drops any variable that is `undefined`, `null`, or empty string —
so an unset budget simply does not appear, and the model is never fed a dangling
`budget:` line. Second, non-string values (the budget object) are `JSON.stringify`-d
inline (`ai-live.ts:160`), which is why flat, primitive keys read most cleanly and
why the target design (§2) prefers flattening over deep nesting.

### 3.2.2 The offline deterministic path

By default AdOS runs the **offline deterministic** AI (`apps/web/src/ai.ts:13`),
not a live model. Under that default, Mission Injection still occurs — the same
`variables` map is submitted through the same service call — but the stub produces a
deterministic, template-shaped brief rather than genuine model prose (zero token
usage, `model: 'offline-deterministic'`). Genuine model reasoning over the injected
mission requires a locally-run engine (Ollama or an OpenAI-compatible local server,
`apps/web/src/ai-factory.ts:23-57`). Either way, **no cloud endpoint and no API key
is involved** — mission context never leaves the operator's infrastructure. This is
a core AdOS guarantee (see [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md)).

### 3.3 Live-path status ledger

| Behavior | Tier | Evidence |
|---|---|---|
| NL objective (`missionBrief`) injected into the brief prompt | ✅ SHIPPED | `brief/service.ts:47-62`, `routes.ts:931` |
| Budget injected into the brief prompt | ✅ SHIPPED | `brief/service.ts:47-62`, `routes.ts:932-934` |
| Variables rendered as a readable prompt block | ✅ SHIPPED | `ai-live.ts:157-162` |
| Role/system instruction chosen per `promptRef` | ⚠️ PARTIAL ✅ | hardcoded `ROLES` map, `ai-live.ts:123-134` |
| Provenance recorded on the resulting artifact | ✅ SHIPPED | `brief/service.ts:78-84` |
| `targetMetric` / `deadline` threaded into the prompt | ❌ not yet | see §4 — on the aggregate, not in the variables map |
| Brand **rules** / banned words injected | 🔶 separate doc | flat `brandVoice` only; see `BRAND_INJECTION.md` |
| Company-Brain / experience memory injected | ❌ separate doc | generators take no brain port; see `MEMORY_INJECTION.md` |

### 3.4 What Mission Injection carries — and what it does NOT

Mission Injection today carries **mission fields only** (plus the flat client /
brand / product descriptors that accompany them). It explicitly does **not** carry:

- **Brand rules or brand safety.** Only the flat `brandVoice` string and
  `brandValues` list ride along; the brand's banned-word list and enforcement rules
  are **not** injected. Wiring them is a separate concern — see the sibling
  `BRAND_INJECTION.md` — and corresponds to Book A walkthrough gap **B-1**
  (bannedWords enforcement).
- **Memory or learned patterns.** No Company-Brain content, past-campaign
  experience, or winning-pattern data is read back into generation. The brief
  generator takes no memory port; this is Book A walkthrough gap **B-2** (learning
  read-back), covered in `MEMORY_INJECTION.md`.

Keeping these boundaries explicit is deliberate: Mission Injection is a clean,
narrow, working seam. The other injections should **join** it at the same
`variables` (or a richer context object) — they should not be conflated with it.

### 3.5 Design principles the shipped path already honors

The live implementation, small as it is, gets three things right that the rest of
the injection stack should preserve as it is wired in:

1. **The service owns the injection, not the model layer.** Each domain service
   decides *which* mission fields it needs and submits them as named variables
   (`brief/service.ts:47-62`). The AI Manager is generic — it renders whatever
   variables it is given (`ai-live.ts:157-162`) and knows nothing about missions.
   This keeps mission semantics in the domain and keeps the model layer reusable.
2. **Injection is explicit and inspectable.** Because variables become a labeled
   `- key: value` block, the exact mission context a model saw for any generation is
   reconstructable from the request. There is no hidden or implicit context.
3. **Absent fields degrade gracefully.** The empty-value filter (§3.2.1) means an
   incomplete Mission still generates; missing budget or (future) deadline simply
   narrows the context rather than failing the call.

These principles are the contract the memory, brand, and pattern injections must
satisfy when they attach to this seam.

---

## 4. To build — richer mission framing 🔶

Mission Injection works, but it injects a subset of the Mission today. The build
work here is **minor** and additive; it does not require re-architecting the live
path.

### 4.1 Thread `targetMetric` and `deadline` through

The Mission aggregate already holds `targetMetric` and `deadline`
(`mission.ts:41-42`, validated at `mission.ts:247-248`), and Book A documents them
as first-class Mission fields. But the web layer's `MarketingContext` assembly
(`routes.ts:921-935`) currently spreads only `budget`; the `MarketingContext` type
(`marketing-brief.ts:18-29`) does not yet carry `targetMetric` or `deadline`.

The build: extend `MarketingContext` and the `variables` map so the model reasons
explicitly under the success metric and time horizon it must hit. This is a small,
well-bounded change entirely within the existing shipped path — no new engine, no
new stack. Tag: 🔶 (design specified; wiring is Book B build work).

### 4.2 Richer mission framing once the Context Engine is wired 🔶

The deeper upgrade is to move mission framing from a flat key/value block into a
structured **context object** produced by the Context Engine. That engine already
exists in the codebase, unwired
(`domains/executive-memory/src/context-builder.ts:37-86`), and is designed to
assemble a layered context (`Prompt → Mission → Brain → Memory → Experience`). When
it is wired into the live pipeline, Mission Injection becomes the **first layer** of
that assembled context rather than a hand-built variables map — and the memory,
brand, and pattern injections attach as further layers on top of it.

Until then, the shipped flat-variable path is the source of truth: it is simpler,
deterministic, and already carries the two most load-bearing mission fields
(objective + budget). The Context Engine wiring is documented as 🔶 **BUILT
(UNWIRED)** — the architecture already exists as
`domains/executive-memory/src/context-builder.ts`; activating it into the live
generation path is Book B build work.

### 4.3 To-build ledger

| Item | Tier | Note |
|---|---|---|
| Thread `targetMetric` into brief variables | 🔶 to wire | field exists on aggregate; extend `MarketingContext` |
| Thread `deadline` into brief variables | 🔶 to wire | field exists on aggregate; extend `MarketingContext` |
| Structured mission context via Context Engine | 🔶 BUILT (UNWIRED) | `executive-memory/src/context-builder.ts:37-86` — exists, not on live path |
| Mission injection into the other four services | ✅/design | brief injects today; creative/campaign/report/executive receive their own upstream artifacts, not raw mission fields — extend as the layered context lands |

---

## 4bis. Mission Injection across the five-artifact pipeline

The pipeline produces five AI artifacts in sequence: brief → creative → campaign
draft → report → executive summary (`apps/web/src/routes.ts`, Book A →
[`CAMPAIGN_LIFECYCLE.md`](../../book-a/CAMPAIGN_LIFECYCLE.md)). It is worth being
precise about where **raw mission fields** are injected versus where the pipeline
carries mission intent forward implicitly:

| Stage | AI artifact | How mission intent reaches it today |
|---|---|---|
| 1 | **Marketing Brief** | Raw mission fields injected directly (`missionBrief`, `budget`) — ✅ this document |
| 2 | **Creative Set** | Receives the **approved brief**, not raw mission fields (`routes.ts:961-967`) — mission intent flows through the brief |
| 3 | **Campaign Draft** | Receives brief + creative context — mission intent flows downstream |
| 4 | **Campaign Report** | Receives campaign + hand-entered metrics (`routes.ts:1037`) |
| 5 | **Executive Summary** | Synthesizes the completed campaign for leadership (`routes.ts:1070`) |

The key insight: **only the brief injects raw mission fields.** Every downstream
stage inherits mission intent *transitively*, through the artifact its predecessor
produced. This is why the brief is the load-bearing injection point — an error or
omission in Mission Injection propagates through all five artifacts, and an
improvement there benefits all five. The layered-context target design (§4.2) would
let later stages also see the original mission context directly rather than only its
downstream reflections; that is future work, tagged 🔶.

---

## 5. Consistency with Book A

This document reuses Book A's vocabulary exactly and never redefines it:

- **Mission states** (`mission.ts`, Book A §3.1):
  `submitted | planning | awaiting_approval | executing | paused | completed | failed`.
  Mission Injection is invoked while a Mission is being driven from `submitted`
  through `planning`; the brief generation call advances the mission via `plan()`
  and `requestApproval('strategy_and_budget')` (`routes.ts:939-940`).
- **Approval gates** (defaults `['strategy_and_budget', 'campaign_launch']`,
  `mission.ts:110`; full set `strategy_and_budget`, `creative_assets`,
  `campaign_launch`). Gates are respected by the pipeline **after** generation —
  they are not injected into the prompt.
- **Provenance.** Every artifact produced from an injected mission carries
  `provenance{ taskId, capability, model, engine, latencyMs }`
  (`brief/service.ts:78-84`), consistent with Book A.

For the authoritative state machine, transition rules, and the *"one NL sentence
replaces multi-day briefing"* framing, see
[`../../book-a/MISSION_ENGINE.md`](../../book-a/MISSION_ENGINE.md).

---

## 6. Value contribution

**Production time ↓ (core throughput win).** Mission Injection is the mechanism
that turns a **one-line objective** into a **structured first draft**. A single
natural-language sentence plus a budget — the entire client input — is flattened
into prompt context and returns a complete, schema-shaped marketing brief in one
generation call. This collapses the classic multi-day briefing-and-drafting cycle
(strategist + copywriter + planner) into a single automated step that a human then
reviews and approves.

Because this is the **root injection** on which every later artifact depends
(creative, campaign, report, executive all descend from the brief), improving it
compounds: every hour saved at the brief stage is an hour saved for the whole
pipeline. This is precisely the throughput win Book A attributes to the brief→draft
cycle — and Mission Injection is the wired seam that delivers it today.

**Revenue ↑ (secondary).** Faster brief→draft cycles let an agency carry more
concurrent missions with the same headcount — more campaigns produced per unit of
human time.

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
