# Demo — Company Brain (Marketing-Performance Memory)

The **Company Brain** is AdOS's marketing-performance memory for the demo tenant,
**Vega Reklam Ajansı** (İstanbul). It is **not** a text archive and it does **not**
answer questions with quoted sources. Instead it is a compact, learned memory of how
the agency's advertising actually performed: who each brand is, which creative moves
worked, how each pipeline stage runs, and what past campaigns returned. Everything
below is generated deterministically in `demo/src/seed.mjs` (the `company_brain`
object) from `demo/src/data-model.mjs` (`COMPANY_DNA`, `PATTERN_SEEDS`). Same seed →
identical brain (checksum-verified). Fictional; isolated to `demo/`. Bilingual-aware
(TR primary, EN labels where noted).

The brain has **nine parts**, mirroring `in-memory-company-brain.ts`:

```
Company Brain (Vega Reklam Ajansı)
├── 1. CompanyDNA            — who the agency is (single record)
├── 2. BrandProfile ×12      — voice, banned words, top channel, avg ROAS per brand
├── 3. MarketingInsight      — best-performing brands (ROAS over N campaigns)
├── 4. CreativeInsight       — which creative patterns lifted engagement
├── 5. SalesInsight          — objectives that returned positive ROI
├── 6. SopPerformance ×5     — runs + approval rate per pipeline stage
├── 7. Knowledge graph       — campaign → ad → lead → ROI nodes/edges
├── 8. Pattern library       — winning-ad patterns with average lift
└── 9. Experience engine     — past campaigns (objective, ROAS, ROI, outcome)
```

Nothing here is a file, a folder, or a searchable corpus. There is no ownership
scoping and no source-quoting — the brain stores **advertising metrics and learned
patterns only** (matches `PRODUCT_TRUTH.md` §2.1–2.2).

---

## 1. CompanyDNA — the agency's identity (single record)

One fixed record (`COMPANY_DNA` in `data-model.mjs`) that grounds every AI-assisted
draft in the agency's own mission and tone.

| Field | Value |
| --- | --- |
| `id` | `dna-vega` |
| `mission` | *"Yerel ve çevrimdışı yapay zekâ ile insan onaylı reklam kampanyaları üretmek."* (Produce human-approved ad campaigns with local, offline AI.) |
| `positioning` | Sovereign creative performance agency |
| `tone` | confident, precise, honest |
| `north_star` | ROAS-positive campaigns approved by humans |

The DNA is the top of the brain: it is what keeps briefs and creative sets on-message
across all six clients.

---

## 2. BrandProfile — one learned profile per brand (×12)

For each of the agency's **12 brands** (2 per client) the brain keeps a
`BrandProfile` built from `brand/brand.ts:20-42` fields plus performance derived from
the experience engine (§9). Each profile carries: **voice**, **banned_words** (brand
guardrails the AI must respect), **top_channel**, **campaigns_run**, and **avg_roas**
(mean ROAS across that brand's completed campaigns; `null` until it has run one).

| Brand | Client | Voice (EN) | Banned words (TR) |
| --- | --- | --- | --- |
| NovaMak Pro | NovaMak Endüstri | professional, precise, industrial | ucuz, bedava, garanti |
| NovaMak Parts | NovaMak Endüstri | technical, reliable, B2B | ucuz, kesin sonuç |
| Derma Glow | Derma Cosmetics | warm, confident, dermatological | mucize, kalıcı tedavi, şifa |
| Derma Men | Derma Cosmetics | bold, direct, modern | mucize, anında |
| Fresh Daily | Fresh Foods | friendly, fresh, everyday | en iyi, birebir |
| Fresh Kids | Fresh Foods | playful, caring, wholesome | bağımlılık, sınırsız |
| FinTR Invest | FinTR Katılım | trustworthy, clear, compliant | garanti getiri, risksiz, kesin kazanç |
| FinTR Pay | FinTR Katılım | simple, secure, fast | risksiz, sınırsız kredi |
| Evim Living | Evim Home | cozy, aspirational, accessible | en ucuz, tükeniyor |
| Evim Garden | Evim Home | natural, calm, seasonal | sınırsız, birebir |
| Getaway Sun | Getaway Travel | vivid, inviting, escape | garanti tatil, kesinlikle |
| Getaway City | Getaway Travel | smart, curated, urban | en ucuz, birebir |

**top_channel** is drawn from the agency's channel set — Meta, Google Ads, YouTube,
TikTok, LinkedIn, Display — and **avg_roas** is recomputed from the brand's own
campaign outcomes, so the profile grows as the brand runs more work. The banned-word
lists are honest brand guardrails: the AI keeps them out of every draft
(`banned_words_respected: true`).

---

## 3. MarketingInsight — best-performing brands

Derived facts (`kind: 'marketing'`) for the **top brands by average ROAS** (up to 5),
each a one-line performance statement rather than a file reference:

- `mi-*` → *"ROAS `<avg_roas>`x over `<campaigns_run>` campaigns"* for each leading
  brand.

These are what the brain surfaces when the next brief for that brand is being drafted:
"this brand tends to return X over N campaigns," so strategy starts from evidence.

---

## 4. CreativeInsight — which creative moves worked

Derived facts (`kind: 'creative'`) from the top entries of the pattern library (§8),
each expressing a creative lever and its measured lift:

- `ci-*` → *"`<pattern>` (+`<lift>`% engagement)"* — e.g. *"UGC-style opening hook in
  first 2 seconds (+18% engagement)"*, *"Local social proof / Turkish testimonial
  (+22% engagement)"*.

This is the memory a Creative Director draws on before a new creative set: proven
hooks, framings, and openings — not copy pulled from any archive.

---

## 5. SalesInsight — objectives that paid off

Derived facts (`kind: 'sales'`) from **positive-outcome** past campaigns, tying a
client objective to the return it produced:

- `si-*` → *"`<objective>` → ROI `<roi>`%"* — e.g. *"potansiyel müşteri toplama (lead
  generation) kampanyası → ROI 140%"*.

Up to four are kept, so the brain can point at objective types that historically
converted for the agency.

---

## 6. SopPerformance — how each pipeline stage runs (×5)

For each of the **five pipeline stages** the brain tracks the **standard operating
procedure's** health: how many times the stage was drafted (`runs`) and, for gated
stages, the share of human approvals that were approved (`approval_rate`, `null` where
there is no gate).

| Stage (`key`) | Artifact | Gate | Tracked |
| --- | --- | --- | --- |
| `brief` | MarketingBrief | strategy_and_budget | runs, approval_rate |
| `creative` | CreativeSet | creative_assets | runs, approval_rate |
| `campaign_draft` | CampaignDraft | campaign_launch | runs, approval_rate |
| `report` | CampaignReport | — (no gate) | runs |
| `executive` | ExecutiveReport | — (no gate) | runs |

`approval_rate` is measured against **real human approval decisions** (some frontier
missions sit at `pending`), so the brain reflects how readily each stage clears its
human gate. Nothing here is auto-approved — every draft is `human_reviewed: true`.

---

## 7. Knowledge graph — campaign → ad → lead → ROI

For every campaign that reached its **report** stage, the brain adds a small
four-node chain to a single graph (`knowledge_graph: { nodes, edges }`):

```
campaign ──uses──▶ ad ──generated──▶ lead ──contributed──▶ roi
(kg-camp-*)        (kg-ad-*)         (kg-lead-*)           (kg-roi-*)
```

| Node type | Holds | Source |
| --- | --- | --- |
| `campaign` | ref to the campaign draft, objective label | `cmp-<mission>` |
| `ad` | ref to the creative set | `crv-<mission>` |
| `lead` | number of leads generated | CampaignReport |
| `roi` | ROI % achieved | derived KPI |

Edges: `campaign —uses→ ad`, `ad —generated→ lead`, `lead —contributed→ roi`. Traversed
end to end, the graph answers *"which creative drove which leads at what ROI?"* across
every completed campaign — a performance graph, not a graph of files.

---

## 8. Pattern library — winning-ad patterns

Six seeded winning-ad patterns (`PATTERN_SEEDS`), each with an average engagement
lift and a running use count that grows as campaigns accumulate:

| `id` | Pattern | Avg lift |
| --- | --- | --- |
| `pat-ugc-hook` | UGC-style opening hook in first 2 seconds | +18% |
| `pat-price-anchor` | Price anchoring against premium tier | +12% |
| `pat-local-proof` | Local social proof / Turkish testimonial | +22% |
| `pat-scarcity-honest` | Honest limited-time seasonal framing | +9% |
| `pat-benefit-first` | Benefit-first headline over feature list | +15% |
| `pat-question-open` | Question-based ad copy opening | +11% |

Each entry carries `avg_lift_pct` and `uses`. This is the library the demo surfaces to
**shape the next brief**: "the local-proof pattern lifts engagement ~22% — use it
here." Honest framings only (note `pat-scarcity-honest`), consistent with brand
guardrails.

---

## 9. Experience engine — past campaigns

One entry per completed campaign — the brain's episodic memory of what the agency has
already run:

| Field | Meaning |
| --- | --- |
| `mission_id` | which mission produced it |
| `brand_id` | which brand it ran for |
| `objective` | the client objective (e.g. performans, lead generation, retargeting) |
| `roas` | return on ad spend (x) |
| `roi` | return on investment (%) |
| `outcome` | `positive` when ROAS ≥ 1, else `negative` |

The experience engine is the raw material the rest of the brain learns from:
BrandProfile averages (§2), MarketingInsight and SalesInsight lines (§3, §5), and the
graph's ROI nodes (§7) all reduce down to these entries. It is what lets the demo say
*"a past campaign with this objective for this brand returned ROAS X"* and carry that
forward into the next brief.

---

## How the brain is used in the demo

The Company Brain is **read at the start of the pipeline**, not queried for answers.
When a new mission opens, AdOS grounds the offline-deterministic draft in:

1. **CompanyDNA** — mission and tone (§1).
2. The mission's **BrandProfile** — voice, banned words, top channel, prior ROAS (§2).
3. Matching **insights, patterns, and past experience** — the winning move and the
   objective's track record (§3–§5, §8, §9).

The headline demo moment: *the Company Brain surfaces a past winning campaign or
pattern that measurably shapes the next brief* — a performance memory feeding forward,
with a human approving every stage that follows.

---

## Appendix — what the brain is NOT (by design)

Aligned to `PRODUCT_TRUTH.md` and the demo validator, the Company Brain contains:

- **No files and no searchable corpus** — it stores metrics, insights, and patterns,
  never a stored-text archive.
- **No source-quoting answers** — the AI never returns a quoted passage; the evidence
  layer is always advertising metrics (ROAS, CTR, ROI, lift), not prose.
- **No ownership tiers or scoped access** — the brain is a plain in-memory store; there
  is no per-user gating of what it holds.
- **No autonomous agents** — the brain feeds a single offline-deterministic draft per
  stage; a human reviews and approves every one.

All content is fictional and lives under `demo/`; the validator fails the build if any
file-store, quoted-source, or access-tier data appears (`demo/src/validate.mjs`).
