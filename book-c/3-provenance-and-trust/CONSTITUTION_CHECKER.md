# C010 — The Constitution Checker

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is
> [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document is about

Every other document in this book has been about *producing* an explanation: gathering the
evidence behind a recommendation, scoring the system's confidence in it, recording the
alternatives that were weighed, writing the reason down in a journal the human can read back.
Those documents describe how the AI *speaks*. This document is about how the AI is made to
*shut up* when it has nothing worth saying.

The **Evidence First Law** is the first principle of the entire book:

> No output may be presented AS a "recommendation" unless it can show evidence.

Stated that way, it is a promise. A promise is only as good as the thing that enforces it. A
recommendation with no evidence behind it — a bare guess dressed up in confident language —
is exactly the failure mode the law exists to prevent, and a law with no enforcement point is
just a wish printed on the wall. The **Constitution Checker** is the enforcement point. It is
the single place in the design where the Evidence First Law stops being aspirational and
becomes a gate that a proposed recommendation must pass through before a human ever sees it.

The Checker's job is narrow and can be said in one sentence: given a proposed recommendation
together with the evidence and confidence assembled for it, decide whether that recommendation
is *adequately supported* — and if it is not, withhold it or flag it rather than let it reach
the human as if it were sound.

That is the whole of it. The Checker does not decide whether the recommendation is *good*. It
does not decide whether the campaign will *work*. It does not approve anything, and it never
substitutes its judgment for a person's. It answers exactly one question — "is there enough
here to call this a recommendation at all?" — and it answers it before the human is asked to
spend a single second of attention.

---

## 2. Where the Checker sits in the pipeline

To understand the Checker you have to understand what flows into it. Two upstream components
do the real work of assembling the case for a recommendation, and both are documented in
Part 1 of this book:

- The **Evidence Engine**
  ([`../1-why-contract/EVIDENCE_ENGINE.md`](../1-why-contract/EVIDENCE_ENGINE.md)) gathers the
  concrete, human-readable facts that support a proposed recommendation — the campaigns this
  agency has actually run, the marketing rollups, the patterns and prior experience — and
  attaches a source and a weight to each. It hands back a structured bundle of evidence
  references. If that bundle is empty, there is nothing to stand on.

- The **Confidence Model**
  ([`../1-why-contract/CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md)) takes that
  evidence and produces a confidence score plus a plain-language reason, blending how strong
  the evidence is, how broad it is, and how well similar recommendations have fared before.

The Constitution Checker is the component *downstream* of both. It does not gather evidence
and it does not compute confidence — it **consumes** their outputs. By the time a proposed
recommendation reaches the Checker, someone else has already answered "what supports this?"
and "how sure are we?" The Checker's contribution is to take those two answers and turn them
into a single, consequential verdict: *does this proceed, or not?*

Conceptually the flow is:

```
proposed recommendation
        │
        ▼
  Evidence Engine  ── gathers evidence references
        │
        ▼
  Confidence Model ── scores confidence + writes the reason
        │
        ▼
  Constitution Checker ── gate: adequately supported?
        │
   ┌────┴────┐
   ▼         ▼
 pass      block / flag
   │            │
   ▼            ▼
reaches      withheld or marked as
the human    unsupported before the human sees it
```

This ordering is the point. The gate sits *between* the machinery that builds the case and
the human who will act on it. Nothing about the Evidence First Law is enforceable if the gate
is anywhere else.

---

## 3. The capability and its honest tier

**`ConstitutionChecker` — 🔶 BUILT (UNWIRED)** —
`domains/executive-memory/src/governance.ts:41-45`.

The Checker exists as real, unit-tested code. It gates a recommendation on
confidence and evidence thresholds: a recommendation carrying insufficient evidence, or a
confidence that falls below the bar, does not pass — it is blocked or flagged rather than
handed onward as if it were sound. This is genuine behavior, not a sketch. It has tests, it
runs, and it does what this document describes.

What it is **not** is *wired*. And this book does not pretend otherwise.

The live web application (`apps/web`) builds its AI through `createAIManager()`, which
produces an `OfflineAIManager` or a `LiveAIManager`. It does **not** run the rich reasoning
pipeline in `packages/ai-manager/src/runtime/manager.ts`. That runtime — the pipeline that
threads a proposed recommendation through the Evidence Engine, the Confidence Model, and the
Constitution Checker in sequence — is instantiated only inside tests
(`walking-skeleton.test.ts`). So the Checker today is reached only from within that unwired
runtime and from its own unit tests. No live route, no button, no screen currently sends a
real recommendation through this gate.

That is what the **🔶 BUILT (UNWIRED)** tag means, and it is the honest status of this
capability. The gate is built. The gate is tested. The gate is *not yet on the path a real
recommendation travels to reach a real reviewer.*

Wiring it is the Book C build task for this document. Concretely, wiring the Checker means: on
the live path, every proposed recommendation is run through the gate — after the Evidence
Engine has gathered its evidence and the Confidence Model has scored it — *before* the
recommendation is rendered anywhere a human will read it. A recommendation that fails the gate
is withheld or visibly flagged; only a recommendation that passes reaches the reviewer wearing
the full explanation the rest of this book describes.

Until that wiring exists, the promise of the Evidence First Law on the live surface is carried
by the hand-rolled evidence and confidence literals the shipped code assembles by hand — not
by an enforced gate. Saying so plainly is part of keeping this book trustworthy. The Checker
is the destination; it is not yet the road.

### 3.1 What "adequately supported" checks

The Checker's verdict rests on two independent conditions, both of which must hold for a
recommendation to pass:

1. **Evidence sufficiency.** There must be enough real evidence behind the recommendation.
   An empty or threadbare evidence bundle is disqualifying on its own — no amount of confidence
   can rescue a recommendation that cannot point to anything it is based on. This is the direct
   embodiment of "no recommendation is ever 'the LLM said so.'"

2. **Confidence adequacy.** The confidence assembled for the recommendation must clear the
   threshold. A recommendation the system itself is barely willing to stand behind should not
   be paraded in front of a reviewer as though it were solid.

Fail either condition and the recommendation does not pass as-is. It is blocked outright, or it
is flagged — surfaced to the human but marked, unmistakably, as *not adequately supported* so
that the human weighs it knowing exactly what it is. The difference between blocking and
flagging is a design lever discussed in Section 6; both are refusals to let an unsupported
claim masquerade as a recommendation.

---

## 4. This is where the law becomes enforced

It is worth being precise about what changes at this gate, because it is the whole reason the
component exists.

Before the gate, the Evidence First Law is a *description of good behavior*. The Evidence
Engine tries to gather evidence; the Confidence Model tries to score it honestly. Both are
built to serve the law. But "trying to" is not "must." Nothing in the mere existence of those
two engines *forces* a recommendation to actually carry adequate support before it is shown to
a human. A pipeline could gather weak evidence, score low confidence, and still — absent a gate
— render the recommendation to a reviewer in the same confident type as any other.

The Constitution Checker is the word *must*. After the gate, the law is no longer a hope about
how the system behaves; it is a structural fact about what the system is *able* to present. A
recommendation that cannot show evidence does not pass the gate, and therefore is not presented
as a recommendation. Not "should not." *Is not.* The gate is the mechanism by which the
sentence "no output may be presented AS a recommendation unless it can show evidence" acquires
teeth.

This is the sense in which the Checker is the keystone of the Evidence First Law. Every other
Book C component *supplies* the raw material of an explanation. This one *decides whether the
material is enough*, and enforces that decision by refusing passage. Remove it and the law
reverts to a slogan. Keep it and the law is enforced at exactly one, auditable place.

There is a deliberate economy in that. Enforcement lives in a single component, not scattered
across every screen that might show a recommendation. That is what makes the law auditable:
there is one gate to inspect, one place to reason about, one point where "is this adequately
supported?" is asked and answered for the whole system.

---

## 5. The crucial boundary: a guardrail, not an approver

This is the single most important idea in this document, and it must not be blurred: **the
Constitution Checker is a guardrail, not an approver.**

The Checker can do exactly two things. It can let a recommendation through, or it can withhold
or flag it. That is the entire range of its authority. It **never auto-approves** anything. It
**never** turns a proposed recommendation into a decision. It **never** replaces the human.

AdOS is human-sovereign, and that principle is absolute here. Every output of the Checker is
**advisory input to a person** — never a decision made in a person's place. When the gate
passes a recommendation, it is not saying "do this." It is saying "this is adequately
supported; it is worth your attention." When the gate blocks a recommendation, it is not
overruling anyone; it is sparing a human from being asked to evaluate a claim that could not
even show its evidence. In both directions the Checker is protecting the human's attention and
the integrity of what reaches it — it is not exercising the human's judgment for them.

Put the two roles side by side so the line is unmistakable:

- **The Constitution Checker** asks: *"Is this adequately supported — enough evidence, enough
  confidence — to be shown to a person as a recommendation at all?"* Its outputs are *pass*,
  *block*, and *flag*. It gates the **quality of the evidence**, upstream of the human.

- **The human approval gate** asks: *"Given this well-supported recommendation, do I, the
  responsible person, choose to act on it?"* Its output is a **decision**, and only a human
  produces it.

These are different gates, in different parts of the system, answering different questions. The
human approval gate — how a person reviews, approves, rejects, or edits an AI proposal, and how
that authority is structured — belongs to Book A and to Book B, Part 4. It is **not** redesigned
here, and this document deliberately does not touch its mechanics. The only relationship worth
stating is the ordering: the Constitution Checker sits *before* the human approval gate. It
cleans the input to human judgment; it does not perform human judgment.

The failure this boundary guards against is seductive and worth naming. A gate that decides
whether a recommendation is "good enough" is one small slip in language away from a gate that
decides *for* the human. The Checker must never make that slip. It removes unsupported noise so
that the human's sovereign decision is made over signal — and then it stops. The decision is
the human's, always. A gate that passed a recommendation has certified that it is *worth
looking at*, not that it is *right to do*.

---

## 6. Block versus flag

The Checker has two ways to decline, and choosing between them is a real design question rather
than an implementation detail, because it directly shapes the human's experience.

- **Block.** The recommendation is withheld entirely. It never reaches the reviewer as a
  recommendation. This is the right response when a proposed recommendation is so poorly
  supported — no meaningful evidence, confidence far below any reasonable bar — that showing it
  would only waste the reviewer's time and erode their trust in every *other* recommendation on
  the screen. Blocking keeps the recommendation surface clean: what a reviewer sees there has,
  by construction, cleared the bar.

- **Flag.** The recommendation is surfaced, but marked. The reviewer sees it *and* sees, plainly,
  that it did not pass the support threshold — thin evidence, low confidence, or both. This is
  the right response when withholding entirely would hide something the human might still want
  to weigh with their eyes open. A flag is an honesty label, not a demotion in disguise: it lets
  the human exercise sovereign judgment over a marginal case *with full knowledge that it is
  marginal.*

The distinction matters because it keeps the guardrail from quietly becoming a censor. Blocking
is appropriate for the clearly unsupported. Flagging preserves human sovereignty over the
genuinely marginal — the human still decides, but decides informed. Neither mode ever approves
anything; both are refusals to let an unsupported claim wear the unqualified clothing of a sound
recommendation. Where a given system draws the line between "block this" and "flag this" is a
tuning decision, and it is exactly the kind of decision that should be made by people and left
adjustable rather than frozen into the gate.

---

## 7. Passing the gate is not a certificate of truth

The Checker enforces the Evidence First Law. It does **not**, and cannot, enforce the second
law of this book — **Confidence ≠ Truth** — because no gate can. This distinction is subtle and
load-bearing, and getting it wrong would undo much of the care the rest of the book takes.

Passing the gate means one thing and one thing only: the recommendation is **adequately
supported**. It has real evidence behind it and enough confidence to be worth a person's
attention. Passing the gate does **not** mean the recommendation is *correct*. It does not mean
the campaign will work. It does not mean reality will agree.

- **Confidence** is the system's confidence in the recommendation, computed from evidence and
  prior success.
- **Truth** is whether the recommendation actually turns out right when it meets the world.

These are not the same thing, and the Checker traffics entirely in the first. A recommendation
can clear every threshold the Checker sets — strong evidence, high confidence — and still fail
in the market. Another, blocked for thin support, might have been the right call. The gate
raises the *floor* on how well-grounded the things a human sees are; it does not and never could
guarantee outcomes. The full treatment of why confidence must not be mistaken for truth — and
why narrowing the gap between them over time is a *later* book's job, not this one's — lives in
[`../1-why-contract/CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md).

The right mental model is that the Checker is a filter on *support*, not an oracle on *outcome*.
It answers "is this well-grounded enough to show?" — never "is this going to work?" Reading a
passed recommendation as a guarantee would recreate, at the last moment, exactly the
overconfidence the whole book is built to prevent.

This is also why the invariant that governs every part of this book governs the gate too:

> **Evidence is descriptive, not prescriptive.**

The evidence the Checker weighs *describes* what campaigns like this one have done before. It
tells the human what the record shows. It never *prescribes* the decision. A recommendation that
passes the gate arrives at the human carrying its evidence as a *description of the past*, offered
in support of a choice — not as a command that the past be repeated. The gate makes sure the
description is real and sufficient before the human sees it. It does not, and must not, let that
description harden into a directive. The human reads the evidence, weighs it, and decides. That
is the shape of a human-sovereign system, and the Checker is built to protect it rather than to
short-circuit it.

---

## 8. Boundaries this component holds

The Constitution Checker inherits and honors the same boundaries as the rest of AdOS. Because it
is a gate, it is worth stating them plainly here — a gate is precisely the place where a system's
principles either hold or leak.

- **100% local.** The gate runs entirely on the machine. There is no cloud call, no per-token
  billing, no external service consulted to decide whether a recommendation is supported. The
  thresholds and the check are local logic over locally assembled evidence.

- **Copy only.** The Checker weighs textual evidence and numeric confidence. It does not process
  images, vision, or speech; it has no opinion about anything but the structured support a
  recommendation carries.

- **No external data.** The evidence the gate evaluates comes from the agency's own campaign
  history, surfaced by the upstream engines. There are no connectors, no crawlers, no ingestion
  of outside data feeding the decision. The gate judges the agency's own record, nothing else.

- **No vendor telemetry.** Nothing about what the gate blocks, flags, or passes is reported to
  any outside party. The verdicts are the agency's own; they stay on the agency's own
  infrastructure.

- **Human-sovereign.** Restated because it is the load-bearing one: the gate never auto-approves
  and never decides. Every verdict is advisory input to a person. This boundary is not a nicety
  bolted on afterward — it is the definition of what the component is allowed to be.

---

## 9. Value contribution

The Constitution Checker earns its place along both axes this book cares about: it **protects
revenue by protecting trust**, and it **saves production time**.

**Trust, and therefore revenue.** An advertising agency's product is judgment its clients pay to
rely on. The fastest way to destroy that reliance is to hand a client — or an internal reviewer
who answers to a client — a confident recommendation that turns out to have had nothing behind
it. One unsupported claim that a client catches, and every future recommendation is read with
suspicion. The Checker is the structural guarantee that this does not happen: an unsupported
claim does not pass the gate, so it is never presented as a recommendation in the first place.
That is a direct defense of the agency's credibility, and credibility is what wins accounts and
keeps them. It is also precisely what differentiates AdOS from a generic language-model tool that
will happily generate a fluent, evidence-free recommendation on demand. AdOS *cannot* present one,
by construction — and that "cannot" is sellable.

**Time saved.** Every recommendation a human reviews costs attention. A reviewer handed a weak,
unsupported recommendation must first do the work of discovering that it is weak — re-deriving
"do I even believe this?" from scratch — before they can dismiss it. The gate catches those weak
recommendations *before* they reach the reviewer, so the reviewer spends their scarce attention
only on recommendations that have already cleared the support bar. The reviewer who sees, up
front, that a recommendation carries real evidence and adequate confidence approves faster than
one who has to reconstruct the case themselves. The gate does not make the decision for the
reviewer — Section 5 is emphatic about that — but it makes the reviewer's decision faster by
ensuring that everything reaching them is worth deciding about.

Both effects flow from the same discipline: the Evidence First Law, enforced at one place, so
that what reaches a human is always something a human should reasonably spend time on.

---

## 10. Summary

- The **Constitution Checker** is the enforcement point of the **Evidence First Law**. It gates
  a proposed recommendation on evidence sufficiency and confidence adequacy, and blocks or flags
  anything that is not adequately supported. **🔶 BUILT (UNWIRED)** —
  `domains/executive-memory/src/governance.ts:41-45`.

- It **consumes** the outputs of the Evidence Engine
  ([`../1-why-contract/EVIDENCE_ENGINE.md`](../1-why-contract/EVIDENCE_ENGINE.md)) and the
  Confidence Model
  ([`../1-why-contract/CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md)); it does not
  gather evidence or compute confidence itself.

- It is the place where the Evidence First Law stops being aspirational and becomes enforced: a
  recommendation that cannot show evidence does not pass the gate and therefore is not presented
  as a recommendation.

- **Honest tier:** the gate is built and unit-tested, but it is reached only from the unwired
  runtime pipeline (`packages/ai-manager/src/runtime/manager.ts`) and its tests — not from the
  live app. Wiring it means running every recommendation through the gate before it reaches a
  human.

- **It is a guardrail, not an approver.** It can withhold or flag, but it **never** auto-approves
  and **never** replaces the human. Every verdict is advisory input to a human-sovereign decision.
  The human approval gate is a different mechanism, owned by Book A and Book B Part 4, and is not
  redesigned here.

- **Passing the gate means "adequately supported," not "guaranteed correct."** Confidence is not
  truth; the gate raises the floor on support, it does not guarantee outcomes.

- **Evidence is descriptive, not prescriptive.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
