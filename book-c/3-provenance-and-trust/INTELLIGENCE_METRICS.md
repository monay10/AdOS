# C011 — Intelligence Metrics

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document is about

Every other document in this book describes a piece of the Trust Layer — the evidence a
recommendation must carry, the confidence attached to it, the alternatives it weighed, the
decision a human took, the outcome that followed. This document asks the question that sits on
top of all of them:

> **How do we know the Trust Layer is actually working?**

A trust layer that is never measured is a claim, not a capability. It is entirely possible to
build every mechanism in Books C-001 through C-010 and still ship recommendations that quietly
arrive without evidence, that carry a confidence number nobody has ever checked against
reality, that rest on two campaigns while presenting themselves as settled, or that describe
themselves in prose the underlying facts do not support. None of those failures announce
themselves. Each one is invisible unless something *counts* it. This document is about that
counting — the metrics that would let the agency, and the people running it, see whether the
Trust Layer is doing its job or only appearing to.

It is important to be honest up front about the state of these metrics, and this document is
honest about it throughout: **almost everything here is ❌ ROADMAP.** No coverage percentage is
computed today. No calibration curve is drawn. No sample-size health check runs. No
faithfulness audit fires. What *does* exist — and it is the reason these metrics are buildable
at all rather than pure fantasy — is the raw material: the Decision Journal already records, for
every decision it captures, the exact fields these metrics would be computed over. So the
correct framing for this whole document is not "here is what we measure" but "here is what is
*measurable in principle* from data we already record, and here is precisely what has and has
not been built to measure it." Wherever a metric is tied to a real store, this document says so
and cites it. Wherever it is not, it carries no citation, because inventing one would violate
the honesty the entire book rests on.

**Value contribution.** Metrics on the Trust Layer earn revenue and save time in two distinct
ways. First, they are how the agency *proves the Trust Layer works* — and a Trust Layer that can
be shown to work, with numbers rather than assertions, is what justifies premium positioning
against generic model tools that can offer no such proof. A prospect asking "how do I know your
AI's explanations are real and not decoration?" is answered by a coverage figure and a
calibration curve, not by a brochure. That is the difference between winning a premium account
and losing it to a cheaper tool that sounds the same. Second, these metrics *focus reviewer
attention where it is worth spending*. A metric that flags the recommendations with thin
evidence, missing confidence, or weak sample support tells a reviewer exactly which items
deserve a hard look — and, by implication, which do not. A reviewer who can spend their scrutiny
on the ten shaky recommendations instead of re-checking all two hundred saves time on every
batch. The Trust Layer builds trust; its metrics prove the trust is earned and point the
scarce human attention at the places it is not yet.

---

## 2. The one honest foundation — the journal already records the raw material

Before describing metrics that do not exist, this document must be precise about the one thing
that does, because it is what separates a buildable roadmap from a wish.

The Decision Journal is ✅ SHIPPED. Its store, `InMemoryDecisionJournal`, lives at
`domains/executive-memory/src/memory.ts:54-80` and exposes three operations — `record`,
`history`, and `attachOutcome`. It is instantiated in the live application at
`apps/web/src/app.ts:91`, and the live write path records, per decision, a structured object:
`{decision, evidence, alternatives, chosen, rejected, confidence, outcome}`
(`apps/web/src/routes.ts:1118`). That written record is read back at `routes.ts:832` via
`journal.history({subjectId, k:1})`, mapped into a learning view at `routes.ts:833-841`, and
rendered on the mission detail screen at `apps/web/src/views/pages.ts:294-297`.

Read that field list again, because it is the whole reason this document is a roadmap and not a
fantasy. Every field a metric in this document would need is **already being recorded**:

- The **evidence** array is present on each record — so *whether a recommendation carried
  evidence* is a property already sitting in the store, waiting to be counted.
- The **confidence** object is present — so *what the system claimed* about each decision is
  recorded, and can later be compared against what happened.
- The **alternatives / chosen / rejected** fields are present — so *whether a recommendation
  showed what it weighed and discarded* is likewise recorded.
- The **outcome** field exists on the record, and can be filled after the fact through
  `attachOutcome` (`memory.ts`) — so *what actually happened* can be joined back to *what was
  claimed*.

This is the crucial honesty of the whole document, and it cuts both ways:

- **The raw material is real and shipped.** Over the set of decisions the journal holds, the
  ingredients of every metric below already exist as recorded fields. Coverage, calibration,
  strength, and faithfulness are all *measurable in principle* from data the app already writes.
- **No metric is computed today.** ❌ Nothing in the live application reads the journal and
  produces a coverage percentage, a calibration curve, a sample-size health score, or a
  faithfulness audit. The fields are recorded; nobody counts them. The journal is a source of
  metrics, not a metrics engine.

And one caveat rides along with the shipped foundation, stated plainly because the metrics
inherit it: the journal store is **in-memory** (`apps/web/src/app.ts:89-91`). Its records live
for the life of the process, not durably across restarts the way finished artifacts do. So any
metric computed over the journal today would be computed over *this process's* decisions, not
over the agency's entire measured history. Durable decision memory is a foundation these metrics
ultimately need, and it is not fully in place. Saying so is part of quoting any future number
honestly.

Everything in the four sections that follow is built on this one foundation: the fields are
recorded (✅), and the metrics over them are not (❌).

---

## 3. Metric family one — Explanation Coverage ❌ ROADMAP

### 3.1 What coverage measures

The first thing to measure about a Trust Layer is not how good its explanations are — it is how
*many* of its outputs have an explanation at all. Coverage is that metric. It answers a blunt
question:

> **Of all the recommendations the system produced, what fraction actually carried the full
> explanation — evidence, confidence, and alternatives — the way the contract requires?**

The contract in question is the **Explainability Contract** — the standard, owned by
[`../1-why-contract/EXPLAINABILITY_MODEL.md`](../1-why-contract/EXPLAINABILITY_MODEL.md), that
every AI output should one day support: recommendation, why, evidence, confidence, alternative
considered, brand rules checked, memory consulted, human action required. Coverage is the
completeness metric *for that contract*. A recommendation that shows evidence, states a
confidence, and names an alternative is a covered recommendation. One that arrives as a bare
instruction — "do this" — with no evidence array, no confidence object, and no alternatives, is
an uncovered one. Coverage is the ratio of the first kind to the total.

The reason coverage comes first is that it catches the failure the Trust Layer is most
vulnerable to: silent gaps. Every other metric in this document assumes an explanation exists to
be evaluated. Coverage is the metric that checks the assumption. A Trust Layer with beautiful
calibration on the 30% of recommendations that carry evidence, and no evidence at all on the
other 70%, is not a 30%-good Trust Layer — it is a broken one wearing a good score. Coverage is
what exposes that.

### 3.2 Why coverage is measurable in principle — and not measured

Here the foundation from Section 2 does its work. Because the live journal already records
`{decision, evidence, alternatives, chosen, rejected, confidence, outcome}` per decision
(`apps/web/src/routes.ts:1118`, store `memory.ts:54`), a coverage metric is not asking for data
that does not exist. It is asking for a count over data that does. In principle, one could read
the journal's `history` (`memory.ts:54-80`), and for each recorded decision check three simple
predicates:

- Is the **evidence** array non-empty?
- Is the **confidence** object present and populated?
- Are **alternatives** (and the `chosen` / `rejected` split) present?

Coverage is then the fraction of records for which all three hold. That is the entire
computation. It requires no model, no network, no external data — only a pass over records the
app already writes.

And yet: **this computation does not exist in the live application.** ❌ ROADMAP. No route reads
the journal to tally covered versus uncovered decisions; no screen displays a coverage figure;
no threshold flags a period in which coverage dropped. The completeness of the Explainability
Contract is, today, un-measured. The honest statement is therefore two-sided and exact — *the
fields coverage would count are recorded live (✅); the counting of them is not built (❌).*

### 3.3 What a coverage metric would surface

Once built, coverage would answer questions the agency currently cannot:

- **A headline number** — "94% of this month's recommendations carried full evidence,
  confidence, and alternatives" — that is the single most direct proof the Trust Layer is
  operating rather than merely installed.
- **A worklist of the uncovered** — the specific recommendations that arrived without their
  explanation. These are exactly the items a reviewer should look at first, because an uncovered
  recommendation is one the system cannot defend. This is the "focus reviewer attention" value
  made concrete: coverage does not just score the layer, it points at the holes.
- **A trend** — whether coverage is rising or falling as the product changes, which is how a
  regression in the Trust Layer would be caught before a client catches it.

One boundary is worth stating even here: a covered recommendation is not thereby a *correct*
one. Coverage measures whether the explanation is *present and complete*, never whether it is
*right*. A fully covered recommendation can still be wrong about the campaign — that is the
domain of the next metric family. Coverage is necessary, not sufficient. Evidence is
descriptive, not prescriptive: a complete explanation describes the case for a recommendation
faithfully; it never proves the recommendation must be followed.

---

## 4. Metric family two — Confidence Calibration ❌ ROADMAP

### 4.1 What calibration measures, and the law it tests

The second metric family goes straight at the book's second law. **Confidence ≠ Truth**, owned
by [`../1-why-contract/CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md), holds that
the system's confidence in a recommendation and whether the recommendation actually turns out
right are two different things — a 95%-confidence campaign can fail and a 40%-confidence campaign
can be the best performer. That law is a warning. Calibration is the metric that *tests* it:

> **Do high-confidence recommendations actually perform better than low-confidence ones?**

If the system says 90% and is right nine times in ten, its confidence is calibrated. If it says
90% and is right half the time, its confidence is inflated — a number that looks like knowledge
but carries none. Calibration is the empirical check on whether a confidence score means
anything at all. It is the difference between a Trust Layer whose confidence a reviewer can lean
on and one whose confidence is decoration.

### 4.2 The comparison it requires — recorded confidence versus real outcome

Calibration is a join. It puts two recorded things side by side, for each decision:

1. **The confidence the system recorded at decision time.** This is the `confidence` object
   written to the journal at `apps/web/src/routes.ts:1118` — the number the system committed to
   *before* it knew the result. (In the live app this is the hand-rolled confidence literal
   built at `routes.ts:1123-1130` and displayed at `routes.ts:837`; the deterministic engine
   that would compute it more richly is `HeuristicConfidenceEngine`,
   `domains/executive-memory/src/reasoning.ts:62-91`, 🔶 BUILT (UNWIRED).)

2. **The outcome that actually followed.** This is the `outcome` field, filled after the fact
   through `attachOutcome` (`memory.ts`) — the real result captured once the campaign ran.

Because the journal records the confidence and can attach the outcome to the *same* record, the
comparison calibration needs is structurally available. Group the decisions by their recorded
confidence, and for each group ask what fraction actually succeeded. Plot claimed confidence
against realized success rate, and the shape of that plot *is* the calibration of the Trust
Layer. That is the measurement.

And, once more: **it is not computed.** ❌ ROADMAP. Nothing in the live application reads back
recorded confidence, joins it to attached outcomes, and produces a calibration curve or an
over/under-confidence score. `attachOutcome` exists on the store; no live path uses the paired
data to grade confidence. The ingredients are recorded; the calibration is not built.

### 4.3 The hard boundary — Book C measures, Book D improves

This is the most important line in the section, and it must be stated without hedging.

**Book C defines the calibration measurement. It does not close the gap the measurement
reveals.**

Computing calibration — drawing the curve, producing the over-confidence score — is a
*measurement*, and defining that measurement is Book C's job, because calibration is how the
Trust Layer is checked. But *improving* calibration over time — feeding the outcome data back so
that tomorrow's confidence numbers are better aligned with reality than today's — is
**learning**, and learning is **Book D's** job, not this book's. Book C is the read/explain side:
it can *tell you* that 90%-confidence recommendations only succeed 60% of the time. Turning that
finding into a system that says 60% next time is the Memory → Knowledge → Pattern →
Recommendation loop, and this document deliberately does not design it.

So the division is clean:

- **Book C (here):** define what calibration is, name the recorded confidence and the attached
  outcome it compares, and specify the metric. ❌ ROADMAP — defined, not built.
- **Book D (later):** consume the calibration signal and *narrow the Confidence ≠ Truth gap*,
  making confidence numbers earn their accuracy over time.

Confusing the two would have this document quietly designing the learning loop, which the book's
own boundaries forbid. Calibration is where Book C hands the baton to Book D: Book C says "here
is how you would know whether the confidence is honest"; Book D takes that and makes it more
honest.

---

## 5. Metric family three — Evidence Strength and sample-size health ❌ ROADMAP

### 5.1 What strength measures

The third metric family measures whether the evidence a recommendation rests on is *strong
enough to trust*, and the sharpest single indicator of that is sample size:

> **Are the rollups behind a recommendation backed by enough campaigns to be trustworthy?**

A recommendation grounded in "+18% CTR in finance over 183 campaigns" rests on a thick sample; a
recommendation grounded in "+18% CTR over 3 campaigns" wears the same headline over almost
nothing. Evidence strength is the metric that tells these apart at scale — not case by case in a
reviewer's head, but as a health figure across all the recommendations the system produces. It
answers whether the Trust Layer's evidence is generally well-supported or generally thin.

### 5.2 What it ties to in the codebase

The primitive strength would measure over already exists, and is documented in detail by
[`../2-grounded-recommendation/PERFORMANCE_ROLLUPS.md`](../2-grounded-recommendation/PERFORMANCE_ROLLUPS.md).
The per-vertical performance rollup carries a `sampleSize` field alongside its metrics —
`mergeMarketing` accumulates that count as campaigns fold into a vertical
(`domains/company-brain/src/in-memory-company-brain.ts:100-114`), and the rollup is surfaced as
evidence text "ROAS …, CTR … over ${sampleSize} campaigns" at
`domains/executive-memory/src/reasoning.ts:30`. That `sampleSize` is the atom of evidence
strength: it is the recorded number of campaigns behind a figure, which is exactly what a
strength metric would read.

Both the rollup primitive (🔶 BUILT (UNWIRED)) and the evidence line that quotes it are built but
unwired — and the rollup is never populated on any live path because `enrich({kind:'marketing'})`
is never called in `apps/web`. So the strength metric inherits a double gap: the sample-size field
it would read is 🔶 (built, dormant), and the metric that would aggregate it into a health score is
❌ (not built at all). There is no honest way to call any of this shipped.

### 5.3 What a strength metric would surface

A sample-size health metric, once built, would produce:

- **A distribution, not just an average** — how many recommendations rest on thick samples versus
  thin ones. A Trust Layer where most evidence sits on hundreds of campaigns is healthy; one
  where most sits on two or three is fragile no matter how confident it sounds.
- **A thin-evidence worklist** — the specific recommendations whose sample support falls below
  some threshold. Like coverage's worklist, this is the "focus reviewer attention" value made
  concrete: it points a reviewer at the recommendations most likely to be luck rather than
  pattern.
- **A trust floor** — a way to say "this recommendation's evidence is too thin to present as
  settled," which is precisely the discipline that keeps a small sample from borrowing the
  authority of a large one.

The strength metric measures how much the evidence *can be trusted*; it never claims the evidence
*must be obeyed*. A rollup over 183 campaigns is strong evidence and still only evidence.
Evidence is descriptive, not prescriptive — a large sample describes a large history; it does not
bind the next campaign to repeat it.

---

## 6. Metric family four — Rationale Faithfulness ❌ ROADMAP

### 6.1 What faithfulness measures

The fourth metric family is the subtlest and, in a book built on trust, the most dangerous
failure it guards against:

> **Does the explanation actually match the underlying facts — or does it say things the facts
> do not support?**

Coverage checks that an explanation is *present*. Strength checks that its evidence is *thick*.
Calibration checks that its confidence is *honest*. Faithfulness checks that its *prose does not
lie*. An explanation that reads "recommended because finance campaigns returned strong ROAS" when
the underlying rollup shows weak ROAS — or shows a finance sample of two — is unfaithful: it is a
fabrication dressed as evidence, and it is worse than no explanation at all, because it actively
manufactures trust the facts do not warrant.

### 6.2 Why faithfulness is the deepest test

This metric family exists because the Trust Layer's greatest risk is not silence but confabulation
— a fluent explanation that the facts underneath do not back. The design principle that guards
against it is owned in full by
[`../2-grounded-recommendation/DECISION_EXPLANATION.md`](../2-grounded-recommendation/DECISION_EXPLANATION.md):
an explanation must *explain the decision that was actually made from the facts that were actually
recorded* — it must never invent a new, more flattering justification. That document draws the
line between a deterministic reason string computed from real figures
(`domains/executive-memory/src/reasoning.ts:91`, 🔶 BUILT (UNWIRED)) and AI-generated narrative
prose, and insists the prose stay faithful to the facts rather than author its own.

Faithfulness is the *metric* over that principle. Where the explanation document says "the prose
must match the facts," this metric family asks "and does it?" — across every recommendation, as a
measurable rate rather than a design aspiration. It would compare, per decision, the explanation's
claims against the recorded evidence and confidence in the journal (`routes.ts:1118`,
`memory.ts:54`) and flag any claim the underlying fields do not support.

### 6.3 The state of it — the hardest ❌ in this document

Faithfulness is the least built of all four families, and this must be said without softening.
There is **no faithfulness audit today** — ❌ ROADMAP, and the most speculative of the four,
because it requires not just counting recorded fields (as coverage does) but *comparing an
explanation's assertions to the facts they claim to rest on*, which is a harder computation than
any other metric here. The deterministic-first discipline that makes faithfulness *achievable* —
generating reasons from recorded figures rather than from a model's imagination — is a design
principle documented elsewhere; the *metric* that verifies faithfulness at scale is not built.

What keeps faithfulness from being pure fantasy is the same foundation as the rest: because the
journal records the evidence and confidence a decision actually rested on, an explanation's
claims *have something concrete to be checked against*. The facts are recorded (✅); the audit
that checks prose against them is not (❌). And the strongest structural guard remains a design
choice, not a metric: an explanation built deterministically from recorded facts has far less room
to fabricate than one improvised freely. Faithfulness, in the end, is best served by never
generating an unfaithful explanation in the first place — the metric is the backstop, not the
first line of defense.

---

## 7. The hard rule — own data only, 100% local, no exceptions

This rule governs all four metric families equally, and it is stated here at length because it is
the single most important constraint on what "measuring the Trust Layer" is allowed to mean.

**Every metric in this document is computed over the agency's own in-memory data — and nothing
else.** There is no other data source, and there is no path to one:

- **No vendor telemetry.** These metrics never phone home. No count of coverage, no calibration
  point, no sample-size figure, no faithfulness flag is ever sent to a vendor, a model provider,
  or any third party. The agency measures its own Trust Layer for its own eyes; nobody outside the
  machine learns what those measurements say.
- **No usage tracking.** These are not product-analytics metrics. They do not track who clicked
  what, how long a user lingered, or which feature was opened. They measure *the quality of the
  explanations the system produced* — coverage, calibration, strength, faithfulness — computed
  from the journal and the rollups, not from watching a user. There is no session, no event
  stream, no behavioral funnel.
- **No external benchmarks.** A metric here never compares the agency's numbers to an industry
  average bought from a data broker or scraped from the web. "94% coverage" means 94% of *this
  agency's* recommendations — not 94% against some external standard. Calibration is measured
  against the agency's *own* recorded outcomes, not against a vendor's model of what confidence
  should mean. When a metric cites a sample of "183 campaigns," those are 183 campaigns this
  agency ran.
- **100% local computation.** Every metric is a pass over local, in-process stores — the journal
  (`memory.ts:54`, `app.ts:91`) and, for strength, the rollups
  (`in-memory-company-brain.ts:100-114`). Populating the inputs is a local write; computing a
  metric is a local read. There is no network call, no cloud service, no per-token cost, and no
  moment at which the agency's measured self-assessment leaves the machine.

Say it plainly and say it again, because it is the point: **the Trust Layer is measured with the
agency's own data, on the agency's own machine, for the agency's own use — no telemetry, no usage
tracking, no external benchmarks, entirely local.** This is not a limitation to apologize for; it
is the source of the metrics' integrity. A coverage figure computed from telemetry could be
gamed, disputed, or leaked. A coverage figure computed from the agency's own journal, never
transmitted anywhere, is simply true — and true only to the people who run the agency, which is
exactly who it is for.

---

## 8. Human-sovereign — metrics inform people, they never auto-tune the AI

There is a second constraint as important as the first, and it concerns what these metrics are
*allowed to do* once computed.

**Every metric in this document exists to inform the humans running the agency. Not one of them
acts.** This is the human-sovereign principle applied to measurement, and it is absolute:

- A low coverage figure **flags** the uncovered recommendations for a human to review. It does not
  suppress them, rewrite them, or auto-generate the missing evidence. A human decides what to do
  about the gap.
- A poor calibration curve **shows** a human that confidence is running inflated. It does not
  reach into the confidence engine and re-tune it. (Re-tuning is Book D's learning work, and even
  there it would surface to a human, not act unsupervised.) The metric reports; the person
  responds.
- A thin sample-size distribution **warns** a human that evidence is fragile. It does not raise
  the sample-size threshold on its own or auto-reject the thin recommendations. It points; the
  reviewer chooses.
- A faithfulness flag **alerts** a human that an explanation may overstate its facts. It does not
  silently delete or edit the explanation. A person reads the flag and judges.

No metric in this document ever auto-tunes a model, auto-adjusts a threshold, auto-approves a
recommendation, or auto-rejects one. The metrics are instruments on a dashboard, not hands on a
wheel. They make the state of the Trust Layer *visible* to the people accountable for it, and
those people — not the metrics — decide. A recommendation flagged as uncovered, poorly
calibrated, thinly supported, or possibly unfaithful is a recommendation *routed to human
attention*, which is precisely the human-sovereign guardrail the
[`CONSTITUTION_CHECKER.md`](CONSTITUTION_CHECKER.md) enforces at decision time and the metrics
enforce in aggregate: the confidence/evidence gate (`domains/executive-memory/src/governance.ts:41-45`,
🔶 BUILT (UNWIRED)) blocks or flags a *single* unsupported recommendation for a human; these
metrics show the *pattern* of such cases for a human. Neither ever acts alone.

This is why the metrics increase the value of the human, rather than replacing them. A reviewer
armed with these metrics is more powerful — they see where to look — but no less sovereign. The
metrics hand the human a sharper view; they never take the human's hand off the decision.

---

## 9. The invariant — measurement describes, it never prescribes

Everything in this document converges on the sentence that governs the entire book, and it must
be read exactly as written:

> **Evidence is descriptive, not prescriptive.**

A metric is evidence *about the evidence* — a measurement of how well the Trust Layer is
describing its own reasoning. And like every other form of evidence in this book, it describes;
it does not dictate. A coverage figure of 94% describes the state of the explanations; it does
not command that the 6% be auto-fixed. A calibration curve describes how confidence has related
to outcome; it does not force the next confidence number. A faithfulness rate describes how well
prose has matched fact; it does not rewrite the prose.

The failure mode the invariant guards against is the same one at every level of the book:
mistaking a description of the past for an instruction about the future. A metrics system that
*acted* on its own readings — auto-tuning, auto-rejecting, auto-approving — would have crossed
from describing the Trust Layer to *governing* it without a human, which is exactly the oracle
this book exists to refuse. The metrics stay descriptive. They inform a sovereign human who
decides. That is what keeps a measurement of trust from quietly becoming an unaccountable
controller of it.

Evidence is descriptive, not prescriptive — and a metric, being evidence about the evidence, is
bound by that rule twice over.

---

## 10. Boundaries

The metrics in this document operate under the same hard boundaries as the rest of AdOS, restated
here where they bear directly on measurement.

**Own data only.** Every metric is computed over the agency's own journal and rollups. No vendor
telemetry, no usage tracking, no external benchmark, no connector, no crawler, no ingestion
feeds a single figure. (Section 7 states this in full; it is the load-bearing boundary of the
document.)

**100% local.** Metrics are local reads over in-process stores. No network, no cloud, no
per-token cost, nothing transmitted. A self-assessment of the Trust Layer never leaves the
machine.

**Human-sovereign.** Metrics inform; they never act. No auto-tuning, no auto-approval, no
auto-rejection. (Section 8 states this in full.)

**Copy only.** These metrics count and compare structured records and text. They reason over
numbers and words, never over images, vision, or audio.

**Measurement is not learning.** Computing a metric is a Book C read of recorded facts.
*Improving* the thing the metric measures — narrowing the calibration gap, strengthening thin
evidence over time — is the write/learn side, and it belongs to **Book D**. This document defines
the measurements; it deliberately does not design the loop that would act on them. Calibration is
the clearest case: Book C says how to know whether confidence is honest; Book D makes it more
honest.

---

## 11. Summary of tiered claims

| Capability | Tier | Anchor |
| --- | --- | --- |
| Decision Journal records `{decision, evidence, alternatives, chosen, rejected, confidence, outcome}` per decision | ✅ SHIPPED | `apps/web/src/routes.ts:1118`, store `domains/executive-memory/src/memory.ts:54-80` |
| Journal instantiated live; read back and rendered | ✅ SHIPPED | `apps/web/src/app.ts:91`; read `routes.ts:832`; render `apps/web/src/views/pages.ts:294-297` |
| `attachOutcome` — join real outcome to a recorded decision | ✅ SHIPPED (store op) | `domains/executive-memory/src/memory.ts` |
| Journal store is in-memory / per-process | ✅ SHIPPED (caveat) | `apps/web/src/app.ts:89-91` |
| **Explanation Coverage** — % of recommendations carrying evidence + confidence + alternatives | ❌ ROADMAP | fields recorded (`routes.ts:1118`); metric not computed |
| **Confidence Calibration** — recorded confidence vs. real outcome | ❌ ROADMAP | confidence `routes.ts:1123-1130`, outcome via `attachOutcome` (`memory.ts`); metric not computed |
| Improving calibration over time (narrowing Confidence ≠ Truth) | ❌ ROADMAP — **Book D**, not Book C | learning loop, out of scope here |
| **Evidence Strength / sample-size health** — are rollups backed by enough campaigns? | ❌ ROADMAP | reads rollup `sampleSize` (🔶 `in-memory-company-brain.ts:100-114`); metric not built |
| **Rationale Faithfulness** — explanation matches the underlying facts | ❌ ROADMAP | design principle in `../2-grounded-recommendation/DECISION_EXPLANATION.md`; audit not built |
| Any metric acting autonomously (auto-tune / auto-approve / auto-reject) | ❌ never — human-sovereign by design | metrics inform; humans decide |
| Any metric using vendor telemetry / usage tracking / external benchmarks | ❌ never — own data only, 100% local | Section 7 |

The one sentence to carry out of this document: the Trust Layer's raw material is already
recorded on every live decision (✅ `routes.ts:1118`, `memory.ts:54`) — evidence, confidence,
alternatives, and outcome all sit in the journal — so coverage, calibration, strength, and
faithfulness are all *measurable in principle*; but not one of those metrics is computed today
(❌), and when they are, they will be computed over the agency's own local data, shown to a
sovereign human, and never allowed to act — because a metric is evidence about the evidence, and
evidence is descriptive, not prescriptive.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
