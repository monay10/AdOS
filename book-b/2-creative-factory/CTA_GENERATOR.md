# CTA Generator — Part 2, Creative Factory

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |

> **Implementation status.** ⚠️ **PARTIAL.** A call-to-action **is produced today**, but only as **one field of the single-shot creative set** (`cta` on `domains/creative-studio/src/creative/service.ts:42-55`). A **dedicated CTA generator** — one that emits multiple on-brand, channel-appropriate CTA variants for testing and ties them to scoring — is **❌ ROADMAP**: no such code exists.

---

## 1. Why a CTA stage exists

The call-to-action is the smallest unit of copy that most directly moves a revenue
number. A headline earns the click; the **CTA earns the conversion**. Two ads with
identical bodies and different button verbs ("Get started" vs. "Book your free
audit") can carry materially different conversion rates and, therefore, different
CPA and ROAS. Because the CTA is short, high-leverage, and cheap to vary, it is the
single best surface in the Creative Factory for **structured, testable variation**.

Today AdOS treats the CTA as a byproduct of one large generation. The **target
design** promotes it to a first-class stage that produces a **small slate of
candidate CTAs per channel**, each tone-matched to the brand and destined for the
Part 4 scoring loop. This document specifies that stage, states precisely what the
code does now, and draws the line between the two per the tiers below.

**Tier legend** — `✅ SHIPPED` (runs in the live app path) · `🔶 BUILT (UNWIRED)`
(code exists in the repo, unit-tested, but no running app path instantiates it) ·
`❌ ROADMAP (ABSENT)` (no implementation; design only).

---

## 2. Target design — a dedicated CTA stage

The target CTA stage sits inside the Creative Factory, downstream of the brief and
alongside the copy and headline stages. Where the copy stage writes the argument
and the headline stage writes the hook, the CTA stage writes the **ask** — and it
writes several, not one.

### 2.1 Position in the agent pipeline

```
Campaign Brief → Planning → Research → Memory → Brand
      → Prompt Orchestrator → Generation
            ├─ Copy stage      (see COPY_GENERATOR.md)
            ├─ Headline stage  (see HEADLINE_GENERATOR.md)
            └─ CTA stage       ← this document
      → Quality → Brand Safety → Revision → Approval → Learning → Optimization
```

The CTA stage consumes the same **CreativeContext** DTO the copy and headline
stages consume (`domains/creative-studio/src/creative/creative-set.ts:18-29`):
`brandVoice`, `objective`, `targetAudience`, `positioning`, `keyMessages`. Its
distinguishing input is **channel** and **destination** — a CTA on a paid social
ad, an email button, and a landing-page hero are not interchangeable.

### 2.2 Target inputs and outputs

| Input | Source | Role in CTA generation |
|---|---|---|
| `objective` | Marketing Brief → `CreativeContext.objective` | Anchors the verb to the desired action (lead, sale, signup) |
| `brandVoice` | Brand → `CreativeContext.brandVoice` | Tone-matches the phrasing (formal vs. playful) |
| `targetAudience` | Brief → `CreativeContext.targetAudience` | Calibrates urgency and reading level |
| `channel` | Campaign plan (per ad set) | Selects length + placement conventions per surface |
| Brand banned-words | Brand rules (`brand/brand.ts`) | Filters unsafe phrasing — see Part 4 Brand Safety |

**Output** (target): a `CtaSet` — an ordered slate of **3–5 CTA variants per
channel**, each carrying its own `provenance{taskId,capability,model,engine,
latencyMs}` so every candidate is reproducible and auditable, exactly as the
shipped creative set is today (`domains/creative-studio/src/creative/service.ts:71-77`).

```
CtaSet
  channel: 'paid_social' | 'email' | 'landing_page' | ...
  variants: [
    { text: 'Start your free trial', tone: 'direct',    provenance },
    { text: 'See what you could save', tone: 'curiosity', provenance },
    { text: 'Book a 15-minute demo',   tone: 'concrete',  provenance },
  ]
```

### 2.3 Channel conventions the stage must respect

A CTA is only "good" relative to where it lands. The target stage carries a small
table of per-channel conventions and generates each slate against the row for its
surface. These conventions are design guidance for the prompt the orchestrator
builds — they are **not** enforced by any code today.

| Channel | Typical length | Voice register | Example ask |
|---|---|---|---|
| `paid_social` | 2–4 words, thumb-stopping | Punchy, urgent | "Claim your spot" |
| `email` | Short button + inline nudge | Conversational | "See your report" |
| `landing_page` | Hero verb phrase | Confident, benefit-led | "Start your free trial" |
| `search` | Tight, intent-matched | Direct, literal | "Get a quote" |
| `display` | Very short, glanceable | Bold | "Shop now" |

Today the app produces a top-level `cta` and a `landingPage.cta`
(`domains/creative-studio/src/creative/creative-set.ts:43-50`), which is a coarse,
two-surface approximation of this table baked into the single creative shot. The
target stage generalizes it to a per-channel loop.

### 2.4 A worked slate (illustrative target output)

For a lead-generation objective, a formal B2B brand voice, and the `email` channel,
the target stage would return a slate the scoring loop can rank — for example:

| Variant | Tone | Why it might win |
|---|---|---|
| "Book your free audit" | Concrete | Names the deliverable; low friction |
| "See where you're overspending" | Curiosity | Implies a payoff without a price |
| "Get my savings estimate" | First-person | First-person buttons often lift clicks |

Only one of these exists today, chosen implicitly by the single generation call.
The target design produces all three, tags each with provenance, and lets Part 4
decide — turning a guess into a measured selection.

### 2.5 Design principles

1. **Variants, not a single answer.** The stage's reason to exist is to give the
   scoring loop something to choose between. One CTA is the current reality; a
   **slate** is the target.
2. **Channel-appropriate by construction.** Each variant is generated against a
   channel's conventions (button length for email, hero phrasing for landing
   pages, thumb-stopping brevity for paid social).
3. **Tone-matched to the brand.** Every variant passes through the same brand voice
   the rest of the Creative Factory uses; the CTA never breaks character.
4. **Scored, not guessed.** Variants are handed to the Part 4 scoring/optimization
   loop rather than chosen by the model's first instinct.
5. **Copy only.** Like every Creative Factory stage, the CTA generator writes text
   and never touches campaigns or ad platforms
   (`domains/creative-studio/src/creative/creative-set.ts:13-16`).

---

## 3. Today — what the code actually does

**Tier: ⚠️ PARTIAL.** A CTA is generated on every mission, but it is a **single
field emitted inside one creative shot**, not the output of a dedicated,
variant-producing stage.

### 3.1 The CTA is one field of the single creative set

`CreativeStudioService.generate` makes **exactly one** `ai.submit` call with
`promptRef { key: 'creative.set', version: 1 }`
(`domains/creative-studio/src/creative/service.ts:42-55`). That single task returns
all six creative fields at once. The response schema the service declares lists
`cta` as one required string among the six
(`domains/creative-studio/src/creative/service.ts:9-21`):

| Creative field | Type | Carries a CTA? |
|---|---|---|
| `headline` | `string` | No |
| `adCopy` | `string` | No |
| **`cta`** | **`string`** | **Yes — the primary CTA** |
| `socialPost` | `string` | No |
| `landingPage` | `{ headline, body, cta }` | **Yes — a second CTA on the landing page** |
| `email` | `{ subject, body }` | The ask lives inside `body`, no discrete CTA field |

The shape is defined on `CreativeContent`
(`domains/creative-studio/src/creative/creative-set.ts:43-50`), with the landing
page carrying its own `cta` via `LandingPageCopy`
(`creative-set.ts:31-35`). So the app already produces **two** CTA strings per
mission — the top-level `cta` and `landingPage.cta` — but both fall out of the
**same** generation call, not from a CTA-specific engine.

### 3.2 The default output is a fixed string

Under the default **OfflineAIManager** (the deterministic stub that ships as the
app default — `apps/web/src/ai.ts:13`), the CTA is not model-written at all: it is
a constant template value, e.g. `cta: 'Get started'`
(`apps/web/src/ai.ts:94`) and `cta` resolved to a fixed fallback
(`apps/web/src/ai.ts:113`). Genuine, varied CTA prose requires a locally-run engine
(Ollama or an OpenAI-compatible local server); even then, it is still **one** CTA
per field per shot.

### 3.3 What is therefore true and not true today

| Statement | Tier |
|---|---|
| A CTA string is generated on every mission | ✅ SHIPPED |
| A landing-page CTA is generated alongside it | ✅ SHIPPED |
| CTAs carry provenance and are gated by human approval | ✅ SHIPPED |
| CTAs are produced by a **dedicated** CTA stage | ❌ not today (one field of `creative.set`) |
| **Multiple** CTA variants are produced for testing | ❌ ROADMAP |
| CTAs are generated **per channel** with channel conventions | ❌ ROADMAP |
| CTA variants are **scored** and the winner selected | ❌ ROADMAP |

The human approval workflow that governs the creative set today
(`domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481`)
already gates the CTA as part of the `creative_assets` stage — that gate carries
forward unchanged into the target design.

### 3.4 Generation mechanics the CTA already rides on

Even though there is no dedicated CTA stage, today's single CTA field is produced
through the same live generation mechanics the target stage will reuse — so the
build is additive, not a rewrite. All of the following are `✅ SHIPPED`:

| Mechanic | What it does for the CTA | Evidence |
|---|---|---|
| Single `ai.submit` per task | The `creative.set` call that emits `cta` | `service.ts:42-55` |
| Schema-as-prompt-text | `cta` listed required in the declared schema | `service.ts:9-21` |
| JSON extraction from output | Pulls the `cta` field out of model prose | `apps/web/src/ai-live.ts:179-198` |
| One self-repair retry | A single repair turn if the JSON is malformed | `apps/web/src/ai-live.ts:49-67` |
| Language injection | CTA is written in the mission's TR/EN language | `apps/web/src/ai-live.ts:139-141` |
| Provenance stamp | Every generated set (incl. CTA) is reproducible | `service.ts:71-77` |

The target CTA generator changes **what is asked for** (a per-channel slate of
variants) and **what happens after** (scoring + selection), not the underlying
submit/extract/repair/provenance machinery, which stays exactly as shipped.

---

## 4. To build — a dedicated CTA generator

**Tier: ❌ ROADMAP.** None of the following exists in code today; this is a clean
design specification. It reuses the shipped generation mechanics (one `ai.submit`
per task, schema-as-prompt-text, JSON extraction, one self-repair retry,
provenance) and adds the variant + channel + scoring structure on top.

### 4.1 Build ledger

| Build item | Target tier after wiring | Nearest existing code | Today |
|---|---|---|---|
| Dedicated `creative.cta` task | ✅ once wired | `creative.set` task pattern (`service.ts:42-55`) | ❌ folded into `creative.set` |
| Multi-variant `CtaSet` output | ✅ once wired | single `cta` field (`creative-set.ts:43-50`) | ❌ one string |
| Per-channel generation loop | ✅ once wired | top-level + `landingPage.cta` only | ❌ two fixed surfaces |
| Brand/banned-word injection | 🔶 → ✅ | `safety-engine.ts:57-64`, `governance.ts` (unwired) | ❌ not on live path |
| Variant scoring / EMA reward | 🔶 → ✅ | `ai-manager/src/runtime/learning.ts:18-46` | 🔶 unwired |
| Winner selection | ❌ → ✅ | none (stored merge fields only) | ❌ no detector |
| Learning read-back into slate | ❌ → ✅ | recorded at completion (`routes.ts:1146-1170`) | ❌ write-only |

### 4.2 Build steps

1. **Introduce a `cta` capability task.** Add a dedicated prompt key (e.g.
   `creative.cta`) so the CTA is generated by its own task rather than as a field
   of `creative.set`. The task takes `CreativeContext` plus a `channel` argument.
2. **Emit a slate, not a field.** Have the task return a `CtaSet` of 3–5 variants
   (§2.2), each with independent provenance. Loop the task per channel so each
   surface gets its own slate.
3. **Channel conventions as prompt structure.** Encode per-channel constraints
   (length, placement, verb style) in the prompt the orchestrator builds, so
   variants are channel-appropriate by construction rather than by post-hoc edit.
4. **Tone-match through Brand injection.** Route the CTA prompt through the same
   brand-rule and banned-word injection the rest of the Creative Factory will use
   (Book A walkthrough gap **B-1**, bannedWords enforcement — the enforcement code
   exists unwired at `domains/executive-memory/src/governance.ts` and
   `packages/ai-manager/src/runtime/safety-engine.ts:57-64`; wiring it is Book B
   work). This keeps every CTA variant on-brand and safe.
5. **Hand variants to scoring.** Emit each variant into the Part 4 optimization
   loop so the winner is chosen by score, not by the model's first guess (§4.3).

### 4.3 Tie to Part 4 Scoring

A CTA generator without scoring is just "more strings." The value comes from the
**closed loop**: generate a slate → score each variant → select and record the
winner → let the next mission's slate benefit from what won.

- **Scoring engine.** The reward/scoring machinery already exists unwired — the
  EMA-based learning engine at `packages/ai-manager/src/runtime/learning.ts:18-46`
  and the versioned, A/B-scored prompt registry at
  `domains/prompt-registry/src/in-memory-prompt-registry.ts:55-92`. Both are
  🔶 **BUILT (UNWIRED)**: coded and unit-tested, but no running app path
  instantiates them. Wiring them so CTA variants are ranked is Book B build work.
- **Winner selection.** Choosing the best CTA is a ❌ ROADMAP capability today — no
  winner/loser detector exists (`bestHook`/`bestHeadline` are stored merge fields,
  not the output of a detector). The CTA generator is a natural first consumer of a
  real selection step.
- **Read-back into generation.** The learning loop is currently **write-only
  relative to generation** — memory is recorded at mission completion
  (`apps/web/src/routes.ts:1146-1170`) but no generator reads it back (Book A
  walkthrough gap **B-2**). Closing that loop for CTAs — so a winning CTA pattern
  informs the next slate — is the headline design goal, not a shipped behavior.

This is the same architecture the sibling copy and headline generators target; the
CTA stage is where it pays off first because the CTA is the shortest, most-tested,
most conversion-adjacent unit of copy.

---

## 5. Relationship to sibling stages

| Stage | Writes | Document |
|---|---|---|
| Copy generator | The argument / body | [`COPY_GENERATOR.md`](COPY_GENERATOR.md) |
| Headline generator | The hook | [`HEADLINE_GENERATOR.md`](HEADLINE_GENERATOR.md) |
| **CTA generator** | **The ask** | **this document** |

All three are today collapsed into the **single** `creative.set` task
(`domains/creative-studio/src/creative/service.ts:42-55`); the target design splits
them into dedicated, variant-producing, individually scored stages that share the
same `CreativeContext`, brand injection, and provenance discipline. See the
end-to-end creative flow in
[`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md).

---

## 6. Known limitations carried by this stage

The gap between today's single CTA field and the target CTA generator is one facet
of the broader Creative Factory limitations. In summary:

- **No variant generation.** The app emits one `cta` (plus one `landingPage.cta`),
  never a slate. `❌ ROADMAP`.
- **No per-channel awareness.** CTAs are not generated against channel conventions;
  the only surface distinction is top-level vs. landing page. `❌ ROADMAP`.
- **No enforced brand safety on the CTA.** Banned-word enforcement code exists but
  is unwired (`packages/ai-manager/src/runtime/safety-engine.ts:57-64`); a CTA can
  today contain a banned phrase without being blocked (Book A gap **B-1**). `🔶`.
- **No scoring or winner selection.** Nothing ranks CTA candidates; the learning
  engine that could is `🔶 BUILT (UNWIRED)`
  (`packages/ai-manager/src/runtime/learning.ts:18-46`).
- **No learning read-back.** A winning CTA does not inform the next mission's CTA;
  memory is write-only relative to generation (Book A gap **B-2**). `❌ ROADMAP`.

For the authoritative, repo-wide list of what is and is not implemented, see
[`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) and
[`../../KNOWN_LIMITATIONS.md`](../../KNOWN_LIMITATIONS.md).

---

## 7. Value contribution

- **Revenue ↑.** The CTA is the copy element closest to the conversion event.
  Generating **multiple on-brand, channel-appropriate CTA variants** and letting the
  scoring loop pick the winner lifts click-to-conversion and pushes **CPA down /
  ROAS up** without any change to spend. A better button verb is the cheapest lever
  in the funnel.
- **Production time ↓.** Today a human edits the single generated CTA by hand when it
  is weak or off-channel. A dedicated generator that emits a ready-to-test slate per
  channel removes that manual rewrite from the `creative_assets` approval step,
  shortening time-to-first-draft while keeping the human as approver, not author.

Both effects are consistent with the AdOS value rule: every capability must increase
the agency's revenue or reduce its production time. The CTA stage does both.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
