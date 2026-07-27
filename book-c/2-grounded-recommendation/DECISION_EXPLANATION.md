# Decision Explanation — Rendering the Reason a Decision Already Has

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. The governing
> document is [`../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](../1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md).
>
> **Law:** *Evidence is descriptive, not prescriptive.*

---

## 1. What this document owns

AdOS — the Enterprise AI Operating System for Advertising — does not just produce
recommendations; it can explain every recommendation using its own campaign memory. This
document owns the last mile of that promise: turning a decision the system already made into a
sentence a human can read.

The word that governs this entire document is **explanation** — and it is chosen against a
much more common, much more dangerous word: **justification**. The two look alike and are not
alike at all.

- An **explanation** *renders* reasoning that already exists. The evidence, the confidence, and
  the alternatives were computed before any prose was written. The explanation reads them back.
- A **justification** *invents* reasoning after the fact. It starts from a conclusion and works
  backwards to a story that makes the conclusion sound wise. The reasoning did not drive the
  decision; the decision summoned the reasoning.

Book C builds the first and forbids the second. This is the central rule of the document and
everything below is in service of it: **the explanation must render reasoning that already
exists — never fabricate a persuasive story to fit a decision that was made on other grounds.**

Why this matters is not a stylistic preference. A large language model is extraordinarily good
at producing fluent, confident, plausible prose. Ask one to "explain why we chose this budget"
and it will happily generate three paragraphs of reasons — reasons it composed on the spot,
that may have had nothing to do with the actual computation, and that a reviewer has no way to
distinguish from real ones. That is not explanation. That is a machine rationalizing a decision
it did not actually make on the grounds it claims. In an advertising agency, where the output
of this system is shown to a client and staked on a media budget, that failure mode is not
merely embarrassing — it is a breach of trust that is very hard to recover.

So Book C inverts the usual flow. The reasoning is produced first, deterministically, by
engines that compute evidence and confidence from the agency's own campaign history. The
explanation is assembled **from** those facts. Local AI, if it is used at all, is allowed only
to phrase facts it was handed into readable language. It is never allowed to decide what the
reasons are.

Scope discipline. This document lives in Book C — the **read/explain side**. It renders the
reason a decision has. It does not build the machinery that makes the reasons *better over
time*; that calibration loop is Book D's job. Book C's job ends at faithfully showing the
reason that exists today.

Everything here is **100% local, offline-first, copy-only, human-sovereign**. No cloud, no
per-token API call, no telemetry, no external data.

---

## 2. The reasoning already exists — before any prose is written

An explanation is only as honest as the facts underneath it. In AdOS those facts are not a
by-product of the explanation; they are computed independently, in advance, by two engines. The
explanation surface is downstream of both.

### 2.1 The confidence reason string

**Tier: 🔶 BUILT (UNWIRED).** The engine exists and is unit-tested, but no live route in the
web app reaches it yet. Wiring it into the running product is Book C build work.

`HeuristicConfidenceEngine.assess()` lives at
`domains/executive-memory/src/reasoning.ts:62-91`. It blends evidence strength, evidence
breadth, and prior success rate into a score (`reasoning.ts:82`), and — critically for this
document — it emits a **human-readable reason string** alongside that score
(`reasoning.ts:91`):

```
reason: `Based on ${parts.join(', ')}.`
```

In practice this renders as a compact, factual sentence such as:

> "Based on 382 campaigns, ROAS 5.8."

Read that sentence carefully, because it is the whole thesis of this document in miniature. The
number `382` is not a flourish the AI chose to sound convincing. It is a count that the engine
already accumulated. The `ROAS 5.8` is not persuasion; it is a measured rollup. The reason
string is a **faithful serialization of a computation that already happened** — the parts were
assembled from real signals, and the sentence merely joins them. No model was asked to decide
what the reason should be. The reason was computed; the string reports it.

This is why the confidence engine is the anchor of decision explanation and not a decoration on
top of it. The explanation begins here, with a sentence the system can already produce without
any generative model in the loop at all.

### 2.2 The evidence text

**Tier: 🔶 BUILT (UNWIRED).**

`BrainEvidenceEngine.gather()` lives at `domains/executive-memory/src/reasoning.ts:14-56`. It
returns weighted `EvidenceRef[]` drawn from the company brain's marketing rollups, learned
patterns, and prior experience. Its guiding comment states the discipline plainly: *no
recommendation is ever "the LLM said so."*

The engine emits evidence text in the same faithful, factual register — for example
(`reasoning.ts:30`):

> "ROAS …, CTR … over 183 campaigns"

Again: the phrasing is descriptive, the numbers are measured, and nothing here is invented to
persuade. This is the raw material of the explanation. The confidence reason string tells a
reviewer *how sure* the system is; the evidence text tells them *on what basis*.

### 2.3 The explanation is assembled FROM these facts

The relationship is one-directional and it must stay that way:

```
Evidence text (reasoning.ts:30)  ─┐
                                  ├──►  Explanation (read back, phrased, shown)
Confidence reason (reasoning.ts:91) ─┘
```

The explanation surface consumes the evidence text and the confidence reason. It does not
produce them, it does not amend them, and it may not add reasons that are not present in them.
If the engines produced "382 campaigns, ROAS 5.8," the explanation may say that clearly and
warmly — but it may not say "because finance clients always respond to this creative style"
unless that clause traces to a real `EvidenceRef`. The moment prose introduces a reason the
engines did not compute, it has stopped explaining and started justifying.

This one-directional flow also has an ordering consequence worth naming: the reasons must be
computed **before** the explanation is requested, not summoned by the request. In a
justification pipeline, the prompt "explain this decision" is the trigger that manufactures the
reasons. In AdOS the reasons already sit in the evidence text and the confidence reason string
by the time any explanation is assembled. The explanation step has nothing left to invent — its
inputs are already complete. That ordering is what makes the difference between the two words
structural rather than aspirational: you cannot fabricate a reason that the pipeline required
you to have computed a step earlier.

---

## 3. The shipped pattern that proves this works: AI narrative for reports

The discipline described above is not hypothetical. AdOS already ships a feature built on
exactly this principle, and it is the model that decision explanation follows.

**Tier: ✅ SHIPPED.**

The analytics engine produces campaign reports. A report is overwhelmingly composed of
**computed numbers** — spend, ROAS, CTR, conversions, deltas — none of which are generated by a
language model. On top of those numbers sits a `ReportNarrative`
(`domains/analytics-engine/src/report/campaign-report.ts:13-17`): a short prose summary that
reads the report in plain English.

The rule that governs this feature is stated directly in the code
(`domains/analytics-engine/src/report/service.ts:24`):

> "only the narrative is AI-generated"

That single clause is the entire architecture. The **facts** — every number in the report — are
deterministic. The **prose wrapper** around them is the only thing the local model writes, and
it writes it from the facts it is given. The narrative is displayed in the running app at
`apps/web/src/routes.ts:640`, and the same shape recurs in the executive dashboard.

This is worth sitting with, because it is the exact template for decision explanation:

| Layer                    | Who produces it        | May it invent facts? |
| ------------------------ | ---------------------- | -------------------- |
| The numbers / evidence   | Deterministic engines  | No — they are measured |
| The confidence           | Deterministic engine   | No — it is computed  |
| The prose wrapper        | Local AI (narrative)   | **No — it phrases only** |

The local model in the report feature is not asked "was this campaign good?" — the numbers
already answer that. It is asked only "say this clearly." Decision explanation asks its model
precisely the same narrow question about a decision's reason, and grants it precisely the same
narrow permission: phrase the facts, invent nothing.

A shipped, in-production feature therefore already demonstrates the safe division of labor. The
task for Book C is to extend the same pattern from *reports about outcomes* to *explanations of
decisions* — not to discover a new technique.

### 3.1 What "phrase only" looks like in practice

It helps to see the narrow permission concretely. Suppose the engines have produced, for a
budget recommendation, this raw material:

- Confidence reason string (`reasoning.ts:91`): `"Based on 382 campaigns, ROAS 5.8."`
- Evidence text (`reasoning.ts:30`): `"ROAS 5.8, CTR 2.1% over 382 campaigns"`

A **faithful** phrasing — the only kind permitted — stays inside those facts:

> "This budget is recommended on the strength of 382 past campaigns, which together averaged a
> 5.8× return and a 2.1% click-through rate."

Every noun in that sentence traces to a computed fact. Nothing was added. The prose is warmer
than the raw string, and not one reason has appeared that the engines did not supply.

An **unfaithful** phrasing — the kind the rule forbids — smuggles in reasons:

> "This budget is recommended because finance clients respond strongly to premium creative and
> because Q4 seasonality favors aggressive spend."

Neither clause traces to an `EvidenceRef`. "Finance clients," "premium creative," and "Q4
seasonality" are inventions the model produced to sound authoritative. This is the exact moment
explanation becomes justification, and it is exactly what the deterministic-first architecture
of Section 2 is designed to make impossible: the narrator was never given those reasons, so a
faithful narrator cannot report them, and an unfaithful one is caught the instant a reviewer
asks which evidence reference supports the claim — because none does.

---

## 4. The rule: deterministic facts, AI phrasing only

Stating the rule so it cannot be misread:

> **Numbers, evidence, and confidence come from deterministic sources. Local AI may only phrase
> them into readable language.**

Three clauses, each load-bearing:

1. **Numbers, evidence, and confidence come from deterministic sources.** The `382`, the
   `ROAS 5.8`, the `over 183 campaigns`, and the confidence score all originate in
   `HeuristicConfidenceEngine` and `BrainEvidenceEngine`, computed from the agency's own
   campaign memory. They exist before the explanation does.
2. **Local AI may only phrase them.** If a generative model touches the explanation at all, its
   input is the already-computed facts and its output is prose that says those same facts more
   fluently. It receives facts; it returns sentences; it adds no reasons.
3. **Only phrase them.** The model has no authority to select evidence, adjust a number,
   reweight a confidence, or introduce a rationale. Those are computations, and computations are
   not the narrator's job.

### 4.1 Why the rule exists: guarding against post-hoc rationalization

The failure this rule prevents is subtle and specific. A model that is handed a *conclusion*
("we chose budget B") and asked to *explain* it will produce reasons — but they are reasons
manufactured to fit the conclusion, not reasons that produced it. The prose will be fluent and
false-to-process. It will describe a deliberation that never happened.

By forcing the reasons to be computed **first**, deterministically, and letting prose come
**only after** and **only from** those reasons, AdOS structurally removes the model's ability to
rationalize. The narrator never sees a bare conclusion to defend; it sees a set of facts to
report. There is no gap for a fabricated story to fill.

This is also why a purely deterministic explanation — the confidence reason string alone, with
no generative model at all — is always a valid and fully honest explanation in AdOS. The prose
layer is a readability convenience, never a source of truth. **Deterministic-first** is not a
performance optimization; it is the integrity guarantee. The system can always fall back to
showing "Based on 382 campaigns, ROAS 5.8." verbatim, and that is a complete, trustworthy
explanation on its own.

### 4.2 The invariant that keeps explanations honest

Underneath the rule sits the law that governs all of Book C:

> **Evidence is descriptive, not prescriptive.**

An explanation describes the evidence that *informed* a decision. It never claims the evidence
*forced* the decision. "Based on 382 campaigns, ROAS 5.8" tells a reviewer what the history
looked like; it does not tell them the history mandated this choice, because it did not. The
human remains free to weigh the same evidence and decide otherwise. A faithful explanation
makes the evidence legible without pretending it is a verdict — which is exactly what keeps the
human, not the data, sovereign over the decision.

---

## 5. Where the explanation is shown

### 5.1 Today: the mission-detail learning panel

**Tier: ✅ SHIPPED.**

There is a real explanation surface running in the app today. When a decision is recorded, the
Decision Journal stores its full shape at `apps/web/src/routes.ts:1118` — the `decision`, the
`evidence`, the `alternatives`, the `chosen` and `rejected` options, the `confidence`, and (once
known) the `outcome`. That record is read back at `apps/web/src/routes.ts:832` via
`journal.history({subjectId, k:1})`, mapped into a `LearningView` at
`apps/web/src/routes.ts:833-841`, and rendered on the mission-detail page by `renderLearning`
at `apps/web/src/views/pages.ts:294-297`.

`renderLearning` is the clearest real "why did it decide this" surface shipping today. It shows a
reviewer the decision alongside the evidence and confidence that accompanied it — a
faithful read-back of stored facts, exactly in keeping with the rule of this document. It is,
however, deliberately modest: it displays the fields the journal happened to store, in the
layout the mission page had room for.

Two honesty caveats belong here. First, the live decision journal is **in-memory** — the record
survives for the life of the process, not durably across restarts. Second, `renderLearning`
shows the journal's stored shape, not the full explainability contract; it predates the engines
of Section 2 and reads back hand-assembled fields rather than a computed reason string.

### 5.2 Roadmap: a first-class explanation surface

**Tier: ❌ ROADMAP.** No implementation; this is specification only, and carries no code
citation.

The destination is a dedicated explanation surface that honors the full eight-field
explainability contract for every recommendation:

1. **Recommendation** — what the system proposes.
2. **Why?** — the phrased reason, sourced from the confidence reason string.
3. **Evidence** — the evidence text and its references.
4. **Confidence** — the score, shown as the system's belief about itself, not about reality.
5. **Alternative considered** — the `chosen` vs `rejected` options already stored at
   `routes.ts:1118`.
6. **Brand rules checked** — which brand constraints were verified.
7. **Memory consulted** — which slices of campaign memory fed the evidence.
8. **Human action required** — what the reviewer is being asked to do next.

Building this surface means wiring the Section 2 engines to a live route so the "Why?" and
"Evidence" fields are populated by `HeuristicConfidenceEngine` and `BrainEvidenceEngine` rather
than by the hand-assembled literals in use today, and letting the optional prose layer wrap —
never replace — those computed fields. Field 4 stays scrupulously honest about the Confidence ≠
Truth boundary: closing the gap between the system's confidence and reality is Book D's work,
not something this surface should imply it has solved.

Until that surface exists, `renderLearning` remains the honest, shipped answer, and this section
does not claim otherwise.

---

## 6. Boundaries

The decision-explanation capability observes the same boundaries as the rest of AdOS, and each
one has teeth here specifically.

- **100% local generation.** Any prose phrasing runs on the machine, offline. There is no cloud
  narration service and no per-token API call. An explanation is generated where the campaign
  memory already lives — the facts never leave the box to be described somewhere else.
- **Human-sovereign.** An explanation is **advisory context for the human's decision, never a
  replacement for it.** It exists to help a person decide faster and better; it does not decide,
  approve, or execute. The reviewer reads the reason and remains free to accept, reject, or
  override it. Where a confidence/evidence gate participates
  (`domains/executive-memory/src/governance.ts:41-45`, 🔶 BUILT (UNWIRED)), it flags weakly
  supported recommendations for human attention — it never auto-approves.
- **No external data.** The evidence and numbers come exclusively from the agency's own campaign
  history. There are no connectors, no crawlers, no third-party enrichment feeding the
  explanation. If a fact is in the explanation, it traces to the agency's own memory.
- **Copy only.** The explanation is text. No image, vision, or speech generation is involved in
  producing or displaying it.

These boundaries are not friction bolted onto the feature. They are the reason the explanation
can be trusted: a reason phrased locally, from your own data, with a human holding the decision,
is a reason a client can be shown without hesitation.

---

## 7. Value contribution

**Value contribution.** A clear, faithful explanation speeds human approval and builds client
trust. A reviewer who is shown the evidence and the confidence — "Based on 382 campaigns, ROAS
5.8" — approves faster than one forced to re-derive "do I actually believe this?" from scratch;
that is direct **reduction in production and review time**. And because the explanation renders
real reasoning rather than a fabricated story, it survives the scrutiny of a skeptical client:
the agency can defend every recommendation with the agency's own campaign memory, which **wins
and retains accounts** and sharply differentiates AdOS from generic LLM tools whose "reasons"
are eloquent guesses. Explanation that renders instead of invents is the difference between a
tool a client tolerates and a system a client trusts — and trust, in this business, is revenue.

The distinction this document defends is therefore not academic. An invented justification that
gets caught costs an account; a faithful explanation that holds up earns the next one.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
