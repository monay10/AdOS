# Readability — Checking Generated Copy Is Clear Before a Human Reads It

| | |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP (ABSENT).** There is **no readability code
> anywhere in AdOS** — no Flesch score, no reading-grade estimate, no sentence- or
> word-length metric, no clarity check of any kind (verified absent across `apps`,
> `domains`, and `packages`). Nothing today measures whether generated copy is easy to
> read. This document is a clean design specification, not a description of live behavior.

---

## 1. Why this document exists

A local language model, asked for a **CreativeSet**, returns six copy fields —
`headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, `email` — in one shot
(`domains/creative-studio/src/creative/service.ts:42-55`). It returns them whether they
read at a fourth-grade level or bury a call to action inside a forty-word sentence.
Nothing in the generation step, and nothing anywhere else on the live path, asks the one
question a copy chief asks first: *is this clear?*

Between raw generation and the human reviewer at the `creative_assets` gate there is an
opportunity — and, in the target architecture, an obligation — to run a cheap
**Readability** check: a deterministic score of how hard each field is to read, plus an
optional local-AI clarity read for the nuance a formula cannot see. The output is not a
verdict on the copy's *ideas* — that is the reviewer's job — but a triage signal that
says *"this landing-page paragraph reads at grade 15; your target audience reads at
grade 9."*

This document defines that check, states plainly that **nothing like it exists today**,
and specifies the build. A central design claim runs through it: **readability can be
computed deterministically, with no model at all.** Sentence length, word length, and
syllable ratios are arithmetic over text. That makes readability the most natural fit in
Book B for AdOS's offline-first, deterministic ethos — a real, useful check that needs no
inference engine, no tokens, and no network, and that returns the identical score every
time it sees the same text.

Readability is a **sub-check**, not a standalone stage. It is one of the content checks
that [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md)
composes, and one of the signals that the [`SCORING.md`](SCORING.md) engine folds into a
draft's overall quality number. It reports; it never rewrites and never blocks.

---

## 2. Target design — the Readability sub-check

### 2.1 Shape of the check

Readability takes one piece of text and a target reading level, and returns a score plus
a `pass`/`flag` verdict. It runs per **field** of a `CreativeSet`, because a `cta` and a
`landingPage.body` are not held to the same bar — a three-word button and a paragraph of
prose are different reading tasks.

The check has two layers, and the first is sufficient on its own:

| Layer | What it does | Needs a model? | Determinism |
|---|---|---|---|
| **1 · Deterministic scoring** | Compute reading-difficulty metrics from the text's own structure — sentence length, word length, syllable ratio | **No** | Fully deterministic — same text, same score, always |
| **2 · Local-AI clarity read** (optional) | Ask a locally-run model for a short clarity judgment the arithmetic misses (ambiguity, awkward phrasing, buried point) | Yes (local only) | Non-deterministic; degrades to `pass` on engine error |

Layer 1 is the spine. Layer 2 is an optional enhancement that only runs when a local
engine is configured and enabled; when it is absent — the default offline posture — the
check still produces a complete, useful result from arithmetic alone.

### 2.2 Layer 1 — deterministic readability scoring

The deterministic layer computes a small set of well-understood, public-domain metrics.
None requires a model; all are pure functions of the input string.

| Metric | Computed from | Signals |
|---|---|---|
| **Mean sentence length** | words ÷ sentences | Long sentences → harder reading |
| **Mean word length** | characters ÷ words | Long words → denser copy |
| **Syllable-per-word ratio** | syllables ÷ words | Polysyllabic density (a heuristic count) |
| **Reading-grade estimate** | a Flesch-Kincaid-style combination of the above | A single grade-level number |
| **Longest-sentence flag** | max sentence length | Catches the one buried, run-on sentence |

The combined **reading-grade estimate** is the headline number — an approximate US-grade
level derived from a Flesch-Kincaid-style formula over the sentence-length and
syllable-ratio inputs. It is a heuristic, not a linguistic ground truth, and the design
treats it as such: it is a **relative** signal for triage, never a hard pass/fail on the
copy's worth.

A worked sketch of the arithmetic (illustrative — this is spec, not shipped code):

```
score(text, target):
  sentences   = splitSentences(text)          # pure
  words       = splitWords(text)               # pure
  syllables   = sum(estimateSyllables(w) for w in words)  # heuristic, pure
  meanSentLen = words.length / sentences.length
  meanSyll    = syllables / words.length
  grade       = 0.39*meanSentLen + 11.8*meanSyll - 15.59   # FK-style estimate
  verdict     = 'flag' if grade > target.gradeCeiling else 'pass'
  return { grade, meanSentLen, meanSyll, verdict, reason }
```

Every line above is arithmetic over the text. There is no `ai.submit(...)`, no token
cost, no network call, and no run-to-run variance. This is exactly the property
PRODUCT_TRUTH.md attributes to the platform's KPI math and offline stub — *"Deterministic.
OfflineAIManager and KPI math are pure/deterministic"* — extended to a new domain.

### 2.3 Layer 2 — optional local-AI clarity assessment

Arithmetic cannot tell that *"leverage synergistic paradigms"* is short-sentenced but
meaningless, or that a clause is grammatically fine yet ambiguous. When — and only when —
a local engine is available, Readability MAY run a single low-cost clarity judgment: a
short prompt asking the model to rate clarity and name the single least-clear phrase.

This layer is **strictly optional and strictly local**:

- It uses only local inference (Ollama or an OpenAI-compatible local server) exactly as
  the rest of AdOS does — `apps/web/src/ai-factory.ts:23-57`. No cloud, no API key.
- If no engine is configured, or the call errors, the check **degrades to `pass`** on the
  clarity dimension and returns the deterministic score alone. Layer 2 never strands a
  draft and never overrides a hard deterministic flag.
- Its verdict is advisory, like every other content check — see
  [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md).

The two layers combine into one report: the deterministic grade is always present; the
clarity note is present only when a local model produced one.

### 2.4 Output shape

Readability emits a compact, per-field report as review metadata. It never mutates the
copy.

```
ReadabilityReport {
  overall: 'clear' | 'flagged'
  fields: [
    { field: 'headline',         grade: 6,  target: 8,  verdict: 'pass' },
    { field: 'socialPost',       grade: 14, target: 9,  verdict: 'flag',
      reason: 'grade 14, target ≤ 9; longest sentence 31 words' },
    { field: 'landingPage.body', grade: 11, target: 10, verdict: 'flag',
      reason: 'grade 11, target ≤ 10',
      clarity: { rating: 'low', note: "phrase 'leverage synergistic paradigms' is vague" } }
  ]
}
```

The `grade`/`target`/`verdict` triple is always deterministic. The `clarity` block appears
only when Layer 2 ran. `overall` is `flagged` if any field flags, `clear` otherwise.

### 2.5 Policy thresholds by channel

A single reading-grade ceiling for all copy would be wrong: a social post and a legal
disclaimer live at different bars. Readability is governed by a small, declared **policy
table** keyed by channel/field, so the same score can `pass` in one place and `flag` in
another. The thresholds below are an illustrative default, not a shipped constant:

| Field / channel | Target grade ceiling | Rationale |
|---|---|---|
| `headline` | ≤ 8 | Must be instantly scannable |
| `cta` | ≤ 6 | Shortest, most direct copy on the page |
| `socialPost` | ≤ 9 | Feed skimming rewards plain language |
| `adCopy` | ≤ 10 | Persuasive but still light |
| `landingPage.body` | ≤ 10 | Longer form tolerates a little more density |
| `email.subject` | ≤ 8 | Competes in a crowded inbox |
| `email.body` | ≤ 10 | Read with more attention than a feed |

Policy is data, not code branching — a table the agency can tune per brand without
touching the scorer. The **rules** for what these thresholds mean and how a flag is
weighed are owned by [`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md);
Readability supplies the measurement, the quality rules supply the judgment.

### 2.6 Where Readability sits in the pipeline

```
Brief → Creative Generation → Validation Pipeline → [ Readability ] ─┐
                                   (Part 1)          (this doc)       │  one signal among
                                                          │           ├─ Creative QA (Part 2)
                                    deterministic ────────┤           └─ Scoring   (Part 4)
                                    + optional local AI ──┘
                                                                      ▼
                                                     Human Review (creative_assets gate, ✅)
```

Readability is a **leaf** in the content-check tree: it produces one signal that two
consumers use. **Creative QA**
([`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md)) takes the
per-field `pass`/`flag` verdict and shows it, highlighted, to the reviewer at the
`creative_assets` gate. **Scoring** ([`SCORING.md`](SCORING.md)) folds the grade estimate
into a draft's composite quality number. Readability itself owns neither the review UI nor
the composite score — it only measures.

### 2.7 A worked example (target behavior)

The brief targets *"cost-conscious small-business owners"* (a plain-language audience).
The model returns a well-formed `CreativeSet`. In the target design, Readability runs
deterministically and produces:

| Field | Grade est. | Target | Verdict | Reason |
|---|---|---|---|---|
| `headline` | 6 | ≤ 8 | `pass` | — |
| `cta` | 4 | ≤ 6 | `pass` | — |
| `socialPost` | 14 | ≤ 9 | `flag` | grade 14; longest sentence 31 words |
| `adCopy` | 9 | ≤ 10 | `pass` | — |
| `landingPage.body` | 12 | ≤ 10 | `flag` | grade 12, target ≤ 10 |
| `email.subject` | 7 | ≤ 8 | `pass` | — |

`overall: 'flagged'`. No field was rejected or rewritten. The human at the
`creative_assets` gate opens a draft with two specific, field-scoped clarity issues
pre-marked — a 31-word social sentence and a dense landing paragraph — instead of reading
six blocks cold to find them. If a local engine happened to be enabled, the two flagged
fields might also carry a one-line clarity note; if not, the grade-based flags stand on
their own.

---

## 3. Today — what runs on the live path

### 3.1 Nothing measures readability ❌ ROADMAP

There is **no readability implementation of any kind** in AdOS. A search across `apps`,
`domains`, and `packages` for readability, reading-level, Flesch, Gunning, SMOG, and
syllable logic returns **zero matches**. The concepts do not appear in the codebase.

| Readability capability | Status | Note |
|---|---|---|
| Flesch / Flesch-Kincaid score | ❌ ROADMAP | no such code exists |
| Reading-grade estimate | ❌ ROADMAP | no grade metric anywhere |
| Sentence / word-length heuristics | ❌ ROADMAP | not computed on any path |
| Syllable counting | ❌ ROADMAP | absent |
| Per-channel readability policy | ❌ ROADMAP | no threshold table exists |
| Local-AI clarity assessment | ❌ ROADMAP | no clarity prompt or engine |

This aligns with PRODUCT_TRUTH.md §4, which lists readability among the absent content
checks, and with the Book B concept ledger, which tags *Readability* as ❌ ROADMAP with
the note *"no code"*.

### 3.2 What does run — and why it is not readability

Two things touch generated copy on the live path today. Neither judges clarity:

- **Structural validation** — JSON extraction (`apps/web/src/ai-live.ts:179-198`, ✅) and
  a manual six-field shape re-check
  (`domains/creative-studio/src/creative/service.ts:102-123`, ✅). This confirms the copy
  is *well-formed*, never whether it is *readable*.
- **Human approval** — a person reads the six fields and decides at the `creative_assets`
  gate (`domains/agency-os/src/approval/approval.ts`, `apps/web/src/routes.ts:478-481`,
  ✅). The reviewer is, today, the **entire** readability function — an unaided human
  judgment with no metric in front of them.

So the answer to *"how does AdOS check that copy is clear today?"* is: **it does not,
except by asking a human to read it.** Everything in this document is the design for
changing that.

---

## 4. To build — the Readability check

Readability is small, self-contained, and — because Layer 1 needs no model — buildable
without any of the unwired inference machinery. It is one of the least entangled builds in
Book B.

### 4.1 Build steps

1. **Write the deterministic scorer** as a pure function in a small package (e.g. a
   `readability` module): text in, `{ grade, meanSentLen, meanSyll, longestSentence }`
   out. No I/O, no model, fully unit-testable with fixed expected numbers. This is the
   entire core of the feature.
2. **Declare the channel policy table** (§2.5) as data — a per-field grade ceiling the
   agency can tune per brand. Keep it out of the scorer so thresholds change without
   touching arithmetic.
3. **Wrap scorer + policy in a `ReadabilityCheck`** that takes a `CreativeSet` and the
   policy, scores each field, applies the ceiling, and emits the `ReadabilityReport`
   (§2.4). Deterministic end to end.
4. **Add the optional Layer-2 clarity read** behind a capability flag: if — and only if —
   a local engine is configured, run one short clarity judgment per flagged field via the
   existing local AI path (`apps/web/src/ai-factory.ts:23-57`); on any error, degrade to
   `pass`. Never required; never cloud.
5. **Expose the report to its two consumers** — Creative QA
   ([`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md)) for the
   review UI, and Scoring ([`SCORING.md`](SCORING.md)) for the composite quality number.
   Readability publishes the signal; it does not own either surface.

### 4.2 Design constraints

- **Deterministic by default.** Layer 1 must be a pure function — same text, same score,
  every run, zero tokens, no network. This is the property that makes Readability fit
  AdOS's offline-first, air-gap-capable posture. Any model use is confined to the optional
  Layer 2 and must never be a prerequisite for producing a score.
- **Advisory, never blocking.** A readability flag informs the reviewer; it does not stop
  a draft. The human at `creative_assets` remains the decision-maker
  (`apps/web/src/routes.ts:478-481`), preserving the Book A approval model exactly.
- **Non-destructive.** Readability annotates; it never edits copy. AI rewrite is itself
  Roadmap (Book A gap **B-3**, `requestRevision` is human-only today); this check must not
  smuggle in an auto-fix.
- **Local-only.** Layer 2, if used, runs on local inference — no cloud, no API key, no
  telemetry — consistent with the whole platform.
- **Policy-driven, not hard-coded.** Thresholds are data keyed by channel/brand, tunable
  without code changes; the scorer knows nothing about channels.

### 4.3 Why deterministic is the right default here

Readability is the clearest case in Book B where **no model is needed**. The signal —
how structurally hard text is to read — is fully recoverable from the text's own
arithmetic. Choosing the deterministic path buys AdOS four things at once:

| Property | Consequence |
|---|---|
| **Zero token cost** | The check runs on every field of every draft for free |
| **Zero network** | Works in a fully air-gapped install, no engine required |
| **Reproducible** | Identical score every run — testable with exact expected values, auditable |
| **Instant** | Arithmetic over a few hundred words is microseconds, not an inference round-trip |

This mirrors the platform's existing deterministic surfaces — the offline stub
(`apps/web/src/ai.ts:13`) and the KPI math — and keeps Readability honest under the AI
Constitution's local-first mandate
([`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)).

### 4.4 Non-goals

Readability explicitly does **not**:

- **Rewrite or auto-simplify copy.** Lowering a grade is the human's job at the
  `creative_assets` gate, or a future AI revision engine (gap **B-3**) — never this check.
- **Judge on-brief relevance, tone, or brand safety.** Those are separate content checks
  ([`SCORING.md`](SCORING.md), [`TONE_CHECKER.md`](TONE_CHECKER.md),
  [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md));
  Readability measures clarity of expression only.
- **Own the composite quality score.** It contributes one input to Scoring; it does not
  compute the overall number.
- **Block on a flag.** Only structural invalidity (Part 1) stops a draft; a readability
  flag is advisory.
- **Require a model.** Layer 2 is optional; the deterministic score is the product.

### 4.5 Relationship to the sibling checks

Readability is one of a small family of content sub-checks that Part 4 defines and Part 2
composes. It shares its plumbing — per-field `pass`/`flag` verdicts, advisory-only,
non-destructive, local-only — with them:

| Sibling check | What it measures | Deterministic? | Doc |
|---|---|---|---|
| **Readability** (this doc) | Is the copy easy to read? | **Yes** (Layer 1) | this file |
| **Tone Checker** | Does the copy match the brand voice? | Partly (model judgment) | [`TONE_CHECKER.md`](TONE_CHECKER.md) |
| **Scoring** | What is the draft's overall quality number? | Mixed | [`SCORING.md`](SCORING.md) |
| **Creative QA** | Orchestrates all of the above for one draft | — | [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md) |

Of the family, Readability is the one that can ship **entirely without a model** — which
is why it is the natural first content check to build.

---

## 5. Status ledger

| Capability | Tier | Evidence / note |
|---|---|---|
| Deterministic readability scoring | ❌ ROADMAP | no metric code exists (verified absent) |
| Reading-grade estimate (FK-style) | ❌ ROADMAP | no such formula in the codebase |
| Sentence / word / syllable heuristics | ❌ ROADMAP | not computed anywhere |
| Per-channel readability policy table | ❌ ROADMAP | design in this doc; not implemented |
| Optional local-AI clarity read | ❌ ROADMAP | no clarity prompt or engine |
| `ReadabilityReport` / `ReadabilityCheck` | ❌ ROADMAP | specified here; not built |
| Structural validation (context, not readability) | ✅ SHIPPED | `apps/web/src/ai-live.ts:179-198`; `creative/service.ts:102-123` |
| Human review at `creative_assets` gate | ✅ SHIPPED | `approval.ts`, `apps/web/src/routes.ts:478-481` |

Every readability-specific row is ❌ ROADMAP. The two ✅ rows are the adjacent live-path
functions and are listed only to mark the boundary — neither measures clarity.

---

## 6. Value contribution

- **Revenue ↑.** Clearer copy converts better. Ad copy, subject lines, and landing pages
  that read at the audience's level get scanned, understood, and acted on; dense copy loses
  the reader before the call to action. A deterministic readability floor raises the
  clarity of everything the agency ships, and clearer creative is a direct lever on
  click-through and conversion — the KPIs the platform already measures
  (`domains/analytics-engine/src/.../kpi.ts`). Copy that lands is copy that sells.
- **Production-time ↓.** The check auto-flags hard-to-read fields *before* a human opens
  the draft. A reviewer who sees `socialPost — grade 14, target ≤ 9` fixes a known problem
  in seconds instead of re-reading six fields hunting for the awkward one. Because Layer 1
  is deterministic and zero-cost, it runs on every field of every draft with no token
  budget and no latency — the cheapest possible quality signal, catching the clarity errors
  humans most often skim past.

Readability earns its place under the AdOS value rule on both axes: it lifts the
conversion quality of what gets sold, and it removes reviewer toil — at literally zero
inference cost.

---

## 7. Cross-references

- Source of truth: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) · Roadmap:
  [`../../ROADMAP.md`](../../ROADMAP.md) · Known limits:
  [`../../KNOWN_LIMITATIONS.md`](../../KNOWN_LIMITATIONS.md)
- Governing reference: [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)
- Quality rules (Part 1): [`../1-ai-foundations/AI_QUALITY_RULES.md`](../1-ai-foundations/AI_QUALITY_RULES.md)
- Creative QA that composes this check (Part 2): [`../2-creative-factory/CREATIVE_QA.md`](../2-creative-factory/CREATIVE_QA.md)
- Sibling — tone check (Part 4): [`TONE_CHECKER.md`](TONE_CHECKER.md)
- Sibling — quality scoring (Part 4): [`SCORING.md`](SCORING.md)

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
