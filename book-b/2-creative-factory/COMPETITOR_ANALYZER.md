# Competitor Analyzer — Positioning Creative Against the Field

| Field | Value |
|---|---|
| **Owner** | Office of the Chief AI Architect |
| **Source of truth** | [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Status** | Official |
| **Governing reference** | [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md) |

> **Implementation status:** ❌ **ROADMAP — not built.** There is **no competitor
> analyzer** anywhere in AdOS today. The single trace of the concept is one
> capability seed, `competitor.analysis`, in an unwired registry
> (`packages/contracts/src/ai/capability.ts:83`) — a title and a description, with
> no analyzer code, no service, no prompt, no route behind it. Critically, AdOS has
> **no external connectors, no web scraping, no data ingestion, and no document
> Q&A** (`../../PRODUCT_TRUTH.md` §2.5, §2.1). A competitor analyzer in AdOS could
> therefore only ever reason over competitor facts the **user manually provides**,
> plus local AI — it **cannot fetch, crawl, or ingest live competitor data**. This
> document specifies that manual-input-only design; it does not describe a live
> feature.

---

## 1. Why this document exists

Every campaign brief and every creative set is written into a market that already
has incumbents. A headline that lands in a vacuum can be invisible — or worse,
indistinguishable — next to three competitors saying the same thing. A
**Competitor Analyzer** is the pipeline stage that turns "who else is in this
market, and what do they claim?" into a **structured positioning input** that the
brief and the creative can be steered against, so the agency ships copy that is
*differentiated on purpose*.

Book B specifies this as a stage in the target agent pipeline:

> Campaign Brief → Planning → **Research (incl. competitor positioning)** → Memory
> → Brand → Prompt Orchestrator → Generation → Quality → Brand Safety → Revision →
> Approval → Learning → Optimization.

But specification is not shipment. This doc draws the line hard: the **analysis
reasoning** is a legitimate, buildable local-AI stage; the **data acquisition**
half that most commercial "competitor intelligence" tools assume (crawlers, ad-
library scrapers, SERP pulls, social listening) is **out of scope and forbidden**
for AdOS. See §5.

### Relationship to Book A

Book A already flags competitors as a **Roadmap** concept in the brand model:
`../../book-a/BRAND_DOMAIN.md` records a target `competitors[{ name, positioning,
differentiators[] }]` shape but notes **"No competitor field in `BrandProps`"** —
i.e. brands cannot even *store* competitor facts today. This document is the Book B
AI-side companion to that gap: even once a brand can hold competitor facts, turning
them into positioning guidance for generation is a separate, unbuilt stage.

**Value contribution:** revenue ↑. Differentiated positioning is the lever between
"a competent ad" and "an ad that wins share." By making the field explicit at brief
time, the agency produces creative that stakes a distinct claim instead of echoing
the category — a direct driver of client win-rates and retained accounts. This
capability serves **revenue**, not production-time, and is justified on that basis
per the Book B value rule.

---

## 2. Target design (what we intend to build)

The analyzer is a **research-stage transform**: it consumes structured, user-
provided competitor facts plus the brand's own context, reasons over them with the
local AI, and emits a structured **positioning object** that downstream stages
(brief, creative) consume as input variables. It never leaves the machine.

### 2.1 Position in the pipeline

```
Mission ──▶ [Competitor Analyzer] ──▶ MarketingBrief ──▶ CreativeSet ──▶ …
              ▲            │
   user-provided       positioning
   competitor facts    object (structured)
   + brand context
```

The analyzer sits **before** the brief in the Research band. It does not replace
brief generation; it *feeds* it, contributing a `positioning` block to the same
variables map that Mission Injection already populates
(`domains/marketing-intelligence/src/brief/service.ts:47-62`).

### 2.2 Inputs (all local, all user-originated)

| Input | Origin | Notes |
|---|---|---|
| `competitors[]` | **User-entered** via a form (name, claimed positioning, differentiators, notable messaging the user has seen) | The *only* competitor data source. AdOS does not obtain it. |
| Brand context | Existing `Brand` aggregate — voice, rules, banned words (`domains/agency-os/src/brand/brand.ts:20-42`) | Reused, not re-derived. |
| Product context | Existing `Product` aggregate — pricing, features (`domains/agency-os/src/product/product.ts:30`) | For claim contrast. |
| Mission objective | The client's stated objective (already flattened for Mission Injection) | Frames what "differentiated" means for this campaign. |

There is **no** input that AdOS fetches. Every competitor fact is typed in by a
human who did the research off-platform.

### 2.3 Output — the positioning object (structured)

A single structured artifact, produced by **one** local-AI `reasoning` call, shaped
so downstream generation can consume it as prompt variables:

| Field | Meaning |
|---|---|
| `marketSummary` | One-paragraph synthesis of the competitive set *as described by the user*. |
| `competitorClaims[]` | Per-competitor: the core claim/angle the user reported. |
| `whitespace[]` | Angles the reported competitors are **not** occupying — candidate differentiation lanes. |
| `recommendedPositioning` | The distinct claim this brand should stake, given brand voice + product + mission. |
| `messagingContrasts[]` | "They say X; we should say Y" pairs the creative stage can lean on. |
| `provenance` | `{taskId, capability:'competitor.analysis', model, engine, latencyMs}` — same provenance envelope every AdOS AI artifact carries. |

### 2.4 How it feeds generation

The `recommendedPositioning` and `messagingContrasts[]` are injected as prompt
variables into the brief and creative prompts, exactly as Mission Injection injects
mission fields today (`../1-ai-foundations/MISSION_INJECTION.md`). The creative
stage's six copy fields (headline / adCopy / cta / socialPost / landingPage / email
— `domains/creative-studio/src/creative/creative-set.ts:43-50`) are then generated
*aware of* the positioning, rather than in a vacuum.

Because generation-time injection of derived context is itself Book B build work
(see `../1-ai-foundations/MEMORY_INJECTION.md`), the analyzer's output rides on the
same injection wiring the memory-loop needs — it is not a standalone bolt-on.

---

## 3. Today — what actually exists

> **Tier: ❌ ROADMAP (ABSENT).** No analyzer code exists. Present tense below
> describes only the lone seed; everything else is design.

### 3.1 The one and only trace

| Artifact | Location | What it is |
|---|---|---|
| `competitor.analysis` capability seed | `packages/contracts/src/ai/capability.ts:83` | A `CapabilityDefinition` entry: `{ id: 'competitor.analysis', title: 'Competitor Analysis', description: 'Analyze competitors and market position.', modelCapability: 'reasoning', tools: ['crawler', 'browser'] }`. A declaration only. |

That entry lives in `CORE_CAPABILITIES`, a static seed array
(`capability.ts:72`). Two facts make it a **seed, not a feature**:

1. **The registry is unwired.** No running app path instantiates a capability
   registry from this array; `apps/web` never reads it to route a
   `competitor.analysis` task. It is data waiting for a consumer that does not
   exist.
2. **The `tools` it names do not exist.** The seed lists `tools: ['crawler',
   'browser']`. AdOS has **no crawler and no browser tool** — consistent with
   `../../PRODUCT_TRUTH.md` §2.5 (connector-hub is a stub, 0 importers) and §3
   (the only outbound `fetch()` calls target localhost AI engines). The seed
   describes an *aspirational* capability whose declared dependencies are
   themselves absent.

### 3.2 What does NOT exist

| Expected part of an analyzer | Status | Evidence |
|---|---|---|
| Analyzer service / class | ❌ absent | No file; grep for a competitor analyzer service finds none. |
| A prompt / task template for it | ❌ absent | The five shipped services cover brief/creative/campaign/report/executive only (`../../PRODUCT_TRUTH.md` §1.3). |
| A route or UI form to enter competitors | ❌ absent | No competitor input path in `apps/web/src/routes.ts`. |
| A `competitors` field on the brand | ❌ absent | `../../book-a/BRAND_DOMAIN.md`: "No competitor field in `BrandProps`." |
| Any data source for competitor facts | ❌ absent **and forbidden** | No connectors, no scraping, no ingestion (`../../PRODUCT_TRUTH.md` §2.5). |
| Positioning object consumed by generation | ❌ absent | Generators take no positioning input (`brief/service.ts:47-62`). |

There is nothing to "wire" here — unlike Book B's 🔶 topics, no built-but-dormant
analyzer sits in the codebase. This topic is a **clean design spec** from zero.

---

## 4. To build — the manual-input-only analyzer

> **Tier: ❌ ROADMAP.** The following is a specification, not a description of
> present behavior. It is scoped deliberately to what AdOS's local, offline,
> connector-free architecture can honestly support.

### 4.1 Build steps

| # | Step | Notes |
|---|---|---|
| 1 | Add a `competitors[]` value object to the brand/mission domain | Realizes the Book A `../../book-a/BRAND_DOMAIN.md` Roadmap shape `{ name, positioning, differentiators[] }`. **User-entered only.** |
| 2 | Add a competitor-entry form + route | A human types in what they already know about rivals. No fetch. |
| 3 | Define a `competitor.analysis` task template | A `reasoning` prompt: given the user-provided competitor facts + brand/product/mission context, emit the §2.3 positioning object. |
| 4 | Route the capability through the AI Manager | Have a running path actually consume the `capability.ts:83` seed and dispatch to the local engine. **Replace the seed's `tools: ['crawler','browser']` with `tools: []`** — the analyzer reasons over supplied text; it acquires nothing. |
| 5 | Inject the positioning object into brief/creative prompts | Reuse the Mission-Injection variable mechanism (`../1-ai-foundations/MISSION_INJECTION.md`). |
| 6 | Persist positioning with provenance | Same `{taskId, capability, model, engine, latencyMs}` envelope as every AdOS artifact. |

### 4.2 The hard boundary — no acquisition, ever

This is the load-bearing constraint of the whole design. Everything in the left
column below is **forbidden** for AdOS and stays permanently on the Roadmap /
out-of-scope, regardless of how attractive it looks:

| ❌ Forbidden (never build into AdOS) | ✅ In-scope for this analyzer |
|---|---|
| Crawling competitor websites | Reasoning over a website summary the **user pasted in** |
| Scraping ad libraries (Meta/Google/TikTok) | Reasoning over ad examples the **user described** |
| SERP / keyword-rank pulls | Positioning contrast the AI **infers** from supplied facts |
| Social listening / API feeds | — |
| Document ingestion of competitor PDFs / decks | — |
| Any outbound `fetch()` beyond the localhost AI engine | The single local-AI `reasoning` call |

Rationale, per source of truth: AdOS has **no external integrations**
(`../../PRODUCT_TRUTH.md` §2.5), **no document Q&A / ingestion**
(`../../PRODUCT_TRUTH.md` §2.1), and is **offline / air-gap capable by design**
(`../../PRODUCT_TRUTH.md` §6.1). A live competitor-data feed would violate all
three. The analyzer's honesty is precisely that it is **garbage-in / structured-
out over human-supplied facts** — a reasoning aid, not an intelligence-gathering
system.

### 4.3 What the analyzer must NOT imply

To keep marketing and UI truthful, the built feature must never suggest it has
live or proprietary competitor data:

- No "real-time competitor tracking."
- No "we monitor your competitors."
- No freshness/last-updated claims about competitor facts (their accuracy is
  entirely the user's, as of whenever the user typed them).
- Framing must be: *"Tell AdOS what you know about the competition; AdOS reasons
  over it, offline, to sharpen your positioning."*

### 4.4 Dependencies on other Book B work

| Depends on | Why | Tier there |
|---|---|---|
| Generation-time context injection | To feed the positioning object into brief/creative | ❌ ROADMAP (`../1-ai-foundations/MEMORY_INJECTION.md`) |
| Brand competitor storage | To persist user-entered rivals | ❌ ROADMAP (`../../book-a/BRAND_DOMAIN.md`) |
| Capability registry wiring | To make `capability.ts:83` actually route | seed only today (`capability.ts:83`) |

Until at least the first two land, an analyzer would have nowhere to send its
output — reinforcing that this is a downstream, later-stage build.

---

### 4.5 The reasoning prompt (specification sketch)

The `competitor.analysis` task would be a single `reasoning` submission — the same
shape as the five shipped services, each of which makes exactly one `ai.submit`
call. Its prompt would compose from variables only, never from fetched text:

| Prompt block | Filled from | Injection style |
|---|---|---|
| Role / instruction | Static template | Hardcoded, as with the shipped `ROLES` block (`apps/web/src/ai-live.ts:123-154`) |
| `competitors` list | User-entered value object (§2.2) | Flattened to variables, like Mission Injection |
| Brand voice / rules | `Brand` aggregate (`brand/brand.ts:20-42`) | Flattened variables |
| Product claims | `Product` aggregate (`product/product.ts:30`) | Flattened variables |
| Mission objective | Existing flattened mission fields | Reused from Mission Injection |
| Output schema (as text) | Positioning-object shape (§2.3) | Schema-as-prompt-text, like `ai-live.ts:142-144` — **not** enforced today |
| Language | Workspace language | Language injection, `ai-live.ts:139-141` |

Note two honest limits carried from the shipped stack: schema is injected as *text*
and is **not** structurally enforced (schema-enforced validation is itself 🔶 built-
unwired, see [`VALIDATION_PIPELINE.md`](../1-ai-foundations/VALIDATION_PIPELINE.md)); and the default
offline manager returns deterministic template output, so genuine analytical prose
requires a locally-run engine (`apps/web/src/ai.ts:13`, `ai-live.ts:26`). The
analyzer inherits both realities — it is not a smarter class of AI, just a new task
routed through the same local stack.

### 4.6 Illustrative walkthrough (hypothetical — not a live feature)

The following shows the *intended* flow. It is illustrative design, not a
description of anything the app does today.

1. A strategist opens a competitor form and types three rivals they already
   researched off-platform: names, the positioning each seems to claim, and a
   differentiator or two they noticed.
2. AdOS dispatches one local `competitor.analysis` `reasoning` call with those
   facts plus the brand's voice, the product's price point, and the mission
   objective.
3. The local engine returns a positioning object: a market summary, per-competitor
   claims echoed back, a `whitespace[]` of unclaimed angles, a
   `recommendedPositioning`, and `messagingContrasts[]`.
4. That object is injected into the brief and creative prompts, so the six copy
   fields are written to *lean into the whitespace* rather than restate the
   category.
5. A human reviews and approves as usual through the existing approval gates
   (`strategy_and_budget` / `creative_assets` / `campaign_launch`) —
   `../../book-a/APPROVAL_ENGINE.md`. Nothing about the analyzer bypasses human
   review.

At no point does AdOS learn anything about the competitors that the strategist did
not type. The value is in the *reasoning and injection*, not in data reach.

### 4.7 Distinction from the neighbouring `brand.analysis` seed

The same unwired registry holds a sibling seed `brand.analysis`
(`packages/contracts/src/ai/capability.ts:82`, `tools: ['crawler','pdf_reader']`).
Both are ❌ ROADMAP and both name acquisition tools AdOS does not have. They must
not be conflated: `brand.analysis` reasons about **the agency's own** brand;
`competitor.analysis` reasons about **rivals the user described**. Neither may
crawl or read PDFs in AdOS — the tool lists are aspirational and would be emptied
to `tools: []` when actually wired, per §4.1 step 4.

### 4.8 How this differs from commercial "competitor intelligence"

Most tools sold as competitor analyzers are, in practice, **data-acquisition**
products with a thin reasoning layer on top. AdOS deliberately inverts that: it is
a **reasoning** stage with **no** acquisition layer at all.

| Dimension | Typical commercial tool | AdOS competitor analyzer (as specified) |
|---|---|---|
| Data source | Crawlers, ad-library scrapers, SERP APIs, social feeds | User-typed facts only |
| Freshness | Continuously refreshed | As of whenever the user typed it |
| Network | Cloud, external calls | Offline / air-gap capable; localhost engine only |
| Cost model | Per-seat + data/API fees | Local inference, no per-token billing |
| Data reach | Broad, proprietary | Exactly what the strategist already knows |
| Core value | Data you didn't have | Structuring and contrasting what you do have |

This is a narrower promise, and an honest one. AdOS wins on **privacy, offline
operation, and zero data cost**, not on data reach — consistent with the product's
100%-local identity (`../../PRODUCT_TRUTH.md` §6.1).

### 4.9 Failure modes and anti-patterns to guard against

| Risk | Guard |
|---|---|
| UI implies AdOS *knows* the competitors | Copy must frame input as "what you tell us" (§4.3). |
| Positioning object mistaken for fact | Provenance + "based on user-provided facts" labelling on the artifact. |
| Stale competitor facts drive stale creative | Show the entry date; never present freshness AdOS cannot guarantee. |
| Scope creep toward scraping "just this once" | The §4.2 boundary is a hard architectural line, not a preference. |
| Empty / thin input yields hollow positioning | Treat as garbage-in; require a minimum of meaningful competitor facts before running. |

---

## 5. Status ledger (this doc's topic)

| Concept | Tier | Evidence / note |
|---|---|---|
| Competitor Analyzer (any code) | ❌ ROADMAP | No implementation anywhere. |
| `competitor.analysis` capability | ❌ ROADMAP (seed only) | Declaration in unwired registry, `packages/contracts/src/ai/capability.ts:83`. |
| Competitor storage on brand | ❌ ROADMAP | `../../book-a/BRAND_DOMAIN.md` — "No competitor field in `BrandProps`." |
| Live competitor data (crawl/scrape/ingest) | ❌ FORBIDDEN | No connectors, no ingestion (`../../PRODUCT_TRUTH.md` §2.5, §2.1). |
| Manual-input positioning reasoning | ❌ ROADMAP (buildable) | Design in §2/§4; local-AI `reasoning`, no acquisition. |
| Positioning injected into generation | ❌ ROADMAP | Generators take no positioning input (`brief/service.ts:47-62`). |

---

## 6. Value contribution

**Revenue ↑ — differentiated positioning.** The entire justification for this
stage is commercial: campaigns that stake a distinct, defensible claim against the
competitive set win more share than campaigns that echo the category. By making
competitor positioning an explicit, structured input to the brief and creative —
even from purely user-supplied facts reasoned over locally — the agency ships
sharper first drafts, wins more pitches, and retains accounts on the strength of
differentiation. The capability is justified on **revenue**, not production-time,
and only when built within the offline, connector-free boundary above; a version
that tried to acquire competitor data would not be AdOS.

---

## 7. Cross-references

- Source of truth — connectors/ingestion absent: [`../../PRODUCT_TRUTH.md`](../../PRODUCT_TRUTH.md) (§2.5, §2.1)
- Book A brand model — competitors flagged Roadmap: [`../../book-a/BRAND_DOMAIN.md`](../../book-a/BRAND_DOMAIN.md)
- Governing reference: [`../1-ai-foundations/AI_CONSTITUTION.md`](../1-ai-foundations/AI_CONSTITUTION.md)
- Injection mechanism this stage would reuse: [`../1-ai-foundations/MISSION_INJECTION.md`](../1-ai-foundations/MISSION_INJECTION.md)
- Generation-time context injection dependency: [`../1-ai-foundations/MEMORY_INJECTION.md`](../1-ai-foundations/MEMORY_INJECTION.md)

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
