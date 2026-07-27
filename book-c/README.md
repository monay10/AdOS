# BOOK C — Campaign Intelligence (AdOS's Trust Layer)

The layer that answers one question, honestly:

> **"Why did the AI recommend this?"**

Book C turns AdOS from a system that *produces* recommendations into one that can **explain
every recommendation using the agency's own campaign memory** — evidence, confidence,
alternatives, and provenance, with the human always holding the pen.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book C is a
> **design & architecture specification**, not a claim of shipped capability. Every
> capability is tagged **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing
> unbuilt is claimed as shipped.
>
> **Start here:**
> [`1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md)
> — the four governing laws that bind the whole book.

---

## Where Book C sits

| Book | Question it answers |
|---|---|
| A — Agency | What is the agency domain? |
| B — Factory | **How** does the AI produce? |
| **C — Campaign Intelligence** | **Why** did the AI recommend this? *(this book)* |
| D — Performance Memory | How does the AI **learn**? |
| E — Creative Intelligence | How does the AI produce **better**? |

Book C is the **read/explain side of the learning loop**; Book D will build the write/learn
side. The two together close the gap where AdOS's Company Brain is write-only today.

## The four governing laws

1. **Evidence First Law** — no output is a "recommendation" unless it can show evidence:
   Recommendation → Evidence → Confidence → Alternatives → Decision. Never "the LLM said so."
2. **Confidence ≠ Truth** — confidence is the system's belief; truth is the real outcome.
   Closing the gap over time is **Book D's** job.
3. **Explainability Contract** — the 8-field minimum every AI output must one day render
   (Recommendation / Why? / Evidence / Confidence / Alternative considered / Brand rules
   checked / Memory consulted / Human action required) — the future UI standard.
4. **Evidence is descriptive, not prescriptive** — past data informs but never forces.

## The three parts

| Part | What it covers |
|---|---|
| [`1-why-contract/`](1-why-contract/) | **What an explanation is** — the laws, the anatomy, the evidence engine, the confidence model |
| [`2-grounded-recommendation/`](2-grounded-recommendation/) | **The "because"** — the shipped journal, per-sector performance evidence, trade-offs, faithful explanation |
| [`3-provenance-and-trust/`](3-provenance-and-trust/) | **Making it trustworthy** — provenance, the enforcement gate, and intelligence metrics |

Each part has its own `README.md`, a validation report (all **✅ PASS**), and a release. The
flagship summary is [`BOOK_C_RELEASE.md`](BOOK_C_RELEASE.md).

## The honest baseline

AdOS already ships a real explainability surface: the **Decision Journal** records a
decision's evidence, confidence, and alternatives, reads them back, and renders them on the
mission detail page. And the true grounded-reasoning engines — `BrainEvidenceEngine`,
`HeuristicConfidenceEngine`, `ConstitutionChecker`, and a per-sector CTR/ROAS-over-N rollup
(the "+18% CTR in finance over 183 campaigns" primitive) — **already exist in the codebase,
unit-tested but unwired.** Book C is the code-grounded blueprint for turning those pieces
into a trustworthy Trust Layer.

## Inviolable boundaries

**100% local** · **copy only** · **no external data** (no connectors/crawlers/benchmarks) ·
**no vendor telemetry** (own data only) · **human-sovereign** (never auto-approves).

## The one thing to remember

> *AdOS does not just produce recommendations; it can explain every one using its own
> campaign memory.*

That is the strongest technical and commercial line that separates AdOS from generic,
prompt-and-pray LLM tools — and Book C is how it becomes true.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
