# AI Suggestions — Advisory Improvement Proposals for the Human Reviewer

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP (ABSENT)** — no AI content-suggestion feature
> exists. Suggestions are **advisory only**: every proposal is human-gated and never
> auto-applies. The single related artifact in the codebase is the **unwired**
> `InMemoryLearningEngine.suggest()` (`packages/ai-manager/src/runtime/learning.ts:38-46`),
> which suggests a **model / prompt version** — an infrastructure choice — **not** content
> edits. There is no code today that proposes copy changes to a reviewer.

---

## 1. What this document specifies

The **AI Suggestion layer** is the advisory surface that sits inside **human review**. When
a reviewer opens a generated artifact (a `CreativeSet`, a `MarketingBrief`, a
`CampaignDraft`), the system surfaces a short list of **concrete, one-click improvement
proposals** — for example:

- *"Headline exceeds 60 characters — tighten to «X»."*
- *"«guaranteed» is a brand-forbidden word — replace with «X»."*
- *"CTA reads at grade 12; the brand voice targets grade 8 — try «X»."*
- *"A past winning ad for this product used the hook «X» (ROAS 4.2× over 6 campaigns) —
  consider adapting it."*

Each proposal is a **suggestion, not an action.** AdOS is **not an autonomous agent**: the
human reviewer always decides. A suggestion can be **accepted** (fed into the Revision
Engine as a proposed edit), **dismissed**, or **ignored**. Nothing the AI proposes is ever
written back to an artifact without an explicit human click. This is a hard rule of the
[AI Constitution](../1-ai-foundations/AI_CONSTITUTION.md) and of the human-gated pipeline
described in `PRODUCT_TRUTH.md` (§1.3, §6.2 "Autonomous AI").

**Where it sits in the pipeline:**

```
Generation → Quality / Brand-Safety checks → [ AI SUGGESTIONS ] → Human Review → Revision → Approval
                        (this doc composes these upstream signals into human-gated proposals)
```

The Suggestion layer is a **composition layer**, not a new model call. It does not
re-generate the artifact. It **reads** the findings that the Part 4 checkers and Part 3
memory already produce, and **presents** them to the human as accept-into-revision options.

---

## 2. Target design

### 2.1 Anatomy of a suggestion

Each suggestion is a small, self-describing record. The design shape:

| Field | Meaning |
|---|---|
| `id` | Stable identifier for the proposal within a review session. |
| `field` | Which artifact field it targets (`headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, `email`). |
| `source` | Which upstream check produced it: `brand_safety` \| `readability` \| `tone` \| `length` \| `memory`. |
| `severity` | `blocker` \| `warning` \| `advisory` — mirrors the verdict vocabulary of the checkers. |
| `rationale` | One human-readable sentence explaining *why* (e.g. "brand-forbidden word"). |
| `current` | The exact text being critiqued (so the reviewer sees the before). |
| `proposed` | The suggested replacement text (the after) — **optional**; some suggestions only flag. |
| `evidence` | Optional memory grounding: pattern id, ROAS/CTR detail, campaign count. |
| `state` | `pending` \| `accepted` \| `dismissed` — reviewer-controlled, defaults to `pending`. |

The `proposed` field is what makes a suggestion **one-click**: accepting it hands
`{field, current, proposed}` to the Revision Engine as a **non-destructive** proposed edit
(see [`REVISION_ENGINE.md`](REVISION_ENGINE.md)). The reviewer can still edit the proposed
text before applying it — the suggestion is a starting point, never a final answer.

A concrete instance of the record, for a headline that trips two checks at once:

```
{
  "id":       "sug-7c1",
  "field":    "headline",
  "source":   "brand_safety",
  "severity": "blocker",
  "rationale":"Contains brand-forbidden word «guaranteed».",
  "current":  "Guaranteed results in 30 days",
  "proposed": "Proven results in 30 days",
  "evidence": null,
  "state":    "pending"
}
```

The same `headline` may carry a second, lower-severity suggestion from the `length` source;
the assembly layer keeps both, ordered `blocker` first, and lets the reviewer resolve each
independently. Suggestions are **per-finding**, not per-field — one field can host several.

### 2.2 The four suggestion sources

The Suggestion layer composes **existing Part 4 checkers** and **Part 3 memory**. Each maps
to a `source`:

| Source | Feeds from | Example proposal |
|---|---|---|
| `brand_safety` | Brand Safety flags (banned/forbidden words, PII, secrets) | "Remove brand-forbidden word «guaranteed»; try «proven»." |
| `readability` / `tone` | Quality / Scoring checks (grade level, tone-vs-brand-voice) | "Copy reads at grade 12; brand voice targets grade 8 — simplify." |
| `length` | Field-length rules from Scoring | "Headline is 74 chars; tighten to ≤ 60." |
| `memory` | Corporate memory — winning-pattern library, past-campaign experience | "A prior winning hook for this product: «X» (ROAS 4.2× / 6 campaigns)." |

The first three are **corrective** (fix a violation). The fourth is **generative-by-recall**
— it proposes a *better option* drawn from what worked before, which is the mechanism the
[Recommendation Engine](../3-learning-engine/RECOMMENDATION_ENGINE.md) is designed to power.

The raw signal behind `brand_safety` already exists in the codebase: the safety engine scans
copy for brand-forbidden words by loading the brand's list and matching case-insensitively
(`packages/ai-manager/src/runtime/safety-engine.ts:57-64`), where the forbidden list comes
from the brand aggregate (`domains/agency-os/src/brand/brand.ts:20-42`). That scanner is
**🔶 BUILT (UNWIRED)** — it produces exactly the finding a `brand_safety` suggestion needs,
but nothing on the live path calls it yet. Closing that gap is Book A gap **B-1**
(bannedWords enforcement). The Suggestion layer is the reviewer-facing *presentation* of that
finding; enforcement itself is specified in [`SCORING.md`](SCORING.md) and the Part 1
[`VALIDATION_PIPELINE`](../1-ai-foundations/VALIDATION_PIPELINE.md).

### 2.4 Suggestion lifecycle

A single suggestion moves through a tiny, human-driven state machine — deliberately smaller
and simpler than the Mission lifecycle, because a suggestion carries no authority of its own:

| From | Event | To | Effect |
|---|---|---|---|
| — | assembled from a finding | `pending` | Rendered in the review panel, sorted by severity. |
| `pending` | reviewer clicks **Accept** | `accepted` | `{field, current, proposed}` handed to the Revision Engine as a *proposed* edit. |
| `pending` | reviewer clicks **Dismiss** | `dismissed` | Suppressed for the session; not re-surfaced; not an error. |
| `pending` | reviewer edits then accepts | `accepted` | Reviewer's edited text replaces `proposed` before hand-off. |

There is no `applied` state on the suggestion itself — application is the Revision Engine's
concern, and the revision it creates still faces the approval gates. The suggestion's job ends
the moment it is accepted or dismissed.

### 2.3 The advisory contract (non-negotiable)

1. **Human-gated.** A suggestion changes nothing until a human clicks **Accept**. There is
   no auto-apply, no "apply all", no background rewrite.
2. **Non-destructive.** Accepting a suggestion creates a *proposed revision*, it does not
   overwrite the approved artifact. The revision itself still flows through the standard
   approval gates (`strategy_and_budget`, `creative_assets`, `campaign_launch`).
3. **Explainable.** Every suggestion carries a `rationale` and, where relevant, `evidence`.
   The reviewer must be able to see *why* before deciding.
4. **Dismissable.** A dismissed suggestion is remembered for the session so it is not
   re-surfaced, but dismissal is never treated as an error or a block.
5. **Ordered by severity, not by AI confidence.** `blocker` (e.g. a banned word) sorts above
   `advisory` (e.g. a memory-recalled alternative). The human sees the most important thing
   first.

This contract makes the Suggestion layer safe to build **before** the AI is fully trusted:
because it only ever *proposes*, a wrong suggestion costs a click, never a bad launch.

---

## 3. Today — what the code actually does

### 3.1 There is no content-suggestion feature — ❌ ROADMAP

No code today inspects a generated artifact and proposes copy edits to a reviewer. The
generation services emit their artifacts in a single shot and stop:

- **Creative generation** is a single `ai.submit({ capability: 'chat', promptRef: { key:
  'creative.set' } })` call that returns all six copy fields at once
  (`domains/creative-studio/src/creative/service.ts:42-55`). It does not analyse, score, or
  suggest anything about its own output.
- There is **no** readability checker, **no** tone checker, **no** quality scorer, and **no**
  winner/loser detector on the live path — confirmed absent in `PRODUCT_TRUTH.md` §4 and the
  Part 4 sibling specs. With no such checks running, there are no findings to compose into
  suggestions.
- The only revision that exists today is **human-authored**: `Approval.requestRevision()`
  moves an artifact from `in_review` to `revision_requested`
  (`domains/agency-os/src/approval/approval.ts:182-184`). The AI proposes nothing; the human
  writes the revision note themselves. This is Book A gap **B-3** (non-destructive,
  AI-assisted revision is not built).

### 3.2 The only `suggest()` in the codebase suggests a MODEL/PROMPT — 🔶 BUILT (UNWIRED)

There **is** a method named `suggest()` in the repository, and it is important to be precise
about what it does, because its name invites confusion. It lives in the **learning runtime**:

```
packages/ai-manager/src/runtime/learning.ts:38-46
  async suggest(promptKey): Promise<{ model?: string; promptVersion?: number } | null>
```

`InMemoryLearningEngine.suggest()` returns the **best-performing model and prompt version**
for a given prompt key, chosen from an exponential-moving-average reward signal it
accumulates in `observe()` (`learning.ts:18-36`). In other words, it answers *"which local
engine and which prompt template should we run next time?"* — an **infrastructure /
orchestration** decision. It says **nothing** about the *content* of any headline, ad copy,
or CTA. It never sees a `CreativeSet`. It cannot propose "tighten this headline".

Two further facts keep this honest:

- It is **🔶 BUILT (UNWIRED)**: the class exists and is unit-tested, but no running app path
  instantiates it — `apps/web` never constructs `InMemoryLearningEngine`. Its wiring is the
  subject of Part 3 ([`../3-learning-engine/RECOMMENDATION_ENGINE.md`](../3-learning-engine/RECOMMENDATION_ENGINE.md)),
  not this document.
- Even once wired, its output would feed the **Scoring / model-selection** path
  ([`SCORING.md`](SCORING.md)), not the reviewer-facing content-suggestion surface this
  document specifies.

**Summary of today:**

| Capability | Tier | Evidence |
|---|---|---|
| AI content suggestions to a reviewer ("tighten this headline") | ❌ ROADMAP | no code exists |
| One-click accept-into-revision | ❌ ROADMAP | no code; human revision is manual (`approval.ts:182-184`) |
| Model / prompt `suggest()` (infrastructure, not content) | 🔶 BUILT (UNWIRED) | `learning.ts:38-46` |
| Brand-forbidden-word detection (the raw signal a suggestion would use) | 🔶 BUILT (UNWIRED) | `packages/ai-manager/src/runtime/safety-engine.ts:57-64` |
| Evidence / confidence grounding (for `memory` suggestions) | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/reasoning.ts:14-99` |

---

## 4. To build — the suggestion layer

The Suggestion layer is **almost entirely composition**: most of the raw signals it needs
already exist in the repository as unwired code. The build work is (a) wiring those checkers
onto the review path, (b) adding the small suggestion-assembly layer, and (c) the reviewer UI.

### 4.1 Build steps

| # | Step | Tier of the pieces | Notes |
|---|---|---|---|
| 1 | **Wire the checkers onto the review path.** Run Brand Safety, readability/tone, and length rules against the generated artifact when it enters `in_review`. | 🔶 for Brand Safety (`safety-engine.ts:57-64`); ❌ for readability/tone/length | The checker outputs are the raw findings. See [`SCORING.md`](SCORING.md). |
| 2 | **Add the memory recall source.** Query the winning-pattern library and past-campaign experience via the evidence/confidence reasoner for better-option proposals. | 🔶 (`reasoning.ts:14-99`, `context-builder.ts:37-86`) | This is the closing of Book A gap **B-2** (learning read-back). See [`../3-learning-engine/RECOMMENDATION_ENGINE.md`](../3-learning-engine/RECOMMENDATION_ENGINE.md). |
| 3 | **Build the suggestion-assembly layer.** Normalise checker findings + memory hits into the `Suggestion` record shape (§2.1); sort by `severity`; dedupe per `field`. | ❌ ROADMAP (new) | Pure composition — **no new model call**. |
| 4 | **Surface in the reviewer UI.** Render suggestions beside the artifact with Accept / Dismiss controls; show `rationale` + `evidence`. | ❌ ROADMAP (new) | See [`HUMAN_REVIEW.md`](HUMAN_REVIEW.md). |
| 5 | **Accept → Revision.** On Accept, hand `{field, current, proposed}` to the Revision Engine as a proposed, non-destructive edit that still flows through approval gates. | ❌ ROADMAP (new) | See [`REVISION_ENGINE.md`](REVISION_ENGINE.md). |

### 4.2 Design constraints for the build

- **No new inference for corrective suggestions.** `brand_safety`, `readability`, `tone`, and
  `length` suggestions derive from **deterministic checks**, not a model call. Only the
  `memory` source consults recalled data (still no fresh generation — it recalls stored
  patterns). This keeps the layer fast, offline, and reproducible, consistent with the
  local-only, deterministic-default posture in `PRODUCT_TRUTH.md` §3.
- **`proposed` text is best-effort, never mandatory.** For a banned word, a deterministic
  replacement table can produce `proposed`. For a tone issue, the layer may flag without a
  rewrite rather than fabricate one — a suggestion with `proposed: null` is valid and simply
  asks the human to edit.
- **The Revision Engine, not the Suggestion layer, mutates state.** The Suggestion layer is
  read-only over the artifact. This preserves the non-destructive guarantee and keeps a clean
  seam between *proposing* (this doc) and *applying* (`REVISION_ENGINE.md`).
- **Provenance carries through.** An accepted suggestion records which `source` and, for
  `memory`, which pattern/evidence produced it, so an approved revision remains auditable back
  to its rationale.

### 4.3 What this layer must never become

Per the AI Constitution and `PRODUCT_TRUTH.md` §2.3 (no autonomous "Digital Employees"):

- It must **never auto-apply** a suggestion.
- It must **never** silently rewrite an approved artifact.
- It must **never** present a suggestion as a completed action or a decision already taken.
- It must **never** bypass the approval gates when a suggestion is accepted.

The AI's role is to **inform the human faster**, never to replace the human's judgement.

### 4.4 Edge cases the design must handle

| Situation | Designed behavior |
|---|---|
| No findings at all | Show an empty, "no suggestions — looks clean" state. An empty panel is a valid, non-blocking outcome. |
| A checker is unavailable (e.g. memory source not yet wired) | Degrade gracefully — omit that `source`; never fail the review because one source is silent. |
| Conflicting suggestions on one field | Keep both, sorted by severity; the reviewer resolves them in order. Accepting one does not auto-dismiss the other. |
| A suggestion whose `proposed` would itself violate a rule | The proposed text is re-checked before hand-off; a suggestion may not introduce a new `blocker`. |
| Reviewer edits `proposed` before accepting | The reviewer's text wins and is what reaches the Revision Engine; the original `proposed` is retained only in provenance. |
| Same finding recurs across review rounds | A previously dismissed finding stays dismissed for the session so the reviewer is not nagged. |

None of these paths ever apply an edit without a human click — graceful degradation and the
advisory contract are preserved together.

---

## 5. Worked walkthrough (target behavior)

To make the advisory contract concrete, here is how a review session is designed to unfold
once the layer is built. Nothing below runs today; it is the target sequence.

1. A `CreativeSet` for product *"NovaGrip"* is generated and enters `in_review`. It contains
   `headline: "Guaranteed grip, zero slip"`, a `cta: "Buy the only tool trusted worldwide"`,
   and an `adCopy` block reading at grade 11.
2. On entry to review, the wired checkers run against each field:
   - Brand Safety flags `headline` — «Guaranteed» is on the brand's forbidden list
     (`safety-engine.ts:57-64`, list from `brand.ts:20-42`).
   - Length rule flags `cta` — 39 characters over the brand's CTA ceiling.
   - Readability flags `adCopy` — grade 11 against a grade-8 brand-voice target.
3. The memory source is queried for *NovaGrip*: the reasoner returns a past winning hook,
   *"Grips when everything else lets go"*, with evidence *"ROAS 3.9× over 4 campaigns"*
   (`reasoning.ts:14-99`).
4. The assembly layer normalises these four findings into `Suggestion` records, sorts them
   `blocker` → `warning` → `advisory`, and the review panel shows:

   | # | Field | Source | Severity | Proposal |
   |---|---|---|---|---|
   | 1 | `headline` | `brand_safety` | `blocker` | Replace «Guaranteed» → «Dependable». |
   | 2 | `cta` | `length` | `warning` | Trim to «The tool pros trust». |
   | 3 | `adCopy` | `readability` | `warning` | Simplify to grade 8 *(flag only, no auto-rewrite)*. |
   | 4 | `headline` | `memory` | `advisory` | Try winning hook «Grips when everything else lets go» (ROAS 3.9× / 4 campaigns). |

5. The reviewer **accepts** #1 (edits «Dependable» → «Reliable» first), **accepts** #4 to
   replace the headline entirely, **dismisses** #2, and hand-edits `adCopy` themselves in
   response to the #3 flag.
6. Each acceptance is handed to the Revision Engine as a proposed, non-destructive edit. The
   resulting revised `CreativeSet` re-enters review and, on human approval, passes the
   `creative_assets` gate. No suggestion ever wrote to the artifact directly.

The value is visible in the trace: four issues located and three of them one-click-fixed,
without the AI ever taking an unreviewed action.

---

## 6. Relationship to sibling documents

| Document | Relationship |
|---|---|
| [`HUMAN_REVIEW.md`](HUMAN_REVIEW.md) | The review surface that **hosts** suggestions; defines Accept / Dismiss controls and the reviewer's authority. |
| [`REVISION_ENGINE.md`](REVISION_ENGINE.md) | The **consumer** of accepted suggestions — turns `{field, current, proposed}` into a non-destructive revision under the gates. |
| [`SCORING.md`](SCORING.md) | The **producer** of the corrective signals (readability, tone, length, quality) the Suggestion layer composes. |
| [`../3-learning-engine/RECOMMENDATION_ENGINE.md`](../3-learning-engine/RECOMMENDATION_ENGINE.md) | The **producer** of the `memory` source — winning patterns and past-campaign experience recalled as better options. |
| [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) | The governing rule that all suggestions are advisory and human-gated. |

---

## 7. Value contribution

- **Production time ↓.** Reviewers today read an artifact cold and must spot every brand-voice
  slip, over-long headline, and weak CTA by eye, then hand-write a revision note
  (`approval.ts:182-184`, Book A gap **B-3**). Concrete, pre-located suggestions with a
  proposed fix turn a scan-and-retype task into a click, cutting time-in-review and the number
  of review round-trips per campaign.
- **Revenue ↑.** Memory-backed suggestions surface hooks and angles that **already performed**
  (recalled ROAS/CTR evidence) at the exact moment of decision, so the final approved creative
  is measurably better than a first draft — improving the quality of what ships without adding
  an autonomous, un-reviewed AI action.

Because the layer is composition over already-coded checkers and memory, it delivers this
value at low build cost while strictly preserving the human-in-the-loop guarantee.

---

*Documentation only. No application code, packages, domains, or tests were modified. Aligned
to PRODUCT_TRUTH.md.*
