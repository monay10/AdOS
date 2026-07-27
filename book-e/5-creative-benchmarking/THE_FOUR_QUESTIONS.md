# The Four Questions — How A, B, C, D, and E Answer Together

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 1. What this document is

This is the closing document of Book E, and it is also the closing document of the whole
intelligence spine — Books A through E. Every prior document defended one capability at a time:
how a creative is scored, how two creatives are compared, how a suggestion is offered without
becoming an edit, how quality is measured, how a baseline is drawn honestly. This document does
something different. It steps back and asks what those capabilities add up to **when they run
together.**

The answer is a claim about identity. A tool that generates advertising copy is a commodity;
there are many of them, and they all do roughly the same thing — take a prompt, return text.
AdOS is built to be something else: an **operating system for an advertising agency**, a
*reklam ajansı işletim sistemi*, in which producing copy is only the first of several jobs, and
by no means the most valuable one. The more valuable jobs are judgement jobs, and judgement jobs
are answered by questions. This document names the four questions, shows which book answers each,
and shows that they share a single spine.

Two sentences bound everything that follows. They are stated in full at the top of this document
because they are the boundary of the entire exercise, and every claim below is subordinate to
them:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

Nothing in this synthesis — no combination of scoring, comparison, and benchmarking — overturns
those two sentences. The four questions produce **evidence and judgement**. The fifth act, the
decision, belongs to a person. That is the design, and this document exists to make the design
legible as a whole.

---

## 2. The four questions

An agency, working on a piece of creative for a client, is really asking four questions in
sequence. Each one has a home in the books.

### Question 1 — *What should we produce?*

This is the production question. Given a brief, an audience, a brand, and a channel, what copy
should the system generate? Book B answers it. Book B is the **production layer**: it defines how
the AI produces the six copy outputs of a creative sprint, how those outputs are structured, and
how the production pipeline is organized. When the agency needs *material to work with*, Book B
is where that material comes from.

Cross-reference: [`../../book-b/README.md`](../../book-b/README.md).

### Question 2 — *Why this?*

This is the explanation question. The system produced a headline, recommended an angle, favored
one direction over another — **why?** An advertising decision that cannot be explained cannot be
defended to a client, and an agency lives or dies by its ability to defend its work in a room.
Book C answers it. Book C is the **Trust Layer**: it defines the "why contract," grounded
recommendation, and provenance — the machinery that turns an output into an *explained* output.
When the agency needs to stand behind a recommendation, Book C is where the reasoning comes from.

Cross-reference: [`../../book-c/README.md`](../../book-c/README.md).

### Question 3 — *What happened before?*

This is the memory question. Before deciding anything, the agency wants to know what its own
past campaigns actually did. What was the ROAS? Which patterns recurred across winners? What is
the baseline for this vertical, this client, this class of work? Book D answers it. Book D is the
**Performance Memory** — the company's evidence store. It records campaigns, discovers patterns,
and holds the numbers that any honest judgement must rest on. When the agency needs *evidence*,
Book D is where that evidence lives.

Cross-reference: [`../../book-d/README.md`](../../book-d/README.md).

### Question 4 — *Which is better?*

This is the judgement question, and it is the subject of this entire book. Given two or more
creatives — a headline against a headline, an angle against an angle — which is stronger, and on
what defensible grounds? Book E answers it. Book E is the **judgement layer**: it scores
creatives, compares them same-class, measures their quality across named dimensions, suggests
optimizations without rewriting, and benchmarks against the agency's own history. When the agency
needs to *choose between options without descending into a debate about taste*, Book E is where
the ranking comes from.

This book — the one you are reading — is Question 4.

### Book A — the workflow beneath all four

The four questions do not float in the air. They happen inside an agency's actual workflow:
clients, brands, campaigns, briefs, approvals, reporting. Book A defines that workflow. It is not
a fifth question; it is the **ground the other four stand on** — the operating environment in
which producing, explaining, remembering, and judging all take place. Every question above is
asked *about a campaign*, *for a client*, *under an approval gate*, and all of those are Book A's
concepts.

Cross-reference: [`../../book-a/README.md`](../../book-a/README.md).

---

## 3. The shared spine — evidence → judgement → human decision

The four questions are not four separate machines bolted together. They are four expressions of
**one spine**, and the spine is the reason they can be answered together at all:

```
evidence  →  judgement  →  human decision
```

Read the questions against the spine and the unity is obvious:

| Question | Book | Where it sits on the spine |
| --- | --- | --- |
| What should we produce? | B | Produces the *candidate* the spine will judge |
| Why this? | C | Turns judgement into *explained* judgement |
| What happened before? | D | Supplies the **evidence** the whole spine rests on |
| Which is better? | E | Turns evidence into **judgement**, ranked and transparent |
| (workflow beneath) | A | Carries the candidate to a **human decision** — the approval gate |

Every book contributes to the same left-to-right movement. Book D fills the *evidence* box. Book
E converts evidence into *judgement* — a ranking, a score, a comparison. Book C makes that
judgement *explainable*. And Book A carries the whole thing to a person, who makes the *decision*.
Nothing skips a box. Book E never invents evidence — it reads Book D's Performance Memory and
interprets it. Book E never makes the decision — it ranks alternatives and hands the ranking to a
human at Book A's approval gate. The spine is not a diagram we drew after the fact; it is the
constraint every book was written to obey.

This is why the four questions can be answered *together*. They are not four products that happen
to sit in one repository. They are four segments of a single pipeline whose direction never
reverses: evidence first, then judgement, then a human deciding.

### A worked pass along the spine

To make the spine concrete, follow one creative through all four questions. An account manager is
preparing two headline options for a finance client and needs to choose one before the client
call. Trace the questions in order, and note the honest tier of each step as the design intends
it — and as it stands today:

1. **What should we produce? (B)** The production layer generates the candidate copy — a headline,
   ad copy, a CTA, and the rest of the six copy outputs of the sprint. This is the material the
   rest of the spine will judge. *(Production is the most mature question; the copy is real
   output.)*
2. **What happened before? (D)** Before anything is judged, the Performance Memory is read: what
   did this client's past finance campaigns do, what is the vertical baseline, which patterns
   recurred among the winners. This is the **evidence** box. *(Live today, this is only the
   per-client mean ROAS at `routes.ts:1461-1470`; the richer per-vertical and pattern evidence is
   🔶 BUILT (UNWIRED), sitting behind the `LiveAIManager` bypass.)*
3. **Which is better? (E)** With evidence in hand, the two headlines each receive a
   multi-dimensional score — brand fit, policy fit, clarity, specificity, and the rest — and are
   compared **same-class** (finance against finance, never across verticals). The output is a
   ranking with the dimensions shown. *(This is the judgement box, and for a creative it is almost
   entirely ❌/🔶 today — nothing scores or compares a creative in the live app.)*
4. **Why this? (C)** The ranking is not handed over as a bare verdict. The Trust Layer attaches
   the reasoning — which dimensions drove "A over B," backed by which evidence — so the account
   manager can defend the choice on the client call.
5. **The decision.** The ranking and its explanation arrive at Book A's approval gate, where the
   account manager — not the system — chooses which headline ships, and may override the ranking
   entirely.

Notice that no step invents evidence and no step makes the decision. Book E reads what Book D
recorded; Book A hands the result to a person. The pass runs left to right and stops at a human.
That is the spine doing its one job.

---

## 4. The synthesis — from content generator to decision support

Put the four questions on the shared spine and the identity of the product changes.

A system that only answers Question 1 — *what should we produce?* — is a content generator. Prompt
in, copy out. It is useful, but it is a commodity, and it competes on price and speed against
every other prompt-and-pray tool on the market. It cannot tell you whether the copy it just
produced is any good, why it recommended one option over another, what your own history says, or
which of two drafts is stronger. It generates; it does not judge.

A system that answers **all four** questions on one spine is a different kind of thing. It
produces (B), it explains (C), it remembers (D), and it judges (E) — and it does all of that
*inside an agency's real workflow* (A). At that point AdOS stops being an ordinary
content-generation tool and becomes **evidence-based creative decision support**: a system that
does not merely hand you copy, but hands you a *defensible ranking of copy, grounded in your own
performance history, with the reasoning shown*. That is what an operating system for an
advertising agency is — a *reklam ajansı işletim sistemi* — and it is the whole point of the
exercise.

This is worth stating plainly, because it is easy to mistake for a pivot: **the synthesis is the
natural continuation of Books A through D, not a new direction.** Book A gave the agency its
workflow. Book B gave it production. Book C gave it explanation. Book D gave it memory. Book E
adds judgement on top of that memory. "The four questions answered together" is not a new product
grafted onto the old one — it is the moment the four existing layers are recognized as segments
of one spine. Book E is the last segment, not a departure from the earlier ones.

---

## 5. Honest current status — this is the design, not today's capability

Everything in Section 4 is a claim about what the A–E design **specifies**. It is not a claim
about what the live application does today. Book E is a design-and-architecture synthesis, and
this section is candid about the gap, because a synthesis that overstated its own maturity would
violate the first law of every book in this repository.

Here is the honest state of Question 4 — *which is better?* — in the shipped app:

- **What runs live:** the application scores exactly one thing about performance — **per-client
  mean ROAS**, computed at
  [`apps/web/src/routes.ts:1461-1470`](../../apps/web/src/routes.ts). That is the only live
  baseline. It is ✅ SHIPPED, and it is genuinely useful, but it judges a *client's account*, not
  a *creative*.
- **What does not run live:** **nothing scores or compares a creative.** The creative artifact,
  `CreativeSet`, has no score field and no scoring method — creative scoring is ❌ ROADMAP today.
  There is no creative-A-versus-B comparison, no quality model computing clarity or specificity,
  no suggestion engine.
- **Why the judgement machinery is dormant:** the pieces that *would* judge are largely 🔶 BUILT
  (UNWIRED). The live app constructs its AI through `createAIManager` → `LiveAIManager`
  ([`apps/web/src/ai-factory.ts:39`](../../apps/web/src/ai-factory.ts),
  [`apps/web/src/main.ts:43`](../../apps/web/src/main.ts)), and that path **bypasses the entire
  runtime pipeline** where the scoring, safety, and constitution machinery lives. The safety
  engine, the constitution checker, the EMA and confidence and pattern-ranking primitives — all
  of them are real, tested, deterministic, and offline, and none of them is reached by a live
  code path. They are instantiated only in tests. Relative to the live app, **every judgement
  primitive Book E describes is 🔶.**

So when this document says "the four questions answered together," it is describing **the design
that Books A–E specify, not a current capability.** Today, Question 1 (produce) largely works,
the account-level slice of Question 3 (ROAS memory) works, and Question 4 (which creative is
better) is almost entirely ❌/🔶. The four-question system is a coherent architecture whose
judgement half is mostly not wired in yet. Saying so is not a hedge; it is the point. A system
that claimed to answer "which is better" about a creative today would be lying, and Book E does
not lie about tiers.

### The concrete throughline from here

The gap is not vague, and closing it is not a research problem. It is a wiring problem with a
fixed order, and the order follows the spine:

1. **Wire Book D's evidence read-back.** Give the live app a path to the Performance Memory it
   already records — the per-vertical baselines and pattern evidence that today sit behind the
   `LiveAIManager` bypass. Judgement cannot start until evidence is readable. *(Evidence.)*
2. **Wire the scoring and safety machinery.** Route creatives through the deterministic engines
   that already exist and are already tested — the safety and constitution checks, the ranking and
   confidence primitives — so that a creative actually receives a multi-dimensional score built
   from Evidence + Rules + Heuristics. *(Judgement.)*
3. **Surface the judgement to the human.** Present the score, the comparison, and the reasoning at
   the agency's approval gate, where a person accepts, rejects, or overrides it. *(Human
   decision.)*

That is the throughline: evidence read-back, then scoring machinery wired in, then judgement
surfaced to a person. Each step is a known quantity — the machinery is written; the work is
connection, not invention.

---

## 6. The laws, recapped — the spine has a constitution

The four-question synthesis is not held together by good intentions. It is held together by the
governing laws of Book E, which are the same laws every content document has carried. Recapped
here as the closing statement of the book:

1. **Evidence ≠ Judgement.** "214 campaigns → CTR 5.2%" is evidence; "this hook is better" is
   judgement. The spine keeps them in separate boxes on purpose.
2. **Judgement is reproducible.** Same evidence + same rules + same heuristics = same score. A
   score is deterministic, never a model's momentary mood.
3. **A score is never an LLM opinion.** Every score is built from Evidence + Rules + Heuristics —
   never "the model thinks it's an 8/10."
4. **Score is multi-dimensional.** No single "87/100." Overall decomposes into named dimensions,
   each shown separately.
5. **No hidden weights.** The weights that compose a score are documented. Percentages may change;
   the principle never does.
6. **Comparison before optimization.** The flow order is fixed: evidence → score → comparison →
   optimization. Understand how good a creative is before suggesting a change.
7. **Suggestion ≠ automatic rewrite.** AI suggests; the human decides; always. AdOS never
   auto-rewrites a creative.
8. **Benchmark integrity.** Only same-class items are compared — Finance to Finance, E-commerce to
   E-commerce, B2B to B2B. Never across contexts.

These eight laws are not eight rules for one book. They are the constitution of the spine. Read
them back and every one is a statement about keeping evidence, judgement, and human decision in
their proper places, in their proper order, with nothing hidden.

It is worth naming why the laws survive the synthesis unchanged. When four capabilities are
combined, the usual temptation is to relax a rule "just at the seams" — to let a combined score
paper over a missing dimension, or to let a benchmark quietly compare across contexts because the
combined view looked cleaner. The laws exist precisely to hold at the seams. A four-question
system that broke Law 8 at the join between benchmarking and comparison would produce a tidier
ranking and a false one. The reason Book E can be assembled into a whole at all is that each law
is a property of the whole, not a property of one document — Evidence ≠ Judgement holds across the
join between D and E; No Hidden Weights holds across the join between scoring and comparison;
Benchmark Integrity holds across the join between quality and baseline. The synthesis is only as
honest as its seams, and the laws are what keep the seams honest.

---

## 7. The one principle that governs every future book

Books A–E complete the intelligence spine, but they do not close it. Future layers are already
named — **Book F (AI Studio)**, **Book G (Analytics)**, **Book H (Marketplace)** — and each will
add capability that Books A–E do not have. The unifying principle across every layer, present and
future, is a single ordering that no new book is permitted to break:

> **First evidence, then judgement, then human decision.**

This is the law beneath the laws. Book F's studio, Book G's analytics, Book H's marketplace — each
will produce, score, rank, or recommend something new, and each must obey the same spine. A new
layer may add a new kind of evidence, or a new kind of judgement, or a new surface for a human to
decide on. It may **not** collapse the order: it may not let judgement run ahead of evidence, and
it may not let the system decide in a human's place. The spine is the invariant. New books extend
it; they do not amend it.

That constraint is what makes the phrase "operating system" honest. An operating system is not
defined by its features but by the rules every feature must obey. For AdOS, that rule is the
spine, and this is the document that states it as the shared inheritance of everything built and
everything still to come.

There is a discipline in this that is easy to underrate. It would be simpler, and more
demo-friendly, to let a future book skip a box — to let an analytics layer decide instead of
surfacing a decision, or to let a studio layer judge before it has evidence. The spine forbids
it, and forbidding it is the value. A system whose every layer answers to *evidence first, then
judgement, then human decision* is a system a client can trust the same way in every corner of
the product, because the corners were all built to the same law. Consistency of that kind is not
a constraint on the product; it is the product. Book E's contribution to the spine is judgement;
its contribution to the *future* books is the insistence that judgement never runs ahead of
evidence and never stands in for a person.

---

## 8. Value contribution — why this is the whole product's differentiator

The value of the four-question synthesis is the value of the product itself, so it is worth
stating in the plainest business terms.

A prompt-and-pray tool sells **speed of generation**. It competes on how fast it returns copy,
and it competes against a crowded field, on price. AdOS, once the spine is wired, sells something
a generator cannot: **evidence-based creative decision support.** That difference shows up as
money and time in two direct ways:

- **Revenue.** Transparent, reproducible creative judgement lets an agency *defend and improve its
  work in front of clients*. When a client asks "why this headline?", the agency does not answer
  with taste — it answers with a score built from the client's own performance history, with the
  reasoning shown and the evidence cited. Work that can be defended is work that can be *sold*, and
  *re-sold*, and *priced above commodity*.
- **Production time.** Same-class ranking lets the team *pick the strongest option fast instead of
  debating by taste*. The hours an agency loses to internal argument over which draft is better are
  hours the spine gives back — not by deciding for the team, but by putting a defensible ranking on
  the table so the decision is informed and quick.

Both of those benefits — the revenue and the reclaimed time — are only available to a system that
answers all four questions together. A generator that answers only Question 1 cannot defend its
own output or rank its own drafts. That is the differentiator, and it is why the synthesis, once
built, is the point of the whole product rather than a feature of it.

And it is always, in every case, subordinate to the two sentences this document opened with,
restated here as its final word because they are the guardrail on everything above:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

The four questions produce evidence and judgement. The agency's people produce the decision. That
is the design of the spine, that is the design of AdOS, and that is where Book E — and the A–E
intelligence spine — comes to rest.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
