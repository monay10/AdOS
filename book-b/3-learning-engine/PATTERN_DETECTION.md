# Pattern Detection — Surfacing the Structures That Repeatedly Win

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ⚠️ **PARTIAL / 🔶.** The pattern library **captures**
> winning structures at mission completion and **ranks** them by an evidence-weighted
> score — that write-and-rank path is real, in-repo code
> (`domains/company-brain/src/pattern-library.ts:9-38`). BUT it is (a) **in-memory /
> non-durable**, and (b) **never read into generation** — no brief, creative, campaign,
> report, or executive generator queries it. So detection today = *capture + weighted
> ranking*, not an ML/statistical pattern-mining engine, and its output reaches no
> prompt. Reading patterns back into the Context Engine and building richer detection is
> **Book B build work** (the **B-2** gap named in the Book A walkthrough).

---

## 0. The one-paragraph truth

Every time a mission finishes, AdOS records the campaign's shape — its channel mix and
the ordered steps that produced it — as a reusable **Pattern**, tagged with the ROAS it
achieved (`apps/web/src/routes.ts:1156`). Those patterns accumulate in an in-memory
library that can already return, for any vertical, the patterns most worth reusing —
ranked by an **evidence-weighted score** that rewards both strong results and larger
sample sizes, then nudges proven repeat-winners upward (`pattern-library.ts:18-38`).
That is genuine, tested code. What is missing is the two things that would make it a
learning *engine*: the library is **not durable** (a restart empties it) and **nothing
reads it back** — no generator asks "what has repeatedly won for this vertical?" before
drafting. Until that read-back exists, the winning structures are archived, ranked, and
then ignored. Closing that gap is the point of this document.

---

## 1. Target design — detection that surfaces what repeatedly works

Pattern Detection is the component that answers a single operational question:

> *"For this client's vertical, which campaign structures have repeatedly produced
> above-target returns — and how confident are we?"*

It is deliberately **not** a black-box ML model. In an offline-first, 100%-local,
air-gap-capable product (no cloud, no API key, no per-token billing —
`ai-factory.ts:23-57`), detection must be **deterministic, inspectable, and cheap**. The
target design therefore layers three tiers of increasing richness on top of the same
captured evidence:

| Tier | What it does | Signal it uses | Status |
|---|---|---|---|
| **T1 — Capture** | Persist each finished campaign's structure + result | `channels`, `structure[]`, `evidence{sampleSize,metric,value}` | ✅ code exists (`routes.ts:1156`) |
| **T2 — Evidence-weighted ranking** | Order patterns by confidence-scaled value + proven reuse | `rank()` = `value·min(1,sampleSize/100) + reuseCount·0.1` | ✅ code exists (`pattern-library.ts:35-38`) |
| **T3 — Recurrence detection** | Merge repeat occurrences of the *same* structure into one growing-evidence pattern; surface only structures seen `≥N` times with a real lift | frequency across missions, aggregated `sampleSize`, variance | ❌ ROADMAP — no merge/dedup logic today |

The **detected** output of the target design is a short, ranked shortlist of
high-confidence winning structures per vertical, handed to the **Context Engine**
([`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md)) so the
Prompt Orchestrator can anchor a new draft on proven structure instead of generating
from a blank slate. Detection feeds generation; that is its whole purpose.

Its relationship to its siblings in this part:

| Component | Question it answers | Doc |
|---|---|---|
| **Best Practices** | *What general rules hold across many campaigns?* | [`BEST_PRACTICES.md`](./BEST_PRACTICES.md) |
| **Pattern Detection** (this doc) | *Which specific structures repeatedly win in this vertical?* | this file |
| **Winner Detection** | *Which single artifact/asset won or lost, and why?* | [`WINNER_DETECTION.md`](./WINNER_DETECTION.md) |

Pattern Detection sits between them: coarser than per-asset Winner Detection, more
specific than Best Practices. All three are consumers/producers of the same recorded
memory whose read-back is specified in
[`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md).

### 1.1 Where detection sits in the agent pipeline

The differentiator Book B specifies is a pipeline — *Campaign Brief → Planning → Research →
Memory → Brand → Prompt Orchestrator → Generation → Quality → Brand Safety → Revision →
Approval → Learning → Optimization* — rather than a bare *Prompt → LLM → Output*. Pattern
Detection is a **Learning** and **Memory** stage component: it consumes finished-campaign
outcomes (Learning) and, once the read-back exists, contributes proven structure into the
Memory context that the Prompt Orchestrator renders (feeding Generation). It therefore
touches both ends of the loop — it is fed by what the last campaign did, and it shapes what
the next campaign is drafted from. Today only the first half of that arc runs.

---

## 2. The data model — what a Pattern is

A captured pattern is a small, fully-typed record
(`packages/contracts/src/ai/company-brain.ts:124-131`):

```ts
export interface Pattern {
  id: string;
  domain: string;              // the vertical, e.g. "restaurant"
  name: string;                // human label
  structure: string[];         // ordered steps, e.g. ["15s video","first 3s food","CTA reservation"]
  evidence: { sampleSize: number; metric: string; value: number };
  reuseCount: number;
}
```

| Field | Meaning | Role in detection |
|---|---|---|
| `domain` | The vertical the pattern belongs to | Partition key — `bestFor(domain)` filters on it |
| `structure` | Ordered, human-readable steps of the winning shape | The reusable payload a generator would anchor on |
| `evidence.value` | The measured result (e.g. ROAS) | Primary rank signal |
| `evidence.sampleSize` | How many campaigns back this value | Confidence scaler in `rank()` |
| `evidence.metric` | Which KPI the value is on (e.g. `'roas'`) | Context for interpreting `value` |
| `reuseCount` | Times this pattern has been re-adopted | Small popularity nudge in `rank()` |

The six governed KPIs (CTR/CPC/CPA/CPL/ROAS/ROI) named in Book A are the legal values of
`evidence.metric`; today the capture site records `roas` specifically (see §3).

A design consequence worth stating: the `Pattern` shape is deliberately **thin and
declarative** — an ordered list of strings plus one evidence triple. It carries no model
weights, no embeddings, and no opaque state. That is what makes detection inspectable and
portable: any operator can read a captured pattern and understand exactly why it ranks where
it does. It also means the entire library serialises trivially, which is what makes the
durability build item (§4.2) a straightforward persistence adapter rather than a modelling
exercise. The contract, in other words, was written to be read back; only the wiring is
absent.

---

## 3. Today — what the code actually does (⚠️ PARTIAL ✅ / 🔶)

Two things are real and shipped-as-code; everything past them is not. Draw the line
precisely.

### 3.1 ✅ Capture at mission completion (write path runs)

When a mission completes, the route handler captures a pattern from the campaign that
just ran (`apps/web/src/routes.ts:1156`):

```ts
await app.brain.patterns.capture({
  domain: vertical,
  name: `${vertical}: ${channels.join('+')} launch`,
  structure: [...channels.map((ch) => `${ch} ad set`), 'measure', 'reallocate'],
  evidence: { sampleSize: 1, metric: 'roas', value: roas },
});
```

This runs on the live app path alongside the experience, knowledge-graph, and
decision-journal recording in the same completion block (`routes.ts:1146-1177`). The
`capture` implementation assigns an `id`, initialises `reuseCount: 0`, and stores the
record in a `Map` (`pattern-library.ts:12-16`). **This is ✅ SHIPPED** — but note two
hard limits visible right in the code:

- Every capture writes `sampleSize: 1`. Because nothing merges repeat occurrences of the
  same structure, each finished mission becomes its **own** one-sample pattern. The
  aggregation that would grow `sampleSize` for a recurring structure does not exist yet.
- `structure` is a fixed template (`channels → "measure" → "reallocate"`), not a mined
  or inferred shape. It reflects the pipeline's own steps, not a discovered winning
  pattern.

### 3.2 ✅ Evidence-weighted ranking (`rank` / `bestFor`)

`bestFor(domain)` returns every pattern in that vertical, sorted best-first
(`pattern-library.ts:18-22`), using the `rank` function (`pattern-library.ts:35-38`):

```ts
function rank(p: Pattern): number {
  const confidence = Math.min(1, p.evidence.sampleSize / 100);
  return p.evidence.value * confidence + p.reuseCount * 0.1;
}
```

Be precise about what this is and is not:

| `rank()` **does** | `rank()` does **not** do |
|---|---|
| Scale a pattern's `value` by a confidence factor that saturates at `sampleSize = 100` | Run any statistical test, regression, clustering, or ML model |
| Reward proven reuse with a flat `+0.1` per `reuseCount` | Detect *recurrence* — it never notices two patterns share a structure |
| Produce a deterministic, inspectable ordering | Compute significance, variance, or a confidence interval |
| Sort within a single `domain` | Compare across verticals or against a baseline/lift |

So "detection" today is **capture + a single-formula weighted sort**. It is honest, cheap,
and deterministic — but it is a ranking heuristic, not a pattern-mining engine.

#### Worked example — what `rank` produces

Suppose the `restaurant` vertical has accumulated three captured patterns. Because capture
always writes `sampleSize: 1` and never merges (see §3.1), each is a separate one-sample
record until Track B lands:

| Pattern | `evidence.value` (ROAS) | `sampleSize` | `reuseCount` | `confidence = min(1, n/100)` | `rank` |
|---|---|---|---|---|---|
| `restaurant: instagram+tiktok launch` | 4.0 | 1 | 0 | 0.01 | `4.0·0.01 + 0` = **0.040** |
| `restaurant: instagram launch` | 2.5 | 40 | 3 | 0.40 | `2.5·0.40 + 0.3` = **1.300** |
| `restaurant: google+meta launch` | 6.0 | 1 | 0 | 0.01 | `6.0·0.01 + 0` = **0.060** |

`bestFor('restaurant')` returns them ordered `1.300 → 0.060 → 0.040`. Note the behaviour
this reveals: the **flashy 6.0-ROAS single win ranks below** the steadier 2.5-ROAS pattern
that has 40 samples and proven reuse — the confidence scaler is doing its job, suppressing
noise. But it also exposes the current limits: because capture never grows `sampleSize`
past 1, the confidence factor stays pinned at `0.01` for freshly captured patterns, so a
brand-new genuine winner is heavily discounted until Track B's recurrence merge lets its
sample count climb. The ranking is defensible; the capture side under-feeds it.

### 3.3 ✅ `markReused` (the reuse counter)

`markReused(id)` increments a pattern's `reuseCount` (`pattern-library.ts:28-31`), which
feeds the `+ reuseCount·0.1` term in `rank`. The mechanism to record that a pattern was
re-adopted exists — but since no generator adopts a pattern (§3.5), nothing calls it on
the live path. It is plumbing waiting for a consumer.

### 3.4 🔶 In-memory only — not durable

`InMemoryPatternLibrary` holds patterns in a plain `Map` (`pattern-library.ts:10`). There
is no SQLite/Postgres adapter for the pattern library, so **a process restart discards
the entire library**. This mirrors PRODUCT_TRUTH.md §2.6: the Company Brain is a global,
unscoped in-memory store. Durability is a build item, not a shipped fact.

### 3.5 🔶/❌ Never read into generation — the B-2 gap

This is the decisive limit. Grep the generators — `brief/service.ts`,
`creative/service.ts`, `draft/service.ts`, `report/service.ts`, `dashboard/service.ts` —
and **none takes a `PatternLibraryPort`, and none calls `bestFor`**. The brief and
creative services build their prompts from mission fields only
(`brief/service.ts:47-62`; PRODUCT_TRUTH.md §4). The captured, ranked patterns therefore
reach **no prompt, ever**. This is exactly the write-only-relative-to-generation
condition described in [`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md)
and is the **B-2** motivating gap: the library is a filing cabinet no one opens.

### 3.6 Today at a glance

| Behaviour | Tier | Evidence |
|---|---|---|
| Capture pattern at mission completion | ✅ SHIPPED | `routes.ts:1156` |
| `capture` stores record, sets `reuseCount:0` | ✅ SHIPPED | `pattern-library.ts:12-16` |
| Evidence-weighted `rank` (confidence × value + reuse nudge) | ✅ SHIPPED | `pattern-library.ts:35-38` |
| `bestFor(domain)` filtered, ranked retrieval | ✅ SHIPPED | `pattern-library.ts:18-22` |
| `markReused` increments reuse counter | ✅ SHIPPED (uncalled on live path) | `pattern-library.ts:28-31` |
| Durable storage of the library | 🔶 in-memory `Map` only | `pattern-library.ts:10` |
| Recurrence detection / structure merge / lift-vs-baseline | ❌ ROADMAP | no such code |
| Read patterns back into any generator | ❌ ROADMAP (readers unwired) | generators take no port; `app.ts:84-88` |
| Statistical / ML pattern mining | ❌ ROADMAP | no such code |

---

## 4. To build — from a ranked archive to a detection engine

Two independent build tracks. Track A is the high-leverage one (it closes B-2); Track B
enriches the detection itself.

### 4.1 Track A — read patterns into the Context Engine (🔶 → wire)

The reader components already exist unwired. The Context Engine
(`domains/executive-memory/src/context-builder.ts:37-86`, described in
[`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md)) is
designed to assemble Prompt → Mission → Brain → Memory → Experience context. Pattern
Detection plugs into its **Brain** stage:

1. **Inject the port.** Give the creative/campaign generators a `PatternLibraryPort`
   (they take none today — `creative/service.ts:42-55`).
2. **Query on generate.** Before drafting, call `bestFor(vertical)` and take the top
   `k` (e.g. 3) patterns whose `evidence.sampleSize ≥ minSamples` and `value ≥ target`.
3. **Render into the prompt.** Serialise each pattern's `structure[]` as an anchoring
   hint via the Prompt Orchestrator
   ([`../1-ai-foundations/PROMPT_ORCHESTRATOR.md`](../1-ai-foundations/PROMPT_ORCHESTRATOR.md)),
   e.g. *"Proven structure for this vertical (ROAS x over N campaigns): …"*.
4. **Close the reuse loop.** When a draft adopts a surfaced pattern, call `markReused(id)`
   so `rank` promotes what keeps working (`pattern-library.ts:28-31`).

This is the specific wiring the **B-2** gap needs; it is the same read-back specified in
[`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md).

**Sequence (target read path).** The wiring adds one query and one render step ahead of the
existing single-shot `ai.submit(...)` call — no change to the local-only inference contract:

| Step | Actor | Call | Tier |
|---|---|---|---|
| 1 | Context Engine | `patterns.bestFor(vertical)` → top-`k` above thresholds | 🔶 wire |
| 2 | Context Engine | assemble Brain stage context (patterns + experience) | 🔶 `context-builder.ts:37-86` |
| 3 | Prompt Orchestrator | render `structure[]` into the prompt as anchoring hints | 🔶 wire |
| 4 | Generator | existing `ai.submit(...)` single-shot generation | ✅ live |
| 5 | On draft-adopts-pattern | `patterns.markReused(id)` | 🔶 wire (`pattern-library.ts:28-31`) |

Only steps 1, 3, and 5 are new integration; step 4 is untouched, so the read-back inherits
the shipped local-inference, offline-default, and provenance guarantees unchanged.

### 4.2 Track B — richer, still-deterministic detection (❌ → design)

| Build item | Design | Tier |
|---|---|---|
| **Recurrence merge** | On `capture`, match against existing patterns by structure signature; if found, merge — increment `sampleSize` and update `value` (running mean) instead of inserting a duplicate | ❌ |
| **Lift vs baseline** | Rank on lift over the vertical's mean KPI, not raw `value`, so "wins" are relative to what is normal for that vertical | ❌ |
| **Confidence beyond `min(1,n/100)`** | Replace the linear scaler with a variance-aware confidence (e.g. lower-bound of a proportion/mean) so noisy single wins rank below steady performers | ❌ |
| **Minimum-recurrence gate** | Only *surface* structures observed `≥N` times — the definition of a detected pattern vs a one-off | ❌ |
| **Multi-KPI evidence** | Carry more than one `metric` per pattern (all six KPIs) so detection is not ROAS-only as capture is today | ❌ |
| **Durability** | A persistence adapter for the library so patterns survive restart (parallels the SQLite/Postgres aggregate stores) | 🔶/❌ |

Track B stays inside the product's constraints: every item is deterministic and offline —
no cloud model, no per-token cost. Detection gets richer without violating the
100%-local, air-gap posture.

### 4.3 Detection-quality risks the design must guard against

A pattern detector that anchors future drafts on past winners can quietly degrade output if
built naively. The design calls these out so they are handled, not discovered later:

| Risk | Failure mode | Mitigation in the target design |
|---|---|---|
| **Small-sample overconfidence** | A single 6.0-ROAS fluke gets reused as if proven | Confidence scaler + minimum-recurrence gate (§4.2) — do not *surface* below `N` observations |
| **Survivorship / feedback loop** | Reusing a pattern inflates its `reuseCount`, which inflates its rank, which drives more reuse | Keep `reuseCount`'s weight small and evidence-dominant; rank on lift, not popularity |
| **Vertical drift** | A structure that won last quarter no longer fits the market | Carry recency in evidence; decay old samples (future refinement) |
| **Homogenisation** | Every draft anchors on the same top pattern; creative diversity collapses | Surface a *shortlist* (top-`k`, not top-1); the human `creative_assets` gate remains the backstop |

None of these are solved by the current `rank` alone — they are why Track B and the human
approval gate both matter. Detection informs the draft; it never overrides human review.

### 4.4 Acceptance criteria for the read-back (Track A)

The wiring is done when all of the following hold — each is objectively checkable and none
requires a cloud dependency:

| # | Criterion | How it is verified |
|---|---|---|
| 1 | A generator receives a `PatternLibraryPort` via its constructor/config | Type signature change; unit test injects a fake port |
| 2 | On generation, `bestFor(vertical)` is called before `ai.submit` | Spy asserts call order |
| 3 | Only patterns above `minSamples` / `target` thresholds are surfaced | Test with mixed patterns asserts filtering |
| 4 | Surfaced `structure[]` appears verbatim in the rendered prompt | Assert prompt text contains the steps |
| 5 | Adopting a surfaced pattern calls `markReused(id)` exactly once | Spy on `markReused` |
| 6 | With an empty library, generation still succeeds (graceful no-op) | Test empty `bestFor` returns `[]`, draft still produced |
| 7 | The default offline manager path is unaffected | Existing offline tests stay green |

Criterion 6 matters: because capture only begins populating the library after the first
completed mission, a client's very first campaign must generate correctly with **zero**
patterns available. Detection is an accelerant, never a precondition.

### 4.5 Boundaries — what Pattern Detection is NOT

Per the concept ledger and PRODUCT_TRUTH.md §4, these are **not** this component and must
not be implied as shipped:

- **Not Winner/Loser Detection.** Per-asset win/loss (hook, headline, CTA) is
  ❌ ROADMAP with no detector — see [`WINNER_DETECTION.md`](./WINNER_DETECTION.md).
  `bestHook`/`bestHeadline` are stored merge fields, not detected winners.
- **Not Trend Analysis, Recommendation, or Competitor Analysis** — all ❌ ROADMAP, no
  code (PRODUCT_TRUTH.md §4).
- **Not a live-optimisation loop.** Nothing launches or reallocates a real campaign;
  drafts never leave `draft` status (PRODUCT_TRUTH.md §2.4). Detection informs the *next
  first draft*, not a running ad.

### 4.6 Relationship to the Learning Engine's scoring

Pattern Detection is complementary to — not the same as — the reward-scoring **Learning
Engine** that exists unwired at `packages/ai-manager/src/runtime/learning.ts:18-46` (an
EMA reward with a `suggest` method). The two operate at different granularities and both
are currently disconnected from generation:

| Concern | Pattern Detection | Learning Engine (`learning.ts`) |
|---|---|---|
| Unit of learning | A campaign **structure** (channel mix + steps) per vertical | A **prompt/model** reward signal (EMA) |
| Output | Ranked shortlist of reusable structures | A suggested prompt/model choice |
| Home | `domains/company-brain` | `packages/ai-manager/runtime` |
| Status | ⚠️ capture+rank ✅; read-back ❌ | 🔶 BUILT (UNWIRED) |

They can eventually feed the same Context Engine assembly without overlap: one supplies
*what structure to reuse*, the other *which prompt/model produced good results*. Neither is
on the live generation path today; keeping them distinct avoids conflating structure reuse
with inference-parameter tuning.

---

## 5. Value contribution

**Primary: revenue ↑.** The product promise is *"AdOS uses the agency's corporate memory
to produce human-approved first drafts and improves each campaign by learning from the
last."* Pattern Detection is the mechanism behind "improves … by learning from the last":
when a generator anchors a new draft on the vertical's **proven** winning structure
rather than a blank prompt, the first draft starts from what has already produced
above-target ROAS. Reusing proven patterns lifts expected campaign performance, and
because the confidence-weighted `rank` promotes structures with more supporting evidence
and proven reuse, the shortlist gets sharper the longer a client runs — a per-client
compounding advantage competitors cannot copy, since it is built from that client's own
results.

**Secondary: production time ↓.** Anchoring on a proven structure means fewer human
revision cycles at the `creative_assets` gate — first drafts land closer to
approval-ready.

**Cost to the promise: zero.** Capture, `rank`, and `bestFor` are pure, deterministic,
offline functions (`pattern-library.ts:12-38`). Wiring the read-back and enriching
detection add **no** cloud dependency, API key, or per-token billing — fully consistent
with the 100%-local, air-gap-capable posture.

The capture-and-rank engine that makes this possible already runs. The one honest caveat:
until Track A lands, patterns are detected and ranked but never read — the value above is
**latent**, unlocked by closing the B-2 read-back.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
