# Creative Brief Generator — The Bridge from Strategy to Creative

**Owner:** Office of the Chief AI Architect
**Source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md)
**Governing reference:** [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Status:** Official — aligned to `PRODUCT_TRUTH.md`

> **Implementation status:** ✅ **SHIPPED** — the `MarketingBrief` is generated
> today (`domains/marketing-intelligence/src/brief/service.ts:43-96`) and its
> strategic content is handed to creative as a `CreativeContext`
> (`apps/web/src/routes.ts:961-972`); that handoff *is* the working
> brief→creative bridge. ⚠️ **PARTIAL / ❌ ROADMAP** — there is **no distinct,
> standalone "creative brief" artifact** separate from the `MarketingBrief`, and
> **no brief-quality gating** before creative runs.

---

## 0. Why this document exists

Every piece of on-strategy creative starts from a good brief. In a human agency the
creative brief is the single most leveraged artifact in the building: a one-page
instrument that compresses strategy into a proposition a creative team can execute
without re-litigating the strategy. Get it right and the first draft lands close;
get it wrong and the studio burns revision cycles chasing a moving target.

AdOS already produces the strategic substance of a brief — the `MarketingBrief` —
and already *hands it to creative*. What it does **not** yet do is treat the brief
as a **first-class creative instrument** with a single-minded proposition,
mandatories, tone rails, and do/don't guidance that the [Context Engine](../1-ai-foundations/CONTEXT_ENGINE.md)
can assemble into a generation prompt. This document specifies that target artifact,
records exactly what ships today, and draws the line between the two.

The bridge this document describes is the same bridge Book A walks through in
[`../../book-a/CAMPAIGN_LIFECYCLE.md`](../../book-a/CAMPAIGN_LIFECYCLE.md) (Mission →
brief → creative) and [`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md)
(the gated creative step). Book B's contribution is to name the artifact that crosses
the bridge and to specify how to strengthen it.

---

## 1. Target design — an explicit Creative Brief artifact

### 1.1 The instrument

The target `CreativeBrief` is a distinct artifact, derived from the approved
`MarketingBrief`, whose *only* job is to drive creative generation. Where the
`MarketingBrief` answers *"what is the strategy?"*, the `CreativeBrief` answers
*"what must the creative say, and how?"*.

| Field | Purpose | Source today |
|---|---|---|
| `singleMindedProposition` | The one idea the creative must land | derive from `positioning` + `keyMessages` |
| `mandatories` | Must-includes: offer, legal, product name, CTA intent | `productName`, brand/product data |
| `tone` | The voice rails for this campaign | `brandVoice` (flat string today) |
| `dos` | On-brand moves to lean into | brand profile (⚠️ not yet structured) |
| `donts` | Off-limits: banned words, claims to avoid | brand banned-words (❌ not yet injected) |
| `references` | Winning-pattern exemplars to echo | pattern library (🔶 unwired) |
| `audienceInsight` | The tension the creative resolves | `targetAudience` + persona (❌) |
| `channelIntent` | Format hints per surface | `recommendedChannels` |

### 1.2 Where it sits in the pipeline

```
Mission
  └─▶ MarketingBrief         (strategy — ✅ generated today)
        └─▶ CreativeBrief    (creative instrument — ❌ target artifact)
              └─▶ Context Engine → generation prompt   (🔶 CONTEXT_ENGINE.md)
                    └─▶ CreativeSet   (six copy fields — ✅ generated today)
```

The `CreativeBrief` is the **input the Context Engine reads** to compose a grounded
generation prompt. Today the Context Engine (`domains/executive-memory/src/context-builder.ts:37-86`)
exists but is unwired; the `CreativeBrief` is the artifact it is designed to consume.
See [`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md).

### 1.3 Design principles

The target artifact is governed by four principles, each of which keeps it honest
against the AI Constitution and the tier model:

1. **One instrument, one job.** The `CreativeBrief` drives *creative generation* and
   nothing else. It does not carry budget math, KPI targets, or channel-planning
   detail — those live on the `MarketingBrief` and flow to the campaign step. Keeping
   the instrument narrow is what makes it single-minded.

2. **Derived, never re-generated.** The `CreativeBrief` is *distilled* from an
   already-approved `MarketingBrief`; it never re-runs strategy. This preserves the
   human approval already given at the `strategy_and_budget` gate and avoids a second
   model call that could drift from approved strategy.

3. **Provenance-carrying.** Like every AI artifact in AdOS, a `CreativeBrief` records
   `taskId`, `capability`, `model`, `engine`, `latencyMs` and a `briefId`
   back-reference, so any creative can be traced strategy → brief → copy.

4. **Additive to the handoff, not a rewrite.** The existing `CreativeContext`
   contract (`creative-set.ts:18-29`) is the stable interface creative already
   consumes. The `CreativeBrief` becomes the *source* of that context, so the
   creative service is untouched — the artifact slots behind an interface that
   already ships.

### 1.4 Worked example — from strategy to instrument

Given an approved `MarketingBrief` whose `content` reads (illustrative):

```
positioning:      "The only air-gapped AI OS an agency fully owns."
keyMessages:      ["No cloud, no per-token bill", "Runs offline", "Own your data"]
targetAudience:   "Independent agency owners wary of cloud AI lock-in"
recommendedChannels: ["LinkedIn", "Email"]
```

the target distillation produces a `CreativeBrief`:

| `CreativeBrief` field | Distilled value |
|---|---|
| `singleMindedProposition` | "Own your AI — no cloud, no lock-in." |
| `mandatories` | product name; the "100% local" claim; a clear CTA |
| `tone` | confident, plain-spoken, non-hype (from `brandVoice`) |
| `dos` | lead with ownership; name the offline guarantee |
| `donts` | no cloud/SaaS framing; no banned words (once injected) |
| `audienceInsight` | "burned by per-token bills and vendor lock-in" |
| `channelIntent` | LinkedIn thought-leadership; email direct-response |

The Context Engine then composes the `creative.set` prompt from this instrument.
Today, by contrast, the raw `positioning` and `keyMessages` strings pass straight
through the `CreativeContext` with none of this distillation — which is precisely the
⚠️ gap.

### 1.5 Brief-quality gate

A creative brief is only useful if it is *good*. The target design adds a
**brief-quality check** between strategy approval and creative generation: is the
proposition single-minded, are mandatories present, are tone rails set, do the
do/don't lists exist? This gate is the natural home for the analysis specified in the
sibling [`BRIEF_ANALYSIS.md`](./BRIEF_ANALYSIS.md). It is **not implemented today**
(❌ ROADMAP) — no analyzer or scorer runs against the brief.

---

## 2. Today — what actually ships

### 2.1 ✅ SHIPPED — the `MarketingBrief` is generated

The `MarketingBriefService.generate()` method takes a `MarketingContext` (the
flattened mission/client/brand/product fields) and submits a single `reasoning`
task to the AI Manager, returning a persisted `MarketingBrief`
(`domains/marketing-intelligence/src/brief/service.ts:43-96`). This is the
system's first "thinking" step.

The generated `content` object carries the full strategic payload
(`domains/marketing-intelligence/src/brief/marketing-brief.ts:40-47`):

| Field | Type | Role in the brief |
|---|---|---|
| `objective` | `string` | The campaign goal |
| `targetAudience` | `string` | Who it speaks to |
| `positioning` | `string` | The strategic angle |
| `keyMessages` | `string[]` | The points to land |
| `recommendedChannels` | `string[]` | Where it runs |
| `budgetAllocation` | `BudgetAllocation[]` | How spend splits |
| `kpis` | `Array<{name,target,unit}>` | How success is judged |

**This content *is*, effectively, the creative brief today.** `objective`,
`targetAudience`, `positioning`, and `keyMessages` are exactly the strategic
substance a creative team needs. The artifact simply isn't *named* or *shaped* as a
creative brief — it is a strategy brief that creative reads directly.

The inputs are injected as prompt variables
(`domains/marketing-intelligence/src/brief/service.ts:47-62`): `clientName`,
`industry`, `brandVoice`, `brandValues`, `productName`, `productDescription`,
`missionBrief`, `budget`. This is **Mission injection** — see
[`../1-ai-foundations/MISSION_INJECTION.md`](../1-ai-foundations/MISSION_INJECTION.md).

Provenance is attached to every brief — `taskId`, `capability`, `model`, `engine`,
`latencyMs` (`service.ts:78-84`) — so any brief is reproducible and auditable, per
the AI Constitution.

### 2.2 ✅ SHIPPED — the brief→creative handoff (`CreativeContext`)

This is the real bridge. When the brief is approved and the operator triggers
creative, the route handler `generateCreative()` reads the approved brief and
assembles a `CreativeContext`, then calls `app.creative.generate(...)`
(`apps/web/src/routes.ts:961-972`):

```ts
const generated = await app.creative.generate({
  tenantId: session.tenantId,
  missionId: id,
  clientId: mission.clientId,
  briefId: brief.id.toString(),
  productName: product.name,
  brandVoice: brand.profile.voice,
  objective: brief.content.objective,
  targetAudience: brief.content.targetAudience,
  positioning: brief.content.positioning,
  keyMessages: [...brief.content.keyMessages],
});
```

The `CreativeContext` shape is defined at
`domains/creative-studio/src/creative/creative-set.ts:18-29`:

| `CreativeContext` field | Filled from | Meaning |
|---|---|---|
| `briefId` | approved brief id | provenance link back to strategy |
| `productName` | product aggregate | the subject |
| `brandVoice` | `brand.profile.voice` | tone rail (flat string) |
| `objective` | `brief.content.objective` | the goal |
| `targetAudience` | `brief.content.targetAudience` | the audience |
| `positioning` | `brief.content.positioning` | the angle |
| `keyMessages` | `brief.content.keyMessages` | the points to land |

So the strategic brief fields **cross the bridge into creative** as a typed,
provenance-carrying context. This is the handoff the target design formalizes into a
first-class `CreativeBrief` — the plumbing already exists; it is the *artifact* that
is missing.

### 2.3 ✅ SHIPPED — the creative side consumes it

`CreativeStudioService.generate()` takes that `CreativeContext` and submits a single
`chat` task with key `creative.set` version 1
(`domains/creative-studio/src/creative/service.ts:38-55`), passing `productName`,
`brandVoice`, `objective`, `targetAudience`, `positioning`, `keyMessages` as prompt
variables. One task emits **all six copy fields at once** — `headline`, `adCopy`,
`cta`, `socialPost`, `landingPage`, `email` (`service.ts:10-21`) — the same six
fields Book A documents. This confirms the tier note: there is a single
`creative.set` task, **not** per-asset (hook/headline/copy/CTA) generators.

### 2.4 ✅ SHIPPED — the human gate around the handoff

After creative generates, the mission moves into the `creative_assets` approval gate
(`apps/web/src/routes.ts:975`). Strategy itself is approved at the
`strategy_and_budget` gate before creative can run (the `mission.status !== 'planning'`
guard at `routes.ts:952` enforces sequencing). The brief→creative bridge is thus
**human-gated on both sides**, consistent with
[`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md).

### 2.5 ⚠️ What is *not* there today

| Gap | Reality today | Tier |
|---|---|---|
| A distinct `CreativeBrief` artifact | Creative reads `MarketingBrief` fields directly via `CreativeContext`; no separate brief entity exists | ⚠️ PARTIAL |
| Single-minded proposition | Implied by `positioning`; never distilled into one instrument field | ❌ ROADMAP |
| Mandatories / do / don't lists | Not modelled; banned words not injected (Book A gap **B-1**) | ❌ ROADMAP |
| Tone as structured rails | Only a flat `brandVoice` string is passed | ⚠️ PARTIAL |
| References / winning-pattern exemplars | Pattern library exists but is unread at generation | 🔶 BUILT (UNWIRED) |
| Brief-quality gate before creative | No analyzer or score runs; the only gate is human approval | ❌ ROADMAP |
| Persona / competitor enrichment | No persona or competitor data exists to fold in | ❌ ROADMAP |

The through-line: the **strategy-to-creative handoff ships and works** (✅), but the
**brief is not yet a purpose-built creative instrument** (⚠️/❌).

---

## 3. To build — formalize the creative brief

The build work has two independent tracks. Track A can proceed immediately on data
that exists today; Track B depends on capabilities specified in sibling documents
that are themselves roadmap.

### 3.1 Track A — introduce the `CreativeBrief` artifact (near-term)

1. **Define the artifact.** Add a `CreativeBrief` value object derived from an
   approved `MarketingBrief`, carrying `singleMindedProposition`, `mandatories`,
   `tone`, `dos`, `donts`, `references`, `audienceInsight`, `channelIntent`. It
   carries its own provenance and a `briefId` back-reference, mirroring how
   `CreativeContext` already links via `briefId` today (`creative-set.ts:22`).

2. **Distill, don't re-invent.** Populate it from data already present:
   `singleMindedProposition` from `positioning` + top `keyMessages`;
   `channelIntent` from `recommendedChannels`; `tone` seeded from `brandVoice`.
   No new upstream data is required for a first version.

3. **Route the handoff through it.** Change `generateCreative()`
   (`routes.ts:961-972`) to build the `CreativeContext` *from the `CreativeBrief`*
   rather than directly from raw `MarketingBrief` fields. The `CreativeContext`
   contract can stay stable, so `CreativeStudioService` is untouched — the artifact
   slots in as the source of the handoff.

4. **Feed the Context Engine.** Make the `CreativeBrief` the object the
   [Context Engine](../1-ai-foundations/CONTEXT_ENGINE.md) reads when composing the
   `creative.set` prompt, so mandatories and do/don't rails become prompt context
   rather than being dropped.

### 3.2 Track B — enrich the brief (depends on roadmap siblings)

1. **Brand injection.** Fold structured brand rules and banned words into
   `mandatories`/`donts` so the brief carries brand safety *into* generation. This
   closes Book A gap **B-1** (bannedWords enforcement) at the brief layer; the
   injection path is specified in
   [`../1-ai-foundations/BRAND_INJECTION.md`](../1-ai-foundations/BRAND_INJECTION.md).

2. **Persona incorporation.** Populate `audienceInsight` from a real persona once the
   [`PERSONA_BUILDER.md`](./PERSONA_BUILDER.md) capability exists. Today
   `targetAudience` is a single generated string; a persona would give the brief the
   tension a proposition resolves. (Persona building is ❌ ROADMAP — only an event
   constant exists, `domains/marketing-intelligence/src/events.ts:10`.)

3. **Competitor context.** Add a `differentiation` note derived from competitor
   analysis when that capability lands (❌ ROADMAP — only a capability seed exists,
   `capability.ts:83`).

4. **Brief-quality gate.** Wire the analysis from
   [`BRIEF_ANALYSIS.md`](./BRIEF_ANALYSIS.md) as a pre-creative check: score
   single-mindedness and completeness, and surface a warning (never a hard block —
   the human approval gate remains the authority) before creative spends a
   generation cycle.

### 3.3 Sequencing

| Step | Depends on | Tier today |
|---|---|---|
| A1–A4 `CreativeBrief` artifact + rewire handoff | data that ships today | ❌ → buildable now |
| B1 brand/banned-word injection | `BRAND_INJECTION.md` wiring | 🔶/❌ |
| B2 persona insight | `PERSONA_BUILDER.md` | ❌ ROADMAP |
| B3 competitor differentiation | Competitor Analyzer | ❌ ROADMAP |
| B4 brief-quality gate | `BRIEF_ANALYSIS.md` | ❌ ROADMAP |

Track A is deliberately independent so the artifact can exist and structure the
handoff *before* the enrichment sources are built — each Track B input then simply
populates one more field of an artifact that already flows through the pipeline.

---

### 3.4 Guardrails while building

Because the brief is the instrument most tempting to over-claim, the build must stay
inside the tier model:

| Guardrail | Why |
|---|---|
| The brief-quality gate **warns**, never hard-blocks | The human approval gate (`creative_assets`) remains the authority; the AI advises |
| The `CreativeBrief` is **derived offline-safe** | Distillation must work under the default `OfflineAIManager`, not assume a live model |
| Do not describe enrichment as shipped | Persona, competitor, and banned-word injection are ❌/🔶 until their sources exist and are wired |
| Keep `CreativeContext` stable | The creative service ships today; the artifact slots behind it, changing no live behavior until deliberately wired |

## 4. Value contribution

**Production-time ↓.** A brief is the cheapest place to be right. Today the six copy
fields are generated from a strategy brief that carries no proposition, mandatories,
or do/don't rails — so anything off-strategy surfaces only at the `creative_assets`
approval gate and is corrected by human revision loops (Book A gap **B-3**). A
purpose-built `CreativeBrief` that hands single-minded, mandatory-carrying, tone-railed
context to generation makes the *first* draft land closer, cutting revision cycles per
mission. Fewer round-trips through the human gate is directly less production time.

**Revenue ↑.** On-strategy creative performs. A brief that pins the proposition and
folds in brand safety and (later) persona insight produces copy that is more likely to
convert on the KPIs the same brief declares (`kpis`, `service.ts` schema). Better
first drafts also mean the agency can take on more missions per unit of creative-team
time — the throughput lever behind AdOS v2's value rule.

The bridge already exists and carries traffic; formalizing the artifact that crosses
it converts a working handoff into a *quality* handoff, which is where both levers pay
off.

---

## 5. Cross-references

- Book A — [`../../book-a/CAMPAIGN_LIFECYCLE.md`](../../book-a/CAMPAIGN_LIFECYCLE.md):
  the Mission → brief → creative pipeline this artifact sits inside.
- Book A — [`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md):
  the gated creative step that consumes the handoff.
- [`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md):
  the (unwired) engine the `CreativeBrief` is designed to feed.
- [`../1-ai-foundations/MISSION_INJECTION.md`](../1-ai-foundations/MISSION_INJECTION.md):
  how mission fields already reach the brief prompt.
- [`../1-ai-foundations/BRAND_INJECTION.md`](../1-ai-foundations/BRAND_INJECTION.md):
  the brand-safety injection Track B folds into the brief.
- Sibling — [`BRIEF_ANALYSIS.md`](./BRIEF_ANALYSIS.md): the brief-quality analysis
  that becomes the pre-creative gate.
- Sibling — [`PERSONA_BUILDER.md`](./PERSONA_BUILDER.md): the persona source for
  `audienceInsight`.
- Governing reference —
  [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md).

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to `PRODUCT_TRUTH.md`.*
