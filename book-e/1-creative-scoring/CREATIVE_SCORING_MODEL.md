# Creative Scoring Model

> **Single source of truth:** [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md). This is a
> **design & architecture specification**. Every capability is tagged **✅ SHIPPED**, **🔶
> BUILT (UNWIRED)**, or **❌ ROADMAP**; nothing unbuilt is claimed as shipped. Governing
> document: [`./CREATIVE_INTELLIGENCE_CONSTITUTION.md`](./CREATIVE_INTELLIGENCE_CONSTITUTION.md).
>
> **Laws:** *Evidence ≠ judgement · judgement is reproducible · a score is never an LLM opinion
> · higher score does not guarantee better business outcome · Creative Intelligence ranks
> alternatives, humans choose direction.*

---

## 1. What this document defines

This document defines **how a Creative Score is built** — the composite. It is the assembly
manual: what a score is made of, why it must be reproducible, how the Overall decomposes into
named dimensions, and how each dimension's weight is documented rather than hidden.

It does **not** re-derive how each individual dimension is measured. Per-dimension measurement
lives in Part 4:

- Quality dimensions (Clarity, Readability, Specificity, Persuasiveness, and the rest of the
  copy-quality metrics) — [`../4-creative-quality/CREATIVE_QUALITY_MODEL.md`](../4-creative-quality/CREATIVE_QUALITY_MODEL.md).
- Brand Fit and Policy Fit (the two dimensions that already have deterministic offline code) —
  [`../4-creative-quality/BRAND_AND_POLICY_FIT.md`](../4-creative-quality/BRAND_AND_POLICY_FIT.md).

This document is the layer above those: given per-dimension results, **how do they combine into
one transparent, reproducible, multi-dimensional Creative Score?**

Two sentences govern everything that follows, and they are stated here in full because they are
the boundary of the whole exercise:

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

A score is a decision-support artifact. It orders options and exposes its reasoning. It never
makes the call.

---

## 2. The core equation: Evidence + Rules + Heuristics

A Creative Score is built from three ingredients and nothing else:

```
Creative Score = f(Evidence, Rules, Heuristics)
```

- **Evidence** — observed facts from the agency's own Performance Memory. "214 campaigns in this
  vertical averaged CTR 5.2%." Evidence is measured, not asserted. Book E produces no new
  evidence; it consumes what Book D has already aggregated (see §9).
- **Rules** — explicit, documented constraints. "Banned words fail Policy Fit." "Confidence below
  the minimum caps the Overall." Rules are written down; anyone can read them and predict the
  outcome.
- **Heuristics** — documented deterministic formulas that convert evidence into a bounded number.
  A pattern-rank formula, an exponential moving average, a sample-size weighting. Each heuristic
  is a fixed arithmetic expression, not a learned black box.

**A Creative Score is NEVER an LLM opinion.** There is no step in which a language model is asked
"rate this headline out of 10." The model's job, elsewhere in the product, is to *produce* copy.
Judging that copy is a separate, transparent, arithmetic activity. This is the third governing
law, stated plainly:

> **Law — Score is never an LLM opinion.** Every score is built from Evidence + Rules +
> Heuristics — never "the model thinks it's an 8/10."

### 2.1 Why not just ask the model?

Asking a model for a rating is fast and feels intelligent. It fails three tests that matter to an
agency defending its work to a client:

1. **It is not reproducible.** The same headline can score 7 one minute and 8 the next, because a
   generative model samples. There is no stable number to stand behind.
2. **It is not inspectable.** "Why 8?" has no answer beyond "the model said so." An agency cannot
   defend a media decision with that.
3. **It is not separable from taste.** The model's rating folds evidence, style preference, and
   training bias into one opaque digit. Book E's entire purpose is to keep **evidence** and
   **judgement** separate so the judgement can be audited.

Deterministic math over real evidence passes all three. That is why the scoring engine is
arithmetic, not a prompt.

---

## 3. Reproducibility: the most important property

> **Law — Judgement is reproducible.** Same Evidence + Same Rules + Same Heuristics = Same Score.
> A score is deterministic — never random, never dependent on a model's momentary mood.

Reproducibility is not a nice-to-have. It is the property that makes a score usable as evidence in
a client conversation, in an internal review, and in an audit six months later.

### 3.1 What determinism guarantees

Given the exact same inputs — the same copy artifact, the same Book D aggregates, the same
documented rules and weights — the scorer must return **the identical number, every time, on every
machine, forever**. No sampling. No temperature. No wall-clock. No network. No hidden model call.

```
score(creative, evidence, rules, heuristics) → x
score(creative, evidence, rules, heuristics) → x   // always, byte-for-byte
```

The moment any input changes — a new campaign lands in Book D, a rule is edited, a weight is
re-documented — the score is *expected* to move, and the change is explainable by pointing at
exactly which input moved. That is the difference between a system that drifts and a system that
learns transparently.

### 3.2 Why an agency needs this

- **Defensibility (revenue).** "Variant B scored higher on Evidence Support because 214 comparable
  campaigns backed its angle" is a sentence an account lead can say to a client. "The AI liked it
  more" is not.
- **Consistency (production time).** Re-scoring the same variant next week does not silently
  reshuffle the ranking. The team is not re-litigating yesterday's decision.
- **Auditability.** When a decision is questioned, the inputs are re-run and the number reproduces.
  Nothing to reconstruct from memory.

### 3.3 How determinism is actually achieved

By construction, the scoring machinery is pure arithmetic over fixed inputs. Every primitive Book E
reuses is deterministic:

- Exponential moving average: `prior * (1 - α) + reward * α` — a fixed formula
  (`packages/ai-manager/src/runtime/learning.ts:49`).
- Confidence: `0.5*avgWeight + 0.2*breadth + 0.3*success`, bounded 0–100
  (`domains/executive-memory/src/reasoning.ts:82`).
- Sample-size weighting: `min(1, n/100)`
  (`domains/executive-memory/src/reasoning.ts:101`).
- Pattern rank: `evidence.value*confidence + reuseCount*0.1`, sorted descending
  (`domains/company-brain/src/pattern-library.ts:35`).

None of these call a model. None of them read the clock or a random source. Feed them the same
numbers and they return the same numbers. That is the mechanical guarantee behind Law 2.

**Tier:** the primitives above are **🔶 BUILT (UNWIRED)** — the code and its tests exist, but no
live path reaches them (see §8). The *composite creative scorer* that assembles them is **❌
ROADMAP** (see §7).

---

## 4. The multi-dimensional model

> **Law — Score is Multi-Dimensional.** No single "87/100." The Overall decomposes into named
> dimensions, each shown separately.

A single number hides more than it reveals. "87" cannot tell a strategist whether a headline is
brilliant but borderline on policy, or safe but forgettable. So the Creative Score is never
presented as one digit. It is an Overall that **decomposes** into named dimensions, each displayed
on its own.

```
Overall
  ├── Brand Fit
  ├── Policy Fit
  ├── Clarity
  ├── Readability
  ├── Specificity
  ├── Persuasiveness
  ├── Evidence Support
  └── Confidence
```

### 4.1 The dimensions

| Dimension | What it answers | Built from | Measured in |
|---|---|---|---|
| **Brand Fit** | Does this sound like *this* brand's voice and honour its dos/donts? | Brand voice + banned-words data, documented rules | Part 4 · `BRAND_AND_POLICY_FIT.md` |
| **Policy Fit** | Does it pass offline safety/compliance checks (PII, secrets, forbidden words)? | Deterministic regex safety + constitution rules | Part 4 · `BRAND_AND_POLICY_FIT.md` |
| **Clarity** | Is the message unambiguous — one idea, cleanly stated? | Deterministic copy metrics | Part 4 · `CREATIVE_QUALITY_MODEL.md` |
| **Readability** | Can the target audience read it effortlessly? | Deterministic readability metrics | Part 4 · `CREATIVE_QUALITY_MODEL.md` |
| **Specificity** | Concrete claims and numbers vs vague filler? | Deterministic copy metrics | Part 4 · `CREATIVE_QUALITY_MODEL.md` |
| **Persuasiveness** | Does the structure carry a hook, value, and ask? | Deterministic copy metrics | Part 4 · `CREATIVE_QUALITY_MODEL.md` |
| **Evidence Support** | How much real performance data backs this angle? | Book D aggregates + pattern rank | §9 · Book D |
| **Confidence** | How much should we trust this score given sample size and breadth? | Sample-size + breadth heuristics | §9 · this doc |

Each dimension is scored, displayed, and defended **on its own axis**. A creative can be strong on
Persuasiveness and weak on Evidence Support at the same time, and the reader sees both — not an
average that erases the tension.

### 4.2 The Overall is a documented roll-up, not a black box

The Overall exists only as a **weighted combination of the dimensions above**, using weights that
are written down. It is a convenience for ranking, never a replacement for the decomposition. The
dimensions are always shown alongside it. This matters for the next law.

---

## 5. No hidden weights

> **Law — No Hidden Weights.** The weights that compose a score are documented. Real percentages
> may change; the principle never does — no score forms from hidden weights.

If the Overall is a weighted sum, then the weights *are* the editorial policy of the scorer. Hiding
them would hide the judgement. So they are published.

### 5.1 A documented example weight table

The following is an **illustrative, documented** weight set. The real percentages in a shipped
scorer may differ — but whatever they are, they will be published exactly like this, never buried
in code no one reads.

| Dimension | Example weight |
|---|---|
| Brand Fit | 25% |
| Evidence Support | 20% |
| Policy Fit | 20% |
| Clarity | 15% |
| Readability | 10% |
| Confidence | 10% |
| **Total** | **100%** |

Read this as: `Overall = 0.25·BrandFit + 0.20·EvidenceSupport + 0.20·PolicyFit + 0.15·Clarity +
0.10·Readability + 0.10·Confidence`. Every coefficient is visible. Anyone can reproduce the Overall
by hand from the dimension scores.

> The remaining named dimensions (Specificity, Persuasiveness) may enter the Overall in a shipped
> configuration or be shown as standalone diagnostics; whichever it is, the published weight table
> is the authority. The rule is not "these exact numbers" — it is **"whatever the numbers are, they
> are on the page."**

### 5.2 Policy Fit is a gate, not just a weight

One documented rule overrides the weighted sum: a **Policy Fit failure caps the Overall**. A
creative that trips a banned-word or PII rule cannot be rescued by a high Persuasiveness score. The
gate is itself a documented rule (Evidence + Rules + Heuristics), so it does not violate
transparency — it is written here, in the open.

### 5.3 Confidence conditions the Overall

`Confidence` is unusual: it does not describe the *creative*, it describes the *score's own
trustworthiness*. When the backing evidence is thin (small sample size, narrow breadth), Confidence
is low, and a low Confidence is a documented signal to treat the Overall as provisional. This is how
the model stays honest about how much it knows — the same discipline Book D applies to its
aggregates.

---

## 6. Per-element scoring against the copy-only artifact

Scoring is applied to a **real artifact**, and in AdOS that artifact is **copy only**.

The creative artifact is `CreativeContent` — six copy outputs of a sprint:
`headline, adCopy, cta, socialPost, landingPage{headline,body,cta}, email{subject,body}`
(`domains/creative-studio/src/creative/creative-set.ts:43-50`). The service that produces it is
explicit: it **"Produces copy ONLY"** (`domains/creative-studio/src/creative/service.ts:26`), with
a text-only schema (`service.ts:10-21`). It runs live as `CreativeStudioService`
(`apps/web/src/app.ts:85`).

So the "elements" a strategist thinks of map onto the six copy fields:

| Scoring element | Maps to copy field | Tier |
|---|---|---|
| Headline | `headline` | copy artifact exists ✅; scoring ❌ (see §7) |
| Hook / Primary Text | `adCopy` / `socialPost` | copy artifact exists ✅; scoring ❌ |
| CTA | `cta` (and `landingPage.cta`, `email` subject/body) | copy artifact exists ✅; scoring ❌ |
| Landing Angle | `landingPage` (`headline` + `body`) | copy artifact exists ✅; scoring ❌ |
| Offer | expressed *within* the copy (headline/body/email) | copy artifact exists ✅; scoring ❌ |
| **Visual** | — | **❌ against the copy-only boundary** |
| **Video** | — | **❌ against the copy-only boundary** |
| **Carousel** | — | **❌ against the copy-only boundary** |

### 6.1 Visual, Video, and Carousel scoring are out of scope by boundary

There is **no visual, video, carousel, or image artifact anywhere in the product**. Scoring them is
not merely unbuilt — it is **❌ against the copy-only boundary**. A scorer cannot evaluate an object
the system does not produce. This is a design boundary, not a backlog item: AdOS is a copy-only,
100%-local, offline product, and creative scoring lives inside that boundary.

When this document says a per-element score exists as a *possibility*, it always means a score over
one of the six copy fields — never over a rendered visual.

---

## 7. Honest tier: the model is roadmap, the machinery is built

Book E is honest about what runs today. Two facts set the tier for creative scoring.

**Fact 1 — nothing scores a creative today.** The `CreativeSet` has **no score field and no scoring
method** (`domains/creative-studio/src/creative/creative-set.ts:86`). No code path takes a
`CreativeSet` and returns a Creative Score. Therefore:

> **Creative scoring is ❌ ROADMAP.**

There is no `path:line` for "score a creative," because there is no such code. Book E does not
pretend otherwise.

**Fact 2 — the reusable machinery already exists, deterministic and tested.** The Evidence + Rules +
Heuristics primitives that a creative scorer would assemble are **🔶 BUILT (UNWIRED)**:

| Primitive | Formula | Citation | Tier |
|---|---|---|---|
| Pattern rank | `evidence.value*confidence + reuseCount*0.1`, sort desc | `domains/company-brain/src/pattern-library.ts:35` | 🔶 |
| Confidence | `0.5*avgWeight + 0.2*breadth + 0.3*success` → 0–100 | `domains/executive-memory/src/reasoning.ts:82` | 🔶 |
| Evidence + sample-size weighting | weighting logic | `domains/executive-memory/src/reasoning.ts:29-51` | 🔶 |
| Confidence from sample | `min(1, n/100)` | `domains/executive-memory/src/reasoning.ts:101` | 🔶 |
| Learning EMA | `prior*(1-α) + reward*α` | `packages/ai-manager/src/runtime/learning.ts:49` | 🔶 |

Each is pure deterministic math (satisfying Law 2), and each is already covered by tests. What is
missing is the wiring: an assembler that reads the six copy fields, pulls Book D evidence, runs
these formulas per dimension, applies the documented weights, and returns a decomposed Creative
Score. **That assembler is the build.**

> **Tier summary:** the *creative scoring model* is **❌ ROADMAP** for creatives; the *machinery*
> it is built from is **🔶 BUILT (UNWIRED)**.

---

## 8. Why the machinery is UNWIRED: the LiveAIManager bypass

The primitives above are tagged 🔶 and not ✅ for one structural reason.

The live web app builds its AI through `createAIManager` → `LiveAIManager`
(`apps/web/src/ai-factory.ts:39`, `apps/web/src/main.ts:43`). `LiveAIManager` **bypasses the entire
runtime pipeline** — the `AIManager` where the scoring, safety, and reasoning machinery is
instantiated. That pipeline and its engines are wired up **only in tests**.

The practical consequence: every judgement primitive this document relies on is **🔶 relative to
the live app**. The formulas run in the test suite; they do not run when a user opens AdOS. Book E
is deliberately honest about this — almost nothing that judges a *creative* is reachable in the live
product today. What exists is **reusable machinery, dormant behind the bypass**, waiting to be
wired into a creative scorer.

This is why the build is small in code and large in value: the arithmetic already exists and is
tested; the work is to route a copy artifact through it and surface the decomposed score.

---

## 9. Evidence comes from Book D — this book produces none

> **Book D = Evidence → Book E = Judgement. Book E NEVER produces new data.**

Two of the eight dimensions — **Evidence Support** and **Confidence** — draw directly on the
agency's Performance Memory. That data is **not** created here. It is produced and aggregated by
Book D and consumed read-only by Book E.

- **Evidence Support** is a function of Book D performance aggregates: how many comparable campaigns
  back this creative's angle, and how strongly. It feeds the pattern-rank heuristic
  (`domains/company-brain/src/pattern-library.ts:35`) whose `evidence.value` term is a Book D
  aggregate.
- **Confidence** is a function of the *volume and breadth* of that same evidence, via the
  sample-size heuristic `min(1, n/100)` (`domains/executive-memory/src/reasoning.ts:101`) and the
  0.5/0.2/0.3 confidence formula (`domains/executive-memory/src/reasoning.ts:82`). A thin Book D
  produces low Confidence — the score says so, out loud.

For how those aggregates are computed (per-vertical ROAS/CTR, sample sizes, breadth), see
[`../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md`](../../book-d/2-pattern-discovery/PERFORMANCE_AGGREGATIONS.md).

The remaining six dimensions (Brand Fit, Policy Fit, Clarity, Readability, Specificity,
Persuasiveness) are computed from the copy artifact itself plus documented brand/policy data — they
do not consume Book D aggregates, and they too produce no new stored data. Scoring reads; it does
not write back a new dataset.

---

## 10. Boundaries

The scoring model lives inside AdOS's product boundaries, and it does not stretch them:

- **100% local, offline-first.** Scoring is arithmetic on-device. No cloud, no API call, no
  telemetry, no external benchmark feed. A score is computable with the network cable pulled.
- **Copy-only.** The artifact is the six copy fields. Visual/Video/Carousel scoring is ❌ against
  the copy-only boundary (§6.1), not a pending feature.
- **No new data.** Book E interprets Book D evidence; it never produces new performance data (§9).
- **Human-sovereign.** A score ranks; it never decides, never auto-acts. The model surfaces a
  decomposed number and the evidence behind it, and stops. The strategist chooses.
- **No external benchmarks.** Evidence is the agency's own history. Sector/global comparison is out
  of scope under the no-external-data boundary.

---

## 11. Value contribution

Transparent, reproducible creative judgement changes two numbers an agency cares about:

- **Revenue.** A decomposed, evidence-backed score is defensible in front of a client. "This
  variant scored higher on Evidence Support — 214 comparable campaigns back its angle — and passed
  every Policy Fit gate" wins a media argument that "the AI preferred it" loses. Defensible
  judgement protects and grows the account.
- **Production time.** A reproducible ranking lets a team pick the strongest option **fast**,
  instead of re-debating by taste every review. Same inputs, same order, no re-litigation. Hours of
  opinion-trading collapse into a glance at the dimensions.

Both gains are bounded by the same discipline: the score ranks alternatives, and a human chooses
direction — every time.

---

## 12. Summary

- A Creative Score = **Evidence + Rules + Heuristics** — **never an LLM opinion** (Law 3).
- It is **reproducible**: same inputs → same score, guaranteed by deterministic arithmetic, not a
  model call (Law 2).
- It is **multi-dimensional**: Overall decomposes into Brand Fit · Policy Fit · Clarity ·
  Readability · Specificity · Persuasiveness · Evidence Support · Confidence, each shown separately
  (Law 4).
- Its weights are **documented, never hidden** (Law 5) — with Policy Fit acting as a documented
  gate and Confidence conditioning trust.
- It scores the **copy-only** artifact's six fields; **Visual/Video/Carousel scoring is ❌** against
  the copy-only boundary.
- **Creative scoring is ❌ ROADMAP** today (`CreativeSet` has no score field,
  `creative-set.ts:86`); the deterministic **machinery is 🔶 BUILT (UNWIRED)** behind the
  `LiveAIManager` bypass. Wiring it into a scorer is the build.
- Evidence for the Evidence Support and Confidence dimensions comes from **Book D**; Book E produces
  no new data.

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
