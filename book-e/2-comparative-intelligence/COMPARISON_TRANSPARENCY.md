# Comparison Transparency — Showing the Work Behind "A Beats B"

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](../1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 1. What this document defines

Its sibling document defines *that* two creatives are compared and *which same-class rules*
govern a valid comparison. This document defines the harder half: **how the comparison shows
its work.**

When Creative Intelligence says "Creative A beats Creative B," that sentence is not the
output. The sentence is a *headline* over an output. The real output is an **auditable
explanation** — a structured record of which dimensions differed, by how much, backed by
which evidence, weighted by which documented rules. A comparison that produces only the
headline has produced nothing this book is willing to ship.

This is the **Judgment Separation Law in action**. In the scoring part of the book, that law
governs a single creative: a score must expose the evidence and rules beneath it, never
arrive as a bare number. Here the same law governs a *relationship between two creatives*. The
verdict "A > B" is a judgement. The 214-campaign evidence, the per-dimension deltas, and the
documented weights are the material the judgement is built from. This document specifies how
that material is laid out so a human can inspect it, question it, and — critically —
reconstruct the verdict themselves.

Two sentences bound everything that follows, and they are stated here in full because they
are the edge of the whole exercise:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

A transparent comparison is a decision-support artifact. It orders two options and exposes
its reasoning. It never makes the call.

---

## 2. The law: Evidence ≠ Judgement, at the level of a comparison

The governing Constitution declares the separation between evidence and judgement. A
comparison is where that separation is most easily violated, because a comparison *feels* like
a fact. "A is better than B" has the grammar of an observation. It is not one. It is a
judgement assembled from many observations, and the assembly is exactly what must be shown.

The distinction, made concrete:

- **Evidence** — an observed fact from the agency's own Performance Memory. "In this vertical,
  headlines that lead with a number averaged CTR 5.2% across 214 campaigns." Descriptive.
  Book D produced it. Book E did not.
- **Delta** — a measured difference between A and B on one named dimension. "On Evidence
  Support, A scores 78 and B scores 61; delta +17 to A." Arithmetic over two scores.
  Reproducible. Not yet a verdict.
- **Judgement** — the rolled-up conclusion. "A > B overall." The thing a human is being asked
  to trust.

The law forbids the judgement from ever appearing *without* the deltas and the evidence
beneath it. A comparison output in AdOS is structurally a stack:

```
Verdict  (A > B)
  ← rolled up from weighted per-dimension deltas   (No Hidden Weights)
      ← each delta computed from two dimension scores
          ← each score built from Evidence + Rules + Heuristics   (never an LLM opinion)
              ← evidence drawn from Book D's Performance Memory
```

Read top-down it is a claim. Read bottom-up it is an audit trail. The document's entire
purpose is to guarantee that the bottom-up read is always available — that no consumer of a
comparison is ever handed the top of the stack alone.

---

## 3. What "A is better" must never be

A bare verdict is the failure mode this whole part of the book exists to prevent. Three
things a comparison output must never do:

1. **State a winner with no dimension breakdown.** "A is better" tells a reviewer nothing they
   can check. It cannot be defended to a client, contested by a strategist, or reproduced next
   week. It is an opinion wearing a comparison's clothes.
2. **Roll up dimensions with weights the reviewer cannot see.** If A wins because Brand Fit was
   weighted heavily and Clarity lightly, that weighting *is* the decision. Hiding it hides the
   decision. (See §6 — No Hidden Weights.)
3. **Present the winner as a business outcome.** A higher composite score is not a promise of
   higher ROAS. The comparison ranks; it does not predict revenue. The first invariant sentence
   is the guardrail: **higher score does not guarantee better business outcome.**

A comparison that avoids all three is *transparent*. It hands the reviewer the same material
the system used, arranged so the conclusion can be walked back to its inputs. That is the
standard. Everything below is how the standard is met.

---

## 4. The transparent-comparison shape

A comparison of Creative A against Creative B is a table of **per-dimension deltas**, each row
self-justifying. The dimensions are the same multi-dimensional set the scoring model defines —
Brand Fit, Policy Fit, Clarity, Readability, Specificity, Persuasiveness, Evidence Support,
Confidence. The comparison does not invent new dimensions; it *differences* the ones already
scored.

Each row carries four things:

| Column | What it holds | Why it is there |
| --- | --- | --- |
| **Dimension** | The named axis (e.g. Evidence Support) | Law 4: no single blended number |
| **A / B scores** | The two per-dimension scores | The raw material of the delta |
| **Delta** | `A − B` on that dimension, signed | The measured difference, not a verdict |
| **Evidence** | The observed facts behind each score | Law 1: every score traces to evidence |
| **Weight** | The documented contribution of this dimension | Law 5: no hidden weights |

A worked illustration (dimensions and evidence are illustrative; the machinery to compute
them for a creative does not ship — see §7):

```
Comparing:  Creative A  vs  Creative B      (same client, same vertical, same format)

Dimension          A    B   Δ      Weight   Evidence behind the delta
-----------------------------------------------------------------------------------
Brand Fit          82   79  +3 A    25%     A uses no banned terms; B uses 1 flagged word
Clarity            71   84  −13 B   15%     B's headline is shorter, single-claim
Evidence Support   78   61  +17 A   20%     A's hook pattern seen in 214 prior campaigns
Policy Fit         90   90   0      20%     Both pass all deterministic policy checks
Readability        66   74  −8 B    10%     B scores lower grade-level (easier to read)
Confidence         70   58  +12 A   10%     A's evidence rests on a larger sample
-----------------------------------------------------------------------------------
Verdict: A > B — driven primarily by Evidence Support and Confidence, despite B leading
on Clarity and Readability.
```

Notice what the shape forces into the open:

- **B wins two dimensions.** The verdict is not "A is better in every way." It is "A is better
  *on balance, under this weighting*." A reviewer who cares more about Clarity than Evidence
  Support can see exactly where their judgement would diverge from the system's.
- **Every delta names its evidence.** The +17 on Evidence Support is not a feeling; it points
  to prior campaigns. The reviewer can go and check them.
- **The verdict names its drivers.** "Driven primarily by Evidence Support and Confidence" is
  the roll-up made legible. A reader knows *why* A won without recomputing anything.

This is the difference between a verdict and an explanation. The verdict is the last line. The
explanation is the whole table — and the whole table is the output.

---

## 5. Reproducibility: same inputs → same explanation

The comparison inherits the reproducibility law from scoring, and extends it. A score is
reproducible: same Evidence + same Rules + same Heuristics = same score. A *comparison* adds
one more guarantee: **same two creatives, same evidence, same weights = same explanation** —
not just the same winner, but the same deltas, the same drivers, the same table, byte for
byte.

This matters more for a comparison than for a single score, because a comparison is what an
agency shows a *client*. If the same two creatives produced "A wins" on Monday and "B wins" on
Thursday with no change in inputs, the tool would be worse than useless — it would be a
liability in the room. Reproducibility is what lets a strategist say "run it again, you'll get
the same table" and be right.

Reproducibility is achievable here for one structural reason: the primitives that would
compute the underlying scores are **pure deterministic math**, not model sampling. The
confidence computation (`domains/executive-memory/src/reasoning.ts:82`), the evidence
weighting (`domains/executive-memory/src/reasoning.ts:29-51`), and the pattern rank
(`domains/company-brain/src/pattern-library.ts:35`) are all fixed functions of their inputs.
Feed them the same evidence and they return the same numbers every time. A comparison built on
deterministic scores is a deterministic comparison. The explanation is a *view* of that
determinism, which is why the explanation is reproducible too. (See §7 for the honest tier of
all three.)

A comparison is therefore never "the model's take today." It is arithmetic over evidence,
rendered as a table. A score is never an LLM opinion, and neither is the difference between two
scores.

---

## 6. No Hidden Weights: how deltas roll up to a verdict

A per-dimension delta table is transparent about *where* A and B differ. It is not yet
transparent about *why the winner won* — because eight signed deltas do not, on their own, name
a winner. The roll-up needs weights, and the weights are the decision.

The composition rule is the same one the scoring model documents, applied to the deltas:

```
Overall delta (A − B) = Σ ( weightᵢ × deltaᵢ )    over every dimension i
```

Using the §4 table (weights normalised to sum to 1.0):

```
(0.25 × +3)  Brand Fit          = +0.75
(0.15 × −13) Clarity            = −1.95
(0.20 × +17) Evidence Support   = +3.40
(0.20 ×  0)  Policy Fit         =  0.00
(0.10 × −8)  Readability        = −0.80
(0.10 × +12) Confidence         = +1.20
-------------------------------------------
Overall delta                   = +2.60  →  A > B
```

The point is not the number. The point is that **every term in that sum is visible.** A
reviewer can see that Evidence Support (+3.40) and Confidence (+1.20) outweighed B's leads on
Clarity (−1.95) and Readability (−0.80). Change the weights and the winner can change — and
that is *allowed*, because the weights are documented and the reviewer can argue with them.
What is never allowed is a weight the reviewer cannot see. A verdict produced by a hidden
weight is a verdict no one can audit, and an unauditable verdict is exactly what this document
forbids.

The real percentages may differ from the example, and may vary by client or format. The
principle does not: **no comparison verdict forms from a weight the human cannot inspect.**
The weights are part of the output, on equal footing with the deltas.

---

## 7. Honest tier — what ships, what is dormant, what is roadmap

**No comparison exists in code, and no comparison-explanation exists in code. Both are ❌
ROADMAP.** There is no A-versus-B function anywhere in the product, and therefore nothing that
renders a per-dimension delta table or rolls it up to a verdict. This document is a
specification for a capability that has not been built. It is stated plainly so no reader
mistakes the shape above for a shipping feature.

What *does* exist is the deterministic machinery a transparent comparison would reuse — and it
is **🔶 BUILT (UNWIRED)**: code and tests exist, but no live path reaches it.

- **Confidence** — `domains/executive-memory/src/reasoning.ts:82`. A pure function that turns
  evidence weight, breadth, and success into a 0–100 confidence. The Confidence dimension in a
  comparison table would be differenced from this. 🔶
- **Evidence weighting + sample size** — `domains/executive-memory/src/reasoning.ts:29-51`. The
  deterministic weighting that would produce the Evidence Support scores whose delta drives the
  worked example. 🔶
- **Pattern rank** — `domains/company-brain/src/pattern-library.ts:35`. A deterministic
  `evidence.value × confidence + reuseCount × 0.1` ranking. The nearest existing thing to
  ordering alternatives by evidence strength. 🔶

All three are pure deterministic math, which is precisely why a comparison built on them could
satisfy the reproducibility law (§5). But none of them runs when the app runs.

**The live-app bypass (the reason "🔶" and not "✅").** The live web application builds its AI
through `createAIManager` → `LiveAIManager` (`apps/web/src/ai-factory.ts:39`), which
**bypasses the entire runtime pipeline** where the scoring, confidence, and weighting engines
live. That pipeline and its engines are instantiated only in tests. So every primitive above is
dormant relative to the running product: real machinery, wired to nothing a user can reach.
Book E is honest about this — almost nothing that judges a *creative* is built today; what
exists is reusable machinery, waiting for the path that would connect it.

The build, therefore, is not "invent a comparison engine from scratch." It is: score two
creatives with the existing deterministic primitives, difference the scores per dimension,
attach the evidence and the documented weights, and render the result as the auditable table
of §4. The primitives are the hard part, and they are already written.

---

## 8. Reusing Book C's explanation discipline

The idea that a judgement must arrive as a *structured, inspectable record* rather than a
paragraph of persuasion is not new to Book E. It is Book C's whole contribution, and this
document deliberately reuses it rather than reinventing it.

Book C's explainability model defines the anatomy of an explanation for a *recommendation* — a
fixed chain of named parts, each traceable to an observed fact, so that "explained" means the
same thing on every screen. See
[`../../book-c/1-why-contract/EXPLAINABILITY_MODEL.md`](../../book-c/1-why-contract/EXPLAINABILITY_MODEL.md).
Book C's decision journal is the live surface that stores and renders such records for a human
reviewer. See
[`../../book-c/2-grounded-recommendation/DECISION_JOURNAL.md`](../../book-c/2-grounded-recommendation/DECISION_JOURNAL.md).

This document does **not** re-document either. It borrows their discipline and points it at a
different object:

- **Book C explains a *recommendation*** — "here is what I suggest, and the evidence,
  confidence, and rejected alternative behind it." One thing, justified.
- **Book E's comparison explains a *relationship between two creatives*** — "here is which one
  leads, and the per-dimension deltas, evidence, and documented weights behind that lead." Two
  things, differenced and justified.

The comparative framing is what Book E adds. Book C's explanation surfaces the *why* of a
single choice; the transparent comparison surfaces the *why* of a *ranking*. Where Book C names
the alternative it rejected, the comparison lays both alternatives side by side and shows every
axis on which they diverge. The record shape, the traceability requirement, and the "structured
record, not prose" rule are all inherited. Only the object under inspection changes.

Concretely, a comparison verdict is the kind of thing that would one day be written into the
same explainability surface Book C already ships — the difference between A and B recorded with
its deltas and evidence, so a reviewer reads a record instead of re-deriving the ranking.

---

## 9. Human-sovereign: the comparison informs, it never chooses

A transparent comparison exists to make a human's decision faster and more defensible. It does
not make the decision. This is not a limitation of the current build; it is the design.

The comparison surfaces a ranking and the full reasoning beneath it. A strategist reads the
table, sees that A leads on Evidence Support and Confidence while B leads on Clarity, and
decides — knowing this client, this campaign, this moment — which axis matters most today. The
tool cannot know that. It knows the evidence and the documented weights; it does not know the
account politics, the brand's current appetite for risk, or the conversation that happened in
the client meeting. The human does.

So the flow is fixed: **Creative Intelligence ranks alternatives; humans choose direction.**
The comparison hands the reviewer an ordered pair with its full justification and stops there.
Even a decisive verdict — "A > B, overall delta +2.60" — is an *input* to a human choice, never
the choice itself. And the first invariant sentence remains the ceiling on how much authority
the ranking can claim: **higher score does not guarantee better business outcome.** The stronger
comparison is the stronger *candidate*, not the guaranteed *winner in market*.

---

## 10. Boundaries

The transparent comparison lives inside the same fixed boundaries as the rest of Book E:

- **Book E produces no new data.** A comparison interprets, differences, and ranks the evidence
  Book D already recorded. It measures nothing new about the world. Every fact in a comparison
  table originated in the agency's own Performance Memory; the comparison only arranges and
  weighs it. **Book D is evidence; Book E is judgement — and judgement creates no facts.**
- **100% local, offline-first.** The comparison runs on the agency's own machine over the
  agency's own data. No cloud, no API, no telemetry, no external benchmark is consulted to
  decide that A beats B.
- **Copy-only.** The creatives compared are copy artifacts — headline, ad copy, CTA, social
  post, landing-page copy, email. There is no visual, video, or carousel artifact to compare;
  scoring or comparing those is out of scope against the copy-only boundary, not merely unbuilt.
- **Same-class only.** A comparison is valid only between same-class items (same vertical, same
  format). Comparing a finance email against an e-commerce social post produces a number, not a
  meaning. The sibling comparison document governs this integrity rule; this document assumes it.
- **Human-sovereign, suggests-never-decides.** The comparison informs a human choice and never
  substitutes for it. AdOS is the Enterprise AI Operating System for Advertising; the human
  remains the operator.

---

## 11. Value contribution

A creative debate settled by taste is slow and indefensible. Two strategists arguing "A feels
stronger" / "no, B" can burn an afternoon and still walk into the client meeting with nothing
but a preference. A transparent, evidence-backed *why* replaces that debate with a decision.

- **Reduces production time.** The team stops arguing about which creative is stronger and reads
  the table: A leads on Evidence Support and Confidence, B leads on Clarity, here are the deltas,
  here are the weights. The strongest candidate is picked fast, on visible grounds, instead of
  by the loudest voice. Comparison comes *before* optimization — the team knows how the options
  rank before anyone spends time changing one.
- **Increases and defends revenue.** A ranking that can show its work is a ranking an agency can
  defend to a client. "We chose A because it matched a hook pattern seen across 214 of your prior
  campaigns, and here is every dimension we weighed" is a sentence a generic content tool can
  never say. Defensible creative judgement is what an agency sells; a transparent comparison is
  the evidence that the judgement was earned, not guessed.

The value is not the verdict. The value is the *auditable reason* for the verdict — the thing
that turns a subjective creative argument into a fast, defensible decision, always with the
human choosing direction.

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
