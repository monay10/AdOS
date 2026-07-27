# AdOS Demo — The Agency: Vega Reklam Ajansı

**The official fictional organization used in every AdOS demonstration.** Realistic,
internally consistent, and designed to mirror the advertising-agency prospects AdOS
targets. All other demo documents (`DEMO_USERS.md`, `DEMO_WORKFLOWS.md`,
`DEMO_KNOWLEDGE_BASE.md`, `DEMO_DASHBOARDS.md`, `DEMO_DATASET_SPEC.md`) reference the
facts on this page. The canonical entities below are taken verbatim from
`demo/src/data-model.mjs` (WORKSPACE, CLIENTS, BRANDS, PRODUCTS). Fictional — any
resemblance to a real company is coincidental.

---

## 1. Agency identity

| Field | Value |
| --- | --- |
| Workspace / tenant name | **Vega Reklam Ajansı** |
| Trading name (EN) | **Vega Advertising Agency** |
| Workspace id | `ws-vega` |
| Type | Advertising agency (single AdOS tenant) |
| City | İstanbul |
| Locale | Turkish (primary), English (creative & documentation) |
| What it does | Runs AdOS to take its clients' advertising objectives through the human-approved campaign pipeline |
| Clients | **6** (see §7) |
| Brands managed | **12** (2 per client, see §8) |
| Products advertised | **24** (2 per brand, see §9) |

**One-line description:** Vega Reklam Ajansı is a sovereign, offline-first
advertising agency that runs AdOS on its own infrastructure to draft briefs,
creative sets, campaign plans and reports for six clients — every stage produced by
local, deterministic AI and approved by a human.

---

## 2. Mission, vision, values

- **Mission (EN):** To produce human-approved advertising campaigns using local,
  offline AI — creative performance without sending client data to the cloud.
- **Misyon (TR):** Yerel ve çevrimdışı yapay zekâ ile insan onaylı reklam
  kampanyaları üretmek.
- **Vision (EN):** To be the region's most trusted sovereign creative-performance
  agency — precise, honest, and ROAS-positive.
- **Vizyon (TR):** Bölgenin en güvenilir, egemen ve veriye saygılı yaratıcı
  performans ajansı olmak.
- **Values:** Precision · Honesty in claims · Keep our promises · Human approval on
  every campaign · Respect people and client data.
- **North star:** ROAS-positive campaigns approved by humans (`COMPANY_DNA`).

---

## 3. Setup & sovereignty

Vega runs a single on-prem AdOS deployment inside its own network in İstanbul. There
is one workspace (`ws-vega`) — one tenant — and all six clients live inside it with
strict application-level isolation: one client's campaign data is never visible to
another.

- **100% local, offline-capable AI.** The demo AI is offline-deterministic; genuine
  model output requires a locally-run engine (Ollama / OpenAI-compatible). No cloud
  endpoint and no API key are used anywhere.
- **Deterministic & repeatable.** Same seed (`SEED = 20260727`) → identical world,
  checksum-verified. `demo_today = 2026-07-27`. ~2100 records.
- **Air-gap capable.** Pull the network cable and the demo still works.

---

## 4. How the agency works (service model)

Vega does not launch or optimize live ads. It **drafts** each campaign artifact for a
human to review, then a human exports the approved plan to run in the client's own ad
platform. AdOS never pushes to ad platforms (the connector layer is a stub).

The agency's work is organized as **Projects → Missions**. A client states an
objective in natural language (e.g. *"yeni ürün lansmanı için farkındalık
kampanyası"*), and AdOS runs that mission autonomously through the pipeline, pausing
at each human approval gate. The demo models ~18 projects and ~40 missions; a few
frontier missions sit at `pending`.

---

## 5. Team (roles are labels only)

The demo models ~16 internal agency members plus 6 client-side approvers. **Roles are
labels only — RBAC is defined in the product but NOT enforced.** The demo simulates
human approval, not permission enforcement.

| Role (label) | Example holders |
| --- | --- |
| Agency Director | Elif Demir |
| Account Director / Manager | Hakan Çelik, Zeynep Şahin, Kerem Yılmaz |
| Strategy Lead / Strategist | Aslı Yıldırım, Efe Demir |
| Creative Director / Art Director | Sibel Kaya, Onur Kaplan |
| Copywriter | Deniz Acar, Ceren Işık |
| Media Planner | Murat Şahin, İpek Kara |
| Performance / Data Analyst | Berk Aydın, Gizem Ünal, Serkan Aydın |
| Project Coordinator | Pelin Ay |
| **Client Marketing Lead (approver)** | one per client (see §7) |

Full names, ids and reporting lines: `DEMO_USERS.md`.

---

## 6. Organizational chart (top structure)

```
                        Agency Director — Elif Demir
   ┌────────────┬────────────┬────────────┬────────────┬────────────┐
   │            │            │            │            │            │
 Account      Strategy     Creative     Media        Performance   Project
 Director     Lead         Director     Planning     Analytics     Coordination
   │            │            │            │            │
 Account      Strategists  Art Director  Media        Performance /
 Managers                  Copywriters   Planners     Data Analysts
```

- **Agency Director:** Elif Demir.
- Account Managers own the client relationship; Strategy, Creative, Media and
  Analytics contribute to each mission's pipeline stages.
- **Client-side approvers** sit outside the agency and sign off on their own brand's
  campaigns at the approval gates.

---

## 7. Clients (6)

Six clients, each a distinct sector, each with its own client-side Marketing Lead who
approves that client's campaigns.

| Client id | Client | Sector | Client Marketing Lead (approver) |
| --- | --- | --- | --- |
| `cl-novamak` | **NovaMak Endüstri** | Manufacturing | Levent Bozkurt |
| `cl-derma` | **Derma Cosmetics** | Beauty | Nalan Er |
| `cl-fresh` | **Fresh Foods** | FMCG | Tuğçe Al |
| `cl-fintr` | **FinTR Katılım** | Finance | Canan Arslan |
| `cl-evim` | **Evim Home** | Retail | Ozan Kurt |
| `cl-getaway` | **Getaway Travel** | Travel | Derya Kılıç |

> **Continuity note:** NovaMak — the industrial manufacturer from earlier AdOS
> collateral — is now a **client** of the agency, not the demo tenant. This keeps
> continuity with older material while fitting the real product model (Workspace →
> Client → Brand → Product).

---

## 8. Brands (12) — voice & banned words

Two brands per client. Each brand carries a **voice** and a **banned-words** list —
the brand guardrails the AI must respect when drafting copy (`brand/brand.ts:20-42`).

| Brand id | Brand | Client | Voice | Banned words (yasaklı ifadeler) |
| --- | --- | --- | --- | --- |
| `br-novamak-pro` | **NovaMak Pro** | NovaMak Endüstri | professional, precise, industrial | ucuz, bedava, garanti |
| `br-novamak-parts` | **NovaMak Parts** | NovaMak Endüstri | technical, reliable, B2B | ucuz, kesin sonuç |
| `br-derma-glow` | **Derma Glow** | Derma Cosmetics | warm, confident, dermatological | mucize, kalıcı tedavi, şifa |
| `br-derma-men` | **Derma Men** | Derma Cosmetics | bold, direct, modern | mucize, anında |
| `br-fresh-daily` | **Fresh Daily** | Fresh Foods | friendly, fresh, everyday | en iyi, birebir |
| `br-fresh-kids` | **Fresh Kids** | Fresh Foods | playful, caring, wholesome | bağımlılık, sınırsız |
| `br-fintr-invest` | **FinTR Invest** | FinTR Katılım | trustworthy, clear, compliant | garanti getiri, risksiz, kesin kazanç |
| `br-fintr-pay` | **FinTR Pay** | FinTR Katılım | simple, secure, fast | risksiz, sınırsız kredi |
| `br-evim-living` | **Evim Living** | Evim Home | cozy, aspirational, accessible | en ucuz, tükeniyor |
| `br-evim-garden` | **Evim Garden** | Evim Home | natural, calm, seasonal | sınırsız, birebir |
| `br-getaway-sun` | **Getaway Sun** | Getaway Travel | vivid, inviting, escape | garanti tatil, kesinlikle |
| `br-getaway-city` | **Getaway City** | Getaway Travel | smart, curated, urban | en ucuz, birebir |

Banned words are the honest guardrails a compliance-minded agency enforces — e.g.
finance brands cannot promise *"garanti getiri"* / *"risksiz"*, and beauty brands
cannot claim *"mucize"* / *"şifa"*. The AI's drafted copy is checked against them.

---

## 9. Products (24) — TRY pricing

Two products per brand, each carrying a Turkish-lira price (`price_try`,
`product/product.ts:30`). Finance products are priced at ₺0 (account/fund products
with no unit price).

| Product id | Product | Brand | Price (TRY) |
| --- | --- | --- | --- |
| `pr-nm-hmc` | HMC-500 Machining Center | NovaMak Pro | ₺2.450.000 |
| `pr-nm-weld` | Robotic Welding Cell | NovaMak Pro | ₺1.780.000 |
| `pr-nm-spindle` | Precision Spindle Kit | NovaMak Parts | ₺42.000 |
| `pr-nm-service` | Aftermarket Service Plan | NovaMak Parts | ₺96.000 |
| `pr-dg-serum` | Glow Repair Serum | Derma Glow | ₺640 |
| `pr-dg-cream` | Barrier Day Cream | Derma Glow | ₺520 |
| `pr-dm-wash` | Charcoal Face Wash | Derma Men | ₺280 |
| `pr-dm-balm` | Post-Shave Balm | Derma Men | ₺340 |
| `pr-fd-yogurt` | Süzme Yoğurt 1kg | Fresh Daily | ₺78 |
| `pr-fd-milk` | Günlük Süt 1L | Fresh Daily | ₺42 |
| `pr-fk-juice` | Meyve Suyu 200ml | Fresh Kids | ₺24 |
| `pr-fk-snack` | Tam Tahıl Atıştırmalık | Fresh Kids | ₺36 |
| `pr-fi-fund` | Katılım Emeklilik Fonu | FinTR Invest | ₺0 |
| `pr-fi-gold` | Altın Katılım Hesabı | FinTR Invest | ₺0 |
| `pr-fp-wallet` | FinTR Pay Cüzdan | FinTR Pay | ₺0 |
| `pr-fp-pos` | Esnaf POS Çözümü | FinTR Pay | ₺0 |
| `pr-el-sofa` | Nordic 3+2 Koltuk Takımı | Evim Living | ₺34.900 |
| `pr-el-table` | Meşe Yemek Masası | Evim Living | ₺12.900 |
| `pr-eg-set` | Bahçe Mobilya Seti | Evim Garden | ₺18.900 |
| `pr-eg-grill` | Mangal & Barbekü İstasyonu | Evim Garden | ₺6.400 |
| `pr-gs-antalya` | Antalya Ultra Her Şey Dahil | Getaway Sun | ₺42.000 |
| `pr-gs-bodrum` | Bodrum Butik Tatil | Getaway Sun | ₺38.000 |
| `pr-gc-paris` | Paris Şehir Kaçamağı | Getaway City | ₺54.000 |
| `pr-gc-rome` | Roma Kültür Turu | Getaway City | ₺46.000 |

---

## 10. The campaign pipeline (the product's core surface)

Fixed, ordered, and human-gated. Each stage produces one artifact and is blocked by a
human approval before the next stage may begin.

```
Mission
  → MarketingBrief      [gate: strategy_and_budget]
  → CreativeSet         [gate: creative_assets]      (ad copy only; never touches ad platforms)
  → CampaignDraft       [gate: campaign_launch]      (channels + ad sets + budget split; status ALWAYS draft, NEVER launched)
  → CampaignReport                                    (KPIs)
  → ExecutiveReport
```

- **Approval gates** (human click required): `strategy_and_budget`,
  `creative_assets`, `campaign_launch`. Each gate is a human approval — internal or
  client-side. There is **no tiered T0–T4 authority model**.
- A CampaignDraft's status is **always `draft`** — it is never launched from AdOS.

---

## 11. Channels a draft allocates budget across

`Meta`, `Google Ads`, `YouTube`, `TikTok`, `LinkedIn`, `Display`.

AdOS drafts the budget split across these channels; a **human exports the plan to run
it in the client's own ad platform**. AdOS never pushes to these platforms.

**Deterministic ad-KPIs** (per CampaignReport): impressions, clicks, spend,
conversions, leads, revenue → then **CTR, CPC, CPA, CPL, ROAS, ROI** recomputed
deterministically and validated.

---

## 12. Company Brain — a marketing-performance memory

Vega's Company Brain is a **marketing-performance memory**, not a document library.
It holds learned advertising knowledge, not documents, and it produces no cited
answers.

- **CompanyDNA:** mission, positioning (*"Sovereign creative performance agency"*),
  tone, north star.
- **BrandProfile** per brand: voice, banned words, top channel, average ROAS.
- **MarketingInsight / CreativeInsight / SalesInsight:** derived from campaign
  results.
- **SopPerformance** per pipeline stage: runs, approval rate.
- **Knowledge graph:** campaign → ad → lead → ROI nodes and edges.
- **Pattern library:** winning-ad patterns — UGC opening hook, price anchoring, local
  social proof, honest seasonal framing, benefit-first headline, question-based
  opening.
- **Experience engine:** past-campaign entries (objective, ROAS, ROI, outcome).

---

## 13. Why AdOS (Vega's transformation goals)

The "why AdOS" for the demo — Vega's stated objectives:

1. **Adopt AI without sending client data to the cloud** — a hard sovereignty and
   KVKK requirement for regulated clients (finance, retail).
2. **Produce campaign work faster** — briefs, creative sets, plans and reports
   drafted by local AI.
3. **Keep humans in control** — every campaign advances only through explicit human
   approval gates.
4. **Enforce brand safety** — respect each brand's voice and banned-words guardrails.
5. **Learn from past campaigns** — reuse winning patterns and ROAS-positive
   experience across clients.
6. **Give management one real-time view** of missions, approvals and campaign
   performance.

---

## 14. What the demo does NOT contain (by design)

Matching `PRODUCT_TRUTH.md`, the validator explicitly fails if any of the following
appear:

- No document library and no cited answers over documents.
- No permission tiers and no enforced RBAC / restricted-content visibility.
- No autonomous "agents" doing knowledge work — the AI drafts pipeline stages for
  human review.
- No immutable audit store. The demo keeps an ordered, tenant-scoped `activity_log`
  (mission created, stage drafted, approval approved/pending) plus a per-approval
  timeline. A tamper-evident immutable log is Roadmap.
- No launched or optimized live campaigns — drafts only.
- No external ad-platform integrations — the connector layer is a stub.

---

## 15. Demo scale (summary figures)

| Dimension | Figure (fixed for the demo) |
| --- | --- |
| Workspace / tenant | 1 (Vega Reklam Ajansı, `ws-vega`) |
| Clients | 6 |
| Brands | 12 (2 per client) |
| Products | 24 (2 per brand) |
| Projects (modeled) | ~18 |
| Missions (modeled) | ~40 |
| Team members (modeled) | ~16 internal + 6 client approvers |
| Pipeline stages | 5 (brief → creative → draft → report → executive) |
| Approval gates | 3 (strategy_and_budget, creative_assets, campaign_launch) |
| Channels | 6 (Meta, Google Ads, YouTube, TikTok, LinkedIn, Display) |
| Total records | ~2100 |
| Seed / demo_today | `20260727` / `2026-07-27` |

These figures are fixed so every dashboard, report and workflow in the demo
reconciles to the same world.

---

## Appendix — Consistency contract

- The workspace / tenant is always **Vega Reklam Ajansı** (`ws-vega`), an advertising
  agency in İstanbul.
- The six clients, twelve brands and twenty-four products are canonical and taken
  verbatim from `demo/src/data-model.mjs`; other demo documents must not contradict
  them.
- **NovaMak Endüstri is a client of the agency**, not the tenant.
- The Agency Director is **Elif Demir**; roles are labels only — RBAC is not enforced.
- AdOS drafts campaigns; it never launches live ads, has no document library, no cited
  answers, no autonomous agents, and no enforced permissions.
- Everything is fictional and lives under `demo/`.
