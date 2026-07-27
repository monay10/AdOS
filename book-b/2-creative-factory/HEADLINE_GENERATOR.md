# Headline Generator — Producing On-Brand Headline Variants for Testing

**Owner:** Office of the Chief AI Architect
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md)
**Governing reference:** [../1-ai-foundations/AI_CONSTITUTION.md](../1-ai-foundations/AI_CONSTITUTION.md)

> **Implementation status:** ⚠️ **PARTIAL.** A single `headline` string is shipped
> today — but only as **one of six fields** the single `creative.set` shot emits in
> one pass (`domains/creative-studio/src/creative/service.ts:38-89`; offline stub
> `apps/web/src/ai.ts:91-105`). A **dedicated headline generator** — a stage that
> produces *several* on-brand headline variants for testing and hands them to
> scoring — **does not exist in the codebase today.** This document describes that
> stage as a design specification and separates it cleanly from the one headline
> that ships.

---

## 0. Where this document sits

This is a **generation stage** inside **Part 2 — the Creative Factory**. It builds
on the observation that anchors the whole part:

> **Today the creative act is a single shot.** One `creative.set` task emits every
> copy field — headline, ad copy, CTA, social post, landing page, email — at once
> (`domains/creative-studio/src/creative/service.ts:42-55`). No stage specializes
> in any one asset, and no stage produces *alternatives* of anything.

The Creative Factory is the design that **decomposes that single shot into
specialized stages**. The Headline Generator is the stage that owns one job:
**writing the headline, and writing more than one of it.** A headline is the single
highest-leverage line of copy in an ad — it decides whether the rest of the
creative is ever read — so the target design treats it as a first-class artifact
with its own stage, its own prompt, and its own output shape: **a ranked set of
on-brand variants built to be tested against each other**, not a lone string.

This document is **copy only**. Like the shipped creative act, the Headline
Generator never produces or requests images, and it never touches campaigns or ad
platforms (`domains/creative-studio/src/creative/creative-set.ts:13-17`).

It sits between its sibling stages: it consumes the same brief-derived context the
[Hook Generator](./HOOK_GENERATOR.md) and [Copy Generator](./COPY_GENERATOR.md)
consume, and it hands its variants forward to be scored and picked in
**Part 4 — Optimization** (see §7). Nothing here claims a shipped capability beyond
the one headline that genuinely ships.

---

## 1. Vocabulary — one headline vs. a generator

Two ideas sound alike and must be kept apart.

| Term | Output | Status | Meaning |
|---|---|---|---|
| Headline **field** | one `string` | ✅ SHIPPED (within the creative shot) | The `headline` field of `CreativeContent` — one line, emitted with the other five in a single pass. |
| Headline **generator** | ranked `HeadlineVariant[]` | ❌ ROADMAP | A dedicated stage that produces several on-brand candidates *for testing*. No code. |
| `bestHeadline` | one stored `string` | ✅ SHIPPED (stored, not generated) | A Company Brain merge field — the winning past headline for a vertical. It is **recalled**, never generated (`domains/company-brain/src/in-memory-company-brain.ts:112`). |

The live system does the **first row only**, and does it as part of a larger shot.
It also *stores* the third row. It has never done the **second row** — nothing in
the codebase turns one headline into many candidates, and nothing scores them. This
document specifies that second row.

> On `bestHeadline`: it is not evidence of a generator. It is a field the Company
> Brain keeps by copying the headline of whichever campaign had the larger sample
> size (`in-memory-company-brain.ts:111-112`), and it is read only by the **unwired**
> `ExecutiveContextBuilder` (`domains/executive-memory/src/context-builder.ts:61`).
> It is corporate memory *about* a headline, not a headline factory.

---

## 2. Target design — a headline stage that produces variants

The target Headline Generator is a small, single-purpose stage. Its contract:

**In:** the brief-derived creative context (already shipped as `CreativeContext`,
`creative-set.ts:18-29`) plus the brand voice/rules assembled by
[Brand Injection](../1-ai-foundations/BRAND_INJECTION.md).

**Out:** an ordered list of headline variants, each carrying the provenance every
AI artifact carries (`{taskId,capability,model,engine,latencyMs}` —
`creative-set.ts:52-59`), so every candidate is reproducible and auditable.

### 2.1 Target output shape

```
interface HeadlineVariant {
  text: string;          // the headline line — copy only, no image
  angle: string;         // e.g. 'benefit' | 'curiosity' | 'proof' | 'urgency'
  rationale: string;     // why this angle, in brand terms
  provenance: AIProvenance;
}

interface HeadlineSet {
  variants: HeadlineVariant[];   // N on-brand candidates, ready to be scored
  briefId: string;
  missionId: string;
}
```

The stage's defining property is **plurality with variety**: `variants` holds
several candidates spanning distinct *angles*, so a test compares genuinely
different bets — not six rewordings of one idea. Selection is **not** this stage's
job; producing good, diverse, on-brand candidates is.

### 2.2 Where each variant must stay on-brand

Every variant is written **through the brand**, never around it. Per
[Brand Injection](../1-ai-foundations/BRAND_INJECTION.md), the brand's voice, tone,
and banned-word rules shape the prompt; a headline that reads off-voice or uses a
banned term is a defect the same way a schema violation is. The shipped path today
injects only a flat `brandVoice` string (`creative/service.ts:48`); the target
design injects the full brand rule set assembled in Part 1 — that richer injection
is Book B build work, tracked under Book A gap **B-1** (banned-word enforcement).

### 2.3 The angle taxonomy — why variety is the point

A test between headlines that all say the same thing differently teaches nothing.
The value of a variant set is *spread*: each candidate carries a distinct `angle`,
so the test compares strategies, not synonyms. The target design seeds the prompt
with a small, brand-agnostic taxonomy the stage draws from:

| Angle | The bet it makes | Example shape |
|---|---|---|
| `benefit` | The reader wants an outcome | "Get X without Y" |
| `curiosity` | The reader wants the gap closed | "The one thing X gets wrong" |
| `proof` | The reader wants evidence | "How N teams did X" |
| `urgency` | The reader wants to not miss out | "X ends when Y" |
| `objection` | The reader has a specific doubt | "No Z required" |

The stage does not have to use every angle for every mission — the brief and brand
narrow the useful set — but it must produce **more than one distinct angle** so the
downstream test is meaningful. A `HeadlineSet` of five `benefit` rewrites is a
defect of variety, not a valid output.

### 2.4 Stage boundaries

| The Headline Generator DOES | The Headline Generator does NOT |
|---|---|
| Produce several on-brand headline variants | Produce images, thumbnails, or any non-text asset |
| Attach an angle + rationale + provenance to each | Score, rank-by-quality, or *pick* a winner (Part 4) |
| Respect brand voice, tone, and banned-word rules | Launch, publish, or touch an ad platform |
| Hand `HeadlineSet` to the scoring stage | Read the brief to *evaluate* it (that is Brief Analysis) |
| Span distinct angles for a meaningful test | Recall a stored `bestHeadline` and call it new |

---

## 3. Today — what the code actually does (⚠️ PARTIAL ✅)

### 3.1 The one headline that ships

Exactly one headline is produced today, and only as a field of the single creative
shot. The `CreativeStudioService` submits **one** `creative.set` chat task and reads
`headline` back from a six-field object
(`domains/creative-studio/src/creative/service.ts:42-55`):

| Field | Where | Note |
|---|---|---|
| `headline` | `creative-set.ts:44` (`CreativeContent.headline`) | one `string` |
| `adCopy`, `cta`, `socialPost`, `landingPage`, `email` | `creative-set.ts:45-49` | emitted in the same shot |

The JSON schema the service asks the model to fill lists `headline` as one of six
`required` properties (`creative/service.ts:10-21`) — it is a co-equal field of one
response, not the output of a headline stage. The default offline manager builds it
deterministically as `` `${product}: ${lead}` `` from the product name and first key
message (`apps/web/src/ai.ts:91-93`), emitting zero token usage. Genuine model prose
requires a locally-run engine per the
[AI Constitution](../1-ai-foundations/AI_CONSTITUTION.md).

So single-headline-as-part-of-set is ✅ **within the creative shot** — but there is
no variation, no angle, no ranking, and no separate stage.

Concretely, the shipped offline manager assembles the single headline like this
(`apps/web/src/ai.ts:91-93`):

```
const lead = keyMessages[0] ?? `Discover ${product}`;
headline = `${product}: ${lead}`;      // e.g. "AcmeCloud: Ship faster"
```

One deterministic line, no alternatives, no angle, no ranking. It is correct and
reproducible — and it is the whole of what "headline generation" means today.

### 3.2 The stored `bestHeadline` is not generation

The Company Brain keeps a `bestHeadline` per vertical, chosen by copying the
headline of the campaign with the larger sample size
(`domains/company-brain/src/in-memory-company-brain.ts:111-112`). It is written at
mission completion and read only by the unwired `ExecutiveContextBuilder`
(`domains/executive-memory/src/context-builder.ts:61`). It is **recall of a past
winner**, not production of a new candidate — and, per the
[AI Constitution](../1-ai-foundations/AI_CONSTITUTION.md), the brain is currently
**write-only relative to generation**: no generator reads it back.

### 3.3 Status ledger for this document

| Capability | Tier | Evidence |
|---|---|---|
| One `headline` field, emitted inside the single creative shot | ✅ SHIPPED (in the shot) | `creative/service.ts:42-55`; `ai.ts:91-105` |
| Deterministic offline headline default | ✅ SHIPPED | `ai.ts:91-93` |
| Provenance on the creative set | ✅ SHIPPED | `creative-set.ts:52-59`, `service.ts:71-77` |
| `bestHeadline` stored/merged in Company Brain | ✅ SHIPPED (stored, not generated) | `in-memory-company-brain.ts:111-112` |
| Dedicated headline **stage** | ❌ ROADMAP | no such service in the repo |
| **Multiple** headline variants | ❌ ROADMAP | schema emits one `headline` string |
| Angle / rationale per variant | ❌ ROADMAP | no such fields exist |
| Ranking / winner pick | ❌ ROADMAP | no scorer; belongs to Part 4 |
| Brand-rule/banned-word injection into the headline prompt | 🔶/❌ | flat `brandVoice` var shipped; rule injection unwired |

---

## 4. To build — decompose one field into a headline stage

The build is a decomposition, done in three honest steps. None of this exists today.

### 4.1 Step 1 — extract the stage (🔶/❌)

Lift `headline` out of the monolithic `creative.set` schema
(`creative/service.ts:10-21`) into its own `headline.generate` task with its own
prompt template. The `CreativeStudioService` gains a sibling call that submits a
headline task **before** (or alongside) the remaining copy fields. This reuses the
shipped submission machinery — `ai.submit(...)`, schema-as-text injection, JSON
extraction, the one self-repair retry — described in the
[Prompt Orchestrator](../1-ai-foundations/PROMPT_ORCHESTRATOR.md) and
[Retry Engine](../1-ai-foundations/RETRY_ENGINE.md). No new engine is required.

### 4.2 Step 2 — make it produce variants (❌ ROADMAP)

Change the output shape from one `string` to `HeadlineVariant[]` (§2.1). The prompt
asks for **N candidates across distinct angles**; the response schema becomes an
array. Each variant carries its own `angle` and `rationale` so a human — and later a
scorer — can see *why* each bet is different. Variety is a requirement of the prompt,
not an accident of sampling.

### 4.3 Step 3 — keep every variant on-brand (🔶/❌)

Inject the full brand rule set (voice, tone, banned words) into the headline prompt
via [Brand Injection](../1-ai-foundations/BRAND_INJECTION.md), replacing today's flat
`brandVoice` string. A variant that violates a banned-word rule is filtered or
regenerated — this is the headline-stage face of Book A gap **B-1**. The enforcement
code exists unwired in the platform (per the AI Constitution's two-stack account);
wiring it into this stage is Book B build work.

### 4.4 Step 4 — hand off to scoring, do not self-select (❌ ROADMAP)

The stage emits `HeadlineSet` and stops. Ranking and winner selection belong to
**Part 4 — Optimization** (§7), which scores the variants and feeds outcomes back so
the *next* mission's headline stage starts from what actually won. The Headline
Generator never picks its own winner — separation of generation from judgment is a
constitutional rule.

### 4.5 Prompt sketch (target, ❌ ROADMAP)

The extracted task's prompt is small and specific — it asks for a plural, varied,
on-brand result and nothing else:

```
System (roles + brand):  <voice, tone, banned words from Brand Injection>
Task:                    Write {N} headlines for {productName}.
Constraints:             Each ≤ {maxChars}. Each a DIFFERENT angle from
                         {benefit|curiosity|proof|urgency|objection}.
                         Never use: {bannedWords}.
Return (schema as text):  { "variants": [ { "text", "angle", "rationale" } ] }
```

This reuses the shipped schema-as-text injection and JSON-extraction path
(`apps/web/src/ai-live.ts:142-144`, `ai-live.ts:179-198`) — the format enforcement
is prompt-level today, and the full schema-*enforced* validation is the unwired
[Validation Pipeline](../1-ai-foundations/VALIDATION_PIPELINE.md) that this stage
would eventually route through.

### 4.6 Build ledger

| Step | Tier | Depends on |
|---|---|---|
| Extract `headline.generate` task from the creative shot | 🔶/❌ | shipped `ai.submit` path |
| Emit `HeadlineVariant[]` with angle + rationale | ❌ ROADMAP | new task schema |
| Inject full brand rules / banned words | 🔶/❌ | Brand Injection wiring (B-1) |
| Route variants through schema-enforced validation | 🔶 BUILT (UNWIRED) | `ai-manager/src/runtime/validation-engine.ts` |
| Hand `HeadlineSet` to scoring | ❌ ROADMAP | Part 4 Scoring stage |

### 4.7 Design constraints that never bend

Whatever the build order, the stage stays inside the platform's constitutional
boundaries:

- **Copy only.** The Headline Generator never emits, requests, or implies an image,
  the same rule the shipped creative act obeys (`creative-set.ts:13-17`).
- **Local-only, offline-capable.** No cloud call, no API key, no per-token billing —
  the offline manager must still produce a deterministic variant set with zero token
  usage, exactly as the single headline does today (`ai.ts:91-93`).
- **Generation, not judgment.** The stage produces candidates; it never scores or
  picks. Winner selection is Part 4's job and a human's approval.
- **Provenance on every variant.** Each `HeadlineVariant` is reproducible and
  auditable via `{taskId,capability,model,engine,latencyMs}`.

---

## 5. Worked contrast — today vs. target

| Aspect | Today (⚠️ shipped) | Target (❌ design) |
|---|---|---|
| Trigger | one `creative.set` shot | dedicated `headline.generate` stage |
| Output | one `headline` string | ranked `HeadlineVariant[]` |
| Variety | none | several distinct angles |
| Brand rules | flat `brandVoice` var | full voice + banned-word injection |
| Selection | n/a (single line) | scored in Part 4, human-approved |
| Reproducible | ✅ provenance on the set | ✅ provenance per variant |
| Images | none (copy only) | none (copy only) |

The target changes *what the stage yields*, not *how AdOS runs*: still local-only,
still offline-capable, still deterministic under the offline manager, still
human-gated at approval.

---

## 6. Value contribution

**Revenue ↑ — better headlines lift CTR.** The headline is the line that decides
whether an ad is read at all. Producing several on-brand variants *for testing*,
then letting Part 4 pick the winner from real outcomes, is the direct mechanism by
which click-through — and therefore ROAS — improves campaign over campaign. One
un-tested headline can only ever be as good as its single guess.

**Production time ↓.** A dedicated stage generates a testable spread of headlines in
one pass, so the agency skips the manual round of hand-writing and re-writing
alternatives before a test can even start. The agency reviews and approves a ready
slate instead of authoring it.

**Compounding effect.** Because Part 4 records which angle won, the winning pattern
becomes corporate memory the *next* mission's headline stage can start from — the
same learning loop the platform is designed to close. Each campaign's test makes the
following campaign's first draft stronger, so the CTR lift is not a one-off but a
slope.

Per the AdOS value rule, a capability must raise revenue or cut production time;
the Headline Generator does both.

---

## 7. Cross-references

| Document | Relationship |
|---|---|
| [../../PRODUCT_TRUTH.md](../../PRODUCT_TRUTH.md) | Source of truth — one headline ships in the creative shot; no generator exists |
| [../1-ai-foundations/AI_CONSTITUTION.md](../1-ai-foundations/AI_CONSTITUTION.md) | Governing reference — local-only, provenance, tiers, generation-vs-judgment |
| [../1-ai-foundations/BRAND_INJECTION.md](../1-ai-foundations/BRAND_INJECTION.md) | Keeps every variant on-brand; banned-word rules (gap B-1) |
| [../1-ai-foundations/PROMPT_ORCHESTRATOR.md](../1-ai-foundations/PROMPT_ORCHESTRATOR.md) | Shipped submission machinery the extracted stage reuses |
| [./HOOK_GENERATOR.md](./HOOK_GENERATOR.md) | Sibling stage — same decomposition, the opening hook |
| [./COPY_GENERATOR.md](./COPY_GENERATOR.md) | Sibling stage — same decomposition, the body copy |
| [./BRIEF_ANALYSIS.md](./BRIEF_ANALYSIS.md) | Upstream stage — reads the brief before the factory generates |
| [../../book-a/CREATIVE_WORKFLOW.md](../../book-a/CREATIVE_WORKFLOW.md) | The agency-process view of the single creative shot this stage decomposes |

> **Part 4 — Optimization (Scoring).** The `HeadlineSet` this stage emits is the
> input to the Part 4 Scoring stage, which ranks the variants, records which won,
> and feeds that back so the next mission's headline stage starts smarter. That
> scoring stage is specified in Part 4; ranking and winner selection are out of
> scope here by design.

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
