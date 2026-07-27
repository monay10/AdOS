# Creative QA — Quality-Assuring Generated Copy Before a Human Sees It

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP (automated)** / ✅ (human). There is **no
> automated content QA of creative** in AdOS today — no quality-scoring, readability,
> tone, or on-brief relevance code exists (verified absent). The only quality assurance
> that runs today is **structural** — JSON extraction plus the service's manual shape
> re-check (`domains/creative-studio/src/creative/service.ts:102-123`, ✅) — and the
> **human approval** at the `creative_assets` gate (✅). The automated content-QA stage
> described here is a design specification.

---

## 1. Why this document exists

A local language model, asked for a **CreativeSet**, returns six copy fields —
`headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, `email` — in one shot
(`domains/creative-studio/src/creative/service.ts:42-55`). It returns them whether they
are on-brief or off-topic, whether they honor the brand voice or ignore it, whether they
contain a banned word or not, and whether they read cleanly or awkwardly. Nothing in the
generation step judges the *content* of what came back. The model produces; it does not
critique.

Between that raw generation and the human reviewer who clicks approve at the
`creative_assets` gate, there is an opportunity — and, in the target architecture, an
obligation — to run an automated **Creative QA** stage: a set of cheap, deterministic-
where-possible checks that either **pass** a field or **flag** it, so the human reviewer
opens a first draft that has already been triaged rather than a raw dump.

This document defines that target QA stage, states precisely what QA exists **today**
(structural validation plus human approval — nothing more), and specifies the **build**
work, which composes engines documented elsewhere in Book B. Creative QA writes no new
scoring logic of its own: it **orchestrates** the Validation Pipeline (Part 1) and the
Brand Safety, Tone, Readability, and Scoring engines (Part 4). Every one of those content
checks is **Roadmap** or **built-but-unwired**; none runs on the live path.

This is Book A gap **B-1** (bannedWords are declared on the Brand but never enforced
against generated copy) seen from the creative side — see
[`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md).

A note on scope. "QA" here means quality-assuring the *generated copy* — the six fields of
one `CreativeSet` — on its way to a human. It is not campaign QA, not analytics QA, and not
a review of the human's decision. The unit of work is a single creative draft, and the
audience of the QA report is the one reviewer standing at the `creative_assets` gate. Keep
that scope in mind throughout: everything below is about making that one handoff — model
output to human reviewer — safer and faster.

---

## 2. Target design — the Creative QA stage

The target Creative QA stage sits on the pipeline **after** the Validation Pipeline has
produced a well-formed `CreativeSet` object and **before** the object is presented at the
`creative_assets` approval gate. It never blocks silently and never rewrites: it annotates.
Every check emits a **verdict** (`pass` | `flag`) and, on a flag, a short human-readable
reason attached to the specific field. A flag does **not** stop the draft — the human
reviewer still decides — it directs attention.

### 2.1 The five checks

| # | Check | Question it answers | Source of truth | On flag |
|---|---|---|---|---|
| 1 | **Structural validity** | Are all six fields present and correctly shaped? | `responseSchema` / shape check | Reject before QALL — object is malformed |
| 2 | **Brand-voice fit** | Does the copy match the brand's declared `voice`/`rules`? | `brand.ts` voice + rules | Flag field, cite the rule missed |
| 3 | **bannedWords safety** | Does any field contain a brand-banned term? | `brand.ts` banned words | Flag field, name the term (gap **B-1**) |
| 4 | **Clarity / readability** | Is each field readable at the target reading level? | Readability engine (Part 4) | Flag field, report the grade/length |
| 5 | **On-brief relevance** | Does the copy address the brief's objective, audience, key messages? | MarketingBrief fields | Flag field, note the drift |

Structural validity (check 1) is a **hard gate** — a malformed object is not creative, it
is a bug, and the Validation Pipeline stops it before QA runs at all. Checks 2–5 are
**advisory** — they produce flags that ride alongside the draft into the human review UI.

### 2.1.1 Check-by-check design intent

- **Structural validity.** Answered entirely by Part 1. If the six fields and their
  nested shapes are not present and correctly typed, there is nothing to QA — the object
  never reaches the advisory checks. This is the only check with veto power.
- **Brand-voice fit.** The Brand aggregate carries a declared `voice` and a list of
  `rules` (`domains/agency-os/src/brand/brand.ts:20-42`). The QA check asks, per field,
  whether the copy is consistent with that voice — e.g. a brand whose voice is
  *"warm, plain-spoken, no jargon"* should flag a `landingPage.body` full of corporate
  buzzwords. This is a model-judgment check and must degrade to `pass` on engine error.
- **bannedWords safety.** The Brand also carries `bannedWords`. This check is a pure,
  deterministic substring/token scan of every field against that list — no model call,
  zero tokens. It is the single most important advisory check because it is exactly Book A
  gap **B-1**: today those banned words are declared but **never** checked against
  generated copy.
- **Clarity / readability.** A pure metric check (sentence length, syllable/word ratios,
  a grade estimate) per field, compared against a target reading level appropriate to the
  channel — a `socialPost` and an `email` body have different tolerances. Deterministic,
  zero tokens.
- **On-brief relevance.** The MarketingBrief carries the objective, target audience,
  positioning, and key messages that were fed into generation. This check asks whether the
  copy actually addresses them, catching the common failure where the model produces
  fluent copy that has quietly drifted off-brief. Model-judgment; degrades to `pass`.

### 2.2 Output shape

The QA stage attaches a compact report to the `CreativeSet` (as review metadata, never
mutating the copy itself):

```
CreativeQAReport {
  overall: 'clean' | 'flagged'
  checks: [
    { field: 'headline',   check: 'bannedWords', verdict: 'flag', reason: "contains 'guaranteed'" },
    { field: 'adCopy',     check: 'relevance',   verdict: 'pass' },
    { field: 'socialPost', check: 'readability', verdict: 'flag', reason: 'grade 14, target ≤ 9' },
    ...
  ]
}
```

The human reviewer at the `creative_assets` gate sees `flagged` fields highlighted with
their reasons. Nothing is auto-rejected on an advisory flag; the reviewer approves,
requests revision, or edits — exactly as today, but **informed**.

### 2.3 Where QA sits in the agent pipeline

```
Brief → Creative Generation → Validation Pipeline → [ Creative QA ] → Human Review (creative_assets gate)
                                    (Part 1)          (this doc)          (✅ shipped)
                                                          │
                                    composes ┌────────────┼─────────────┐
                                             ▼            ▼             ▼
                                     Brand Safety     Tone /        Scoring
                                     (Part 4)       Readability     (Part 4)
                                                    (Part 4)
```

Creative QA is a **composition point**, not a new engine. It calls the Validation
Pipeline for structure and the Part 4 content engines for the advisory checks, then folds
their verdicts into one report.

### 2.4 A worked example (target behavior)

Suppose the brief's objective is *"drive trial sign-ups from cost-conscious small-business
owners"*, the brand voice is *"plain, honest, no hype"*, and `bannedWords` includes
`guaranteed`. The model returns a well-formed `CreativeSet`. In the target design, QA runs
and produces:

| Field | Check | Verdict | Reason |
|---|---|---|---|
| `headline` | bannedWords | `flag` | contains `guaranteed` (gap **B-1**) |
| `headline` | relevance | `pass` | — |
| `adCopy` | brand-voice | `flag` | hype tone conflicts with voice `plain, honest, no hype` |
| `socialPost` | readability | `flag` | grade 14, target ≤ 9 for social |
| `landingPage.body` | relevance | `pass` | — |
| `email.subject` | readability | `pass` | — |

`overall: 'flagged'`. The draft still goes to the human at the `creative_assets` gate —
nothing was rejected or rewritten — but the reviewer now opens a triaged draft with three
specific, field-scoped issues highlighted instead of six raw text blocks to read cold.

---

## 3. Today — what QA actually runs

Exactly two things assure quality on the live path today. Both are real; neither inspects
creative *content*.

### 3.1 Structural QA — extraction + manual shape check ✅ SHIPPED

When the Creative Studio service receives the model's output, it runs a hand-written
shape check before the copy becomes a `CreativeSet`:

- The AI Manager's live path extracts a JSON value from chatty model text (strip fences,
  take the balanced object) — `apps/web/src/ai-live.ts:179-198` (✅).
- The service then re-checks the shape by hand in `validateContent` — every one of the
  six fields must be present and of the right type, including the nested
  `landingPage{headline,body,cta}` and `email{subject,body}` — or the whole set is
  rejected as *malformed* — `domains/creative-studio/src/creative/service.ts:102-123`
  (✅). The declared `CREATIVE_SCHEMA` (`:9-21`) is passed to the AI Manager as
  `responseSchema` but is **not** machine-enforced on the live path; the manual check
  stands in for enforcement.

| Property | Status | Evidence |
|---|---|---|
| JSON extraction from model text | ✅ SHIPPED | `apps/web/src/ai-live.ts:179-198` |
| Manual six-field shape re-check | ✅ SHIPPED | `domains/creative-studio/src/creative/service.ts:102-123` |
| Malformed set → typed rejection | ✅ SHIPPED | `creative/service.ts:120` |
| Schema **machine-enforced** on live path | 🔶 BUILT (UNWIRED) | `packages/ai-manager/src/runtime/validation-engine.ts` — see Part 1 |

That is the entire automated QA on the live path. It answers one question — *"is this a
well-formed object?"* — and nothing about whether the copy is good, on-brief, on-voice,
or safe.

### 3.2 Human QA — the `creative_assets` approval gate ✅ SHIPPED

The only *content* quality assurance today is a person. The Mission stops at the
`creative_assets` gate and a human reviewer reads the six fields and decides — approve,
or request revision (`domains/agency-os/src/approval/approval.ts`,
`apps/web/src/routes.ts:478-481`). The reviewer is the reader of last resort and, today,
the only reader that judges content at all. See
[`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md) for the gate's
place in the pipeline.

### 3.3 What is absent — automated content QA ❌ ROADMAP

The following do **not** exist anywhere in the codebase (verified absent — no
quality/readability/tone/relevance/scoring code):

| Automated content check | Status | Note |
|---|---|---|
| Quality scoring of creative | ❌ ROADMAP | no scoring code of any kind |
| Readability / clarity grading | ❌ ROADMAP | no readability code |
| Tone / brand-voice fit check | ❌ ROADMAP | no tone analyzer |
| bannedWords enforcement vs copy | 🔶/❌ | enforcement engine unwired; **not** on live path (gap **B-1**) |
| On-brief relevance check | ❌ ROADMAP | no analyzer of brief↔copy alignment |
| Per-asset (hook/headline/CTA) QA | ❌ ROADMAP | one `creative.set` task emits all fields at once |

No automated stage today looks at the *meaning* of a headline. The human at the
`creative_assets` gate is the entire content-QA function.

---

## 4. To build — composing existing engines into the QA stage

Creative QA is deliberately thin. It **writes almost no new logic**; it wires together
checks that are specified — and in several cases already coded, unwired — elsewhere in
Book B. The build is mostly integration and orchestration.

### 4.1 What each check composes

| QA check | Provided by | That engine's tier | Book B doc |
|---|---|---|---|
| 1 · Structural validity | Validation Pipeline (schema-enforced) | 🔶 BUILT (UNWIRED) | [`../1-ai-foundations/VALIDATION_PIPELINE.md`](../1-ai-foundations/VALIDATION_PIPELINE.md) |
| 2 · Brand-voice fit | Tone check + brand rules | ❌ ROADMAP | [`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md), [`../4-optimization/BRAND_SAFETY.md`](../4-optimization/BRAND_SAFETY.md) |
| 3 · bannedWords safety | Brand Safety engine | 🔶/❌ (unwired) | [`../4-optimization/BRAND_SAFETY.md`](../4-optimization/BRAND_SAFETY.md) |
| 4 · Clarity / readability | Readability engine | ❌ ROADMAP | [`../4-optimization/SCORING.md`](../4-optimization/SCORING.md) |
| 5 · On-brief relevance | Scoring engine (relevance) | ❌ ROADMAP | [`../4-optimization/SCORING.md`](../4-optimization/SCORING.md) |

**The content checks (2–5) live in Part 4, and every one of them is Roadmap or
built-but-unwired — none runs today.** Creative QA cannot ship before those engines
exist; this document specifies the seam they plug into, not the engines themselves. The
governing rules for what "quality" means are defined in
[`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md).

### 4.2 Build steps

1. **Wire schema enforcement first** (Part 1). Replace the manual `validateContent` shape
   check with the built-but-unwired `SchemaValidationEngine`
   (`packages/ai-manager/src/runtime/validation-engine.ts`) so check 1 is enforced, not
   hand-rolled. This is a prerequisite: QA should never run advisory checks on an object
   that is not yet proven well-formed.
2. **Define `CreativeQAReport`** as review metadata on the `CreativeSet` aggregate —
   additive, non-mutating, never touching the six copy fields.
3. **Introduce a `CreativeQAService`** that, after generation and validation, calls each
   Part 4 content engine per field, collects `pass`/`flag` verdicts, and assembles the
   report. It owns no scoring logic — it only orchestrates and aggregates.
4. **Surface flags in the review UI** at the `creative_assets` gate: highlight flagged
   fields with their reasons so the human reviewer triages faster. Approval authority is
   unchanged — flags inform, they do not gate.
5. **Record QA outcomes** alongside the mission's other completion signals so the Learning
   Engine (Part 3) can later correlate QA flags with downstream performance. (Recording is
   in-memory and write-only today; reading it back into generation is gap **B-2** and out
   of scope for this doc.)

### 4.3 Design constraints

- **Advisory, not blocking.** Except for the hard structural gate, QA never rejects a
  draft. The human at `creative_assets` remains the decision-maker
  (`apps/web/src/routes.ts:478-481`). This preserves the Book A approval model exactly.
- **Non-destructive.** QA annotates; it never edits copy. AI revision/rewrite is itself
  Roadmap (`requestRevision` is human-only today — gap **B-3**); QA must not smuggle in an
  auto-rewrite.
- **Deterministic where possible.** bannedWords and readability can be pure string/metric
  checks (no model call, zero tokens); brand-voice and relevance may use a model judgment
  but must degrade to `pass` on engine failure rather than block the pipeline.
- **Local-only.** Every check runs on local inference or pure functions — no cloud, no API
  key, air-gap capable — consistent with the whole platform.

### 4.4 Execution order and failure behavior

QA runs its checks in a fixed order so that the cheapest, most decisive checks gate the
more expensive ones:

1. **Structural validity** (Part 1) — hard gate. If it fails, QA does not run; the
   Validation Pipeline surfaces a typed failure and no draft is produced.
2. **Deterministic content checks** (bannedWords, readability) — pure functions, zero
   tokens, cannot fail for infrastructural reasons. Always run.
3. **Model-judgment checks** (brand-voice, relevance) — one local-inference judgment each.
   If the engine is unavailable or errors, the check records `pass` (fail-open) rather than
   blocking the pipeline, because QA is advisory and must never strand a draft that a human
   could otherwise review.

A single QA run therefore produces a complete report even under partial engine failure:
deterministic checks always report; model checks degrade gracefully. The `overall` verdict
is `flagged` if any check flags, `clean` otherwise.

### 4.5 Non-goals

To keep the seam honest, Creative QA explicitly does **not**:

- **Rewrite or auto-correct copy.** Fixing a flagged field is the human's job at the
  `creative_assets` gate, or a future AI revision engine (gap **B-3**) — never QA itself.
- **Block on advisory flags.** Only structural invalidity stops a draft; brand-voice,
  bannedWords, readability, and relevance flags inform the reviewer, they do not veto.
- **Score prompts or models.** Prompt/model performance scoring is a Part 4 concern
  ([`../4-optimization/SCORING.md`](../4-optimization/SCORING.md)); QA scores *this draft's
  copy*, not the machinery that produced it.
- **Read the learning loop into generation.** Feeding past QA outcomes back into the next
  generation is gap **B-2** and belongs to Part 3; QA only records outcomes for later use.

---

## 5. Status ledger

| Capability | Tier | Evidence / note |
|---|---|---|
| Structural QA — JSON extraction | ✅ SHIPPED | `apps/web/src/ai-live.ts:179-198` |
| Structural QA — manual shape re-check | ✅ SHIPPED | `domains/creative-studio/src/creative/service.ts:102-123` |
| Human content QA — `creative_assets` gate | ✅ SHIPPED | `approval.ts`, `apps/web/src/routes.ts:478-481` |
| Schema **enforcement** on live path | 🔶 BUILT (UNWIRED) | `packages/ai-manager/src/runtime/validation-engine.ts` |
| bannedWords enforcement vs copy | 🔶/❌ | enforcement engine unwired; not on live path (gap **B-1**) |
| Automated quality scoring | ❌ ROADMAP | no scoring code |
| Readability / clarity grading | ❌ ROADMAP | no readability code |
| Tone / brand-voice fit check | ❌ ROADMAP | no tone analyzer |
| On-brief relevance check | ❌ ROADMAP | no relevance analyzer |
| `CreativeQAReport` / `CreativeQAService` | ❌ ROADMAP | design in this doc; not implemented |

---

## 6. Value contribution

- **Production-time ↓.** Automated QA triages every draft *before* a human opens it. A
  reviewer who sees `headline — contains 'guaranteed'` and `socialPost — grade 14, target
  ≤ 9` spends seconds confirming known issues instead of minutes hunting for them. Cheap
  deterministic checks (bannedWords, readability) run with zero tokens and catch the
  errors humans most often miss, cutting revision round-trips.
- **Revenue ↑.** Consistent, on-voice, on-brief, brand-safe copy raises the quality floor
  of everything the agency ships. Fewer off-brief drafts reaching clients means fewer
  rejected campaigns and a faster brief-to-approved-creative cycle — more billable output
  per reviewer-hour, at a steadier quality bar.

Creative QA earns its place under the AdOS value rule on both axes: it removes reviewer
toil and it lifts the quality of what gets sold.

---

## 7. Cross-references

- Source of truth: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) · Roadmap:
  [`../../ROADMAP.md`](../../ROADMAP.md) · Known limits:
  [`../../KNOWN_LIMITATIONS.md`](../../KNOWN_LIMITATIONS.md)
- Governing reference: [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)
- Structural check (Part 1): [`../1-ai-foundations/VALIDATION_PIPELINE.md`](../1-ai-foundations/VALIDATION_PIPELINE.md)
- Quality rules (Part 1): [`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md)
- Brand safety / bannedWords (Part 4): [`../4-optimization/BRAND_SAFETY.md`](../4-optimization/BRAND_SAFETY.md)
- Readability / relevance scoring (Part 4): [`../4-optimization/SCORING.md`](../4-optimization/SCORING.md)
- Human review gate (Book A): [`../../book-a/CREATIVE_WORKFLOW.md`](../../book-a/CREATIVE_WORKFLOW.md)

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
