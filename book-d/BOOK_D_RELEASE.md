# BOOK D — Performance Memory — Release (the company's Evidence Base)

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — all 5 parts validated PASS, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

Book D builds the **company's Performance Memory** — the design & architecture of the system
that records every finished campaign, aggregates that history, forms evidence-based
recommendations from the aggregate, and maintains the memory over time.

> **The AI never learns. The company accumulates memory.** It never says *"I learned"*; it says
> *"Based on the results of the last N campaigns…"*. **No new AI is created in Book D.**

Book D is **documentation only** and scrupulously honest: every capability is tagged **✅
SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as shipped.

---

## 1. The four governing laws

| Law | Statement |
|---|---|
| **Memory is Evidence, not Knowledge** | Memory stores facts, never conclusions; interpretation happens later (Book C / the Recommendation Engine). |
| **Raw → Aggregate → Recommendation** | Three mandatory layers; never Campaign → Recommendation. The aggregation layer is core IP. |
| **Sample Size Rule** | Every recommendation carries Sample Size · Confidence · Evidence Age. |
| **Freshness Before Frequency** | Recent evidence isn't devalued by a bigger pile of old evidence; rank by sample size + recency + sector/campaign similarity. |

**Pipeline:** Campaign → Performance Record → Pattern → Evidence → Recommendation → Human →
Next Campaign.

## 2. The three tiers (the spine)

| Tier | Meaning |
|---|---|
| **✅ SHIPPED** | Runs in the live app today; cited to wired code. |
| **🔶 BUILT (UNWIRED)** | Code exists and is unit-tested, but no running path reaches it. Wiring it is Book D build work. |
| **❌ ROADMAP** | No implementation; pure specification. |

Global truth: the live app uses `OfflineAIManager`/`LiveAIManager`, not the runtime pipeline
(`AIRuntimeManager` is test-only). Brain/journal/executive-memory are **in-memory and volatile
even in production** ([app.ts:89](../apps/web/src/app.ts#L89)); only KPI *reports* persist. And
nothing accumulated flows back into a live generation path today.

## 3. The five parts

| Part | Directory | Content docs | ~Lines | Layer |
|---|---|---|---|---|
| 1 · Campaign Recording | [`1-campaign-recording/`](1-campaign-recording/) | 3 | ~1,280 | Raw |
| 2 · Pattern Discovery | [`2-pattern-discovery/`](2-pattern-discovery/) | 2 | ~818 | Aggregate |
| 3 · Recommendation Engine | [`3-recommendation-engine/`](3-recommendation-engine/) | 2 | ~773 | Recommendation |
| 4 · Memory Maintenance | [`4-memory-maintenance/`](4-memory-maintenance/) | 3 | ~1,168 | Maintenance |
| 5 · Performance Intelligence | [`5-performance-intelligence/`](5-performance-intelligence/) | 3 | ~1,177 | Payoff |

**13 content documents + 5 part-validations + 5 part-releases + 6 READMEs = 29 documents.**
Each part carries its own validation (all **PASS**) and release.

## 4. What is ✅ SHIPPED today (the honest baseline)

- **The recording fan-out** — every completed campaign writes to the Decision Journal
  ([routes.ts:1118](../apps/web/src/routes.ts#L1118)), Executive Memory ([:1136](../apps/web/src/routes.ts#L1136)),
  Experience Engine ([:1146](../apps/web/src/routes.ts#L1146)), Pattern Library
  ([:1156](../apps/web/src/routes.ts#L1156)), and Knowledge Graph
  ([:1165](../apps/web/src/routes.ts#L1165)).
- **The Knowledge Graph property-merge** — a real live merge on write
  ([knowledge-graph.ts:17](../domains/company-brain/src/knowledge-graph.ts#L17)).
- **Stored timestamps** on memory entries (freshness *data*).
- **Durable campaign reports** — persisted to Postgres when a database is configured
  ([repositories.ts:193](../apps/web/src/db/repositories.ts#L193)).

## 5. The 🔶 spine Book D wires (already coded, dormant)

Sample-weighted rollups `mergeMarketing`/`mergeSop`
([in-memory-company-brain.ts:100](../domains/company-brain/src/in-memory-company-brain.ts#L100));
Pattern ranking `bestFor` ([pattern-library.ts:18](../domains/company-brain/src/pattern-library.ts#L18));
the evidence/context engines ([reasoning.ts:14](../domains/executive-memory/src/reasoning.ts#L14),
[context-builder.ts:37](../domains/executive-memory/src/context-builder.ts#L37)); EMA recency
weighting ([learning.ts:49](../packages/ai-manager/src/runtime/learning.ts#L49)); Prompt Registry
versioning ([in-memory-prompt-registry.ts:79](../domains/prompt-registry/src/in-memory-prompt-registry.ts#L79)).

## 6. What is ❌ ROADMAP

The richer Performance Record (hook/audience/offer/creative/season/…, and CPM which isn't even
computed); grouping keys beyond `vertical`; history-aggregating "best X" discovery; recommendation
and read-back reaching a live path; freshness scoring; archive/eviction; and **durable persistence
for the memory stores** — the foundational prerequisite for the memory to compound across restarts.

## 7. The deferred value proposition (roadmap only — PRODUCT_TRUTH.md unchanged)

Once Book D's capabilities actually ship, the product value proposition may move from *"Enterprise
AI Operating System for Advertising"* to:

> *The Enterprise AI Operating System that remembers every campaign, explains every
> recommendation, and continuously improves future campaigns using organizational performance
> memory.*

This is held as a **❌ ROADMAP target gated on real implementation**. **PRODUCT_TRUTH.md is not
changed** by Book D — reality first, then marketing. As each capability ships, its tier moves ✅
and PRODUCT_TRUTH.md is updated to match, never ahead.

## 8. Inviolable boundaries (held across all 5 parts)

- **100% local** — no cloud, no API keys, no per-token billing; durable storage is local
  Postgres, not cloud.
- **Copy only** — no image/vision/speech.
- **No external data / benchmarks** — evidence is the agency's own campaign history.
- **No vendor telemetry** — all metrics are own-data.
- **Human-sovereign** — recommendations are advisory; AdOS never auto-approves.

## 9. Validation

All five part-validation reports record **PASS** across the four laws, three-tier discipline,
code-citation accuracy, the vocabulary law, boundary discipline, Book A/B/C/D/E separation, the
deferred-value-prop framing (PRODUCT_TRUTH.md confirmed untouched), and documentation-only hygiene.
Every cross-reference across the 29 documents resolves; the forbidden legacy label "Advertising
Operating System" appears nowhere as a product name.

## 10. What comes next

Book D is the blueprint; **building it is engineering work governed by `../PRODUCT_TRUTH.md` and
`../bizops/RELEASE_GOVERNANCE.md`.** The natural build order: make the memory stores durable →
wire the aggregation (`enrich`/rollups) → wire read-back into recommendation → surface attribution
→ add freshness scoring and archive. **Book E — Creative Intelligence** builds its optimization on
the freshness/similarity foundation Book D lays down.

---

## 11. Governance

[`1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md`](1-campaign-recording/PERFORMANCE_MEMORY_CONSTITUTION.md)
is binding on every Book D artifact. Any addition must tier-tag each capability, trace ✅ claims to
code, and re-run the relevant part validation before release.

**Status: ✅ Released — Performance Memory v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
