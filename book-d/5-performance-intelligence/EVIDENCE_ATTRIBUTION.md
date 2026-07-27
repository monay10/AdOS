# Evidence Attribution — "based on 214 campaigns," quantified

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](../1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md).
>
> **Laws:** *Memory is evidence, not knowledge · Raw → Aggregate → Recommendation · every
> recommendation carries its sample size · freshness before frequency.*

---

## 1. What this document owns

This document owns the **payoff line** of Performance Memory — the sentence that a
recommendation can, one day, put in front of a human:

> *"I gave this recommendation based on evidence from 214 campaigns."*

That sentence is not decoration. It is the **quantified provenance** of a recommendation: the
count of campaigns standing behind it, and how fresh those campaigns are. Where a bare model
would emit a fluent-sounding suggestion with no traceable basis, an attributable memory emits a
suggestion *stamped with its own evidence* — a number the human can trust, question, or reject.

Attribution is the operational face of **Law 3 — the Sample Size Rule**. Every recommendation
must carry an evidence stamp so a user never mistakes a single lucky campaign for a
generalization. This document specifies that stamp: the exact shape a human sees, where each of
its numbers comes from in the stored memory, and — told honestly — how much of it ships today
versus how much is designed here and not yet wired.

**Boundary, stated up front.** Everything here operates on the agency's **own** recorded
campaign history, **100% locally**, offline-first, copy-only. The "214 campaigns" are *the
agency's own* 214 campaigns. There is no external benchmark, no industry dataset, no vendor
telemetry, no cloud model of "what works." Attribution is a claim about *your own history* and
nothing else. The human stays sovereign throughout: the stamp *informs* a decision; it never
approves one.

---

## 2. Law 3 in full — the evidence stamp

> **LAW 3 — Sample Size Rule.** Every recommendation MUST carry an evidence stamp:
> `Sample Size: N campaigns · Confidence: <level> · Evidence Age: <window>`. So a user never
> mistakes a single lucky campaign for a generalization.

This stamp is Book D's contract with the reader, exactly as an Explainability Contract is Book
C's. A recommendation without its stamp is not a finished Performance Memory output — it is an
unattributed guess, and the whole point of accumulated memory is that its outputs are *not*
guesses.

### 2.1 The stamp as a rendered shape

The stamp is meant to be *seen*, attached to the recommendation it qualifies. Concretely, a
rendered recommendation carries its provenance inline:

```
Recommendation
  For a finance-vertical launch, lead with short-form video.

  ── Evidence ────────────────────────────────────────────
  Sample Size:   214 campaigns
  Confidence:    high
  Evidence Age:  last 18 months  (most recent: 6 days ago)
  ─────────────────────────────────────────────────────────
```

Three fields, always present, never optional:

- **Sample Size** — *how many* campaigns stand behind this recommendation. A raw count, not a
  percentage and not a score. `214 campaigns` means two hundred and fourteen real, recorded
  campaigns in the agency's own history contributed to the aggregate this recommendation reads.
- **Confidence** — a qualitative band (`low` / `medium` / `high`) derived from the strength and
  consistency of that evidence, not a false-precision number. Confidence is a *summary* of the
  evidence, never a promise about the future.
- **Evidence Age** — the *window* the evidence spans and, ideally, how recent the freshest
  campaign in it is. `last 18 months` tells the human whether they are reading current evidence
  or an archive.

A thin, recent basis renders just as honestly as a fat one:

```
  ── Evidence ────────────────────────────────────────────
  Sample Size:   3 campaigns
  Confidence:    low
  Evidence Age:  last 30 days
  ─────────────────────────────────────────────────────────
```

The reader sees at a glance that this is a three-campaign signal, and weighs it accordingly. The
stamp's job is to make the *shape of the evidence* impossible to overlook.

### 2.2 The stamp is what stops the AI ever saying "I learned"

The product's cardinal voice rule: **the AI never says "I learned."** It says **"Based on the
results of the last N campaigns…"**. The stamp is the mechanism that enforces this. "I learned"
is a claim about the *AI* — a claim that it has acquired knowledge. "Based on the results of the
last 214 campaigns" is a claim about the *company's evidence* — a fact the human can check.

The distinction is not cosmetic. "I learned" invites the human to trust a black box. The stamp
does the opposite: it *shows its work as a count*. A recommendation phrased as —

> *"Based on the results of the last 214 finance campaigns (most recent 6 days ago), short-form
> video outperformed on click-through."*

— attributes itself to a countable, dated body of evidence. There is nothing for the AI to have
"learned"; there is only a company memory the recommendation is *reading from*. The AI, per the
whole-book principle, never learns — the **company** accumulates memory, and the stamp is the
receipt for that memory. Attribution is precisely what lets the product hold that line at the
surface where the human actually reads a recommendation.

---

## 3. Where the count comes from — sample size on the aggregate

The `N` in "Sample Size: N campaigns" is not counted at recommendation time by scanning raw
records. It is a number the **aggregation layer already carries**: as raw campaigns are folded
into per-dimension aggregates, the count of how many campaigns went into each aggregate rides
along with it. Attribution reads that carried count; it does not recompute it.

### 3.1 `sampleSize` accumulated by sample-weighted merges (🔶 BUILT-UNWIRED)

When the Company Brain folds a new batch of marketing results into an existing aggregate, it
does a **sample-weighted merge** — a weighted average of `ctr` / `cpa` / `roas` in which each
side is weighted by how many campaigns it represents
([`domains/company-brain/src/in-memory-company-brain.ts:100`](../../domains/company-brain/src/in-memory-company-brain.ts)).
The accumulated `MarketingInsight.sampleSize` is the running total of campaigns behind that
aggregate. That total *is* the `N` the stamp needs: it is, by construction, "how many campaigns
this aggregate summarizes."

The Pattern Library carries the same quantity on its own aggregates. A `Pattern` accumulates a
`sampleSize`, and its ranking explicitly reads that count:
[`domains/company-brain/src/pattern-library.ts:18`](../../domains/company-brain/src/pattern-library.ts)
(`bestFor`) ranks with
[`pattern-library.ts:35`](../../domains/company-brain/src/pattern-library.ts) —
`evidence.value * min(1, sampleSize/100) + reuseCount * 0.1`. Note what that `min(1,
sampleSize/100)` term does: it lets a pattern's evidence value climb *toward* full weight only
as its sample size climbs toward 100, so a one-campaign pattern is damped and cannot masquerade
as a proven one. The count is not only carried — it is already used to *temper* the aggregate.
That saturation is exactly the arithmetic Law 3 exists to surface.

**Tier — the sampleSize field and its merges are 🔶 BUILT (UNWIRED).** The structures carry a
`sampleSize`; the sample-weighted merge (`mergeMarketing`) and the ranking that reads it are
coded and tested. But the aggregation entry point (`enrich`) has **no non-test caller anywhere**
in the live app — no live path folds recorded campaigns into these aggregates. So the number
that would become `N` is *designed and present in the data structures*, not *accumulating in
production*.

### 3.2 What the count is NOT

The `N` is a **count of campaigns**, and only that. It is not:

- a *success rate* ("214 wins") — it counts all campaigns in the aggregate, not only the good
  ones;
- a *confidence percentage* — confidence is a separate, qualitative field;
- a claim that all 214 agree — a large `N` with high variance is still a large `N`, and
  Confidence, not Sample Size, is where disagreement shows up.

Keeping `N` a plain count is what makes it honest. It answers exactly one question — *how much
evidence?* — and refuses to smuggle in a second.

---

## 4. Where the evidence age comes from — stored timestamps

The `Evidence Age` field is powered by the **timestamps every memory store already stamps on its
entries** at record time. The window is derived by looking at the ages of the campaigns behind
an aggregate: the span from the oldest to the newest, and how recent the freshest is.

### 4.1 The timestamps exist (✅ stored)

Every store that holds campaign memory writes a timestamp when an entry is recorded, on the
✅ SHIPPED recording path:

- **Experience** — `Experience.at`
  ([`domains/company-brain/src/experience-engine.ts:19`](../../domains/company-brain/src/experience-engine.ts)).
- **Executive Memory** — `ExecutiveMemoryEntry.createdAt`
  ([`domains/executive-memory/src/memory.ts:21`](../../domains/executive-memory/src/memory.ts)).
- **Decision Journal** — `DecisionJournalEntry.at`, populated at record time
  ([`apps/web/src/routes.ts:1116`](../../apps/web/src/routes.ts)).

Because these are written on the wired recording path, the raw material for "Evidence Age"
genuinely accumulates in production: every recorded campaign carries the date it was recorded.

### 4.2 But age is not yet *scored* into a window (❌ ROADMAP)

Storing a timestamp is not the same as computing a freshness *window* and attaching it to a
recommendation. The Executive Memory read path — `recall`
([`domains/executive-memory/src/memory.ts:35`](../../domains/executive-memory/src/memory.ts)) —
ranks entries by **importance plus keyword relevance only**; it does not consult `createdAt`. No
code today reads the timestamps behind an aggregate to derive "last 18 months, most recent 6
days ago." The freshness *data* is ✅; the freshness *scoring* that would fill the `Evidence Age`
field is ❌ ROADMAP.

The operational design of freshness scoring — the recency-aware ranking that would populate this
field — is owned by the sibling maintenance document
[`../4-memory-maintenance/DECAY_AND_FRESHNESS.md`](../4-memory-maintenance/DECAY_AND_FRESHNESS.md).
This document owns only the *presentation* of age in the stamp; the scoring that computes it
lives there.

---

## 5. The honest tier — a live "based on 214 campaigns" is not shipped

It would be easy to overclaim here, so state the truth plainly. **Both raw materials of the stamp
exist in the structures** — the `sampleSize` count on the aggregates, and the timestamps on the
records. **Neither is wired into a live attribution today.**

| Stamp field | Raw material | Where it lives | Tier of a *live* stamp |
|---|---|---|---|
| Sample Size | `MarketingInsight.sampleSize` / `Pattern.sampleSize` | accumulated by sample-weighted merge `in-memory-company-brain.ts:100`; read in ranking `pattern-library.ts:18,35` | 🔶 — data structures carry it; aggregation `enrich` has no live caller |
| Evidence Age | `Experience.at`, `ExecutiveMemoryEntry.createdAt`, `DecisionJournalEntry.at` | `experience-engine.ts:19`, `memory.ts:21`, `routes.ts:1116` | ❌ — timestamps stored (✅), but no scorer turns them into a window |
| Confidence | qualitative assessment over the evidence | `HeuristicConfidenceEngine.assess` `reasoning.ts:62` | 🔶 — engine exists, unwired |

The recommendation-forming layer that would *emit* the stamp is itself 🔶/❌: evidence gathering
is `BrainEvidenceEngine.gather`
([`domains/executive-memory/src/reasoning.ts:14`](../../domains/executive-memory/src/reasoning.ts),
🔶), confidence assessment is `HeuristicConfidenceEngine.assess`
([`reasoning.ts:62`](../../domains/executive-memory/src/reasoning.ts), 🔶), and the composite
recommendation that would carry the stamp is designed in
[`../3-recommendation-engine/RECOMMENDATION_ENGINE.md`](../3-recommendation-engine/RECOMMENDATION_ENGINE.md)
as 🔶/❌. Because the aggregation layer is unwired and freshness scoring is absent, a live
recommendation that actually renders *"based on 214 campaigns · last 18 months"* is **not
shipped**.

**So the stamp is designed here, not shipped.** The count exists as a field; the timestamps
exist as data; the phrasing rule exists as principle. What is missing is the wiring: an
aggregation path that runs live, a freshness scorer that computes the window, and a
recommendation surface that renders the stamp. This document specifies the *target shape* so
that when those pieces wire together, the stamp is already fully defined — and it labels every
piece so no reader mistakes the design for the shipped reality.

---

## 6. The distinction from Book C — provenance, not explanation

Attribution is easy to confuse with explanation, and the two must stay separate. Book C and Book
D answer *different questions* about the same recommendation.

- **Book C answers WHY.** It documents the reasoning and evidence chain — *why* this
  recommendation follows from the evidence, phrased as an explanation the human can read. Its
  machinery (`BrainEvidenceEngine` / `HeuristicConfidenceEngine`, the Decision Journal as
  explanation) is a *read/explain* mechanic, documented in
  [`../../book-c/2-grounded-recommendation/DECISION_JOURNAL.md`](../../book-c/2-grounded-recommendation/DECISION_JOURNAL.md).
- **Book D's attribution answers HOW MUCH and HOW FRESH.** It is the *quantified provenance* of
  the recommendation: the count of campaigns behind it and the age of that evidence. Not the
  argument — the *receipt*.

An analogy: Book C is the *reasoning* in a court opinion; Book D's stamp is the *citation count
and dates* on the evidence the opinion rests on. One tells you the logic; the other tells you how
much evidence, how recent. A recommendation ideally carries both — Book C's explanation *and* Book
D's stamp — but they are produced by different concerns and must not be collapsed into each other.

This document therefore does **not** re-document the explanation mechanic. Where the reasoning
chain matters, it *references* Book C rather than restating it. Book D's contribution at the
surface is the number: **214**, and the window it spans.

---

## 7. Law 1 — attribution reports FACTS, never a conclusion

**LAW 1 — Memory is Evidence, not Knowledge.** The stamp is a pure Law-1 artifact: every field
in it is a *fact about the evidence*, and none of it is a conclusion.

- `Sample Size: 214 campaigns` is a **count** — a recorded fact. It asserts that 214 campaigns
  contributed; it does not assert that video "always wins."
- `Evidence Age: last 18 months` is a **date range** — a recorded fact. It asserts when the
  evidence was gathered; it does not assert that the evidence is right.
- `Confidence: high` is a **summary of the evidence's strength** — still a description of the
  facts, not a promise about the outcome.

The stamp never overstates its facts into a conclusion. It says *"based on 214 campaigns,"* not
*"214 campaigns prove."* The word is **based on**, not **proves** — the count is the *basis* the
human weighs, never a verdict the memory has reached. The moment a stamp were to read "therefore
this will work," it would have crossed from evidence into knowledge and violated Law 1. The
conclusion — the "therefore, do X" — belongs to the recommendation layer (Part 3) or to Book C's
explanation, and even there it is advisory. The stamp's job is narrower and more disciplined:
report the count and the age, exactly, and let those facts speak without inflating them.

This is what makes attribution *trustworthy*. A number that never overstates itself is a number a
human can rely on. The instant a provenance stamp starts editorializing, it stops being
provenance.

---

## 8. Law 4 — the stamp makes evidence age visible

**LAW 4 — Freshness Before Frequency.** Attribution serves Law 4 by putting **Evidence Age**
*next to* Sample Size in the same stamp — so a human can see, at a glance, whether a basis is
fresh, stale, thick, or thin. Frequency and freshness are two different truths, and the stamp
refuses to let either hide the other.

Four combinations, all rendered honestly by the same three fields:

| | Small sample | Large sample |
|---|---|---|
| **Recent** | `3 campaigns · low · last 30 days` — fresh but thin; weigh with caution | `214 campaigns · high · last 18 months` — the strong case |
| **Old** | `4 campaigns · low · 2019` — thin *and* stale; barely a signal | `500 campaigns · medium · 2019 archive` — big but possibly out of date |

The bottom-right cell is the one Law 4 exists to expose. A memory that reported only Sample Size
would crown the `500 campaigns` from 2019 by sheer count — even though the market has moved on.
By forcing **Evidence Age** into the same stamp, attribution makes a *large-but-stale* basis
visibly stale, and a *fresh-but-small* basis visibly small. The human sees both dimensions and
judges; the stamp never pre-decides which matters more.

This is the reason Evidence Age is not optional. Sample Size alone can flatter old evidence.
Evidence Age is the guardrail that keeps a fat, dated pile from passing itself off as current
strength — and keeps a thin, recent signal from being dismissed just because it is small. The
freshness *scoring* that computes the window is ❌ ROADMAP (see §4.2 and
[`../4-memory-maintenance/DECAY_AND_FRESHNESS.md`](../4-memory-maintenance/DECAY_AND_FRESHNESS.md));
the *requirement* that age travel in every stamp is a Law-4 invariant this document owns.

---

## 9. Human-sovereign — attribution informs, never approves

The stamp changes what the human *knows* when they decide. It never decides for them.

- A `high` confidence stamp on `214 campaigns` does **not** auto-apply the recommendation, does
  **not** launch anything, and does **not** pre-approve a brief. It makes the recommendation
  *more legible* — that is all.
- A `low` confidence stamp on `3 campaigns` does **not** block the human from acting on it. A
  strategist may have good reason to run with a thin, fresh signal. The stamp's duty is to make
  sure they do so *knowingly*.

Attribution is decision-support, not decision-making. It sits *before* the human in the loop —
Recommendation → **stamp** → Human → Next Campaign — and its entire purpose is to make the
human's judgment better-informed, never to substitute for it. The approval gates that actually
govern what ships are owned elsewhere (Book A/B); this document does not touch them and never
lets a number stand in for a human's yes.

---

## 10. Invariant boundaries (restated, binding)

Every capability and design in this document sits inside these non-negotiable boundaries:

- **Own data only.** The "214 campaigns" are the agency's *own* recorded campaigns. There is no
  external benchmark, no industry dataset, no comparison to other companies, no vendor
  telemetry. Attribution is a claim about your own history and nothing else. This is precisely
  what makes it defensible — and precisely what a generic benchmark could never be.
- **100% local, offline-first, copy-only.** No cloud, no API, no telemetry, no connectors. The
  counts and timestamps are local records; the stamp, when wired, is computed locally over local
  memory.
- **Human-sovereign.** The stamp informs a decision; it never approves one. It never auto-applies
  and never ships a campaign (§9).
- **The AI never learns; the company accumulates memory.** The stamp is the receipt for that
  memory. The product voice stays **"Based on the results of the last N campaigns…,"** never "I
  learned" (§2.2).
- **Evidence, not knowledge.** Per Law 1, every field in the stamp is a fact about the evidence
  — a count, a date range, a strength summary — never a conclusion (§7).

---

## 11. Value contribution

Quantified attribution is **the single most credible differentiator** between AdOS and a
prompt-and-pray LLM tool. A bare model produces a confident-sounding recommendation attached to
nothing; a human has no way to tell a proven pattern from a hallucinated one. An attributable
memory produces a recommendation stamped with *how many of the agency's own campaigns stand
behind it, and how fresh they are* — a claim the agency can defend, and a client can check.

- **Revenue.** "Based on 214 of *your* finance campaigns, most recent last week" is a sentence a
  competitor using a generic chatbot literally cannot say. It wins and retains accounts by
  proving a compounding, own-data edge — and the edge compounds: the longer the agency runs, the
  larger and fresher the `N` behind every recommendation, so the pitch gets *stronger* with age
  rather than staler.
- **Production time.** A strategist who can see the sample size and evidence age of a
  recommendation at a glance spends less time re-litigating whether it is trustworthy. The stamp
  turns "do I believe this?" into a one-look judgment, so each campaign starts from an evidenced
  direction instead of a blank page.

Reality first, then marketing: today AdOS carries the `sampleSize` count in its aggregate
structures (🔶) and stores the timestamps that would feed Evidence Age (✅ data / ❌ scoring), but
a live recommendation that actually renders *"based on 214 campaigns"* is **not yet shipped**.
This document names that gap exactly so the value claim stays honest — the differentiator is real
in design, and this is the specification it wires to.

---

## 12. Tier summary

| Capability | Tier | Evidence |
|---|---|---|
| `sampleSize` count carried on marketing aggregate | 🔶 BUILT-UNWIRED | `MarketingInsight.sampleSize` via sample-weighted merge `in-memory-company-brain.ts:100`; `enrich` has no live caller |
| `sampleSize` read + damped in pattern ranking | 🔶 BUILT-UNWIRED | `bestFor` `pattern-library.ts:18`; `rank` `pattern-library.ts:35` (`min(1, sampleSize/100)`) |
| Evidence-age timestamps stored on records | ✅ SHIPPED | `Experience.at` `experience-engine.ts:19`, `ExecutiveMemoryEntry.createdAt` `memory.ts:21`, `DecisionJournalEntry.at` `routes.ts:1116` |
| Freshness *scoring* → an Evidence-Age window | ❌ ROADMAP | `recall` ranks importance + keywords only, `memory.ts:35`; no window scorer to cite |
| Confidence band over the evidence | 🔶 BUILT-UNWIRED | `HeuristicConfidenceEngine.assess` `reasoning.ts:62` |
| Recommendation surface that *emits* the stamp | 🔶 / ❌ ROADMAP | evidence gather `reasoning.ts:14` (🔶); composite recommendation designed in `../3-recommendation-engine/RECOMMENDATION_ENGINE.md` |
| Live "based on 214 campaigns" attribution | ❌ ROADMAP | aggregation unwired + freshness scoring absent — designed here, not shipped |

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
