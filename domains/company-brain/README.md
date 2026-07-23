# Company Brain

> **Layer:** Knowledge (between Organization and Cognitive Core) · **Build:** BOOK 2.5 · **Status:** ✅ in-memory adapter built (+ tests)

**What the company KNOWS** — distinct from the Cognitive Core (how it *thinks*).
This is the compounding, un-copyable moat: agents know nothing on their own; they
ask the Company Brain, the Cognitive Core reasons over the answer, and the AI
Manager acts on it. **Every completed task enriches the brain.**

## Sub-brains
- **Brand Brain** — per-brand logo, tone, forbidden words, audience, colors, products, campaign history, approved creatives
- **Marketing Brain** — per-vertical CTR/CPA/ROAS + best hook/headline/offer/funnel/creative (grows for years)
- **Creative Brain** — design memory: best color/font/CTA/thumbnail per format
- **Sales Brain** — conversion rates, objections, best responses
- **Finance / Legal Brain** — (typed, pending domain wiring)
- **SOP Brain** — SOP success rates by version (SOPs learn too)
- **Learning Brain** — aggregated learning signals
- **Decision Brain** — decision → result → reason (via `DecisionMemoryPort`)
- **Knowledge Graph** — Customer→Brand→Product→Campaign→Ad→Lead→Sale→ROI→Department→Employee→Task→Workflow

## Plus
- **Experience Engine** — records experiment→result→reason→learned and retrieves the most similar past experience so the company reuses proven approaches (real Jaccard-based similarity; swappable for vector search)
- **Pattern Library** — winning structures captured once and reused, ranked by evidence + reuse count
- **Company DNA** — mission, vision, culture, values, tone, brand rules, writing style, approval rules, quality/naming standards, design language, risk appetite, decision style

## Unified API (`CompanyBrainPort`)
`dna()` · `brand()` · `marketing()` · `creative()` · `sales()` · `sop()` ·
`graph` · `experience` · `patterns` · `enrich()` · `setDna()` · `setBrand()`

Marketing/SOP insights use **sample-weighted merges** so knowledge stabilizes and
grows rather than being overwritten by the latest data point.

## Published / consumed events
Publishes `brain.enriched.v1` · `brain.experience.recorded.v1` ·
`brain.pattern.captured.v1` · `brain.dna.updated.v1`.
Consumes `campaign.*` · `creative.*` · `analytics.*` · `cos.sop.completed.v1` ·
`cos.decision.logged.v1` · `exec.*`.
