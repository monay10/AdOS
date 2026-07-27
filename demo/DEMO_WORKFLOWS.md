# AdOS Demo — Campaign Pipeline & Missions

**One real workflow** — the **human-approved campaign pipeline** — and the **40
demo missions** that run through it for **Vega Reklam Ajansı** (İstanbul), the
advertising agency that is the demo tenant. Grounded entirely in the demo code
(`src/data-model.mjs`, `src/seed.mjs`, `src/validate.mjs`) and the real product
model (`PRODUCT_TRUTH.md` §1). Deterministic, offline, tenant-isolated; the same
seed rebuilds an identical world. Fictional; isolated to `demo/`.

**Conventions:**
- There is **one** pipeline. A **Mission** — a client objective stated in natural
  language (`Marka: hedef`) — advances through five ordered stages, each producing
  one artifact.
- Advancement is **human-gated**: three of the stages sit behind an approval
  **gate** that requires an explicit human click before the next stage may begin.
- Gates are **flat** — `strategy_and_budget`, `creative_assets`,
  `campaign_launch`. There is **no** tiered spend/authority ladder; a gate is
  simply "a named human approved this." Some frontier missions sit `pending`,
  awaiting that click.
- A campaign is only ever **drafted**. Its status is always `draft`; the demo
  never launches, pushes, or optimizes a live ad. A human exports the draft to
  run it in their own ad platform.
- Every stage is drafted by the **offline deterministic AI**
  (`engine: 'offline-deterministic'`) and marked `human_reviewed`. No autonomous
  agents act on their own.
- Consequential actions are written to the tenant-scoped **activity log** (mission
  created, stage drafted, approval approved/pending). It is an ordered log, not a
  tamper-evident store.

---

## The pipeline — five stages, three gates

`Mission → MarketingBrief → CreativeSet → CampaignDraft → CampaignReport → ExecutiveReport`

| # | Stage key | Artifact | Gate before next stage | Approver |
| --- | --- | --- | --- | --- |
| 1 | `brief` | **MarketingBrief** | `strategy_and_budget` | agency (internal) |
| 2 | `creative` | **CreativeSet** | `creative_assets` | agency (internal) |
| 3 | `campaign_draft` | **CampaignDraft** | `campaign_launch` | client-side lead |
| 4 | `report` | **CampaignReport** | — (post-run) | — |
| 5 | `executive` | **ExecutiveReport** | — (post-run) | — |

### Stage 1 — MarketingBrief
- **Produces:** objective restated, target **audience** (e.g. `25-45 satın alma
  niyeti`, `B2B karar vericiler`, `yerel/şehir bazlı`), the brand-safe key
  message, the mission **budget** (₺), and 2–4 **suggested channels**.
- **AI:** offline deterministic draft; provenance `ai-offline`.
- **Gate — `strategy_and_budget`:** an agency human signs off on the strategy and
  the budget before any creative work starts.

### Stage 2 — CreativeSet (**ad copy only**)
- **Produces:** headline, ad copy, CTA, social post, landing-page text, and email
  copy — **drafts only**. Flagged `copy_only`; it never touches an ad platform.
- **Brand safety:** the set respects the brand's **voice** and **banned words**
  (`banned_words_respected: true`).
- **Gate — `creative_assets`:** an agency human approves the copy before it is
  built into a campaign.

### Stage 3 — CampaignDraft (**never launched**)
- **Produces:** a `status: 'draft'` plan splitting the total budget across 2–4
  **channels** (Meta, Google Ads, YouTube, TikTok, LinkedIn, Display), each with a
  per-channel budget and an **ad-set** count.
- **Status is always `draft`.** The demo never launches or pushes it anywhere.
- **Gate — `campaign_launch`:** the **client-side marketing lead** approves the
  draft. This is the client saying "yes, run this" — the human then exports it to
  their own platform. AdOS still launches nothing.

### Stage 4 — CampaignReport (KPIs)
- **Produces:** deterministic performance numbers (impressions, clicks, spend,
  conversions, leads, revenue) and the derived KPIs recomputed exactly:
  **CTR, CPC, CPA, CPL, ROAS, ROI**.
- Feeds the Company Brain: a `campaign → ad → lead → roi` knowledge-graph slice
  and a past-campaign experience entry (`positive` when ROAS ≥ 1).
- No gate — this is a post-run readout of results a human entered.

### Stage 5 — ExecutiveReport
- **Produces:** a single-call AI executive summary with the campaign ROAS and a
  **recommendation**: `scale` (ROAS ≥ 1.5), `iterate` (ROAS ≥ 1), or `revise`.
- No gate — it is the closing synthesis for the mission.

---

## The three approval gates

Each gate is one explicit human click recorded as an approval
(`decision: 'approved' | 'pending'`, `human: true`, with the approver and time).

| Gate | Sits after | Who approves | What it means |
| --- | --- | --- | --- |
| `strategy_and_budget` | MarketingBrief | Agency internal (any of the 16 agency roles) | Strategy + spend approved |
| `creative_assets` | CreativeSet | Agency internal | Ad copy approved for build |
| `campaign_launch` | CampaignDraft | **Client-side marketing lead** for that brand's client | Client authorizes the draft to run |

- **No tiered authority.** Approval is binary per gate; there are no spend
  thresholds and no escalation ladder.
- **Frontier `pending`.** A mission stopped at its latest gate may sit `pending`
  (~30% of frontier gates), which is exactly what the reviewer clears in the demo.
- **Non-gated stages** (`report`, `executive`) carry no approval; they run after
  the campaign has been exported and results are in.

---

## Actors

Agency staff carry **role labels only** — labels describe the org, they do not
enforce anything (RBAC is defined in the product but not enforced; the demo
simulates human approval, not permission checks).

**Agency (internal) — approve `strategy_and_budget` and `creative_assets`:**

| Role | People |
| --- | --- |
| Agency Director | Elif Demir |
| Account Director | Hakan Çelik |
| Account Manager | Zeynep Şahin, Kerem Yılmaz |
| Strategy Lead / Strategist | Aslı Yıldırım, Efe Demir |
| Creative Director / Art Director | Sibel Kaya, Onur Kaplan |
| Copywriter | Deniz Acar, Ceren Işık |
| Media Planner | Murat Şahin, İpek Kara |
| Performance Analyst | Berk Aydın, Gizem Ünal |
| Data Analyst | Serkan Aydın |
| Project Coordinator | Pelin Ay |

**Client-side marketing leads — approve `campaign_launch` for their own brand:**

| Client | Marketing lead |
| --- | --- |
| NovaMak Endüstri | Levent Bozkurt |
| Derma Cosmetics | Nalan Er |
| Fresh Foods | Tuğçe Al |
| FinTR Katılım | Canan Arslan |
| Evim Home | Ozan Kurt |
| Getaway Travel | Derya Kılıç |

---

## The 40 missions

Every mission is generated deterministically from the seed and belongs to one
client → brand → product → project. It advances 2–5 stages (biased toward fully
closed pipelines, with a handful held at the frontier awaiting a gate). Budget is
₺50,000–₺550,000. A closed mission has `stage: 'closed'`, `status: 'closed'`; an
open one is `in_progress` at its latest reached stage.

**Objective templates** (Turkish natural-language objectives, prefixed with the
brand name):

| Objective | Emphasis | Typical channels |
| --- | --- | --- |
| Yeni ürün lansmanı için farkındalık kampanyası | Awareness / launch | Meta, YouTube, Display |
| Çeyrek sonu satış artışı için performans kampanyası | Performance / sales | Google Ads, Meta |
| Marka bilinirliğini yükselten sosyal medya kampanyası | Brand / social | Meta, TikTok, YouTube |
| Potansiyel müşteri toplama (lead generation) kampanyası | Lead gen | Meta, Google Ads, LinkedIn |
| Sezonluk kampanya ve indirim dönemi tanıtımı | Seasonal / promo | Meta, Display, Google Ads |
| Yeniden hedefleme (retargeting) ile dönüşüm kampanyası | Retargeting / conversion | Meta, Display |
| B2B talep yaratma kampanyası | B2B demand | LinkedIn, Google Ads |
| Mağaza açılışı için yerel kampanya | Local store opening | Meta, Google Ads |

### Mission portfolios by client

The 40 missions are spread across the six clients and their twelve brands. Each
brand carries two products and one or two projects (`Yıllık Plan` / `Lansman` /
`Performans` / `Sezon`); a mission targets one product within a project.

**NovaMak Endüstri** (manufacturing) — brands **NovaMak Pro**, **NovaMak Parts**.
- Voice: professional, precise, industrial / technical, reliable, B2B.
- Banned words: `ucuz`, `bedava`, `garanti`, `kesin sonuç`.
- Products: HMC-500 Machining Center (₺2,450,000), Robotic Welding Cell
  (₺1,780,000), Precision Spindle Kit (₺42,000), Aftermarket Service Plan
  (₺96,000).
- Typical missions: **B2B talep yaratma** and **lead generation**, weighted to
  LinkedIn + Google Ads. Client gate cleared by **Levent Bozkurt**.

**Derma Cosmetics** (beauty) — brands **Derma Glow**, **Derma Men**.
- Voice: warm, confident, dermatological / bold, direct, modern.
- Banned words: `mucize`, `kalıcı tedavi`, `şifa`, `anında`.
- Products: Glow Repair Serum (₺640), Barrier Day Cream (₺520), Charcoal Face
  Wash (₺280), Post-Shave Balm (₺340).
- Typical missions: **social/brand** and **performance**, weighted to Meta +
  TikTok. Client gate cleared by **Nalan Er**.

**Fresh Foods** (fmcg) — brands **Fresh Daily**, **Fresh Kids**.
- Voice: friendly, fresh, everyday / playful, caring, wholesome.
- Banned words: `en iyi`, `birebir`, `bağımlılık`, `sınırsız`.
- Products: Süzme Yoğurt 1kg (₺78), Günlük Süt 1L (₺42), Meyve Suyu 200ml (₺24),
  Tam Tahıl Atıştırmalık (₺36).
- Typical missions: **awareness** and **seasonal promo**, weighted to Meta +
  Display + YouTube. Client gate cleared by **Tuğçe Al**.

**FinTR Katılım** (finance) — brands **FinTR Invest**, **FinTR Pay**.
- Voice: trustworthy, clear, compliant / simple, secure, fast.
- Banned words: `garanti getiri`, `risksiz`, `kesin kazanç`, `sınırsız kredi`.
- Products: Katılım Emeklilik Fonu, Altın Katılım Hesabı, FinTR Pay Cüzdan, Esnaf
  POS Çözümü (financial products carry no unit price).
- Typical missions: **lead generation** and **B2B demand**, weighted to Google Ads
  + LinkedIn; compliance-tight copy. Client gate cleared by **Canan Arslan**.

**Evim Home** (retail) — brands **Evim Living**, **Evim Garden**.
- Voice: cozy, aspirational, accessible / natural, calm, seasonal.
- Banned words: `en ucuz`, `tükeniyor`, `sınırsız`, `birebir`.
- Products: Nordic 3+2 Koltuk Takımı (₺34,900), Meşe Yemek Masası (₺12,900), Bahçe
  Mobilya Seti (₺18,900), Mangal & Barbekü İstasyonu (₺6,400).
- Typical missions: **seasonal promo**, **retargeting**, and **local store
  opening**, weighted to Meta + Display. Client gate cleared by **Ozan Kurt**.

**Getaway Travel** (travel) — brands **Getaway Sun**, **Getaway City**.
- Voice: vivid, inviting, escape / smart, curated, urban.
- Banned words: `garanti tatil`, `kesinlikle`, `en ucuz`, `birebir`.
- Products: Antalya Ultra Her Şey Dahil (₺42,000), Bodrum Butik Tatil (₺38,000),
  Paris Şehir Kaçamağı (₺54,000), Roma Kültür Turu (₺46,000).
- Typical missions: **awareness** and **seasonal** escapes, weighted to Meta +
  YouTube + TikTok. Client gate cleared by **Derya Kılıç**.

### Anatomy of one mission (example shape)

> **Mission `msn-0007`** — *Derma Glow: marka bilinirliğini yükselten sosyal medya
> kampanyası*, product Glow Repair Serum, budget ₺212,500.
> 1. **MarketingBrief** → audience `18-34 ilgi bazlı`, channels {Meta, TikTok,
>    YouTube}. → gate `strategy_and_budget` **approved** (agency).
> 2. **CreativeSet** → headline, ad copy, CTA `Hemen İncele`, social/landing/email
>    drafts; banned words respected. → gate `creative_assets` **approved** (agency).
> 3. **CampaignDraft** → `status: draft`, budget split across the channels with
>    ad-set counts. → gate `campaign_launch` — **pending**, awaiting **Nalan Er**.
>
> The mission sits `in_progress` at `campaign_draft`, one human click away from
> completing. Clearing the gate is a canonical demo moment.

---

## Where the results land

- **Company Brain** (marketing-performance memory, not a document store): brand
  profiles (voice, banned words, top channel, avg ROAS), marketing / creative /
  sales insights derived from campaign results, per-stage `SopPerformance`
  (runs + approval rate), the `campaign → ad → lead → roi` knowledge graph, a
  winning-ad **pattern library** (UGC hook, price anchor, local proof, honest
  scarcity, benefit-first, question-open), and a past-campaign **experience
  engine**. See `DEMO_COMPANY_BRAIN.md`.
- **Dashboards / metrics:** counts of clients, brands, products, missions, closed
  missions, campaign drafts, reports, human approvals, pending approvals, and
  average ROAS. See `DEMO_DASHBOARDS.md` / `DEMO_DATASET_SPEC.md`.
- **Activity log:** every `pipeline.<stage>.drafted`, `approval.approved` /
  `approval.pending`, and `mission.created` action, tenant-scoped and ordered.

---

## Index — pipeline stages

| Stage | Artifact | Gate | Approver | Company Brain effect |
| --- | --- | --- | --- | --- |
| 1 `brief` | MarketingBrief | `strategy_and_budget` | Agency internal | — |
| 2 `creative` | CreativeSet (copy only) | `creative_assets` | Agency internal | pattern library reference |
| 3 `campaign_draft` | CampaignDraft (`draft`) | `campaign_launch` | Client marketing lead | — |
| 4 `report` | CampaignReport (KPIs) | — | — | knowledge graph + experience |
| 5 `executive` | ExecutiveReport | — | — | closes the mission |

Every client, brand, product, team member, mission, artifact, gate, and metric in
this document is generated deterministically by `src/seed.mjs` from
`src/data-model.mjs` and checked by `src/validate.mjs`. The validator fails the
build if any out-of-model data appears (documents, cited answers, permission
tiers, launched campaigns, external pushes, or an immutable audit store) — none of
which exist in this demo, by design.
