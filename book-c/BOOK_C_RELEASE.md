# BOOK C — Campaign Intelligence — Release (AdOS's Trust Layer)

> **Owner:** Office of the Chief AI Architect
> **Status:** ✅ Released — all 3 parts validated PASS, aligned to `../PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

Book C is AdOS's **Trust Layer** — the design & architecture of the system that answers, for
every AI output, one question: **"Why did the AI recommend this?"** It exists to support one
promise, truthfully:

> *"AdOS does not just produce recommendations; it can explain every recommendation using
> its own campaign memory."*

Book C is **documentation only** and scrupulously honest: every capability is tagged **✅
SHIPPED**, **🔶 BUILT (UNWIRED)**, or **❌ ROADMAP**. Nothing unbuilt is claimed as shipped.

> **Law (binding across the whole book):** *Evidence is descriptive, not prescriptive.*

---

## 1. The four governing laws

| Law | Statement | Home |
|---|---|---|
| **Evidence First** | No output is a "recommendation" without evidence: Recommendation → Evidence → Confidence → Alternatives → Decision. Never "the LLM said so." | C001 / C003 / C010 |
| **Confidence ≠ Truth** | Confidence is the system's belief; truth is the real outcome. Closing the gap is Book D's job. | C001 / C004 / C011 |
| **Explainability Contract** | The 8-field minimum every AI output must render — the future UI standard. | C001 / C002 |
| **Descriptive, not prescriptive** | Past data informs, never forces. | every doc |

The 8-field Explainability Contract: **Recommendation · Why? · Evidence · Confidence ·
Alternative considered · Brand rules checked · Memory consulted · Human action required.**

## 2. The three tiers (the spine)

| Tier | Meaning |
|---|---|
| **✅ SHIPPED** | Runs in the live app today; cited to wired code. |
| **🔶 BUILT (UNWIRED)** | Code exists and is unit-tested, but no running path reaches it. Wiring it is Book C build work. |
| **❌ ROADMAP** | No implementation; pure specification. |

The live app builds AI via `createAIManager()` → `OfflineAIManager` / `LiveAIManager` and
does **not** run the rich runtime pipeline in `packages/ai-manager/src/runtime/manager.ts`
(instantiated only in tests). So the grounded-reasoning engines are 🔶. All live memory
stores are **in-memory** — even ✅ journal read/write is per-process, not durably persisted.

## 3. The three parts

| Part | Directory | Content docs | ~Lines | Focus |
|---|---|---|---|---|
| 1 · The Why Contract | [`1-why-contract/`](1-why-contract/) | 4 | ~1,611 | What an explanation *is* |
| 2 · The Because | [`2-grounded-recommendation/`](2-grounded-recommendation/) | 4 | ~1,594 | Grounded justification |
| 3 · Provenance & Trust | [`3-provenance-and-trust/`](3-provenance-and-trust/) | 3 | ~1,198 | Traceable, enforced, measured |

**11 content documents + 3 part-validations + 3 part-releases + 4 READMEs = 21 documents.**
Each part carries its own validation (all **PASS**) and release.

## 4. What is ✅ SHIPPED today (the honest baseline)

- **The Decision Journal** — records a decision's evidence, confidence, alternatives, and
  outcome ([routes.ts:1118](../apps/web/src/routes.ts#L1118)), reads it back
  ([routes.ts:832](../apps/web/src/routes.ts#L832)), and renders it on the mission detail
  page ([pages.ts:294](../apps/web/src/views/pages.ts#L294)). AdOS's live "why did it decide
  this" surface (in-memory).
- **Artifact provenance** — every output carries model/engine/taskId, shown as a badge
  ([creative-set.ts:53](../domains/creative-studio/src/creative/creative-set.ts#L53)).
- **Structural lineage** — brief→campaign→report knowledge graph
  ([routes.ts:1165](../apps/web/src/routes.ts#L1165)).
- **AI narrative** — local AI already writes report prose around given facts
  ([service.ts:24](../domains/analytics-engine/src/report/service.ts#L24)).
- **Coarse per-client ROAS rollup** ([routes.ts:1461](../apps/web/src/routes.ts#L1461)).

## 5. The 🔶 spine Book C wires (already coded, dormant)

| Primitive | Code | Book C home |
|---|---|---|
| `BrainEvidenceEngine` — "no recommendation is ever 'the LLM said so'" | [reasoning.ts:14](../domains/executive-memory/src/reasoning.ts#L14) | C003 |
| `HeuristicConfidenceEngine` — score + human-readable reason | [reasoning.ts:62](../domains/executive-memory/src/reasoning.ts#L62) | C004 |
| Per-sector CTR/ROAS-over-N rollup — the "183 campaigns" evidence (built, never populated live) | [in-memory-company-brain.ts:100](../domains/company-brain/src/in-memory-company-brain.ts#L100) | C006 |
| `ConstitutionChecker` — the evidence/confidence gate | [governance.ts:41](../domains/executive-memory/src/governance.ts#L41) | C010 |
| Prompt Registry — versioning/scoring for provenance | [in-memory-prompt-registry.ts:73](../domains/prompt-registry/src/in-memory-prompt-registry.ts#L73) | C009 |

## 6. What is ❌ ROADMAP

Prompt-version + brand/mission/memory linkage on provenance (C009); attribute-grouped
performance queries on the live path (C006); the full 8-field contract as a UI surface
(C002); and all intelligence metrics — coverage, calibration, evidence strength,
faithfulness (C011). Confidence **calibration against outcomes** is measured here but
**improved** in Book D.

## 7. Inviolable boundaries (held across all 3 parts)

- **100% local** — no cloud, no API keys, no per-token billing, air-gap capable.
- **Copy only** — no image/vision/speech.
- **No external data** — no connectors, crawlers, scrapers, or external benchmarks; evidence
  is over agency-held data only.
- **No vendor telemetry** — all intelligence metrics are the agency's own in-memory data.
- **Human-sovereign** — every check is advisory; the enforcement gate withholds or flags but
  **never auto-approves**; AdOS is not an autonomous agent.

## 8. Validation

All three part-validation reports record **PASS** across three-tier discipline, code-citation
accuracy, the four laws, boundary discipline, Book B/C/D/E separation, and documentation-only
hygiene. Every cross-reference across the 21 documents resolves; the forbidden legacy label
"Advertising Operating System" appears nowhere as a product name.

## 9. What comes next

Book C is the blueprint; **building it is engineering work governed by
`../PRODUCT_TRUTH.md` and `../bizops/RELEASE_GOVERNANCE.md`.** The natural first increments
wire the 🔶 spine: route recommendations through `BrainEvidenceEngine` +
`HeuristicConfidenceEngine`, populate and query the per-sector rollup, and gate with
`ConstitutionChecker` — each moving its Book C tier to ✅ with PRODUCT_TRUTH.md updated to
match. **Book D — Performance Memory** builds the write/learn side that Book C reads from.

---

## 10. Governance

[`1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md`](1-why-contract/CAMPAIGN_INTELLIGENCE_CONSTITUTION.md)
is binding on every Book C artifact. Any addition must tier-tag each capability, trace ✅
claims to code, and re-run the relevant part validation before release.

**Status: ✅ Released — Campaign Intelligence v1.0.0 (AdOS's Trust Layer).**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
