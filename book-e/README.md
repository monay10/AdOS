# BOOK E — Creative Intelligence (the Judgement layer)

The layer where the intelligence spine becomes *judgement*. Book E **scores** creatives,
**compares** them, suggests **optimizations**, measures **quality**, and **benchmarks** — all as
transparent, reproducible judgement over evidence supplied by Book D.

> **Book D = Evidence → Book E = Judgement.** **Book E never produces new data** — it only
> interprets, scores, ranks, and compares.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book E is a **design
> & architecture specification**, not a claim of shipped capability. Every capability is tagged
> **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as
> shipped.
>
> **Start here:**
> [`1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md`](1-creative-scoring/CREATIVE_INTELLIGENCE_CONSTITUTION.md)
> — the governing laws of judgement.

---

## Where Book E sits

| Book | Question it answers |
|---|---|
| A — Agency | What is the agency workflow? |
| B — Factory | What should we **produce**? |
| C — Campaign Intelligence | **Why** this? |
| D — Performance Memory | **What happened** before? |
| **E — Creative Intelligence** | **Which is better?** *(this book)* |

Together, A–E answer the **four questions** on one spine — *evidence → judgement → human
decision* — turning AdOS from a content generator into **evidence-based creative decision
support**.

## The governing laws

1. **Judgment Separation** — Evidence ≠ Judgement. "214 campaigns → CTR 5.2%" is evidence; "this
   hook is better" is judgement. Book E makes *how* the judgement is produced transparent.
2. **Judgment is Reproducible** — Same Evidence + Same Rules + Same Heuristics = Same Score.
3. **A score is never an LLM opinion** — always Evidence + Rules + Heuristics.
4. **Score is Multi-Dimensional** — Overall → Brand Fit · Policy Fit · Clarity · Readability ·
   Specificity · Persuasiveness · Evidence Support · Confidence.
5. **No Hidden Weights** — the composition weights are documented.
6. **Comparison Before Optimization** — Evidence → Score → Comparison → Optimization.
7. **Suggestion ≠ Automatic Rewrite** — AI suggests; the human decides; always.
8. **Benchmark Integrity** — only same-class items are compared (Finance↔Finance, B2B↔B2B).

> **Higher score does not guarantee better business outcome.**
> **Creative Intelligence ranks alternatives; humans choose direction.**

## The five parts

| Part | What it covers |
|---|---|
| [`1-creative-scoring/`](1-creative-scoring/) | **Scoring** — the reproducible, multi-dimensional, no-hidden-weights model |
| [`2-comparative-intelligence/`](2-comparative-intelligence/) | **Comparison** — A vs B, same-class, with the work shown |
| [`3-optimization-suggestions/`](3-optimization-suggestions/) | **Suggestions** — "change X → to Y → because Z", never auto-rewrite |
| [`4-creative-quality/`](4-creative-quality/) | **Quality** — deterministic dimensions; Brand Fit & Policy Fit have code |
| [`5-creative-benchmarking/`](5-creative-benchmarking/) | **Benchmarking** — You vs Agency (own data); the four questions |

Each part has its own `README.md`, a validation report (all **✅ PASS**), and a release. The
flagship summary is [`BOOK_E_RELEASE.md`](BOOK_E_RELEASE.md).

## The honest baseline

Book E is candid that **almost nothing that judges a creative is built today.** No code scores,
compares, or suggests on a creative; the only live scoring is a per-client mean ROAS. But the
**Evidence + Rules + Heuristics machinery all exists — unwired**: pattern rank, confidence,
sample-size weighting, EMA, and the deterministic RegexSafetyEngine + ConstitutionChecker — all
🔶 behind the LiveAIManager bypass. Book E is the code-grounded blueprint for turning that dormant
machinery into transparent creative judgement. Its most shippable piece: **Brand Fit & Policy
Fit**, which already have real (unwired) code.

## Inviolable boundaries

**100% local** · **copy only** · **no external data / no external benchmarks** · **no vendor
telemetry** (own data only) · **human-sovereign** (suggests, never auto-rewrites).

## The one thing to remember

> *Creative Intelligence ranks alternatives; humans choose direction.*

Book E is judgement, made transparent and reproducible — evidence first, then judgement, then the
human's decision.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
