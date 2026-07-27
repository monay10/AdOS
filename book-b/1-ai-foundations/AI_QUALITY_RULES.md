# AI Quality Rules — The Quality Contract for Every Generation

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP** for automated content-quality scoring — no
> quality, readability, tone, relevance, or compliance-scoring code exists in the
> codebase (verified absent). The quality mechanisms that run **today** are ✅ **SHIPPED**
> but narrow: **structural** validity (JSON extraction + manual shape checks), the
> **determinism** of the offline stub, and the **human approval** gate. This document is a
> **specification of the quality contract** every generation must meet — it is not a
> description of shipped scoring.

---

## 0. What this document is (and is not)

This is the **quality contract**: the ruleset that defines what "good" AI output means in
AdOS. It exists so that every artifact the pipeline produces — brief, creative set,
campaign draft, campaign report, executive report — can be measured against one agreed
definition of quality instead of a reviewer's gut feel.

Read this as a **design specification**. Most of the rules below describe a target
enforcement mechanism that does **not exist as code today**. Where a rule *is* partly
enforced now, it is tagged ✅ and cited to the wired source. Where it is not, it is tagged
❌ ROADMAP (or 🔶 where unwired code already exists to build on). The three-tier model is
defined in [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md); this document obeys it exactly.

**The single most important honest statement in this document:** the AdOS **quality gate
today is the human approval step**, not an automated score. Automated quality scoring is
Book B roadmap work. Nothing below should be read as claiming AdOS scores, grades, or
auto-rejects AI content today.

**Tier legend**

| Tier | Meaning |
|---|---|
| ✅ **SHIPPED** | Runs on the live app path today; cited to wired code. |
| 🔶 **BUILT (UNWIRED)** | Code exists and is tested in the repo, but no live path calls it. |
| ❌ **ROADMAP** | No implementation exists. Pure specification. |

---

## 1. The seven quality dimensions

A generation is "good" only if it satisfies all seven dimensions below. Each dimension has
a **rule** (the contract clause), an **enforcement tier today**, and a **target
enforcement mechanism** to build.

| # | Dimension | The rule (contract clause) | Tier today |
|---|---|---|---|
| 1 | **Structural validity** | Output MUST be a single JSON object that fills every field the artifact's schema declares, with correct types. | ✅ partial (shape only) |
| 2 | **On-brief relevance** | Output MUST address the mission objective and brief; no off-topic or generic filler. | ❌ ROADMAP |
| 3 | **Brand-voice fit** | Output MUST match the brand's declared voice, values, and tone. | 🔶/❌ (voice injected as text only) |
| 4 | **Brand safety** | Output MUST NOT contain the brand's banned words, competitor mentions, unapproved claims, PII, or secrets. | 🔶 exists unwired / ❌ at gate |
| 5 | **Clarity & readability** | Output MUST be clear, appropriately concise, and free of malformed or truncated prose. | ❌ ROADMAP |
| 6 | **Factual restraint** | Output MUST NOT invent prices, metrics, guarantees, or claims not grounded in the brief/product inputs. | ❌ ROADMAP |
| 7 | **Language correctness** | Output natural-language values MUST be in the mission's requested language (TR/EN); JSON keys stay English. | ✅ (injected, not verified) |

The rest of this document takes each dimension in turn: states the rule precisely, marks
what is enforced today with a code cite, and specifies the enforcement to build.

---

## 2. Dimension 1 — Structural validity ✅ (partial today)

**Rule.** Every generation MUST return exactly one JSON object. It MUST contain every field
the artifact contract declares (e.g. a `CreativeSet`'s six copy fields — `headline`,
`adCopy`, `cta`, `socialPost`, `landingPage`, `email`), and each field MUST hold the
declared type. Prose, markdown fences, or multiple objects are contract violations.

**Today (✅ SHIPPED).** The live path enforces *shape*, not *content*:

- The prompt asks the model to `Return ONLY a single JSON object` and, when a response
  schema is present, appends the schema as **prompt text** — an instruction, not a gate
  (`apps/web/src/ai-live.ts:142-144`).
- Model output is parsed by `extractJson`, which strips code fences, slices the outermost
  `{...}`, and requires a non-array JSON object; otherwise it fails
  (`apps/web/src/ai-live.ts:179-198`).
- On a parse failure the live path performs **one self-repair retry** — it appends a
  repair turn and re-asks once (`apps/web/src/ai-live.ts:49-67`). No further retries, no
  failover.
- The default offline stub returns hand-built objects that satisfy each artifact's shape
  by construction (`apps/web/src/ai.ts:13`).

**Gap.** The schema is *injected as text* but **not validated** against the returned
object on the live path — a model can return well-formed JSON with wrong types, missing
fields, or out-of-range values and still pass.

**To build (🔶 BUILT, UNWIRED).** A schema-enforcing validator already exists in the repo:
`SchemaValidationEngine.validate` checks type, `enum`, `minLength`, and numeric
`minimum`/`maximum`, returning human-readable errors
(`packages/ai-manager/src/runtime/validation-engine.ts:62-118`); a companion
`repairInstruction` builds the corrective retry turn. Wiring this validator into the live
`submit` path — validate → repair-on-fail — is the Book B build task described in the
Validation Pipeline design. See [`AI_CONSTITUTION.md`](AI_CONSTITUTION.md) for the two-stack
(wired vs unwired) model.

---

## 3. Dimension 2 — On-brief relevance ❌ ROADMAP

**Rule.** Output MUST be *on brief*: it must speak to the mission objective, the target
audience, the product, and the channel. Generic copy that could belong to any brand is a
violation, even when structurally perfect.

**Today.** The brief's mission fields are **injected** into the prompt as variables so the
model *sees* the objective (`domains/marketing-intelligence/src/brief/service.ts:47-62`).
That is input plumbing — it improves the odds of relevance but **does not measure** it.
There is **no relevance scorer, no brief-vs-output comparison, and no analyzer** anywhere
in the codebase. Grep confirms no such module.

**To build (❌ ROADMAP).** A relevance check would compare the generated artifact against
the brief's key entities (objective, audience, product, channel) and emit a
`relevanceScore` with per-field coverage. No code exists; this is a clean design spec.
Because relevance scoring needs the brief as grounding context, it depends on the Context
Engine design (`domains/executive-memory/src/context-builder.ts:37-86`, 🔶 unwired).

---

## 4. Dimension 3 — Brand-voice fit 🔶/❌

**Rule.** Output MUST match the brand's declared voice and values. If a brand is "warm,
plain-spoken, no jargon," output that is stiff or buzzword-heavy is a violation.

**Today (partial).** The brand's `brandVoice` and `brandValues` are passed as **flat prompt
variables** into generation (`domains/marketing-intelligence/src/brief/service.ts:52-53`).
The model is *told* the voice; nothing *checks* the result against it. There is **no
tone-fit scorer**.

**To build.** Two layers:

| Layer | Tier | Note |
|---|---|---|
| Inject brand rules/voice richly (not just a flat string) | 🔶 | governance-style rule injection exists unwired (`domains/executive-memory/src/governance.ts:37-72`) |
| Score output tone against the brand voice profile | ❌ ROADMAP | no tone-check code exists |

---

## 5. Dimension 4 — Brand safety 🔶 unwired / ❌ at gate

**Rule.** Output MUST NOT contain: (a) the brand's **banned/forbidden words**; (b) PII
(email, phone, card, IBAN) or secrets; (c) unapproved competitor mentions or claims. A
single banned-word hit is a hard-fail — brand safety is a **gate**, not a soft score.

**Today.** Brands already carry `forbiddenWords` in their profile
(`domains/agency-os/src/brand/brand.ts`), and the offline/live generators are told the
brand voice — but **no live path scans generated copy against the banned list before
approval**. This is Book A walkthrough gap **B-1** (bannedWords enforcement): the data
exists, the enforcement does not run.

**Built but unwired (🔶).** A safety engine exists in the repo. `RegexSafetyEngine` scans
text for PII and secrets, and — given a brand — flags any `forbiddenWords` hit as an issue
before returning a verdict (`packages/ai-manager/src/runtime/safety-engine.ts:57-64`). It
is unit-tested but **not instantiated by `apps/web`**; nothing on the live pipeline calls
it.

**To build.** Wire `RegexSafetyEngine` into the generation flow so every artifact is
scanned post-generation and a banned-word or PII hit blocks the artifact from reaching the
approval queue. The richer brand-safety enforcement design (competitor mentions, unapproved
claims, regulated-industry rules) is **Part 4** roadmap and has no code today. See
[`../4-optimization/`](../4-optimization/) for the Brand Safety expansion.

---

## 6. Dimension 5 — Clarity & readability ❌ ROADMAP

**Rule.** Output MUST be clear and appropriately concise for its channel: a `cta` is a
few words; a `landingPage` is structured prose. Truncated, repetitive, or run-on text is a
violation.

**Today.** **Nothing** measures readability, length-appropriateness, or repetition. There
is no readability metric (no Flesch/Gunning-Fog, no length rule per field, no dedup check)
anywhere in the codebase — verified absent. The only length signal available is the unwired
validator's `minLength` check (`validation-engine.ts`), which is a schema constraint, not a
readability judgment.

**To build (❌ ROADMAP).** A readability check would apply per-field length/format rules
and a simple reading-ease heuristic, emitting a `readabilityScore` and per-field flags. No
code exists; pure specification.

---

## 7. Dimension 6 — Factual restraint ❌ ROADMAP

**Rule.** Output MUST NOT invent facts. Prices, discounts, performance guarantees, awards,
or statistics that are not present in the product/brief inputs are violations. When unsure,
the model must stay generic rather than fabricate specifics.

**Today.** There is **no grounding check, no claim extractor, and no fact-vs-input
comparison**. Products do carry pricing (`domains/agency-os/src/product/product.ts:30`),
so a grounding check *could* compare generated price claims to the product record — but no
such comparison exists today. Nothing prevents a live model from inventing a "50% off"
that was never in the brief.

**To build (❌ ROADMAP).** A restraint check would extract factual claims from the output,
match each against the grounded inputs (product price, brief facts), and flag unsupported
specifics. This depends on the Evidence/Confidence reasoning design
(`domains/executive-memory/src/reasoning.ts:14-99`, 🔶 unwired) for its grounding source.

---

## 8. Dimension 7 — Language correctness ✅ (injected, not verified)

**Rule.** All natural-language values MUST be written in the mission's requested language
(Turkish or English); JSON keys remain English.

**Today (✅ SHIPPED).** The live path injects a language directive into the prompt:
`Write ALL natural-language text values in ${language}. Keep JSON keys in English.`
(`apps/web/src/ai-live.ts:139-141`). The requested language is resolved from mission/i18n
context. This reliably *steers* output language.

**Gap.** The output language is **not verified** after generation — no check confirms the
returned prose is actually in the requested language. A language-detection verification
pass is ❌ ROADMAP.

---

## 9. How the rules will be enforced — the target quality pipeline

The seven dimensions become a **quality stage** inserted between generation and the
approval queue. Competitors do `Prompt → LLM → Output`; the AdOS design routes every
generation through checks before a human ever sees it:

```
Generation → [Quality Stage] → Approval Queue → Human Review
                  │
   ┌──────────────┼───────────────────────────────┐
   │ Structural   │ SchemaValidationEngine  🔶     │  hard gate (repair-retry on fail)
   │ Brand safety │ RegexSafetyEngine       🔶     │  hard gate (banned/PII → block)
   │ Language     │ language verify         ❌     │  soft flag
   │ Relevance    │ relevance scorer        ❌     │  score
   │ Voice/tone   │ tone scorer             ❌     │  score
   │ Readability  │ readability scorer      ❌     │  score
   │ Restraint    │ grounding/claim check   ❌     │  score
   └──────────────┴───────────────────────────────┘
```

**Enforcement classes.** Each rule is either a **hard gate** (violation blocks the
artifact) or a **soft score** (violation surfaces a flag to the human reviewer but does not
block). The contract assigns them as follows:

| Dimension | Class | Enforcement mechanism | Tier | Cite / cross-ref |
|---|---|---|---|---|
| Structural validity | Hard gate | Validation Pipeline | 🔶 → wire | `validation-engine.ts:62-118` |
| Brand safety (banned/PII) | Hard gate | Safety Engine | 🔶 → wire | `safety-engine.ts:57-64` |
| Language correctness | Soft flag | Language verify pass | ❌ | Part 1 roadmap |
| On-brief relevance | Soft score | Relevance scorer | ❌ | Context Engine `context-builder.ts:37-86` (🔶) |
| Brand-voice fit | Soft score | Tone scorer | ❌ | Brand Safety **Part 4** |
| Readability/clarity | Soft score | Readability scorer | ❌ | Scoring **Part 4** |
| Factual restraint | Soft score | Grounding check | ❌ | reasoning `reasoning.ts:14-99` (🔶) |

**Ties to other Book B parts:**

- **Validation Pipeline** (structural gate) — ✅ shape today / 🔶 schema-enforcement to
  wire; see the Validation Pipeline design in this part.
- **Brand Safety** (banned words, competitor, claims) — enforcement engine 🔶 unwired
  today; full analysis is **Part 4** ❌. See [`../4-optimization/`](../4-optimization/).
- **Scoring** (turning dimension outputs into a composite quality score, and EMA
  prompt/model scoring) — 🔶 unwired learning code exists
  (`packages/ai-manager/src/runtime/learning.ts:18-46`); composite quality scoring is
  **Part 4** ❌. See [`../3-learning-engine/`](../3-learning-engine/) and
  [`../4-optimization/`](../4-optimization/).

Cross-references above point only to real repo files and the planned part directories; the
tier of each is stated so no reader mistakes a design for a shipped behavior.

---

## 10. The quality gate TODAY is human approval ✅

Until the automated stage above is built and wired, **the quality gate in AdOS is the human
approval step** — full stop.

- Every pipeline stage requires an explicit human approval click; the mission's default
  gates are `strategy_and_budget` and `campaign_launch`
  (`apps/web/src/routes.ts:743-753`), with `creative_assets` as the creative gate.
- Approval, rejection, and revision requests are recorded through the approval workflow
  (`domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481`).
- Today's revision is **human-driven and destructive-by-request**: a reviewer asking for a
  revision re-runs generation; there is no AI rewrite that preserves the prior draft. This
  is Book A walkthrough gap **B-3** (non-destructive revision), a Book B motivating
  problem.

So the honest quality story is: **a human is the scorer**. The reviewer reads each
artifact and applies the seven dimensions in their head. The automated quality stage in
§9 exists to *assist and eventually pre-filter* that human — never to replace the approval
gate, which remains mandatory.

**What is genuinely automatic today**, and can be claimed:

| Mechanism | Tier | Cite |
|---|---|---|
| JSON extraction + object shape check | ✅ | `ai-live.ts:179-198` |
| One self-repair retry on parse failure | ✅ | `ai-live.ts:49-67` |
| Schema + language injected as prompt text | ✅ (not enforced) | `ai-live.ts:139-144` |
| Deterministic offline stub (repeatable output) | ✅ | `ai.ts:13` |
| Human approval / revision gate | ✅ | `approval.ts`, `routes.ts:478-481` |

Determinism deserves a note: the default `OfflineAIManager` returns the **same output for
the same input** (`apps/web/src/ai.ts:13`). That is a quality property — it makes the
pipeline testable and demos reproducible — but it is **not** content quality. Deterministic
output can still be off-brief; determinism guarantees *repeatability*, not *goodness*.

---

## 11. Rule-status ledger (authoritative for this document)

| Quality rule | Enforcement class | Tier today | Where it lives / will live |
|---|---|---|---|
| Single JSON object, correct shape | Hard gate | ✅ shape only | `ai-live.ts:179-198` |
| Schema-enforced types/ranges | Hard gate | 🔶 unwired | `validation-engine.ts:62-118` |
| One self-repair retry | Support | ✅ | `ai-live.ts:49-67` |
| Language of prose = requested | Soft flag | ✅ injected / ❌ verified | `ai-live.ts:139-141` |
| On-brief relevance score | Soft score | ❌ ROADMAP | Context Engine (🔶) |
| Brand-voice / tone fit | Soft score | ❌ ROADMAP | Part 4 |
| Banned words absent | Hard gate | 🔶 unwired | `safety-engine.ts:57-64` |
| PII / secrets absent | Hard gate | 🔶 unwired | `safety-engine.ts:57-64` |
| Readability / length-fit | Soft score | ❌ ROADMAP | Part 4 |
| Factual restraint / grounding | Soft score | ❌ ROADMAP | reasoning (🔶) |
| Composite quality score | Aggregate | ❌ ROADMAP | Part 4 (Scoring) |
| Human approval gate | Hard gate | ✅ | `approval.ts`, `routes.ts:478-481` |

Any row marked ❌ is **not implemented today** and must never be described in the present
tense as a product behavior. Rows marked 🔶 exist as tested code in the repo but are **not
on the live path**; the build task is to wire them. Only ✅ rows describe live behavior.

---

## 12. Rule precedence and conflict resolution (design)

When two rules disagree about a single artifact, the contract resolves the conflict by a
fixed precedence. This section is ❌ ROADMAP design — no arbitration code exists today; it
specifies how the future quality stage must behave so that outcomes are predictable.

**Precedence order (highest wins):**

1. **Brand safety** (hard gate) — a banned word, PII, or secret **always** blocks, even if
   every other dimension is perfect. Safety is non-negotiable.
2. **Structural validity** (hard gate) — malformed or schema-invalid output blocks; a
   reviewer cannot approve what the pipeline cannot store.
3. **Factual restraint** (soft, escalatable) — an invented price or guarantee is a serious
   flag that the design escalates toward a hard block for regulated industries.
4. **On-brief relevance, brand-voice fit, readability** (soft scores) — surfaced to the
   reviewer as advisory flags; they inform the human decision but do not auto-block.
5. **Language correctness** (soft flag) — flagged; a wrong-language draft is corrected by
   re-generation, not blocked at the gate.

**Design rules for the arbitration layer (all ❌ ROADMAP):**

- A hard-gate failure short-circuits: the artifact never enters the approval queue and is
  returned for repair or re-generation.
- Soft scores are **aggregated** into a single composite quality score (Part 4 Scoring,
  🔶 learning code exists at `packages/ai-manager/src/runtime/learning.ts:18-46`), shown to
  the reviewer alongside per-dimension detail.
- No score, hard or soft, **removes** the human approval gate. The gate in §10 is
  permanent; automation only pre-filters and annotates.

**Worked example (illustrative, not shipped).** A generated `CreativeSet` returns valid
JSON (passes §2), in the correct language (passes §8), on brief (high relevance), but the
`socialPost` field contains a brand-forbidden word. Precedence rule 1 fires: the artifact
is **blocked** before the approval queue and returned for regeneration — regardless of how
strong the other six dimensions scored. Today, none of this is automatic: that same
banned-word draft would reach the human reviewer, who is the only thing standing between it
and the client (gap **B-1**).

---

## 13. Value contribution

- **Revenue ↑.** A codified quality contract produces **consistent** first drafts — every
  artifact clears the same bar for relevance, brand-voice, and brand-safety before a human
  sees it. Consistency is what lets an agency put its name on AI output at scale; fewer
  off-brand or unsafe drafts reaching clients protects and grows account revenue.
- **Production-time ↓.** Today a human reviewer *is* the quality scorer, catching every
  issue by hand. As the automated stage in §9 is built and wired, structural and
  brand-safety gates pre-filter obvious failures before review, so reviewers spend their
  time on judgment (strategy, taste) rather than on catching malformed JSON, banned words,
  or wrong-language copy. Fewer human quality catches per artifact means faster throughput
  per campaign.

Per the AdOS value rule, this document's capability qualifies on **both** axes: consistent
quality raises revenue and automated pre-filtering (once built) lowers production time. The
gate that protects both today remains **human approval**.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
