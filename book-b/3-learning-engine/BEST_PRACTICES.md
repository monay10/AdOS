# Best Practices — Turning Detected Patterns Into Reusable Guidance the Factory Applies

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |

> **Implementation status:** ❌ **ROADMAP** — evidence-ranked patterns and a
> sample-weighted `bestHook`/`bestHeadline` merge exist **in-memory** in the repo,
> but **no best-practices layer** (curation, thresholding, or injection into
> generation) is built. Nothing here runs on a live app path today. This document
> is a design specification, not a description of shipped behaviour.

---

## 0. The one-paragraph truth

A pattern is raw. A best practice is a pattern that has been **curated** — promoted
past an evidence threshold, phrased as an instruction, stamped with its provenance,
and made available to the generator that writes the next campaign. AdOS records
winning marketing structures today (`domains/company-brain/src/pattern-library.ts`)
and it ranks them by evidence strength. What it does **not** do is turn that ranking
into standing guidance that the factory obeys on the next first draft. The patterns
are captured at mission completion and never read back into generation — the same
open loop described for memory in
[`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md)
(the **B-2 gap** from the Book A walkthrough). This document specifies the missing
layer: a **Best-Practices Engine** that curates top-ranked, evidence-thresholded
patterns into structured rules and hands them to the Context Engine for injection.

**Relationship to its sibling.** [`PATTERN_DETECTION.md`](./PATTERN_DETECTION.md)
covers *how a pattern is captured and ranked* (the raw signal). This document covers
*how a ranked pattern becomes reusable guidance the factory applies* (the codified
output). Detection produces candidates; curation decides which ones earn the right to
steer generation.

---

## 1. Target design — the Best-Practices Engine

### 1.1 The three moves

A best practice is not a new data type invented from nothing; it is a **promotion**
of an existing ranked `Pattern` plus the merged qualitative winners already tracked
in the brain. The engine performs three moves:

| Move | Input | Output | Gate |
|---|---|---|---|
| **Curate** | ranked `Pattern[]` for a vertical | shortlist of eligible patterns | evidence threshold (§1.3) |
| **Codify** | eligible pattern | a structured **best-practice rule** (instruction text + provenance) | phrasing template (§1.2) |
| **Inject** | active rule set for the mission's vertical | prompt-visible guidance block | Context Engine assembly order (§1.4) |

Curate filters. Codify phrases. Inject delivers. No move fabricates evidence; every
rule points back to the campaigns that earned it.

A useful way to hold the distinction: **detection is descriptive, curation is
prescriptive.** Detection says *"this structure appeared in winning restaurant
campaigns."* Curation says *"therefore, when you write the next restaurant creative,
do this."* The second sentence is the entire product of this document — and it is the
sentence AdOS cannot yet form.

### 1.2 The best-practice rule shape (target)

Today's `Pattern` (`packages/contracts/src/ai/company-brain.ts:124-131`) carries:

```
Pattern {
  id: string
  domain: string          // the vertical, e.g. "restaurant"
  name: string
  structure: string[]     // ordered steps, e.g. ["15s video","first 3s food","CTA reservation"]
  evidence: { sampleSize, metric, value }
  reuseCount: number
}
```

A best-practice rule is a **derived, curated projection** of that record — proposed
as a new contract, not a modification of `Pattern`:

```
BestPractice {
  id: string
  vertical: string            // = Pattern.domain
  sourcePatternId: string     // provenance: which pattern this codifies
  guidance: string            // imperative instruction the model can act on
  appliesTo: ArtifactKind[]   // brief | creative | campaign — where the rule is relevant
  evidence: { metric, value, sampleSize }   // carried through, never invented
  confidence: number          // 0..1, the same evidence weighting used to rank
  status: 'active' | 'candidate' | 'retired'
}
```

The `guidance` field is the codification step: `structure` (`["15s video","first 3s
food","CTA reservation"]`) becomes an instruction the generator can honour — e.g.
*"For restaurant video creative, open on food within the first 3 seconds and close
with a reservation CTA (proven over N campaigns at ROAS x)."* The parenthetical is
**provenance**, not decoration: a rule that cannot cite its evidence is not eligible.

### 1.3 Evidence thresholding — what earns "best practice" status

Curation must be conservative. A pattern seen once is not a best practice; it is an
anecdote. The engine reuses the exact evidence weighting the pattern library already
applies (`pattern-library.ts:35-38`):

```
confidence = min(1, evidence.sampleSize / 100)
rank        = evidence.value * confidence + reuseCount * 0.1
```

Promotion to `status:'active'` requires **all** of:

| Gate | Threshold (target, tunable) | Reason |
|---|---|---|
| Minimum sample size | `evidence.sampleSize >= N_min` | one campaign is not a trend |
| Minimum confidence | `confidence >= c_min` | small samples stay `candidate` |
| Minimum rank | `rank >= r_min` | weak signal never steers generation |
| Non-conflicting | no active rule contradicts it for the same `vertical` + `appliesTo` | avoid guidance whiplash |

Patterns below threshold remain `candidate` — visible for review, never injected.
This mirrors the confidence/evidence discipline specified in the Context Engine and
memory work; a best practice is just memory that has earned an imperative voice.

Two of these gates are **already computable from shipped code** — `sampleSize`,
`confidence`, and `rank` all fall out of the existing `rank()` function
(`pattern-library.ts:35-38`). The engine does not need new maths to decide
eligibility; it needs the *promotion decision* and the *rule projection* that the
current library omits. That is the honest measure of the gap: the arithmetic exists,
the judgement does not.

### 1.4 Injection — the Context Engine is the only door

Best practices reach the generator **only** through the Context Engine assembly
described in [`../1-ai-foundations/CONTEXT_ENGINE.md`](../1-ai-foundations/CONTEXT_ENGINE.md)
and [`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md).
The engine does not call `ai.submit(...)` itself and does not touch the generator
services directly. It contributes one bounded block to the assembled context:

```
[ Prompt template ]
[ Mission fields ]            ← ✅ shipped (brief/service.ts:47-62)
[ Brand voice / rules ]
[ Company Brain memory ]     ← 🔶 reader exists unwired
[ Best practices (this doc) ]← ❌ to build: curated rule block, vertical-scoped
[ Task schema as text ]
```

Design constraints on the injected block:

- **Vertical-scoped.** Only rules whose `vertical` matches the mission's vertical are
  eligible; a restaurant rule never leaks into a B2B SaaS brief.
- **Artifact-scoped.** Only rules whose `appliesTo` includes the artifact being
  generated appear (a creative rule is not injected into the analytics report).
- **Bounded.** Top-K by `rank`, hard cap on token budget — best practices compete
  for space with memory and brand rules; they do not crowd out the prompt.
- **Provenance-preserving.** The evidence clause travels with the guidance so the
  model — and any human reviewer reading the assembled context — can see *why* a rule
  is present.
- **Advisory, not enforcing.** Best practices steer the first draft; they are not a
  hard gate. Brand-safety enforcement and validation remain the responsibility of the
  pipeline stages specified in Part 1, not this layer.

### 1.5 Where this sits in the factory pipeline

Best practices are a **learning-engine output** that feeds the **foundations layer**.
They do not touch the generator services directly; they flow one way:

```
Part 3 (Learning)                    Part 1 (Foundations)             Generation
─────────────────                    ────────────────────             ──────────
Pattern Detection ─▶ Best-Practices ─▶ Context Engine assembly ─▶ generator ai.submit
   (sibling)          Engine (here)     (MEMORY_INJECTION /
                                         CONTEXT_ENGINE)
```

This one-way flow is deliberate. It keeps the five generator services single-shot and
port-free at their call sites (exactly as shipped), and it concentrates all the
"knows what worked" logic in one curatable place rather than scattering brain lookups
across every service. If the best-practices rule set is empty — as it is today,
because the engine does not exist — generation degrades gracefully to the current
behaviour: mission fields plus a static template, no worse than the live app.

---

## 2. Today — what actually exists (tier-tagged)

Nothing in this section is a best-practices engine. Two adjacent primitives exist,
both **in-memory**, both **write-only relative to generation**.

| Primitive | Tier | Where | What it does | What it does NOT do |
|---|---|---|---|---|
| Evidence-ranked pattern library | ⚠️ in-memory, unwired at generation | `pattern-library.ts:9-38` | captures winning `structure`s, ranks by `rank()` and `bestFor(domain)` | never read into any generator; no threshold; no rule text |
| `bestHook` / `bestHeadline` merge | ⚠️ in-memory, unwired at generation | `in-memory-company-brain.ts` ~:110-112 | keeps the qualitative winner from the larger sample | not a rule; not injected; single scalar fields |
| Best-practices layer | ❌ **ROADMAP** | — | — | **does not exist** |

### 2.1 The ranked pattern library (⚠️ exists, unwired)

`InMemoryPatternLibrary` (`pattern-library.ts:9-38`) stores `Pattern`s in a
`Map<string, Pattern>` and exposes `bestFor(domain)`, which returns the vertical's
patterns **sorted by evidence-weighted rank**:

```
rank(p) = p.evidence.value * min(1, p.evidence.sampleSize / 100) + p.reuseCount * 0.1
```

This is the closest thing in the codebase to "best practices": it already answers
*"which structures work best for this vertical, weighted by how much evidence backs
them and how often they proved out."* But three things make it **not** a
best-practices engine:

1. **No promotion gate.** `bestFor` returns *every* pattern for the domain, ranked —
   including single-sample anecdotes. There is no threshold, no `active`/`candidate`
   distinction.
2. **No codification.** A `structure: string[]` is raw data, not guidance. Nothing
   turns `["15s video","first 3s food","CTA reservation"]` into an instruction a
   generator can act on.
3. **No reader.** No generation service imports `PatternLibraryPort`. The brief,
   creative, campaign, report, and executive services each make a single
   `ai.submit(...)` call and take **no** brain or pattern port
   (`brief/service.ts:47-62`, `creative/service.ts:42-55`). `bestFor` is called by
   nobody on a live path. `markReused` — the counter that would let the `rank`
   formula reward proven reuse — is therefore never incremented in generation.

### 2.2 The `bestHook` / `bestHeadline` merge (⚠️ exists, unwired)

The Company Brain's sample-weighted merge (`in-memory-company-brain.ts` ~:99-113)
keeps the better-performing qualitative winners from the larger sample:

```
bestHook:     next.sampleSize >= prev.sampleSize ? next.bestHook : prev.bestHook
bestHeadline: next.sampleSize >= prev.sampleSize ? next.bestHeadline : prev.bestHeadline
```

This is a genuinely useful signal — *the hook and headline that won across the most
campaigns* — and it is exactly the kind of thing a best practice would codify. But it
is a **pair of scalar fields on a `MarketingInsight`**, not a rule, not thresholded
beyond "larger sample wins," and — like the pattern library — never injected into
generation. It is recorded at mission completion and read back by nothing.

### 2.3 The honest summary

> **There is no best-practices engine in AdOS today.** Ranked patterns and
> best-winner fields exist in memory; a curation-and-injection layer that would turn
> them into guidance the factory applies **has not been built**. The loop from
> "detected pattern" to "next first draft starts ahead" is **open**.

---

## 3. To build — the curation + injection layer

The build is deliberately additive: it consumes primitives that already exist and
delivers through a door (the Context Engine) that Part 1 already specifies. It writes
no new generator; it wires guidance into the assembled context.

### 3.1 Build ledger

| # | Component | Tier today | Build work |
|---|---|---|---|
| 1 | `BestPractice` contract | ❌ ROADMAP | define the shape in §1.2 in `packages/contracts` |
| 2 | Curator | ❌ ROADMAP | read `bestFor(vertical)`, apply §1.3 thresholds, emit `candidate`/`active` |
| 3 | Codifier | ❌ ROADMAP | render `structure` + evidence → imperative `guidance` string |
| 4 | Rule store | ❌ ROADMAP | persist `BestPractice[]` with `status`; retire conflicting/stale rules |
| 5 | Context Engine block | ❌ ROADMAP (host 🔶 unwired) | add vertical/artifact-scoped, bounded rule block to assembly |
| 6 | Reuse feedback | ❌ ROADMAP | on applied rule, call `markReused(sourcePatternId)` so `rank` compounds |

Component 5's host — the Context Engine — already exists as 🔶 **BUILT (UNWIRED)**
code (`domains/executive-memory/src/context-builder.ts`); wiring it onto the live
path is Part 1 build work that this layer depends on. Components 1–4 and 6 are pure
❌ ROADMAP: no implementation exists.

### 3.2 Sequence (target)

```
mission completes
   └─ pattern captured + ranked        ← ⚠️ exists today (pattern-library.ts), unwired
   └─ Curator scans bestFor(vertical)  ← ❌ build: apply thresholds §1.3
        └─ eligible? → Codifier         ← ❌ build: structure → guidance
             └─ store as BestPractice   ← ❌ build: status = active | candidate
next mission, same vertical, generation begins
   └─ Context Engine assembles context ← 🔶 host unwired
        └─ inject active best-practice block (top-K, bounded) ← ❌ build
   └─ generator's single ai.submit runs with guidance in-context ← ✅ shipped call site
   └─ on human approval of the draft, markReused(sourcePatternId) ← ❌ build: rank compounds
```

The only ✅ element in the chain is the generator's existing `ai.submit` call site;
everything that would make it *smarter than last time* is ❌ to build.

### 3.2.1 Worked example (illustrative, target behaviour)

Suppose three restaurant missions complete over time. Pattern Detection captures and
ranks a structure; the Best-Practices Engine, once built, would promote and codify it:

| Stage | State (target) |
|---|---|
| After mission 1 | `Pattern{ structure:["15s video","first 3s food","CTA reservation"], evidence:{sampleSize:1, metric:"ROAS", value:3.1} }` → `confidence = 0.01`, `rank ≈ 0.031` → **below threshold → `candidate`** |
| After mission 12 | merged `evidence:{sampleSize:12, value:3.4}` → `confidence = 0.12`, `rank ≈ 0.41` → still `candidate` if `r_min` is higher |
| After mission 40 | `evidence:{sampleSize:40, value:3.6}` → `confidence = 0.40`, `rank ≈ 1.44` → **clears threshold → `active`** |
| Codified `guidance` | *"For restaurant video creative, keep it to ~15s, open on food within the first 3 seconds, and close with a reservation CTA — proven over 40 campaigns at ROAS 3.6."* |
| Next restaurant mission | Context Engine injects that one line into the creative generation context; the first draft opens on the proven structure |
| On human approval | `markReused(sourcePatternId)` fires; `reuseCount` rises; `rank` compounds; the rule's standing strengthens |

Note what does **not** happen: the anecdote from mission 1 never steers a draft. Only
after the evidence base is real does the pattern earn an imperative voice. This is the
conservatism §1.3 exists to enforce.

### 3.3 Design invariants (must hold when built)

- **No fabricated evidence.** Every `BestPractice.evidence` is copied from a real
  `Pattern.evidence`; the engine never invents a `sampleSize` or `value`.
- **Threshold before injection.** A `candidate` rule is never injected. Only `active`
  rules — those that cleared §1.3 — reach the prompt.
- **Injection is the Context Engine's job, not the generator's.** Generators stay
  single-shot and port-free at the call site; the guidance arrives pre-assembled in
  their context. This preserves the shipped architecture and avoids coupling every
  service to the brain.
- **Advisory, not a gate.** Best practices improve the *starting position* of a
  draft. They do not replace human approval (`approval.ts`, `routes.ts:478-481`) and
  do not enforce brand safety — enforcement stays where Part 1 places it.
- **Bounded and scoped.** Vertical-scoped, artifact-scoped, token-capped. Guidance
  that does not match the mission's vertical is never assembled.

### 3.4 Open design questions (flagged, not resolved here)

- **Threshold calibration** (`N_min`, `c_min`, `r_min`): start conservative; a rule
  that steers every draft must be very well evidenced. Values are tuning, not
  architecture.
- **Conflict resolution**: when two active rules disagree for the same
  `vertical`+`appliesTo`, which wins — higher `rank`, newer evidence, or human
  arbitration? Proposed default: higher `rank`, with the loser demoted to
  `candidate`.
- **Retirement**: how a best practice decays when newer campaigns stop supporting it.
  Proposed: re-run curation on each completion; a rule that falls below `r_min`
  retires to `status:'retired'` rather than being deleted (audit-friendly).

---

## 4. Boundaries — what this layer is NOT

To keep the tiers honest, this document does **not** claim any of the following, all
of which are ❌ ROADMAP or forbidden as shipped:

| Not this | Why |
|---|---|
| Quality scoring / creative QA of output | no scoring code exists; out of scope here |
| Winner/loser detection | `bestHook`/`bestHeadline` are stored merge fields, not a detector |
| A recommendation engine surfaced to users | recs are output array fields only |
| Enforcement of brand-safety or banned words | enforcement lives in Part 1; this layer is advisory |
| A closed learning loop presented as live | the loop is open today; this is its specification |
| Any cloud, API, or telemetry dependency | AdOS is 100% local, offline-first; best practices are local memory |

Best practices are **codified corporate memory with an imperative voice**. They make
the first draft start from what already worked. They do not judge, gate, launch, or
optimise — those belong to other stages and other tiers.

---

## 5. Value contribution

**Revenue ↑ and production-time ↓ — a codified best practice makes every first draft
start ahead of a blank prompt.**

- **Production-time ↓.** Today each campaign's first draft begins from the mission
  fields and a static template; the agency's hard-won knowledge of *what works for
  this vertical* lives in a human's head or in an unread `Map`. Injecting curated,
  evidence-backed guidance means the generator opens on the proven structure instead
  of a strategist re-deriving it — fewer revision cycles between first draft and
  human approval.
- **Revenue ↑.** A draft that opens on the highest-`rank` structure for the vertical
  (proven over N campaigns at a real ROAS) is closer to a winner before a human ever
  edits it. Compounding `markReused` on approval means the guidance sharpens with
  every campaign — the factory's output quality trends up as the evidence base grows,
  which is the whole promise of corporate-memory-driven generation.
- **Why it is worth building.** Detection alone (its sibling doc) produces signal that
  no one acts on. Curation is what converts that signal into a repeatable edge. Every
  rule this engine promotes either shortens the path to approval or raises the ceiling
  of the first draft — it serves both halves of the value rule directly.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
