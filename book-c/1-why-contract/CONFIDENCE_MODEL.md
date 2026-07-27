# Confidence Model — How AdOS Computes and Communicates Confidence

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is [`CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document owns

AdOS — the Enterprise AI Operating System for Advertising — does not just produce
recommendations; it can explain every recommendation using its own campaign memory. Part of
that explanation is a **confidence number**: a compact signal that tells a human reviewer how
strongly the system stands behind what it just proposed.

This document owns one law of the Trust Layer, stated plainly:

> **Law 2 — Confidence ≠ Truth.**

A confidence score is a claim the system makes about *itself* — "here is how sure I am." It is
not a claim about reality. The score can be high and the campaign can still lose money; the
score can be low and the campaign can still be the quarter's best performer. Confidence and
truth are two different quantities that happen to be printed next to each other. Treating them
as the same thing is the single most dangerous mistake a person can make when reading an AI
recommendation, and the whole point of this document is to make that mistake hard to commit.

Everything here is **100% local, offline-first, copy-only, human-sovereign**. Confidence is
computed on the machine, from the agency's own campaign history. There is no cloud scoring
service, no per-token model call, no telemetry leaving the box. A confidence number is
**advisory input to a human decision** — never an approval, never an execution trigger.

Scope discipline. This book — Campaign Intelligence — is the **read/explain side**. It reports
confidence honestly. It does **not** build the machinery that makes confidence *more accurate
over time*. Closing the gap between what the system believes and what actually happens —
calibration — is **Book D's** job (how the AI learns). Book C's job ends at telling the truth
about the number it has today. This boundary is load-bearing and appears again in Section 6.

---

## 2. The engine: `HeuristicConfidenceEngine`

**Tier: 🔶 BUILT (UNWIRED).** The engine exists and is unit-tested, but no live route in the
web app reaches it yet. Wiring it into the running product is Book C build work.

The engine lives at `domains/executive-memory/src/reasoning.ts:62-91`. Its shape is a single
method, `assess()`, which takes evidence plus a few optional performance signals and returns a
score together with a human-readable reason and a machine-readable basis.

### 2.1 What goes in

`assess()` accepts:

- **`evidence: EvidenceRef[]`** — the weighted evidence references produced upstream (the
  evidence engine is documented in the sibling
  [`../2-grounded-recommendation/`](../2-grounded-recommendation/) part and in
  [`EVIDENCE_ENGINE.md`](EVIDENCE_ENGINE.md)). Each reference carries a `weight`.
- **`priorSuccessRate?`** — how often decisions of this kind have worked out before, when
  known.
- **`sampleSize?`** — how many campaigns the underlying performance figures were drawn from.
- **`roas?`** — the return-on-ad-spend figure, when a metric is in play.

None of these is a verdict. They are *descriptors of the evidence base*. The engine's task is
to compress them into one number a reviewer can read at a glance — and one sentence that says
what the number is made of.

### 2.2 How the score is computed

The core blend is a single line, `reasoning.ts:82`:

```
score = round( clamp01( 0.5 * avgWeight + 0.2 * breadth + 0.3 * success ) * 100 )
```

Three ingredients, three weights:

- **Evidence strength (`avgWeight`, weight 0.5).** The mean weight across the supplied
  evidence references. Strong, high-weight evidence pushes the score up; thin or low-weight
  evidence pulls it down. This is the dominant term by design — the system's confidence should
  track the quality of what it can *show*, not what it *feels*.
- **Breadth of sources (`breadth`, weight 0.2).** `min(1, evidence.length / 5)` at
  `reasoning.ts:78`. More *independent* sources saturating toward five raises confidence.
  One data point agreeing with itself is not the same as five different sources agreeing.
- **Prior success (`success`, weight 0.3).** The historical `priorSuccessRate` when supplied,
  otherwise it falls back to `avgWeight` (`reasoning.ts:79`). This is how "we have tried this
  before and it worked" earns a modest confidence premium.

The blend is clamped to `[0, 1]` and scaled to a 0–100 integer. Nothing about this is a neural
network or a hidden model; it is an explicit, auditable, deterministic formula. Given the same
inputs it returns the same score, every time, on any machine. A reviewer who wants to know
*why* the number is 78 and not 94 can read the arithmetic — there is nothing behind the
curtain.

### 2.3 A worked example

Suppose the evidence engine hands `assess()` four references with weights `0.9, 0.8, 0.7, 0.8`,
a `priorSuccessRate` of `0.75`, a `sampleSize` of `382`, and a `roas` of `5.8`. The engine walks
the same three terms:

- **Evidence strength:** `avgWeight = (0.9 + 0.8 + 0.7 + 0.8) / 4 = 0.80`.
- **Breadth:** `min(1, 4 / 5) = 0.80`.
- **Prior success:** `0.75` (supplied, so no fallback to `avgWeight`).
- **Blend:** `0.5·0.80 + 0.2·0.80 + 0.3·0.75 = 0.40 + 0.16 + 0.225 = 0.785`.
- **Score:** `round(0.785 · 100) = 79`.

And the reason string assembles from the same inputs: *"Based on 4 evidence sources, 382
campaigns, ROAS 5.8, success rate 75%."* The reviewer sees **79%** and can, if they wish,
reconstruct every digit of it. This is what "auditable confidence" means in practice — not a
promise that the number is right, but a guarantee that the number is *traceable*.

A design note that reinforces Law 2: notice what the score does **not** contain. It does not
contain the campaign's actual result, because the result does not exist yet. Every ingredient is
a descriptor of the *evidence available before the decision*. The score is a statement about the
strength of the case, never a peek at the verdict.

### 2.4 The empty-evidence floor

If no evidence is supplied at all, the engine short-circuits at `reasoning.ts:69-74` and
returns a score of **15** with the reason *"No supporting evidence found; confidence is
minimal."* This matters: the system refuses to sound confident about a claim it cannot back.
An unsupported recommendation is not merely uncertain — it is, by construction, near the floor.
That refusal is Law 1 (Evidence First) reaching into the confidence layer: no evidence, no
confidence.

### 2.5 The human-readable reason

The engine does not emit a bare number. Alongside the score it builds a sentence from the same
inputs (`reasoning.ts:84-91`), assembling parts and joining them:

> `reason: "Based on ${parts.join(', ')}."`

So a real assessment reads like:

> **"Based on 382 campaigns, ROAS 5.8."**

The number and the sentence are computed from the *same* ingredients, so the explanation can
never drift from the score. This is deliberate: a confidence figure with no stated basis is a
number a reviewer must simply trust; a confidence figure that says what it rests on is a number
a reviewer can *check*. AdOS never says "I think." It says "78% — based on 382 campaigns, ROAS
5.8," and lets the human weigh the basis for themselves.

### 2.6 The machine-readable basis

The return value also carries a structured `basis` object (`reasoning.ts:92` onward) recording
`sampleSize`, and — when present — `roas` and `successRate`. The prose is for the human; the
`basis` is for downstream systems (the governance gate, the journal, later calibration in Book
D) that need the raw figures rather than a sentence. Same facts, two renderings.

---

## 3. Law 2 in full: Confidence ≠ Truth

Here is the law this document exists to hold.

> **Confidence** = the system's belief in the recommendation — how sure AdOS is, given the
> evidence it can see.
>
> **Truth** = whether the recommendation actually turns out right, in reality, after the money
> is spent and the results come in.
>
> **These are not the same quantity.**

Confidence is computed *before* the outcome exists. Truth is only knowable *after*. A number
generated on Monday cannot contain Friday's results. So a confidence score is always, at best,
a well-reasoned guess about a future that has not happened yet.

### 3.1 The two canonical examples

Keep both of these in mind whenever a confidence number is on screen:

**A 95%-confidence campaign can still fail.** Every prior signal lined up — deep sample, strong
ROAS history, a proven pattern. The engine, honestly reading that evidence, returns 95. Then
the market moves, a competitor undercuts, the creative fatigues faster than history predicted,
and the campaign loses money. The confidence was *correctly computed* from the evidence. The
outcome was still a failure. Confidence was high; truth was low. Nothing malfunctioned — the
future simply refused to match the past.

**A 40%-confidence campaign can be the best performer.** Thin evidence, an unproven sector, a
small sample, so the engine — again honestly — returns 40. The agency runs it anyway on human
judgment, and it becomes the quarter's standout. Confidence was low; truth was high. The system
was *right to be unsure* given what it knew, and reality rewarded the bet regardless.

Neither example is a bug. Both are the law working exactly as intended. A confidence score that
was *never wrong* would not be a confidence score — it would be prophecy, and AdOS does not sell
prophecy. It reports a belief, honestly labeled as a belief.

### 3.2 Why the gap is permanent here — and whose job it is to shrink it

There will always be a gap between confidence and truth, because one is computed before the
outcome and the other after. Book C does not try to erase that gap. Book C's only obligation is
to report confidence **honestly**: to compute it from real evidence, to state its basis, and to
never dress a belief up as a fact.

**Narrowing the gap over time is Book D's responsibility, not Book C's.** Book D is where the AI
*learns* — where the Memory → Knowledge → Pattern → Recommendation loop feeds real outcomes back
against the confidence that was claimed, and recalibrates the scoring so that, over many
campaigns, "80% confident" comes to mean "right about 80% of the time." That feedback loop —
**confidence calibration against real outcomes** — is explicitly out of scope here. This
document builds the *honest reporter*; Book D builds the *learner that makes the reporter more
accurate*. Conflating the two would break the book boundary and, worse, would tempt someone to
claim calibration that does not exist yet.

Until Book D closes the loop, the correct posture is humility: the number is the system's
current, uncalibrated belief, and a human decides what to do with it.

### 3.3 Confidence is not a probability of success

A subtle version of the Confidence ≠ Truth mistake is to read "79% confident" as "79% chance the
campaign succeeds." It is not — not today, and not by construction. The score at `reasoning.ts:82`
is a *weighted blend of evidence quality*, not a probability estimate fitted against observed
outcomes. It has never been checked against how often "79%" campaigns actually win, because that
check is the calibration loop that lives in Book D. Two things follow.

First, the number is **ordinal before it is cardinal**: a 79 meaningfully outranks a 40 — more and
stronger evidence stands behind it — but "79%" does not yet license the sentence "succeeds 79 times
in 100." Reviewers should read it as *relative strength of the case*, not as a betting line.

Second, this is *why* honest display matters so much. A number that looks like a probability but is
not one is a trap; pairing it with its basis — "based on 382 campaigns, ROAS 5.8" — defuses the
trap by showing the reviewer what the number actually rests on. When Book D later calibrates the
engine against real outcomes, the score will earn the right to be read more like a probability. It
has not earned that yet, and this document will not pretend it has.

**Evidence is descriptive, not prescriptive.** The evidence *informs* the confidence score; it
does not *dictate* the decision. A high number describes a strong evidence base — it does not
command approval, and a reviewer remains free to override it in either direction. Past data tells
the system what tended to happen; it never forces the same choice to happen again.

---

## 4. The honest tier picture: what actually runs today

It would be easy to imply the engine above is live. It is not. Here is the scrupulously honest
state of confidence in the shipping product.

### 4.1 What ships today: a hand-rolled literal

**Tier: ✅ SHIPPED (shape only).** In the live web app, confidence is not produced by
`HeuristicConfidenceEngine` at all. When a post-campaign review is recorded, the route hand-rolls
a confidence object inline at `apps/web/src/routes.ts:1123-1130`:

```
confidence: {
  score: Math.round(Math.max(10, Math.min(95, roas * 25))),
  reason: `Based on ${roas}x ROAS`,
  basis: { sampleSize: 1, roas },
}
```

This is a literal, not an engine. The score is a clamped linear function of a single campaign's
ROAS; the reason is a one-variable string; the sample size is hard-coded to `1`. It has the same
*shape* as a real assessment — `{ score, reason, basis }` — which is exactly why the surface can
be upgraded later without changing the display. But it blends no evidence strength, no breadth of
sources, and no prior success rate. It is the placeholder that keeps the Decision Journal
honest-looking while the real engine waits to be wired in.

The score it produces is then read back and displayed. On the mission detail view the journal
entry's `confidence.score` is surfaced at `apps/web/src/routes.ts:837`, mapped into the learning
view a reviewer sees. So what a human reads today is a real number computed from a real campaign's
ROAS — just by the literal, not by the engine.

### 4.2 What is built but dormant

**Tier: 🔶 BUILT (UNWIRED).** `HeuristicConfidenceEngine` (`reasoning.ts:62-91`) — the
three-ingredient blend, the evidence floor, the multi-part reason — exists and is tested, but no
live route calls it. It is reachable only from tests today. The live application constructs its AI
through the offline/live manager path and does **not** run the richer executive-memory reasoning
pipeline where the engine would be invoked. So the good engine is real code sitting one wire away
from production.

### 4.3 The honest summary

| Capability | Tier | Where |
| --- | --- | --- |
| Confidence literal `{score, reason, basis}` recorded on review | ✅ SHIPPED (shape only) | `routes.ts:1123-1130` |
| Confidence score displayed to the reviewer | ✅ SHIPPED | `routes.ts:837` |
| `HeuristicConfidenceEngine.assess()` — evidence/breadth/prior-success blend | 🔶 BUILT (UNWIRED) | `reasoning.ts:62-91` |
| Confidence calibration against real outcomes | ❌ ROADMAP (Book D) | — |

One more caveat, stated plainly: the live Decision Journal that stores these confidence values is
**in-memory** and per-process. The number a reviewer sees is real for the life of the process, not
durably persisted. That honesty matters as much as the score itself.

The work of Book C here is the wiring: replace the single-ROAS literal at `routes.ts:1123-1130`
with a call into `assess()` at `reasoning.ts:62`, feeding it the evidence the evidence engine
already knows how to gather — without changing the `{score, reason, basis}` shape the display at
`routes.ts:837` already consumes.

---

## 5. Displaying confidence to a human without implying certainty

A confidence number is only as good as the way it is shown. Displayed carelessly, "95%" reads as
"this will work." Displayed honestly, it reads as "the system is 95% sure, and here is why — you
decide." The Trust Layer requires the second reading. These are the display rules.

### 5.1 Always show the basis with the number

Never display a bare score. The engine already pairs every score with a reason sentence
(`reasoning.ts:91`); the display must carry both. "78%" alone invites blind trust. "78% — based on
382 campaigns, ROAS 5.8" invites a *judgment*: the reviewer can see the number rests on a deep
sample and a strong ROAS, and can weight it accordingly. The basis is what converts a demand for
trust into an offer of evidence.

### 5.2 Frame it as belief, not fact

The language around the number should say the system's belief, not reality's verdict. "AdOS is
78% confident" is honest. "This campaign will succeed 78% of the time" is not — it launders a
belief into a statistical fact the system has not earned. Confidence is the system talking about
itself.

### 5.3 It is advisory input — it never auto-approves

This is non-negotiable and human-sovereign. No confidence score, however high, causes AdOS to
approve, launch, scale, or spend anything on its own. The number is *input to a human decision*,
full stop. A score of 95 still lands on a person's desk for a yes or no. The related governance
gate ([`../3-provenance-and-trust/CONSTITUTION_CHECKER.md`](../3-provenance-and-trust/CONSTITUTION_CHECKER.md),
🔶 `governance.ts:41-45`) may *block or flag* a recommendation whose confidence or evidence falls
below threshold — but blocking is a brake, never an accelerator. The system can stop itself; it
can never approve itself.

### 5.4 Show low confidence as loudly as high confidence

The temptation is to celebrate high scores and hide low ones. Resist it. A 40% score is *more*
important to surface than a 90% one, because it is the system telling the reviewer "look
harder here." Suppressing low confidence would defeat the entire purpose of computing it. Low
confidence is a feature working, not a result to be embarrassed about.

### 5.5 Never let the number stand in for the outcome

Because Confidence ≠ Truth, the display must never present a score as if the outcome were already
known. Confidence lives *before* the campaign; outcome lives *after*. When both eventually exist,
the honest surface shows them side by side — the confidence that was claimed and the result that
occurred — so a human can see the gap for themselves. Making that gap *visible* is Book C's
honesty; making it *smaller* is Book D's learning.

---

## 6. Boundaries held

Restating the guardrails this document operates inside, because a confidence engine is exactly
the kind of thing people assume is more autonomous than it is:

- **100% local.** Confidence is computed on-device from the agency's own campaign history. No
  cloud scoring, no per-token API call, no external model. The formula at `reasoning.ts:82` runs
  in-process.
- **Copy only.** Confidence rates textual/structured campaign evidence. No image, vision, or
  speech scoring is involved.
- **No external data.** The evidence feeding the score comes from the agency's own memory — no
  connectors, no crawlers, no third-party benchmarks.
- **No vendor telemetry.** The score, its basis, and any later calibration are the agency's own
  data. Nothing about a confidence assessment is reported outward.
- **Human-sovereign.** Confidence is advisory. It never auto-approves. A person always decides.
- **Book boundary.** Book C reports confidence honestly. Book D calibrates it against outcomes.
  This document does not build, design, or claim the learning loop.

---

## 7. Value contribution

**Explainable, calibrated confidence increases agency revenue and reduces reviewer decision
time — the two ways every AdOS capability must pay its way.**

*Reduces production time.* A reviewer who is handed "78% — based on 382 campaigns, ROAS 5.8"
approves or rejects faster than one handed a raw recommendation and forced to re-derive "do I even
believe this?" from scratch. The confidence number plus its basis does the reviewer's first pass
of skepticism for them. Across a portfolio of decisions, that compounds into real hours saved on
every review cycle.

*Increases revenue.* Honest confidence is a differentiator. Generic LLM tools emit an answer with
an implied, unearned certainty; AdOS emits an answer, a number, and the evidence the number rests
on — and openly labels the number as a belief, not a promise. Clients and internal reviewers trust
a system that admits what it does not know. That trust wins accounts, retains them, and separates
AdOS from every tool that hides its uncertainty behind confident prose. And because AdOS never
lets a confidence score approve anything on its own, the agency keeps the human accountability that
enterprise clients require before they will spend real budget.

The honesty *is* the value. A number that never lied about being a guess is worth more than a
number that pretended to be the truth.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
