# Suggestion Is Not an Automatic Rewrite

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 0. What this document is

This document states one law and defends it: **a suggestion is never an automatic rewrite.**

Book E is the judgement layer of AdOS. It scores a creative, it compares one creative against
another, and — in this Part — it can propose an optimization: *change this headline to that one,
because the evidence says so.* The previous document in this Part,
[`SUGGESTION_ENGINE.md`](./SUGGESTION_ENGINE.md), describes how such a proposal is constructed
from score gaps and evidence. This document governs what happens **after** the proposal exists.

The answer is deliberately narrow and deliberately absolute: nothing happens to the creative
until a human decides it should. AdOS proposes; the human disposes. There is no mode in which
the system edits the creative on its own, and there is no button that applies every suggestion
at once. The system's judgement is advisory input to a human decision — never a substitute for
one.

This is not a limitation the product apologizes for. It is the property that keeps the human the
author of the work and keeps the agency accountable for what it ships. The two invariant
sentences of Book E state the boundary directly:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

The second sentence is the constitution of this document. Everything below is an elaboration of
what "humans choose direction" has to mean in the architecture, in the workflow, and in the
day-to-day experience of using AdOS.

---

## 1. The law

**LAW — Suggestion ≠ Automatic Rewrite.** AdOS proposes changes to a creative; it **never**
applies them to the creative on its own. Every suggestion is reviewed by a human, who
**accepts**, **edits**, or **rejects** it. There is no auto-rewrite mode. There is no
"apply all." There is no silent write-back. The creative changes only when a person, having seen
the suggestion and its rationale, chooses to change it.

State the law as an absolute, because it is meant to be one:

1. **No unattended edit.** The system will not modify `headline`, `adCopy`, `cta`, `socialPost`,
   `landingPage`, or `email` — the six copy outputs of a creative — as a side effect of scoring,
   comparing, or suggesting. A suggestion is a description of a possible change, not the change.
2. **No batch application.** A set of ten suggestions is ten separate human decisions, not one.
   AdOS does not offer, and will not offer, a control that commits every proposed edit in a
   single gesture. The absence of "apply all" is a design commitment, not an unfinished feature.
3. **No opt-in to automation.** There is no setting, no flag, and no "power-user mode" that
   turns suggestions into rewrites. The human step is not a default that can be disabled; it is
   the mechanism.

The law is a floor, not a ceiling. AdOS may present suggestions more clearly, rank them more
usefully, and explain them more thoroughly over time. It may never remove the human from between
the suggestion and the creative.

---

## 2. Why this matters

The law exists to protect three things at once: authorship, accountability, and craft. Each is
worth stating on its own, because each fails in a different way if suggestions become rewrites.

### 2.1 Authorship — the human stays the author

AdOS is **human-sovereign** by design. The person operating it is the author of the creative
work; the system is an instrument they use. An instrument that edits the work while the author
is not looking has quietly become the author. The moment a suggestion is applied without a
human choosing to apply it, the sentence "our team wrote this" stops being true, and the agency
can no longer say it with a straight face.

Keeping the human as the one who accepts, edits, or rejects each change preserves the plain fact
that the creative is theirs. The system contributed judgement; the person made the decision. That
distinction is the whole difference between a tool and an autopilot, and Book E is built to be a
tool.

### 2.2 Accountability — someone is answerable

When a creative ships and a client asks "who decided to phrase it this way?", there must be a
human answer. If the system rewrote the line on its own, the honest answer is "the software did,
and nobody reviewed it" — which is not an answer any agency wants to give, and not one any client
wants to hear. Accountability requires a decision-maker, and a decision-maker requires a decision.
Auto-rewrite erases the decision, and with it the accountability.

By routing every suggestion through a human accept/edit/reject step, AdOS guarantees that every
change to a shipped creative traces back to a person who chose it. The audit story is simple:
the system proposed, a named human disposed, and the record shows which.

### 2.3 Craft — judgement does not silently override taste

A Creative Score is a transparent, reproducible judgement built from evidence, rules, and
heuristics. It is genuinely useful, and it is genuinely not the same thing as creative taste. A
higher-scoring headline is not automatically a better headline for this client, this brand voice,
or this campaign — which is exactly why the first invariant sentence exists:

> **Higher score does not guarantee better business outcome.**

If a suggestion were applied automatically because it closed a score gap, the system's numeric
judgement would silently override the human's craft. The line that read better to a skilled
copywriter would be gone, replaced by the line that scored better, with no one having weighed the
trade. That is precisely the failure the law prevents. The score is an input to a human's craft,
not a ruling over it.

### 2.4 The invariant, restated

All three protections collapse into the single sentence this document carries most centrally:

> **Creative Intelligence ranks alternatives; humans choose direction.**

Read it as a division of labor. **Ranking alternatives** is the machine's job: score them,
compare them, order them, explain the order. **Choosing direction** is the human's job: decide
which alternative the work will actually take. The law "Suggestion ≠ Automatic Rewrite" is what
makes that division real instead of decorative. Without it, ranking and choosing blur together
and the machine ends up choosing. With it, the boundary holds: the system ranks, the person
chooses, always.

---

## 3. How this connects to the shipped human gate

AdOS already has a human gate. This document does not design a new one; it points a suggestion at
the one that exists and states that a suggestion is advisory input to it — nothing more, and
nothing that bypasses it.

Two documents in the rest of the product own that gate, and both describe **✅ SHIPPED**
behavior:

- **Human review of AI output** — [`../../book-b/4-optimization/HUMAN_REVIEW.md`](../../book-b/4-optimization/HUMAN_REVIEW.md).
  Book B, Part 4 documents the operational review step in the production pipeline: AI-produced
  copy is presented to a human, who reviews it before it advances. That review step is the
  established place where a person examines what the system produced and decides what to do
  about it.
- **Approval** — [`../../book-a/APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md). Book A
  documents the agency workflow's approval mechanism — the gate through which work passes on its
  way to being shipped, with a human explicitly approving.

A Book E suggestion does not get its own private approval path and does not deserve one. It
arrives at the **same** human gate that already governs whether a creative moves forward. The
suggestion is a piece of evidence-backed advice placed in front of the reviewer; the reviewer
decides, using the mechanism they already use. In other words:

> A suggestion is advisory input to the human gate that already exists. It changes what the human
> is looking at. It does not change who decides, and it does not change that a human decides.

This is why the law is cheap to keep and expensive to break. Keeping it means "route suggestions
to the existing human step, like everything else." Breaking it would mean building a *second*,
unattended path that reaches around the shipped approval gate to edit the creative directly —
which is exactly the thing AdOS is designed never to have.

> **Boundary — do not redesign the gate.** The human review and approval mechanisms are owned by
> Book B Part 4 and Book A respectively. This document references them; it does not restate their
> internals, redesign their flow, or add rules to them. If the two ever appear to conflict with a
> suggestion's behavior, the shipped gate wins and the suggestion yields.

---

## 4. The honest tier — what exists today

Book E is honest about its truth model. Every capability is **✅ SHIPPED**, **🔶 BUILT
(UNWIRED)**, or **❌ ROADMAP**, and nothing unbuilt is described as shipped. Applied to this
document, the honest picture is unusually clean.

### 4.1 There is nothing that could auto-rewrite — because there is nothing at all

- **Suggestion generation — ❌ ROADMAP.** No code produces "change X → to Y → because Z"
  suggestions over a creative today. This is the subject and status of
  [`SUGGESTION_ENGINE.md`](./SUGGESTION_ENGINE.md).
- **Suggestion application / auto-rewrite — ❌ ROADMAP.** No code applies a suggestion to a
  creative, automatically or otherwise. There is no write-back path, no batch commit, no
  "apply." The capability does not exist.

Put the two together and the situation is the opposite of dangerous: **today there is literally
nothing that could auto-rewrite a creative, because neither the suggestion nor its application is
built.** The law is therefore not a guard bolted onto a risky feature. It is a **design guarantee
established before the feature exists**, so that the feature is built the right way — with the
human step present from its first line — rather than retrofitted with a human step after an
autopilot has already shipped.

This is the safest possible moment to fix the boundary in stone, and this document does exactly
that.

### 4.2 The creative has no score to chase, either

A creative in AdOS is copy-only and, today, un-scored: the `CreativeSet` structure carries **no
score field and no scoring method** (`domains/creative-studio/src/creative/creative-set.ts:86`),
so creative scoring itself is **❌ ROADMAP**. There is no live number for an auto-rewrite to
optimize toward even if such a rewrite existed. The whole chain — score, suggest, apply — is
design, not deployment.

### 4.3 The live app already never auto-applies

Even setting the roadmap aside, the running application has no path that could touch a creative
automatically. The live app builds its AI through `createAIManager` → `LiveAIManager`
(`apps/web/src/ai-factory.ts:39`, `apps/web/src/main.ts:43`), and that live manager **bypasses
the entire runtime pipeline** (`AIManager`) where the scoring, safety, and constitution machinery
lives — that machinery is instantiated only in tests. `LiveAIManager` contains no scoring call,
no suggestion call, and no rewrite path. It produces copy; a human reviews it through the shipped
gate (§3). So the live behavior today is already, and trivially, compliant: **AdOS does not
auto-apply anything, because the only manager that runs has no such capability, and the human
approval step is the gate that ships.**

### 4.4 The scoring machinery is dormant, deterministic, and still advisory

The reusable primitives that a future suggestion engine would draw on — exponential-moving-average
scoring (`packages/ai-manager/src/runtime/learning.ts:49`) and its argmax selector
(`learning.ts:53`), pattern ranking (`domains/company-brain/src/pattern-library.ts:35`),
confidence scoring (`domains/executive-memory/src/reasoning.ts:82`) — are all **🔶 BUILT
(UNWIRED)**: real, deterministic math, but sealed behind the `LiveAIManager` bypass and reached
only by tests. They are the ingredients of judgement, not of action. Nothing in that machinery
writes to a creative; it ranks and it scores. When it is eventually wired, the law of this
document is the rule that keeps its output on the advisory side of the human gate.

> **Summary of tiers.** Suggestion generation: ❌ ROADMAP. Suggestion application / auto-rewrite:
> ❌ ROADMAP. Creative scoring: ❌ ROADMAP (`creative-set.ts:86`). Scoring/ranking machinery: 🔶
> BUILT (UNWIRED). Live AI path: **✅ SHIPPED and already never auto-applies** (`LiveAIManager`,
> `ai-factory.ts:39` / `main.ts:43`). Human review & approval gate: **✅ SHIPPED**, owned by Book
> B Part 4 and Book A.

---

## 5. The accept / edit / reject flow (design)

This section describes the intended flow for when suggestion generation is built. It is **design**
(the suggestion capability is ❌ ROADMAP); it is included so the capability is built with the human
step already specified.

### 5.1 A suggestion arrives with its evidence and its rationale

A suggestion is never a bare instruction. Following Law 6 — comparison before optimization — a
suggestion is produced only after the current creative has been scored and compared, and it
carries that context with it. Each suggestion is presented to the human together with:

- **The proposed change** — what would change, expressed against the specific copy field
  (`headline`, `adCopy`, `cta`, `socialPost`, `landingPage`, or `email`).
- **The evidence** — the Book D performance evidence the proposal rests on, shown as evidence, not
  as a conclusion. Evidence ≠ judgement; the human sees both, separately.
- **The score-gap rationale** — the specific dimension gap the change is meant to close and by
  how much, drawn from the scoring model. This is the "because Z" of the suggestion, and its
  detailed construction is the subject of [`SUGGESTION_ENGINE.md`](./SUGGESTION_ENGINE.md).

The reason for presenting all three is the reason for the whole law: the human must be able to
decide **with full context**. A number alone invites reflexive acceptance; a number with its
evidence and its rationale invites an actual judgement. AdOS is built to inform the decision, not
to make it easy to skip.

### 5.2 The human acts — three outcomes, no fourth

For each suggestion, the human takes exactly one of three actions:

1. **Accept.** The human agrees, and the proposed change is applied to the creative — because the
   human applied it. Acceptance is the *only* way a suggestion reaches the creative.
2. **Edit.** The human takes the suggestion as a starting point and writes something of their own
   — the system's proposal informed a human's revision without dictating it. What lands is the
   human's wording, not the machine's.
3. **Reject.** The human declines. The creative is untouched. A rejected suggestion leaves no
   trace on the work; it was advice, and advice can be declined at no cost.

There is no fourth outcome, and specifically there is no "do nothing and let it apply itself." The
default state of a suggestion is *not yet acted on*, and in that state **nothing changes**. The
creative sits exactly as the human last left it until the human chooses otherwise. Inaction is
safe by construction: an unreviewed suggestion is an unapplied suggestion, forever, until a person
acts.

### 5.3 Nothing changes until the human acts

The single sentence that this flow guarantees:

> The creative does not change until a human accepts a change or writes one. Scoring it does not
> change it. Comparing it does not change it. Suggesting a change to it does not change it. Only a
> human acting changes it.

That is the operational meaning of "humans choose direction." The ranking, the scoring, the
suggesting — all of it — is preparation laid in front of a person. The direction is chosen at the
accept/edit/reject step, by the person, every time.

---

## 6. Book E proposes; the human disposes; Book E produces no new data

Two boundaries frame this document and are worth stating plainly together.

**Book E produces no new data.** Book D is the company's Performance Memory — the evidence. Book E
is judgement over that evidence: it scores, ranks, compares, and, in this Part, suggests. It never
manufactures a new fact, a new metric, or a new performance record. A suggestion is an
interpretation of existing evidence, not a new datum. So the phrase for this book is exact: **Book
E proposes; the human disposes.** The proposing is judgement over Book D's evidence; the disposing
is the human's decision at the shipped gate; and no new data is created anywhere in between.

**Everything stays inside the product's boundaries.** The law of this document lives alongside the
standing boundaries of AdOS, and reinforces them:

- **100% local, offline-first, copy-only.** Suggestions concern the six copy fields and nothing
  else; there is no visual, video, or carousel artifact to rewrite, automatically or otherwise.
- **No cloud, no external API, no telemetry, no connectors, no external benchmarks.** A suggestion
  is computed locally over the company's own evidence. Nothing about the accept/edit/reject flow
  reaches outside the machine.
- **Human-sovereign.** The system suggests; it never auto-rewrites. This document is the specific
  form that sovereignty takes in the optimization Part.

---

## 7. Value contribution

Keeping suggestions human-owned is not only principled; it is how this capability **earns its
place** on the two axes Book E cares about — agency revenue and production time.

**Revenue — defensibility and client trust.** An agency that can say "every line in this creative
was chosen by our team, informed by evidence" holds a position no auto-generated deliverable can.
When a client challenges a choice, the agency has a person who made it and a rationale — the
evidence and the score gap — behind it. Auto-rewrite would quietly trade that defensible position
for speed the agency did not ask for and cannot stand behind. Human-owned suggestions keep the
creative accountable and keep the client's trust intact, and trust is what retains accounts and
wins the next brief.

**Production time — faster revision, same authorship.** At the same time, the accept/edit/reject
flow is genuinely faster than revising by argument. Instead of a team debating a headline by
taste, the reviewer sees ranked, evidence-backed alternatives and chooses among them in seconds —
accept the strong one, edit the near-miss, reject the rest. The judgement work of surfacing and
ordering options is done by the machine; the choosing is quick because the options arrive with
their reasons attached. The agency gets the speed of a well-prepared decision **without** giving
up the authorship — the human still chooses direction, just faster.

The trade AdOS refuses to make is speed *for* sovereignty. The trade it offers instead is speed
*with* sovereignty: rank fast, choose deliberately, own the result.

---

## 8. Boundaries and laws, stated

For the record, the boundaries and laws this document depends on:

- **Law — Suggestion ≠ Automatic Rewrite.** AdOS proposes; it never applies a change to a creative
  on its own. No auto-rewrite mode, no "apply all," no silent write-back. The human accepts,
  edits, or rejects each suggestion. (This document.)
- **Law — Comparison before optimization.** A suggestion follows scoring and comparison, so the
  human decides with full context. (Governs §5.)
- **Law — Evidence ≠ judgement.** A suggestion is a judgement; the performance data it rests on is
  evidence. The human sees both, separately.
- **Law — A score is never an LLM opinion.** The rationale a suggestion carries is built from
  evidence, rules, and heuristics — not from a model's mood — which is why it is safe to show a
  human and let them decide.
- **Boundary — the human gate is shipped and owned elsewhere.** Reference Book B Part 4
  ([`HUMAN_REVIEW.md`](../../book-b/4-optimization/HUMAN_REVIEW.md)) and Book A
  ([`APPROVAL_ENGINE.md`](../../book-a/APPROVAL_ENGINE.md)); do not redesign them. A suggestion is
  advisory input to that gate.
- **Boundary — 100% local, copy-only, no external data or benchmarks, no vendor telemetry,
  human-sovereign.** AdOS suggests; it never auto-rewrites.
- **Boundary — Book E produces no new data.** It proposes over Book D's evidence; the human
  disposes.

And the two sentences that must hold across all of Book E, stated here in the context they most
directly govern — a suggestion offered to a human who is free to decline it:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
