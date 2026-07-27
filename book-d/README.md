# BOOK D — Performance Memory (the company's Evidence Base)

The book that makes the Company Brain **actually live**. Book D builds the machinery to
**record** every finished campaign, **aggregate** that history, form evidence-based
**recommendations** from the aggregate, and **maintain** the memory over time.

> **The AI never learns. The company accumulates memory.** The AI never says *"I learned"*; it
> says *"Based on the results of the last N campaigns…"*.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). Book D is a **design
> & architecture specification**, not a claim of shipped capability. Every capability is tagged
> **✅ SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as
> shipped. **No new AI is created in Book D** — it only builds the memory.
>
> **Start here:**
> [`1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md)
> — the four governing laws.

---

## Where Book D sits

| Book | Question it answers |
|---|---|
| A — Agency | What is the agency domain? |
| B — Factory | How does the AI **produce**? |
| C — Campaign Intelligence | Why did the AI **recommend** this? |
| **D — Performance Memory** | How does the **company remember** — and get better? *(this book)* |
| E — Creative Intelligence | How does the AI produce **better**? |

Book C closed the **read/explain** side of the learning gap; Book D closes the
**write/accumulate** side. Together they make the Company Brain a two-way loop.

## The four governing laws

1. **Memory is Evidence, not Knowledge** — memory stores facts (CTR, ROAS, Hook, Day), never
   conclusions. *"Video is always better"* is an interpretation, made later by Book C or the
   Recommendation Engine — never by the memory.
2. **Raw → Aggregate → Recommendation** — three mandatory layers; never Campaign →
   Recommendation. The aggregation layer is AdOS's core IP.
3. **Sample Size Rule** — every recommendation carries **Sample Size · Confidence · Evidence
   Age**, so no one mistakes one lucky campaign for a generalization.
4. **Freshness Before Frequency** — recent evidence is not automatically devalued by a larger
   pile of old evidence; ranking blends sample size, recency, and sector/campaign similarity.

**The pipeline:** Campaign → Performance Record → Pattern → Evidence → Recommendation → Human →
Next Campaign.

## The five parts

| Part | What it covers |
|---|---|
| [`1-campaign-recording/`](1-campaign-recording/) | **Raw** — what a Performance Record is, and the shipped write fan-out |
| [`2-pattern-discovery/`](2-pattern-discovery/) | **Aggregate** — summarizing history into reusable, sample-sized evidence (core IP) |
| [`3-recommendation-engine/`](3-recommendation-engine/) | **Recommendation** — interpreting the aggregate; the human decides |
| [`4-memory-maintenance/`](4-memory-maintenance/) | **Maintenance** — merge, version, decay, freshness, archive, durability |
| [`5-performance-intelligence/`](5-performance-intelligence/) | **Payoff** — "based on N campaigns", memory metrics, the compounding promise |

Each part has its own `README.md`, a validation report (all **✅ PASS**), and a release. The
flagship summary is [`BOOK_D_RELEASE.md`](BOOK_D_RELEASE.md).

## The honest baseline

The write pipes are **real and shipping**: every completed campaign fans out to the Decision
Journal, Executive Memory, Experience Engine, Pattern Library, and Knowledge Graph. But the
record is **thin** (only ROAS/ROI/CTR + channel strings + vertical), the aggregation layer is
**built but never populated**, nothing accumulated is **read back** into generation, and the
derived memory is **volatile in-memory even in production** — only KPI reports persist. Book D
is the code-grounded blueprint for turning those pipes into a memory that compounds.

## Inviolable boundaries

**100% local** · **copy only** · **no external data / no external benchmarks** · **no vendor
telemetry** (own data only) · **human-sovereign** (never auto-approves).

## The one thing to remember

> *The value of Performance Memory compounds only through accumulated, attributable, and
> reviewable campaign evidence.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
