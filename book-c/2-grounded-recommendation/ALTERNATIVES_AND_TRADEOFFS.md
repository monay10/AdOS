# C007 — Alternatives & Trade-offs: Why THIS and not THAT

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document is about

A recommendation is only half an explanation. "Run creative A" tells a reviewer what the
system prefers; it does not tell them what the system rejected, or why. The missing half is
the one that most often decides whether a human trusts the machine: *what else did you
consider, and what made you set it aside?* An answer to that question is what separates a
recommendation a reviewer can interrogate from an instruction they can only obey or ignore.

This document owns that half. It is about the **alternative** — the option that was on the
table and did not win — and about the **trade-off**, the reasoned comparison that explains the
outcome. In the Explainability Contract (Law 3) this is field 5, *"Alternative considered."*
In the mandated recommendation shape it is the fourth link:

> **Recommendation → Evidence → Confidence → Alternatives → Decision**

The link is deceptively important. Evidence and confidence justify the *winner*. Alternatives
justify the *contest* — they show that the winner beat something, that a choice was actually
made rather than a single option rubber-stamped. Without them, a reviewer has no way to tell a
considered decision from a reflex. With them, the reviewer can do the one thing this whole
book exists to protect: disagree, and pick the option the system rejected.

**Value contribution.** Surfacing the road not taken is a trust multiplier and a time saver at
once. A reviewer who sees "we chose A over B because B's ROAS history was thinner in this
sector" reaches a confident yes or a confident override in seconds — they are reading a
comparison, not reconstructing one. That cuts decision time on every campaign. And a system
that can show its rejected options, ranked and reasoned from the agency's own campaigns, reads
as a colleague rather than a black box; that is what wins the account against a generic chat
tool and what retains it when a client's own reviewer learns they can always ask "why not the
other one?" and get a real answer.

---

## 2. What ships today — the data model already exists

The single most important fact in this document is that the shape for "what else was
considered and why it lost" is **not a roadmap item**. It ships. AdOS already records rejected
options and already reads them back onto the screen a human looks at.

### 2.1 The write — ✅ SHIPPED

When the live application records a decision, it writes a journal entry that carries the full
explainability structure in one object (`apps/web/src/routes.ts:1118`):

> `{ decision, evidence, alternatives, chosen, rejected, confidence, outcome }`

Three of those fields are the subject of this document. `alternatives` is the set of options
that were on the table. `chosen` is the one that won. `rejected` is what was set aside. They
are written together, at the same moment, into the same durable-shaped record. The system does
not merely remember what it decided — it remembers what it *declined to decide*, which is the
harder and more valuable half.

The store behind that write is the `InMemoryDecisionJournal`
(`domains/executive-memory/src/memory.ts:54-80`), instantiated in the live application
(`apps/web/src/app.ts:91`). Its `record` operation is the one the route calls; its `history`
and `attachOutcome` operations are how the entry is later read and closed out.

### 2.2 The read-back — ✅ SHIPPED

A stored alternative that no human ever sees is worthless. AdOS reads the entry back. On the
mission detail path the app fetches the most recent journal entry for the subject
(`apps/web/src/routes.ts:832`, `journal.history({ subjectId, k: 1 })`) and maps it onto a
`LearningView` (`apps/web/src/routes.ts:833-841`), the view model that carries the decision,
its evidence, its confidence score (`apps/web/src/routes.ts:837`), and the alternatives into
the rendering layer.

### 2.3 The display — ✅ SHIPPED

That view model is rendered on the mission detail screen by `renderLearning`
(`apps/web/src/views/pages.ts:294-297`). This is the clearest real "why did it decide this"
surface shipping in the product today, and it is where a rejected option becomes visible to a
reviewer. The chain is complete end to end: an alternative is written at
`routes.ts:1118`, retrieved at `routes.ts:832`, shaped at `routes.ts:833-841`, and shown at
`pages.ts:294-297`.

So the honest headline is strong and true: **the data model for "what else was considered and
why it lost" already exists, and it is already displayed.** Field 5 of the Explainability
Contract is not a blank; it is a shipped surface with a real backing store.

### 2.4 The honest persistence caveat — ✅ SHIPPED (with a limit)

One boundary must be stated plainly rather than glossed. The journal is **in-memory**
(`apps/web/src/app.ts:89-91`). Everything above is real and runs in the live app, but the
record lives for the life of the process — it accumulates while the app runs and is not
durably persisted across restarts the way finished artifacts are. "Shipped" here means the
write, read, and display paths are live and wired; it does not mean the history of rejected
options survives a restart. Durable decision memory is a foundation this surface ultimately
needs and does not yet fully have.

---

## 3. The honest gap — a winner is recorded, not a reasoned contest

Here is where scrupulous honesty is required, because the temptation is to let the shipped data
model imply more than it delivers.

What ships is the **shape**, not the **reasoning**. Today `chosen` and `rejected` are recorded
as simple values — the identity of the option that won and the identity of the one that lost.
The record answers "which alternative was set aside" cleanly. What it does *not* yet carry is
the thing that makes a set-aside option *explainable*: its own evidence, its own confidence,
and therefore a defensible account of *why* it ranked below the winner.

Concretely, the gap is the difference between these two things a reviewer might read:

- **Today (✅ SHIPPED shape).** "Chosen: Creative A. Rejected: Creative B." A true statement of
  the outcome. It tells the reviewer *that* B lost. It does not tell them *why* — and a reviewer
  who wants to override toward B is given nothing to weigh against.

- **The design (🔶, Section 4).** "Chosen: Creative A — ROAS 5.8 over 382 same-sector campaigns,
  confidence 0.81. Rejected: Creative B — ROAS 4.9 over 61 campaigns, confidence 0.6." Now the
  reviewer reads a *comparison*. B did not merely lose; it lost by a stated margin, on stated
  evidence, at a stated confidence — and a reviewer who knows something the numbers don't (a
  brand reason, a client relationship, a shift in the market) can override with their eyes open.

The gap, precisely put: the winner is well-served by the rest of Book C — the Evidence Engine
gathers its facts, the Confidence Model scores it — but the **losers are recorded as bare
identities**. A rejected option today has no evidence of its own attached and no confidence of
its own attached. It is a name in a field, not a considered alternative. Closing that gap is
the design work this document specifies.

---

## 4. The design — every alternative carries its own evidence and confidence

The fix does not require a new engine. It requires applying the engines Book C already
documents to *each* option instead of only to the winner. The whole point of the grounded-
reasoning machinery is that it is indifferent to which option it is asked to justify — it
gathers facts and scores them for whatever subject it is handed. So the design is to hand it
every candidate, not just one.

### 4.1 Promote each alternative to a first-class, reasoned entry — 🔶

Today `rejected` is a value. Under this design each alternative — chosen and rejected alike —
becomes a small structured entry carrying three things of its own:

1. **Its own evidence.** The same `EvidenceRef[]` the Evidence Engine produces for the winner,
   gathered instead for this candidate. Reuse `BrainEvidenceEngine.gather()`
   (`domains/executive-memory/src/reasoning.ts:14`), which returns sourced, weighted,
   human-readable facts from the agency's marketing, pattern, and experience stores — the same
   component described in
   [`../1-why-contract/EVIDENCE_ENGINE.md`](../1-why-contract/EVIDENCE_ENGINE.md). An
   alternative's evidence line reads exactly like the winner's — "ROAS …, CTR … over
   ${sampleSize} campaigns" (`reasoning.ts:30`) — because it is produced by the identical
   mechanism.

2. **Its own confidence.** The `HeuristicConfidenceEngine.assess()`
   (`domains/executive-memory/src/reasoning.ts:62`) run over *that alternative's* evidence,
   yielding the same score-plus-reason pair it produces for the winner — for example "Based on
   61 campaigns, ROAS 4.9" (`reasoning.ts:91`), blended from evidence strength, breadth, and
   prior success (`reasoning.ts:82`). The mechanics are the subject of
   [`../1-why-contract/CONFIDENCE_MODEL.md`](../1-why-contract/CONFIDENCE_MODEL.md); here they
   matter because they are what let a rejected option state *how sure the system would have been
   had it been chosen*.

3. **Its readable label.** The plain identity that already ships in the `alternatives` /
   `rejected` fields, so nothing is lost — the design adds reasoning underneath the existing
   value, it does not replace it.

### 4.2 The output is a ranked comparison, not a winner with footnotes — 🔶

Once each candidate carries its own evidence and confidence, the alternatives stop being a list
and become a **ranking**. The reviewer sees the options ordered — the chosen one at the top, the
rejected ones beneath it — each with the facts and the confidence that placed it there. The
value is in the *adjacency*: A and B side by side, their evidence readable against each other,
their confidence scores comparable at a glance.

This is the same discipline the Evidence Engine already applies within a single recommendation,
lifted up one level. There, weight *ranks* the facts behind one option and never suppresses the
weak ones. Here, confidence *ranks* the options themselves and never hides the losers. A
rejected alternative stays visible, stays readable, and sits in its place in the order —
exactly so the reviewer can see whether the winner won by a landslide or a whisker. A decision
where A scored 0.81 and B scored 0.79 is a genuinely close call the human should look at hard;
a decision where A scored 0.81 and B scored 0.35 is not. Today's bare `rejected` value cannot
tell those two situations apart. The ranked comparison can, and that difference is the entire
reason to do the work.

### 4.3 Where the reasoned alternatives live

The design changes what the alternative *fields carry*, not where they live. The write still
happens at `routes.ts:1118`, into the same journal record; the read still happens at
`routes.ts:832`; the display still flows through `LearningView` (`routes.ts:833-841`) and
`renderLearning` (`pages.ts:294-297`). What changes is that `alternatives` / `rejected` go from
holding identities to holding reasoned entries, and `renderLearning` gains the job of drawing
the comparison rather than printing a name. The shipped surface is the delivery vehicle; the
design fills it with reasoning it does not yet carry.

### 4.4 A necessary honesty about the winner's evidence today

One caveat keeps this design grounded. On the live path, the evidence and confidence the app
records are **hand-rolled literals**, not engine output — the running route composes an
`evidence[]` array and a `confidence{score,reason}` object inline at
`apps/web/src/routes.ts:1123-1130` (for example `reason: "Based on ${roas}x ROAS"`), and the
score is displayed at `routes.ts:837`. The genuine `BrainEvidenceEngine` and
`HeuristicConfidenceEngine` are **🔶 BUILT (UNWIRED)** — real, unit-tested, and reached today
only through a runtime the live app does not run, plus their tests. So per-alternative reasoning
inherits the same wiring task as the winner's reasoning: routing recommendation generation
through the real engines. This document does not pretend the losers can be richly reasoned on a
live path while the winner still cannot. Both depend on the same wiring, and both are honestly
🔶 until it lands.

---

## 5. Trade-offs, the Explainability Contract, and human sovereignty

### 5.1 Field 5 is where sovereignty becomes operable

The Explainability Contract's fifth field — *"Alternative considered"* — is not a courtesy. It
is the field that makes the human's authority *actionable*. Human sovereignty is easy to assert
and hard to enable: telling a reviewer "you may override" means little if the screen shows them
only what to approve. The moment the screen also shows what was rejected, and why, the reviewer
has something to override *toward*. Field 5 is the difference between the right to disagree and
the means to disagree well.

Read the recommendation shape with that in mind:

1. **Recommendation.** The system proposes A.
2. **Evidence.** The facts behind A, gathered from the agency's own campaigns.
3. **Confidence.** How sure the system is about A, computed from that evidence.
4. **Alternatives.** B and C, each with *their own* evidence and confidence — the road not
   taken, made legible.
5. **Decision.** A human chooses. The system never chooses for them.

The fourth link is the one that turns the fifth from a formality into a real choice. A reviewer
handed a ranked comparison can pick the option the system ranked *second* — and do it with full
sight of exactly what they are trading away. That is human sovereignty made operable rather than
merely declared.

### 5.2 The AI never auto-selects

This must be stated without hedging. In AdOS the presence of a `chosen` value does not mean the
AI *committed* to anything. The system ranks; it does not enact. Presenting rejected options is
precisely the mechanism that keeps ranking from hardening into selection: because the losers are
shown, the winner is visibly a *proposal at the top of a list*, not a decision already made.
**The AI never auto-selects. Every check is advisory. AdOS never auto-approves.** A human reads
the comparison and acts, and until they act, nothing is decided.

This is also why the honest surface is a *comparison* and not a *verdict*. A verdict — "the
answer is A" — quietly removes the alternatives from view and, with them, the human's ability to
choose differently. A comparison keeps every option on the screen and hands the decision to the
person. The design in Section 4 exists to make the comparison richer, never to make the choice
firmer. The same guardrail is enforced structurally by the confidence/evidence gate documented
in [`../3-provenance-and-trust/CONSTITUTION_CHECKER.md`](../3-provenance-and-trust/CONSTITUTION_CHECKER.md)
(`domains/executive-memory/src/governance.ts:41-45`, 🔶): it can block or flag a recommendation
that lacks support, but it too only advises — it never approves on a human's behalf.

### 5.3 Rejected is not the same as wrong

The most important thing a good trade-off surface teaches a reviewer is restraint about the word
*wrong*. When B ranks below A, B was not *wrong*. It was *out-evidenced*. It may still be the
better choice — the reviewer may hold a fact the stores do not. Keeping the rejected option
visible, with its own evidence and its own confidence, is what preserves that reading. The
ranking says "the agency's history favored A"; it does not say "B was a mistake." That
distinction is the connective tissue between this document and the invariant in Section 7, and
it is why a rejected alternative is shown with its reasoning intact rather than crossed out.

---

## 6. A related but distinct mechanism — Prompt Registry A/B selection

It is worth naming a mechanism that *looks* like alternative-selection so it is not confused
with the one this document is about, because conflating them would misdescribe both.

The **Prompt Registry** keeps versioned prompt templates and scores them
(`domains/prompt-registry/src/in-memory-prompt-registry.ts:18`). Each variant carries a score
updated by an exponential moving average — `score = prior*0.8 + reward*0.2`
(`in-memory-prompt-registry.ts:73`) — and `selectActive` picks the **highest-scoring variant**
(`in-memory-prompt-registry.ts:79`). That is, structurally, an alternative-selection engine: it
holds competing options, scores them from experience, and elects a winner.

But it is a different *kind* of alternative, and the distinction must stay clean on two axes:

- **Different subject.** The Prompt Registry chooses between **prompt variants** — competing
  ways of *phrasing an instruction to the model*. This document is about competing **campaign
  decisions** — which creative, which budget, which direction to recommend to a human. A better
  prompt variant is a production-quality choice made *inside* the machinery; a rejected campaign
  alternative is a business choice presented *to a reviewer*. One tunes how the system speaks;
  the other is what the system advises.

- **Different tier and audience.** Prompt-variant selection is **🔶 BUILT (UNWIRED)**: the
  registry is not instantiated in the live app, and services pass a `promptRef` hardcoded to v1
  (`domains/creative-studio/src/creative/service.ts:45`), so no live path scores or selects
  prompt variants today. And even when wired, its scoring is an *internal optimization* the
  reviewer never arbitrates — nobody overrides which prompt template was active. The campaign
  alternatives this document covers are the opposite: their entire purpose is to be shown to a
  human so the human *can* override.

Both are real, and both may one day run. But the Prompt Registry optimizes the system's own
plumbing behind the scenes, while campaign alternatives exist to be surfaced, ranked, and
overridden by a person. Keeping them separate keeps the trust story honest: the human's veto
governs *what is recommended*, not *which prompt phrasing produced it*.

---

## 7. The invariant — the rejected option was not wrong

Everything in this document converges on one sentence, which must be read exactly as written:

> **Evidence is descriptive, not prescriptive.**

Nowhere is that sentence more load-bearing than in a trade-off. When the ranking places B below
A, it is reporting a *description*: across the agency's own campaigns, the facts happened to
favor A. It is emphatically *not* issuing a *prescription* that B must lose, or that B was a
mistake, or that choosing B would be irrational. The evidence favored A. That is all it did.
The rejected alternative was not "wrong" — the evidence merely favored another.

This is why per-alternative evidence and confidence matter so much, and why hiding the losers
would be a betrayal of the invariant. If the system showed only the winner, it would be
*prescribing* — "here is the answer." By showing every option with its own reasoning, the system
stays *descriptive* — "here is what each option's history looks like; you decide." A reviewer who
overrides toward B is not fighting the evidence; they are adding to it, contributing the judgment
the numbers cannot hold. Markets shift, briefs differ, a client relationship weighs on a call in
ways no rollup records. A ranking that treated its top option as a verdict would erase all of
that. A ranking that treats it as a description invites it in.

So the trade-off surface is a brief laid before a decision-maker, not a sentence handed down to
one. The ranking says where the agency's memory points. It never says where the human must go.
The moment a rejected alternative is treated as *proven wrong* rather than *out-evidenced for
now*, the system has stopped describing and started prescribing — and prescribing is the one
thing this book refuses to let it do. Evidence is descriptive, not prescriptive; a ranked
comparison is that sentence made visible.

---

## 8. Boundaries

The alternatives surface operates under the same hard boundaries as the rest of AdOS.

**Own data only.** Every alternative's evidence is gathered from the Company Brain's own stores
— marketing performance, patterns, experience — and every row in those came out of a campaign
this agency ran. There are no external benchmarks, no connectors, no crawlers, no ingestion. A
rejected option's "over N campaigns" figure is over *this agency's* campaigns. That is what makes
the comparison defensible to a client: their own work is the only thing standing behind either
side of it.

**100% local.** Ranking alternatives is a local read against local memory. No network call, no
cloud service, no per-token cost, no vendor round-trip, and no telemetry — nothing about a
decision, its winner, or its rejected options ever leaves the machine. The comparison a reviewer
reads is computed in-process and seen by no third party.

**Copy only.** The alternatives this surface reasons over are described in metrics and text —
ROAS, CTR, sample sizes, plain-language labels. It compares numbers and words, never images,
vision, or audio.

**Human-sovereign.** Restated because it is the point: the surface *presents* a ranked
comparison and *stops*. It never auto-selects, never auto-approves, and never removes the losing
options from view. Every ranking is advisory. The decision is the human's.

**This surface does not learn.** Reading the stores to rank the options is a Book C concern.
*Growing* those stores from finished campaigns — so that tomorrow's comparison is better
evidenced than today's — is the write/learn side, and it belongs to Book D. This document
deliberately does not design that loop.

---

## 9. Summary of tiered claims

| Capability | Tier | Anchor |
| --- | --- | --- |
| Journal `record` stores `alternatives`, `chosen`, `rejected` (with `evidence`, `confidence`, `outcome`) | ✅ SHIPPED | `apps/web/src/routes.ts:1118` |
| Journal store `InMemoryDecisionJournal` (`record`/`history`/`attachOutcome`) | ✅ SHIPPED (in-memory) | `domains/executive-memory/src/memory.ts:54-80`, `apps/web/src/app.ts:91` |
| Alternatives read back for the subject | ✅ SHIPPED | `apps/web/src/routes.ts:832` |
| Mapped onto `LearningView` (with confidence score) | ✅ SHIPPED | `apps/web/src/routes.ts:833-841`, `:837` |
| Displayed on mission detail via `renderLearning` | ✅ SHIPPED | `apps/web/src/views/pages.ts:294-297` |
| Winner's evidence/confidence recorded as hand-rolled literals (shape only) | ✅ SHIPPED | `apps/web/src/routes.ts:1123-1130`, `:837` |
| Live journal is in-memory / per-process | ✅ SHIPPED (caveat) | `apps/web/src/app.ts:89-91` |
| Per-alternative evidence via `BrainEvidenceEngine.gather()` | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/reasoning.ts:14`, `:30` |
| Per-alternative confidence via `HeuristicConfidenceEngine.assess()` | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/reasoning.ts:62`, `:82`, `:91` |
| Confidence/evidence gate over recommendations (advisory) | 🔶 BUILT (UNWIRED) | `domains/executive-memory/src/governance.ts:41-45` |
| Prompt-variant A/B selection (`selectActive`, EMA scoring) | 🔶 BUILT (UNWIRED) | `domains/prompt-registry/src/in-memory-prompt-registry.ts:79`, `:73`; hardcoded v1 `domains/creative-studio/src/creative/service.ts:45` |
| Rejected options shown as a ranked, reasoned comparison on a live path | ❌ ROADMAP | wiring work (Section 4) |

The one sentence to carry out of this document: the app already records and displays *what else
was considered* — the shape ships — but the losers are still bare names, and the design is to
give each alternative its own evidence and confidence so the reviewer reads a ranked comparison
rather than a lone winner. However it is presented, the rule never changes — evidence is
descriptive, not prescriptive, and a rejected option was out-evidenced, not proven wrong.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
