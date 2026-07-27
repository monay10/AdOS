# Copy Generator — Ad Body Copy & Long-Form Copy Assets

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ✅ **SHIPPED** — every copy asset (`adCopy`, `socialPost`,
> `landingPage{headline,body,cta}`, `email{subject,body}`) is generated **in one shot** by
> the single `creative.set` task (`domains/creative-studio/src/creative/service.ts:38-89`;
> offline stub `apps/web/src/ai.ts:85-106`). Copy **only** — no images. ⚠️/❌ — there is **no
> per-asset copy generator, no variations, and no length/format controls** on the live path.

---

## 1. What this document covers

This is the **Copy Generator** design for AdOS's Creative Factory (Book B, Part 2). Its
subject is the production of **ad body copy and the longer-form copy assets** that surround
a headline: the primary ad body (`adCopy`), the organic `socialPost`, the landing-page
`body`, and the email `subject`/`body`. It is a sibling to
[`HEADLINE_GENERATOR.md`](HEADLINE_GENERATOR.md) (short-form hook/headline copy) and
[`CTA_GENERATOR.md`](CTA_GENERATOR.md) (call-to-action copy); together the three describe
the copy surface of a Creative Set.

The honest headline of this document: **copy generation is the most shipped part of Part 2.**
Unlike headline, CTA, hook, or QA generators — which do not exist as independent code — the
body copy assets are genuinely produced today, because they are emitted as fields of the
one `creative.set` task. What is **not** shipped is any way to generate a *single* asset on
its own, to ask for *variants*, or to control *length or format*.

This document is a specification, not a marketing claim. It follows the three-tier status
model of the AI Constitution: **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, **❌ ROADMAP (ABSENT)**.
Cross-references: Book A's [`CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md)
(Copy/Creative stages) defines the workflow this stage sits inside.

---

## 2. Target design — an on-brand copy stage with variants

The Book B target is a dedicated **Copy stage** that, given a Marketing Brief and the
Brand, produces on-brand body copy **per asset and per channel**, with requestable variants
and explicit length/format constraints — all subject to brand voice and (roadmap) banned-word
safety.

```
Brief + Brand ─▶ Copy Orchestrator
                     │
        ┌────────────┼───────────────┬──────────────┬────────────┐
        ▼            ▼               ▼              ▼            ▼
   adCopy(×N)   socialPost(×N)  landingPage.body  email.body   (more channels…)
   len/format   platform-aware   long-form         subject+body
        │            │               │              │            │
        └──────── Brand voice + bannedWords safety (roadmap) ─────┘
                     │
                     ▼
              Human approval (creative_assets gate)
```

Target-design properties (tier-tagged so shipped ≠ planned):

| Property | Description | Tier |
|---|---|---|
| One-shot copy set | All copy assets generated together from the brief | ✅ SHIPPED |
| On-brand voice | `brandVoice` flattened into the prompt | ✅ SHIPPED (flat var only) |
| Per-asset generator | Regenerate *only* `adCopy` (or email, etc.) in isolation | ❌ ROADMAP |
| Variations | N distinct drafts per asset for A/B selection | ❌ ROADMAP |
| Length / format controls | "≤ 90 chars", "3 sentences", "bullet list" | ❌ ROADMAP |
| Channel-aware copy | Length/tone tuned to Meta vs. email vs. LP | ❌ ROADMAP |
| Banned-word safety | Copy screened against `Brand.bannedWords` | 🔶/❌ (see §5) |
| Provenance | `{taskId,capability,model,engine,latencyMs}` per set | ✅ SHIPPED |

### 2.1 The copy assets in scope

The Copy Generator's remit is the **body and long-form** surface. Each asset has a distinct
job, a distinct length profile, and (in the target design) a distinct set of format controls.
The table below is the target contract; the **Today** column records what is actually produced
by the one-shot task now.

| Asset | Job | Target length profile | Today |
|---|---|---|---|
| `adCopy` | Primary paid-ad body — the persuasive middle | 1–2 sentences, platform-bounded | ✅ generated (one draft, no length control) |
| `socialPost` | Organic social post, conversational | short, emoji-tolerant | ✅ generated (one draft) |
| `landingPage.body` | Long-form conversion copy under the LP headline | multi-sentence | ✅ generated (one draft) |
| `email.subject` | Inbox hook | ≤ ~60 chars | ✅ generated (one draft) |
| `email.body` | Long-form nurture / offer copy | multi-line | ✅ generated (one draft) |

Two of the six `CreativeContent` fields — `headline` and `cta` — are documented by the sibling
generators and are out of scope here, though they are emitted by the *same* task (§3.1).

### 2.2 The Copy Orchestrator (target)

In the target design a **Copy Orchestrator** sits between the brief and the individual copy
sub-generators. Its responsibilities:

1. **Route** each requested asset to its `copy.<asset>` prompt (§4.1), or fall back to the
   one-shot `creative.set` when a full set is requested.
2. **Bind context** — brief fields plus Brand voice and (roadmap) rules — into prompt
   variables, the way `service.ts:47-53` binds them today, but per asset.
3. **Apply constraints** — length/format/channel — and hand a violation to the schema-enforced
   Validation Pipeline for a repair pass (§4.3).
4. **Screen** the result against `Brand.bannedWords` before it is offered for approval (§5.2).

Only step 2's *binding* and the *fallback* one-shot path exist today; steps 1, 3, and 4 are
🔶/❌ build work. The orchestrator concept is shared with Part 1's
[`../1-ai-foundations/PROMPT_ORCHESTRATOR.md`](../1-ai-foundations/PROMPT_ORCHESTRATOR.md);
this document specifies only its copy-specific behavior.

---

## 3. Today — ✅ what the code actually does

### 3.1 One task, all copy assets

The live path generates **all copy assets in a single `ai.submit` call**. The
`CreativeStudioService.generate(...)` method submits one `chat` task keyed
`creative.set` and receives a fully-populated `CreativeContent` object back
(`domains/creative-studio/src/creative/service.ts:42-55`):

```ts
result = await this.ai.submit<CreativeContent>({
  capability: 'chat',
  submittedBy: 'creative-studio.creative',
  promptRef: { key: 'creative.set', version: 1 },
  variables: {
    productName, brandVoice, objective,
    targetAudience, positioning, keyMessages,
  },
  responseSchema: CREATIVE_SCHEMA,
});
```

The returned shape is the **six-field `CreativeContent`** contract
(`domains/creative-studio/src/creative/creative-set.ts:42-50`), of which **five fields are
body/long-form copy** owned by this document:

| `CreativeContent` field | Copy asset | Owned by |
|---|---|---|
| `headline` | Short-form headline | [`HEADLINE_GENERATOR.md`](HEADLINE_GENERATOR.md) |
| `cta` | Call-to-action line | [`CTA_GENERATOR.md`](CTA_GENERATOR.md) |
| `adCopy` | **Primary ad body copy** | **this doc** |
| `socialPost` | **Organic social post** | **this doc** |
| `landingPage.headline` / `.body` / `.cta` | **Landing-page long-form** | **this doc** (`.body`) |
| `email.subject` / `.body` | **Email long-form** | **this doc** |

Because these are all fields of one task result, the ✅ claim is precise: **the copy is
generated**, and it is generated **in a single shot** — never asset-by-asset.

### 3.2 The default output is deterministic, offline, copy-only

By default AdOS runs the `OfflineAIManager` (`apps/web/src/ai.ts:13`), so the copy fields are
filled by a **deterministic string template**, not a model. The offline stub's
`creativeSet(...)` builder assembles every copy asset from the brief variables
(`apps/web/src/ai.ts:85-106`):

```ts
private creativeSet(v: Record<string, unknown>): unknown {
  const product = str(v['productName'], 'the product');
  const voice   = str(v['brandVoice'], 'professional');
  const messages = Array.isArray(v['keyMessages']) ? … : [];
  const lead = messages[0] ?? `Discover ${product}`;
  return {
    headline:   `${product}: ${lead}`,
    adCopy:     `${lead}. A ${voice} choice you can trust — ${messages[1] ?? 'made for you'}.`,
    cta:        'Get started',
    socialPost: `✨ ${lead}! ${product} is here. ${messages[1] ?? ''}`.trim(),
    landingPage: { headline: `${product}, done right`, body: `${lead}. Our ${voice} team delivers …`, cta: 'Book your spot' },
    email:       { subject: `Meet ${product}`, body: `${lead}. Reply to get started with ${product} today.` },
  };
}
```

Genuine model prose requires a locally-run engine (Ollama or an OpenAI-compatible local
server) selected via `LiveAIManager` (`apps/web/src/ai-live.ts:26`) — still **100% local: no
cloud, no API key, no per-token billing** (`apps/web/src/ai-factory.ts:23-57`). Whether
offline or live, the output is **copy only**: the Creative Studio "produces copy ONLY; it
never touches campaigns or ad platforms" (`creative-set.ts:15-17`).

The generated set is persisted and emits a `CreativeGenerated` event carrying the mission,
client, brief and headline (`creative-set.ts:71-79,106-118`), which is what advances the
pipeline toward the `creative_assets` approval gate. The copy assets themselves are not
re-derived after this point — a later edit is a human revision, not a re-generation (see §4.1).

### 3.2.1 Why it is a single shot

The single-task design is deliberate and has a real production-time benefit (§7): one model
round-trip yields a coherent copy set whose assets already share a lead message and voice,
because the offline stub threads the same `lead`/`voice`/`messages` through every field
(`ai.ts:89-104`). The cost of that coherence is the ⚠️ limitation this document exists to
name — there is no seam at which a single asset can be re-rolled without re-running the whole
set, and no place to attach per-asset constraints.

### 3.3 What "shipped" here does **not** include

The following are **not** on the live path, and this document must not imply otherwise:

| Not shipped today | Reality | Evidence |
|---|---|---|
| Per-asset copy generation | Only the whole set is produced, atomically | `service.ts:42-55` (one `submit`) |
| Regenerate one asset | No route re-runs a single copy field | `routes.ts` creative handler calls `generate()` |
| Variations / N drafts | One draft per field, per run | `CreativeContent` has one value per field |
| Length / format controls | No `maxLength`/`format` inputs exist | `variables` in `service.ts:47-53` |
| Image / vision output | No engine exists | ❌ ROADMAP (`contracts/.../ai-task.ts:14-24`) |
| Schema **enforcement** on copy | Schema is injected as prompt **text**, not enforced | see §3.4 |

### 3.4 A note on the schema

The service passes a `responseSchema` (`CREATIVE_SCHEMA`, `service.ts:9-21`) and its comment
reads "the JSON schema the AI Manager enforces." On the **live path**, the schema is injected
into the prompt as **text**, not machine-enforced (`ai-live.ts:142-144`); the only structural
guarantee comes from the hand-written `validateContent(...)` shape check afterward
(`service.ts:102-123`), which rejects a malformed set but does **not** enforce length, tone,
or brand rules. Full schema-**enforced** validation exists as **🔶 BUILT (UNWIRED)** code in
`packages/ai-manager/src/runtime/validation-engine.ts:62-118` — see
[`../1-ai-foundations/VALIDATION_PIPELINE.md`](../1-ai-foundations/VALIDATION_PIPELINE.md).

---

## 4. To build — per-asset generators, variations, controls

This is the ⚠️/❌ half. None of the following exists on the live path today; each is a clean
design spec.

### 4.1 Per-asset copy generators (❌ ROADMAP)

Add copy sub-generators that can be invoked **independently** of the full set, so a user can
regenerate `adCopy` alone without disturbing an already-approved `email`. Target shape:

```
POST /copy/regenerate
  { assetKind: 'adCopy' | 'socialPost' | 'landingPageBody' | 'emailBody',
    creativeSetId, constraints? }
  → produces a new value for that single field, non-destructively (Book A gap B-3)
```

Design notes:
- Introduce a `copy.<asset>` prompt family (e.g. `copy.adCopy`, `copy.email`) alongside the
  existing `creative.set` prompt, versioned through the **Prompt Registry** — code exists
  **🔶 BUILT (UNWIRED)** at `domains/prompt-registry/src/in-memory-prompt-registry.ts:55-92`
  (see [`../1-ai-foundations/PROMPT_ORCHESTRATOR.md`](../1-ai-foundations/PROMPT_ORCHESTRATOR.md)).
- Regeneration must be **non-destructive**: keep prior drafts as revisions rather than
  overwriting, addressing Book A walkthrough gap **B-3** (non-destructive revision). Today
  `approvals.requestRevision` is human-only; an AI copy-revision path is ❌ ROADMAP.
- The per-asset generator should reuse the **same brief context** (`CreativeContext`,
  `creative-set.ts:18-29`) rather than a re-derived one, so a single-asset regeneration stays
  consistent with the surrounding, already-approved copy.
- A per-asset task must still emit `provenance`, so an isolated `adCopy` regeneration is as
  reproducible/auditable as the full-set generation is today (`creative-set.ts:52-59`).

### 4.2 Variations for A/B selection (❌ ROADMAP)

Extend the per-asset generator to emit **N variants** of a copy asset so the agency can pick
or test the strongest. Target response shape (illustrative, not implemented):

```
POST /copy/regenerate { assetKind: 'adCopy', variants: 3, constraints: { maxChars: 120 } }
→ { assetKind: 'adCopy',
    variants: [
      { text: '…', provenance: {…} },
      { text: '…', provenance: {…} },
      { text: '…', provenance: {…} },
    ] }
```

Selection/scoring of the winner (winner/loser detection) is itself ❌ ROADMAP —
`bestHook`/`bestHeadline` today are stored merge fields, not the output of any detector. When
the learning loop closes (a Book B design goal, currently 🔶/❌ — the memory is *recorded* at
mission completion via `routes.ts:1146-1170` but **not read back into generation**), variant
selection can be informed by past-campaign performance rather than chosen blind.

### 4.3 Length & format controls (❌ ROADMAP)

Accept explicit `constraints` per asset — maximum character count, sentence count, list vs.
paragraph, and channel profile (Meta ad vs. email vs. landing page). These map naturally onto
the schema-enforced Validation Pipeline (🔶) so that a violation triggers the self-repair loop
rather than shipping over-length copy. The shipped live path today does **one** self-repair
retry (`ai-live.ts:49-67`); the full failover/repair loop is 🔶 in the unwired
`InferencePipeline` (see
[`../1-ai-foundations/RETRY_ENGINE.md`](../1-ai-foundations/RETRY_ENGINE.md)).

### 4.4 Roadmap ledger for this document

| Capability | Tier | Evidence / note |
|---|---|---|
| One-shot copy set (all assets) | ✅ SHIPPED | `service.ts:38-89`; `ai.ts:85-106` |
| Offline deterministic copy default | ✅ SHIPPED | `ai.ts:13,85-106` |
| Provenance per set | ✅ SHIPPED | `creative-set.ts:52-59`; `service.ts:70-77` |
| Per-asset generator / regeneration | ❌ ROADMAP | no per-asset task exists |
| Copy variations (N drafts) | ❌ ROADMAP | one value per field |
| Length / format / channel controls | ❌ ROADMAP | no constraint inputs |
| Schema-enforced copy validation | 🔶 BUILT (UNWIRED) | `ai-manager/.../validation-engine.ts:62-118` |
| Prompt-registry-driven copy prompts | 🔶 BUILT (UNWIRED) | `prompt-registry/.../in-memory-prompt-registry.ts:55-92` |
| Banned-word safety on copy | 🔶/❌ | unwired engine; see §5 |
| AI copy revision (non-destructive) | ❌ ROADMAP | human revision only |
| Image / creative visuals | ❌ ROADMAP | no engine `ai-task.ts:14-24` |

---

## 5. Brand voice & safety

### 5.1 Brand voice — ✅ (flat variable only)

Brand voice reaches the generator today as a **single flattened string**: `brandVoice` is
passed as one of the `creative.set` variables (`service.ts:48`) and is woven into the offline
stub's copy (`ai.ts:87,93,98`). This is the shipped extent of brand injection into copy — a
voice *label*, not the brand's full rule set or tone matrix.

### 5.2 Banned-word safety — 🔶/❌ (not on the live path)

`Brand` aggregates carry `bannedWords` (per PRODUCT_TRUTH.md §1.2), but **no live code screens
generated copy against them.** This is Book A walkthrough gap **B-1** (bannedWords
enforcement). A regex safety engine exists as **🔶 BUILT (UNWIRED)** at
`packages/ai-manager/src/runtime/safety-engine.ts:57-64`; wiring it so that every copy asset is
screened before it reaches the `creative_assets` approval gate is Book B build work,
specified in [`../4-optimization/BRAND_SAFETY.md`](../4-optimization/BRAND_SAFETY.md). Until
then, do **not** describe copy as brand-safety-enforced.

---

## 6. Where copy sits in the workflow

Copy generation is one stage of the human-gated pipeline described in Book A's
[`CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md). The Creative Set — copy only —
flows into the `creative_assets` approval gate and then into the Campaign draft:

```
MarketingBrief → CreativeSet (copy) → [creative_assets gate: human approval]
              → CampaignDraft → CampaignReport → ExecutiveReport
```

Every stage requires an explicit human approval click; the Creative Set is never launched and
never leaves draft (PRODUCT_TRUTH.md §1.3, §2.4). The copy generator produces **first drafts
for a human to approve** — it does not autonomously ship advertising.

---

## 7. Value contribution

**Production-time ↓ (shipped, core win).** The single-shot copy set replaces the blank-page
problem for an entire campaign's copy — `adCopy`, `socialPost`, landing-page `body`, and
email `subject`/`body` — with an on-brand **first draft produced in one call**. This is the
already-shipped production-time saving of the Creative Factory: a copywriter edits a draft
instead of authoring from zero.

**Revenue ↑ (roadmap, via variants).** Per-asset variations plus (later) winner selection let
the agency A/B-test copy and keep the stronger performer, turning first-draft speed into
measurable lift. That revenue path depends on the ❌ variation and 🔶 learning work, and is not
claimed as shipped.

---

## 8. Consistency with Book A and sibling docs

This document reuses Book A vocabulary without contradiction:

- The six copy fields (`headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, `email`) are
  the exact `CreativeContent` contract of `creative-set.ts:42-50`, as documented in Book A's
  [`CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md).
- The approval gate name `creative_assets` and the "drafts only, never launched" invariant
  match Book A and PRODUCT_TRUTH.md §2.4 exactly.
- `provenance{taskId,capability,model,engine,latencyMs}` is the same provenance envelope used
  across every AI artifact in Book A and Book B.

Motivating Book A walkthrough gaps referenced here:

| Gap | Meaning | Where addressed |
|---|---|---|
| **B-1** | bannedWords not enforced against copy | §5.2 → [`../4-optimization/BRAND_SAFETY.md`](../4-optimization/BRAND_SAFETY.md) |
| **B-3** | revision overwrites instead of preserving drafts | §4.1 (non-destructive per-asset regeneration) |

Sibling copy-surface documents in this part: [`HEADLINE_GENERATOR.md`](HEADLINE_GENERATOR.md)
(short-form headline/hook) and [`CTA_GENERATOR.md`](CTA_GENERATOR.md) (call-to-action). All
three describe fields of the **same** one-shot `creative.set` task today; the split into
independent generators is the shared Part 2 build goal.

---

*Documentation only. No application code, packages, domains, or tests were modified. Aligned
to PRODUCT_TRUTH.md.*
