# AdOS Demo — AI-Assisted Pipeline

**One offline deterministic AI assistant** helps **Vega Reklam Ajansı** move each
client objective through the **human-approved campaign pipeline**. The assistant
**drafts** each of the five stages — brief, creative copy, campaign draft, report,
executive summary — and a **human reviews and approves** every one. There are **no**
role-based AI personas, **no** self-running workers, **no document Q&A**, and **no**
sourced-answer references: the assistant works from the mission, the brand
(voice + banned words) and the product, never from a document library. Bilingual
(TR/EN). Fictional; isolated to `demo/`.

Every draft is recorded in `ai_drafts` with `engine: 'offline-deterministic'`,
`assistant: 'AdOS pipeline'`, `outcome: 'drafted'`, and `human_reviewed: true`
(see `demo/src/seed.mjs`; product basis `PRODUCT_TRUTH.md` §1.5, §2.3, §2.9).

**Shared rules (every stage the assistant drafts):**
- **Deterministic + offline by default:** the same seed produces the same drafts;
  no network, no cloud, no API key (`OfflineAIManager`, `ai.ts:13`).
- **Draft only, never final:** the assistant proposes; a named human reviews and
  clicks approve. It cannot approve, publish, or launch anything itself.
- **Marked `human_reviewed`:** each draft event carries `human_reviewed: true` and,
  at gated stages, a matching approval record.
- **Grounded in agency data, not documents:** inputs are the mission objective,
  brand voice + `banned_words`, and product `price_try` — there is **no** document
  knowledge base and **no** source-reference layer.
- **Local by design:** for genuine model output, point the assistant at a
  locally-run engine — **Ollama** or any **OpenAI-compatible localhost** server
  (vLLM / LM Studio / llama.cpp / SGLang). Still 100% local; the default remains
  offline deterministic generation.

---

## S1 — Marketing Brief

- **Drafts:** a `MarketingBrief` from the mission — audience, key message, budget,
  and suggested channels (a subset of Meta, Google Ads, YouTube, TikTok, LinkedIn,
  Display).
- **Inputs:** mission objective, brand voice, product, budget.
- **Human review + gate:** `strategy_and_budget` — an internal reviewer (Account
  Manager / Agency Director) approves before the pipeline advances.
- **Provenance:** `provenance: 'ai-offline'`, `human_reviewed: true`.
- **Example (TR):** *"18-34 ilgi bazlı"* hedef kitle, *"Marka sesine uygun, insan
  onaylı ana mesaj"*, önerilen kanallar taslak olarak sunulur — insan onayı beklenir.
  **← demo scenario (brief drafted, then approved).**

## S2 — Creative Set

- **Drafts:** a `CreativeSet` — headline, ad copy, CTA, social post, landing-page
  copy, email — **copy only**; it never touches an ad platform (`copy_only: true`,
  `creative-set.ts:16-17`).
- **Inputs:** the approved brief, brand voice and `banned_words` (respected:
  `banned_words_respected: true`).
- **Human review + gate:** `creative_assets` — a human reviews the copy for brand
  fit before it moves on.
- **Example (TR):** *"{ürün} — Yeni Sezon"* başlığı, *"Marka kurallarına ve yasaklı
  kelime listesine uygun reklam metni (taslak)"*, CTA *"Hemen İncele"* — hepsi
  taslak, insan incelemesi için. **← demo scenario (AI drafts ad copy for review).**

## S3 — Campaign Draft

- **Drafts:** a `CampaignDraft` — a budget split across channels with ad-set counts
  per channel. Status is **always `draft`** and **never launched**
  (`campaign-draft.ts:48-49`).
- **Inputs:** approved brief + creative, total budget, channel selection.
- **Human review + gate:** `campaign_launch` — the **client-side approver** signs
  off. AdOS never pushes to an ad platform; a **human exports the split** to run it
  in their own tools (connector-hub is a stub).
- **Example (TR):** ₺ bütçe 3 kanala bölünür, her kanal için 2–5 ad set — taslak
  olarak kalır. **← demo scenario (advance a draft through a human gate; show it is
  never launched).**

## S4 — Campaign Report

- **Drafts:** a `CampaignReport` — deterministic performance figures (impressions,
  clicks, spend, conversions, leads, revenue) with **CTR, CPC, CPA, CPL, ROAS, ROI**
  recomputed deterministically (`analytics-engine kpi.ts:39-50`).
- **Inputs:** hand-entered / seeded performance numbers for the drafted campaign.
- **Human review:** no approval gate; the report also feeds the Company Brain
  (knowledge graph campaign → ad → lead → ROI, plus the experience engine).
- **Example (TR):** kampanya sonuç metrikleri ve türetilmiş KPI'lar; ROAS ≥ 1 ise
  *positive*, değilse *negative* deneyim kaydı.

## S5 — Executive Report

- **Drafts:** an `ExecutiveReport` — a short executive summary and a recommendation
  (`scale` / `iterate` / `revise`) from the campaign report. This is a **single AI
  synthesis draft**, not a running worker (`dashboard/service.ts:48-64`).
- **Inputs:** the campaign report (ROAS drives the recommendation).
- **Human review:** no approval gate; leadership reads the summary and decides.
- **Example (TR):** *"Yönetici özeti: kampanya sonuçları ve öneri (tek AI sentez
  çağrısı)."* **← demo scenario (top-level view).**

---

## Stage ↔ artifact ↔ gate ↔ reviewer matrix

| Stage | Artifact | Approval gate | Human reviewer | `human_reviewed` |
| --- | --- | --- | --- | --- |
| S1 Brief | `MarketingBrief` | `strategy_and_budget` | Account Manager / Agency Director | true |
| S2 Creative | `CreativeSet` | `creative_assets` | Creative reviewer (internal) | true |
| S3 Campaign Draft | `CampaignDraft` | `campaign_launch` | Client-side approver | true |
| S4 Report | `CampaignReport` | — (no gate) | read by Performance Analyst | true |
| S5 Executive | `ExecutiveReport` | — (no gate) | read by leadership | true |

Approval **gates** are `strategy_and_budget`, `creative_assets`, `campaign_launch` —
a human click each. There is **no** tiered T0–T4 approval authority. Some frontier
missions sit at `pending`, waiting on the human at the current gate.

## Engine — offline default vs. local model

- **Default (demo):** `OfflineAIManager`, a deterministic template generator — no
  model server, no network. Same seed → identical drafts (checksum-verified).
- **Optional:** a locally-run engine — **Ollama** (`ollama-engine.ts:10`) or an
  **OpenAI-compatible localhost** server (`openai-compatible-engine.ts:10`) — for
  genuine model output. Still 100% local: no cloud endpoint, no API key.
- The default deliberately does **not** produce real model output; that is honest
  (`PRODUCT_TRUTH.md` §2.9).

## Logging (not an immutable audit trail)

Each drafted stage and each approval is written to the ordered, tenant-scoped
`activity_log` (`pipeline.<stage>.drafted`, approval approved/pending) with a
per-approval timeline. A tamper-evident immutable audit store is **Roadmap**, not
present in the demo.

---

Every stage, artifact, gate, and channel above resolves in `demo/src/data-model.mjs`
and `demo/src/seed.mjs`; the world validator (`demo/src/validate.mjs`) fails if any
document library, sourced-answer reference, permission tier, or launched campaign
appears. Product basis: repo-root `PRODUCT_TRUTH.md`.
