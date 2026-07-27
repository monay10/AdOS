# Scoring — Variant Ranking, Prompt/Model Selection & Content Quality

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** 🔶 **BUILT (UNWIRED)** for *outcome-based* prompt/model
> scoring — the EMA reward engine and prompt-registry scoring already exist in the
> codebase (`packages/ai-manager/src/runtime/learning.ts:18-46`,
> `domains/prompt-registry/src/in-memory-prompt-registry.ts:66-84`) but **no live app
> path instantiates them**. ❌ **ROADMAP (ABSENT)** for *content* scoring — there is
> **no code** that scores the quality of a given creative today.

---

## 0. Scope — two different things both called "scoring"

The word "scoring" hides two distinct mechanisms. This document keeps them strictly
apart, because their status differs and confusing them would overstate what AdOS does.

| | **Outcome scoring** (prompt/model) | **Content scoring** (creative quality) |
|---|---|---|
| **Question it answers** | "Which prompt version / model produced the best *results*?" | "How good is *this specific creative*, before any results exist?" |
| **Input** | A reward signal derived from campaign outcome | The text of a headline / hook / copy / CTA |
| **When it runs** | *After* a mission completes and outcomes are known | *At generation time*, before approval |
| **Mechanism** | Exponential moving average (EMA) reward per `(promptKey, model)` and per prompt version | Composite of Brand Safety + Tone + Readability + on-brief relevance checkers |
| **Status** | 🔶 **BUILT (UNWIRED)** — `learning.ts`, `in-memory-prompt-registry.ts` | ❌ **ROADMAP (ABSENT)** — no code exists |
| **Feeds** | Prompt/model *selection* — the A/B winner mechanism | Variant *selection* inside Part 2 generators |

Neither mechanism is on the live path today. The first is coded and unit-tested but
dormant; the second is pure specification. Read every section below through that lens.

---

## 1. Target design — a unified scoring layer

AdOS is specified as an **AI-agent pipeline**, not a `Prompt → LLM → Output` shot. Two
places in that pipeline need to *choose the best of several options*:

1. **At generation** — a per-asset generator (headline, hook, copy, CTA) produces N
   candidate variants and must return the best one, or a ranked shortlist, to the human
   approver.
2. **Across missions** — over many campaigns, the system must learn *which prompt
   version and which local model* tend to produce the winning creatives, and prefer
   them next time.

The scoring layer is the component that answers both. It has two cooperating halves.

### 1.1 Content quality score (the pre-outcome signal)

A deterministic, offline score computed for a single creative variant *before* any
campaign result exists. It is a weighted composite of four checkers, each of which is
its own Part 4 document:

| Component | Source checker | What it contributes |
|---|---|---|
| **Brand Safety** | [`BRAND_SAFETY.md`](BRAND_SAFETY.md) | Hard gate — banned/forbidden words, PII, injection. A fail is disqualifying, not a deduction. |
| **Tone** | [`TONE_CHECKER.md`](TONE_CHECKER.md) | Alignment of the copy to the brand voice/tone profile. |
| **Readability** | [`READABILITY.md`](READABILITY.md) | Reading-ease / sentence-length fit for the target audience. |
| **On-brief relevance** | this document | Coverage of the brief's objective, offer, and audience keywords. |

Proposed composition (illustrative weights, to be calibrated):

```text
contentScore(variant) =
  brandSafety.pass ? (
      0.35 * tone.score            // 0..1, brand-voice alignment
    + 0.25 * readability.score     // 0..1, audience-appropriate reading ease
    + 0.40 * relevance.score       // 0..1, on-brief coverage
  ) : 0                            // safety failure ⇒ disqualified, score 0
```

Key design rules:

- **Brand Safety is a gate, not a term.** A variant that trips a banned word scores
  `0` and is never surfaced — it does not average out against a high tone score. This
  directly answers Book A walkthrough gap **B-1** (banned-word enforcement).
- **Deterministic and offline.** Every checker must be pure and run without a model
  server, consistent with the AdOS "100% local, no cloud, no API key" guarantee
  (`apps/web/src/ai-factory.ts:23-57`). Scores are reproducible for the same input.
- **Explainable.** The score carries its component breakdown so an approver sees *why*
  one variant beat another, not just a number.

### 1.2 Outcome score (the post-result signal)

An EMA reward accumulated *after* a mission completes and its performance verdict is
known (`exceeded | on_track | at_risk`, per Book A). The reward is attributed to the
`(promptKey, model)` pair — and to the specific prompt version — that produced the
creative. Over many missions this makes the winning prompt version and the winning
local model *emerge from real results*. This is the **A/B winner mechanism** for
prompts and models.

### 1.3 How the halves cooperate

```text
                 ┌─────────────────── generation time ───────────────────┐
  brief ─▶ generator ─▶ N variants ─▶ contentScore() ─▶ rank ─▶ best draft ─▶ human approval
                              ▲                                                    │
                              │ selectActive(): highest-scoring prompt version     │ outcome
                              │                                                    ▼
              prompt-registry ◀── score() ◀── learning.observe(reward) ◀── mission verdict
                 └────────────────── across missions (outcome loop) ──────────────┘
```

- **Content score** ranks variants *within* one generation call.
- **Outcome score** ranks *prompt versions and models across* generation calls, and via
  `selectActive` chooses which prompt version the next generation call even uses.

Together they close the loop the AI Constitution names as Book B's headline goal:
*produce better first drafts, and improve each campaign by learning from the last.*

### 1.4 Worked example (illustrative)

A headline generator is asked for a promotion headline and returns three variants. The
content scorer (§1.1) evaluates each *before* any campaign runs:

| Variant | Brand Safety | Tone | Readability | Relevance | `contentScore` | Rank |
|---|---|---|---|---|---|---|
| "Save 40% this week only" | pass | 0.82 | 0.90 | 0.88 | **0.860** | 1 |
| "Unbeatable prices, guaranteed forever" | pass | 0.70 | 0.85 | 0.55 | 0.680 | 2 |
| "Cheap deals — buy now, [banned word]" | **fail** | 0.60 | 0.80 | 0.70 | **0.000** | — |

- Variant 3 trips the Brand Safety gate, so it scores `0` and is never surfaced — no
  averaging saves it. This is gap **B-1** handled at the source.
- Variant 1 wins the ranking and becomes the recommended draft; variant 2 is the
  shortlist runner-up shown to the approver.
- Weeks later the campaign built on variant 1 returns an `exceeded` verdict. The outcome
  loop maps that to reward `1.0` and calls `observe(...)`, raising the EMA for the prompt
  version and model that produced it — so next mission the registry's `selectActive`
  prefers that prompt version automatically. The pre-outcome content score and the
  post-outcome reward reinforce each other.

---

## 2. Today — what the code actually does

### 2.1 🔶 Outcome scoring EXISTS, unwired

The EMA reward engine is fully implemented and unit-tested. It is **not** instantiated
by any live app path (`apps/web` never constructs it), so it is **BUILT (UNWIRED)**.

**`InMemoryLearningEngine`** — `packages/ai-manager/src/runtime/learning.ts:18-46`:

- `observe({ promptKey, model, reward, metadata })` updates two EMA tables:
  - `modelRewards`: `promptKey → model → EMA reward` (`learning.ts:24-26`)
  - `promptRewards`: `promptKey → version → EMA reward` (`learning.ts:28-32`), keyed by
    `metadata.promptVersion`.
- The EMA is `prior * 0.8 + reward * 0.2` (`learning.ts:49-51`) — responsive to recent
  outcomes, resistant to a single lucky campaign.
- `suggest(promptKey)` returns the best-performing `{ model?, promptVersion? }` for a
  key by picking the max-reward entry (`learning.ts:38-46`, `best()` at `:53-64`).
- When a `PromptRegistryPort` is injected, `observe` also calls `prompts.score(...)`
  (`learning.ts:34`) so registry A/B selection reflects the same outcomes.

**`InMemoryPromptRegistry`** — `domains/prompt-registry/src/in-memory-prompt-registry.ts`:

- `score(key, version, reward)` accumulates a per-version EMA
  (`prior * 0.8 + reward * 0.2`, `in-memory-prompt-registry.ts:66-75`).
- `selectActive(versions)` returns the highest-scoring version, falling back to the
  latest version when nothing has been scored yet (`:78-84`). This is the **A/B winner
  selection**: `get(key)` without a version returns the current winner (`:40-53`).

| Mechanism | Path | Tier |
|---|---|---|
| EMA reward per `(promptKey, model)` | `learning.ts:18-26` | 🔶 BUILT (UNWIRED) |
| EMA reward per prompt version | `learning.ts:28-32` | 🔶 BUILT (UNWIRED) |
| Best model/version suggestion | `learning.ts:38-46` | 🔶 BUILT (UNWIRED) |
| Per-version prompt scoring (EMA) | `in-memory-prompt-registry.ts:66-75` | 🔶 BUILT (UNWIRED) |
| A/B winner selection (`selectActive`) | `in-memory-prompt-registry.ts:78-84` | 🔶 BUILT (UNWIRED) |

**Why it is unwired.** No running service calls `observe` or `score`. Mission
completion records to Company Brain / Executive Memory in memory (`routes.ts:1118-1177`)
but does **not** convert the performance verdict into a reward signal, and the five
generation services never read a prompt from the registry. The scoring machinery spins
with no input and no consumer.

### 2.2 ❌ Content scoring does NOT exist

There is **no code** that scores the quality of a given creative. Confirming the
absence:

- Generation emits all six CreativeSet copy fields in **one** `creative.set` task
  (`domains/creative-studio/.../creative/service.ts:42-55`); it produces no variants and
  ranks nothing.
- No tone, readability, or on-brief-relevance scorer exists anywhere in `domains/` or
  `packages/`.
- The `bestHook` / `bestHeadline` fields that exist are stored **merge fields**, not the
  output of any scorer — nothing computes or compares them.

Content scoring is therefore **ROADMAP (ABSENT)**: a clean design spec, not a live
behavior. Do not describe it in the present tense.

### 2.3 What the checkers it would compose look like today

The content score is specified to compose the Part 4 checkers. Their status matters:

| Composed checker | Today | Note |
|---|---|---|
| Brand Safety | 🔶 partly built, unwired | A deterministic `RegexSafetyEngine` exists (`packages/ai-manager/src/runtime/safety-engine.ts:33-72`) detecting PII, secrets, injection, and brand-forbidden words — but it is not on the live path. See [`BRAND_SAFETY.md`](BRAND_SAFETY.md). |
| Tone | ❌ ROADMAP | No code. See [`TONE_CHECKER.md`](TONE_CHECKER.md). |
| Readability | ❌ ROADMAP | No code. See [`READABILITY.md`](READABILITY.md). |
| On-brief relevance | ❌ ROADMAP | No code; specified here. |

So even the components of the content score are a mix of unwired and absent — the
composite score is fully ❌ until they and the composition layer are built.

---

## 3. To build

Three tracks, in dependency order. Each cites the exact code to change or add.

### 3.1 Wire the outcome scoring (🔶 → ✅) — smallest, highest-leverage step

The engines already work; the build is *connection*, not invention.

1. **Instantiate** `InMemoryLearningEngine` and `InMemoryPromptRegistry` in the app
   composition root (`apps/web/src/app.ts`), injecting the registry into the learning
   engine so `observe` can call `score` (`learning.ts:16,34`).
2. **Emit a reward at mission completion.** Where the pipeline records outcomes
   (`apps/web/src/routes.ts:1118-1177`), map the performance verdict to a reward and
   call `observe({ promptKey, model, reward, metadata: { promptVersion } })`:

   | Verdict (Book A) | Reward |
   |---|---|
   | `exceeded` | `1.0` |
   | `on_track` | `0.6` |
   | `at_risk` | `0.1` |

   `model` comes from the artifact provenance already attached to every AI output
   (`provenance{ model, engine, ... }`).
3. **Read the winner at generation.** Have generation services fetch their prompt via
   `promptRegistry.get(key)` (winner-by-score, `in-memory-prompt-registry.ts:40-53`) and
   optionally consult `learning.suggest(key)` (`learning.ts:38-46`) to pick the model.
   This is the wiring that turns the dormant A/B mechanism into a live loop.

**Result:** prompt versions and local models are ranked by real outcomes; the best one
is chosen automatically next mission. This is the outcome half of §1.2, made live.

### 3.2 Build content scoring (❌ → new code)

1. **Add the on-brief relevance checker** (new, this document's component): keyword /
   coverage overlap between a variant and the brief's objective, offer, and audience
   fields. Deterministic and offline.
2. **Add the composition layer** — a `ContentScorer` that calls Brand Safety, Tone,
   Readability, and relevance and returns `{ score, pass, breakdown }` per the formula
   in §1.1, with Brand Safety as a hard gate.
3. **Keep it pure and offline** — no model server, reproducible, explainable breakdown
   attached to each variant.

### 3.3 Feed content scoring into variant selection

1. **Per-asset generators produce N variants.** The headline and hook generators are
   specified to emit multiple candidates; scoring ranks them and returns the best plus a
   shortlist. See [`../2-creative-factory/HEADLINE_GENERATOR.md`](../2-creative-factory/HEADLINE_GENERATOR.md)
   and [`../2-creative-factory/HOOK_GENERATOR.md`](../2-creative-factory/HOOK_GENERATOR.md)
   for the variant-selection contract this scorer serves.
2. **Winner detection consumes both scores.** Part 3's
   [`../3-learning-engine/WINNER_DETECTION.md`](../3-learning-engine/WINNER_DETECTION.md)
   detects the outcome winner post-campaign; the content score is its *pre-outcome*
   prior. The reward that winner detection produces is exactly the signal §3.1 feeds
   back into `observe`, closing the loop.

### 3.4 Design decisions the wiring must respect

- **Cold start.** Until a prompt version has been scored, `selectActive` falls back to
  the latest version (`in-memory-prompt-registry.ts:78-84`) and `suggest` returns `null`
  (`learning.ts:41`). Generation must treat a `null` suggestion as "use the default
  prompt/model," never as an error. New prompt versions therefore get a fair chance
  before their EMA exists.
- **Reward attribution.** A reward must be attributed to the *exact* `(promptKey, model,
  promptVersion)` that produced the creative — read those from the artifact provenance
  (`provenance{ model, engine, ... }`) recorded at generation, not from whatever prompt
  happens to be active at completion time. Mis-attribution would reward the wrong
  version.
- **EMA smoothing is intentional.** The `0.8 / 0.2` weighting (`learning.ts:49-51`,
  `in-memory-prompt-registry.ts:73`) means one campaign moves a score only ~20% of the
  gap. A single lucky or unlucky result cannot flip the winner — stability by design.
- **In-memory scope.** Both engines store rewards in process memory (`Map`s). Scores
  reset on restart and are not tenant-scoped as written; durable, tenant-scoped storage
  of scores is follow-on build work, not part of the initial wiring.

### 3.5 Build ledger

| Work item | From → To | Where |
|---|---|---|
| Instantiate learning + registry engines | 🔶 → ✅ | `apps/web/src/app.ts` |
| Verdict → reward → `observe` at completion | 🔶 → ✅ | `apps/web/src/routes.ts:1118-1177` |
| Generation reads winning prompt via `get`/`suggest` | 🔶 → ✅ | five generation services |
| On-brief relevance checker | ❌ → new | new `packages/ai-manager` component |
| `ContentScorer` composition layer | ❌ → new | new component |
| Rank N variants in per-asset generators | ❌ → new | Part 2 generators |
| Content score as prior to winner detection | ❌ → new | Part 3 `WINNER_DETECTION.md` |

---

## 4. Interfaces (specification)

Illustrative shapes; the outcome side mirrors code that already exists.

```ts
// Outcome scoring — already implemented (learning.ts, ports)
interface LearningEnginePort {
  observe(signal: {
    promptKey: string;
    model: string;
    reward: number;                 // 0..1, from verdict mapping (§3.1)
    metadata?: { promptVersion?: number };
  }): Promise<void>;
  suggest(promptKey: string): Promise<{ model?: string; promptVersion?: number } | null>;
}

// Content scoring — ROADMAP, to build (§3.2)
interface ContentScore {
  score: number;                    // 0..1 composite
  pass: boolean;                    // false if Brand Safety gate fails
  breakdown: { tone: number; readability: number; relevance: number };
  safety: { pass: boolean; issues: string[] };
}
interface ContentScorerPort {
  score(variant: string, ctx: { brandId: string; brief: unknown }): Promise<ContentScore>;
  rank(variants: string[], ctx: { brandId: string; brief: unknown }): Promise<ContentScore[]>;
}
```

---

## 5. Relationship to the rest of Book B

Scoring is the join point where several Book B streams meet. It consumes the checkers of
Part 4, serves the generators of Part 2, and feeds the detectors of Part 3.

| Doc | Direction | Relationship |
|---|---|---|
| [`BRAND_SAFETY.md`](BRAND_SAFETY.md) | consumes | Hard gate in the content score; a fail disqualifies a variant. |
| [`TONE_CHECKER.md`](TONE_CHECKER.md) | consumes | Weighted tone term in the content score. |
| [`READABILITY.md`](READABILITY.md) | consumes | Weighted readability term in the content score. |
| [`../2-creative-factory/HEADLINE_GENERATOR.md`](../2-creative-factory/HEADLINE_GENERATOR.md) | serves | Ranks the generator's candidate headlines; returns best + shortlist. |
| [`../2-creative-factory/HOOK_GENERATOR.md`](../2-creative-factory/HOOK_GENERATOR.md) | serves | Ranks the generator's candidate hooks. |
| [`../3-learning-engine/WINNER_DETECTION.md`](../3-learning-engine/WINNER_DETECTION.md) | serves / consumes | Content score is a pre-outcome prior; the detector's outcome verdict becomes the reward fed back to `observe`. |

The governing rules for status honesty, offline operation, and human approval are set by
[`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) and are
binding on this document.

---

## 6. Guardrails

- **Never blur the two scores.** Outcome scoring is 🔶 (built, unwired); content scoring
  is ❌ (absent). Do not report either as shipped.
- **Brand Safety is a gate, not a weight** — a safety failure disqualifies a variant.
- **Offline & deterministic** — every checker runs locally, no cloud, no API key,
  reproducible for the same input.
- **Human approval is unchanged.** Scoring ranks and recommends; it never launches and
  never replaces the approval click (`agency-os/src/approval/approval.ts`,
  `apps/web/src/routes.ts:478-481`). The approver still chooses.
- **Explainability is mandatory.** Every score — content or outcome — must expose its
  component breakdown so a human can see *why* one variant or prompt version ranked
  above another. A bare number is not acceptable output.
- **No cloud, no telemetry.** Scores are computed and stored locally; no reward signal,
  score, or ranking is sent anywhere off the machine.

---

## Value contribution

- **Revenue ↑** — objectively picking the best variant, prompt version, and local model
  (instead of shipping the first draft) raises the quality and outcome of the creative
  that actually reaches a campaign. Outcome scoring compounds this: the prompt/model that
  historically wins is chosen automatically next mission.
- **Production time ↓** — auto-ranking variants and auto-selecting the winning prompt
  removes the manual "which of these is best?" comparison from the approver's desk,
  shrinking review time to a confirm-the-recommendation click.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
