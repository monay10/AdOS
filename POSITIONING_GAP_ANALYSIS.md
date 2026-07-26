# AdOS — Positioning Gap Analysis

**Basis of truth:** `PRODUCT_TRUTH.md` (source-of-code audit).
**Compared against:** Website (`website/`), Presentation (`presentation/`), Sales
Kit (`sales/`), Marketing (`marketing/`), Demo (`demo/`), `README.md` /
`ARCHITECTURE.md`, and repository metadata (`package.json`).
**Rule:** no automatic edits — this document only classifies gaps.

---

## 0. Core finding

The collateral splits into **two opposite positioning families**, and the code
supports one of them:

- **Advertising family — code-aligned:** `website/`, `presentation/`, `README.md`,
  `ARCHITECTURE.md`, `package.json` describe AdOS as an **autonomous AI advertising
  agency**. This matches `PRODUCT_TRUTH.md` §1 (Agency OS: brief→creative→campaign
  →report). Gaps here are mostly **Minor/Cosmetic** (overstated autonomy, drafts-
  vs-launch, the tagline swap I made in the brand audit).
- **Enterprise-KM family — code-contradicting:** `sales/`, `marketing/`, and `demo/`
  describe a **generic Enterprise AI Operating System** whose pillars are a
  document **Company Brain** with cited answers, **Digital Employees**, and
  permission-aware AI — for a manufacturer (NovaMak). **None of this exists in the
  code** (`PRODUCT_TRUTH.md` §2). Gaps here are **Critical**.

Severity legend:
- **Critical** — misrepresents *what the product is* or claims a headline capability
  that does not exist; would mislead a buyer/investor.
- **Major** — a real feature is materially overstated.
- **Minor** — essentially true but needs qualification.
- **Cosmetic** — wording/metadata inconsistency with no buyer impact.

Gap count: **5 Critical · 5 Major · 4 Minor · 3 Cosmetic**.

---

## 1. CRITICAL gaps

### C1 — Product category (Enterprise-KM OS vs Advertising-agency OS)
- **Sources:** Sales Kit, Marketing, Demo.
- **Current wording:** *"AdOS is an **AI-powered enterprise operating system** … Three
  pillars: **Company Brain** (private, permission-aware knowledge base; every answer
  cited and permission-scoped), **Digital Employees** (AI agents doing real
  knowledge work), **Workflows & Approvals**"* — `marketing/MARKETING_CONSTITUTION.md:26-29`;
  same in `sales/SALES_KIT_CONSTITUTION.md:33-40`.
- **Recommended wording:** *"AdOS is an autonomous AI **marketing/advertising agency**
  operating system: it turns a campaign objective into a human-approved brief,
  creative, and campaign plan — running local, offline-capable AI on your own
  infrastructure."*
- **Reason:** The implemented product is an advertising agency OS, not a generic
  enterprise KM platform.
- **Evidence:** `PRODUCT_TRUTH.md` §1–§2; `domains/agency-os/src/mission/mission.ts:73-79`;
  advertising pipeline `apps/web/src/routes.ts:731-1184`.
- **Impact:** Highest. A buyer purchasing "enterprise knowledge management" would
  receive an ad-agency tool. Foundational to every downstream claim.

### C2 — "Company Brain = cited document Q&A"
- **Sources:** Sales Kit, Marketing, Presentation (Slide 10).
- **Current wording:** *"Every AI answer is grounded in the company's own documents
  and **cites its sources**. Citations are permission-scoped…"* —
  `sales/SALES_KIT_CONSTITUTION.md:38-40`; *"The Company Brain: your organization's
  living memory"* — `presentation/PRESENTATION_CONTENT.md:242`.
- **Recommended wording:** *"Company Brain is AdOS's **marketing-performance memory** —
  it accumulates brand, creative, and campaign insight (CTR/CPA/ROAS), a
  campaign→lead→ROI knowledge graph, and winning-ad patterns to improve future
  campaigns."*
- **Reason:** The code's Company Brain stores marketing metrics, not documents, and
  emits **no citations**.
- **Evidence:** `PRODUCT_TRUTH.md` §2.1–2.2; `domains/company-brain/src/in-memory-company-brain.ts:32-37`;
  `knowledge-graph.ts:4-6`; grep `cite`=0 in domains.
- **Impact:** Very high — "cited answers over your documents" is a headline trust
  claim that is unimplemented.

### C3 — "Digital Employees"
- **Sources:** Sales Kit, Marketing, Presentation (Slide 11), LinkedIn/Blog.
- **Current wording:** *"**Digital Employees** (AI agents doing real knowledge work)"*
  — `marketing/MARKETING_CONSTITUTION.md:29`; *"Digital Employees: AI assistants for
  every department"* — `presentation/PRESENTATION_CONTENT.md:268`.
- **Recommended wording:** Remove "Digital Employees" as a shipped capability, or
  relabel as roadmap: *"(Planned) autonomous agents."* Describe today's reality:
  *"a human-gated AI pipeline that drafts briefs, creative, and campaigns."*
- **Reason:** No agents exist; `agent-framework`/`autonomy` are event-name stubs with
  0 importers; `executive-ai` is a single LLM call.
- **Evidence:** `PRODUCT_TRUTH.md` §2.3, §5; `domains/agent-framework/src/events.ts:9-15`;
  grep `Digital Employee`=0 in code.
- **Impact:** Very high — an entire named product pillar is fictional.

### C4 — "Permission-aware AI / permission-scoped citations"
- **Sources:** Sales Kit, Marketing, Objection Handling, Security messaging.
- **Current wording:** *"**permission-aware AI** … the AI can never surface content a
  user is not authorized to see"* / *"citations are permission-scoped"* —
  `marketing/MARKETING_CONSTITUTION.md:36,91`; `sales/SALES_KIT_CONSTITUTION.md:39-40`.
- **Recommended wording:** *"AdOS enforces **tenant isolation** so data never crosses
  workspaces. (Fine-grained per-user permission scoping of AI answers is on the
  roadmap.)"*
- **Reason:** RBAC is defined but **never enforced**; the AI is not permission-scoped;
  Company Brain has no tenant scoping at all.
- **Evidence:** `PRODUCT_TRUTH.md` §2.6; `apps/web/src/auth/roles.ts:6-14`;
  `routes.ts:56`; `in-memory-company-brain.ts:32-37`.
- **Impact:** High — a security claim that, if relied on, would be false.

### C5 — Demo environment models a non-existent product
- **Source:** Demo (`demo/`).
- **Current wording:** NovaMak **manufacturer** with 42 employees, document knowledge
  base, and **tiered approval authority T0–T4** — `demo/DEMO_COMPANY.md:1-40`;
  `demo/src/data-model.mjs:41-47`.
- **Recommended wording:** Rebuild the demo around the **real** product: an agency
  workspace with clients/brands/products and a Mission taken through
  brief→creative→campaign→report (matching `apps/web` flows). If a manufacturer
  story is desired for GTM, label it explicitly as a *vision demo*, not the product.
- **Reason:** The code has no manufacturer, no documents, and no tiered approval-
  authority model — only fixed campaign gates.
- **Evidence:** `PRODUCT_TRUTH.md` §1–§2; approval gates `routes.ts:743-753`
  (no T0–T4).
- **Impact:** High — a "deterministic official sales demo" that shows a product the
  engine cannot run is the most dangerous kind of gap in a live sales call.

---

## 2. MAJOR gaps

### M1 — "Immutable audit trail" / "auditable"
- **Sources:** Sales Kit, Marketing, Security messaging.
- **Current wording:** *"**auditable** … immutable audit trail"* —
  `marketing/MARKETING_CONSTITUTION.md:36` and sales security sections.
- **Recommended wording:** *"Every action emits a structured event and is logged;
  approvals keep an ordered timeline. (A tamper-evident, immutable audit store is on
  the roadmap.)"*
- **Reason:** No immutable/append-only audit store exists.
- **Evidence:** `PRODUCT_TRUTH.md` §2.7; `apps/web/src/app.ts:66-67`.
- **Impact:** Material for regulated-sector messaging.

### M2 — "Strict multi-tenant isolation"
- **Sources:** Sales Kit, Marketing.
- **Current wording:** *"**multi-tenant** with strict isolation"*.
- **Recommended wording:** *"Multi-tenant isolation enforced in the application layer
  (ambient tenant context + per-query tenant filtering). Database-level RLS and
  Company-Brain tenant scoping are hardening items on the roadmap."*
- **Reason:** Isolation is real but app-enforced only — no DB RLS; `upsert`/`delete`
  omit `tenant_id`; Company Brain uses global maps.
- **Evidence:** `PRODUCT_TRUTH.md` §6.2; `packages/persistence/src/aggregate-store.ts:49-61`;
  `database.ts:8-10` (RLS claimed, absent).
- **Impact:** Material for CISO due diligence.

### M3 — "Autonomous"
- **Sources:** Website, Presentation, README (advertising family).
- **Current wording:** *"Run an **autonomous** AI ad agency"* —
  `website/WEBSITE_CONSTITUTION.md:64`.
- **Recommended wording:** *"an AI-assisted ad agency — the AI drafts each stage; a
  human approves before anything proceeds."*
- **Reason:** Default AI is deterministic/offline and **every** stage is human-gated;
  the autonomy domain is a stub.
- **Evidence:** `PRODUCT_TRUTH.md` §6.2; `apps/web/src/ai.ts:13`; `routes.ts:743-753`.
- **Impact:** Overstates automation; sets false expectations in demos.

### M4 — Tiered approval authority
- **Source:** Demo.
- **Current wording:** Approval tiers **T0–T4** with per-tier limits —
  `demo/src/data-model.mjs:41-47`.
- **Recommended wording:** *"Approvals use fixed campaign gates (strategy & budget,
  creative, launch). Tiered spend authority is not yet modeled."*
- **Reason:** Code has fixed gates, not a tiered authority model.
- **Evidence:** `PRODUCT_TRUTH.md` §6.2; `mission.ts:110`, `routes.ts:743-753`.
- **Impact:** Demo shows governance depth the product lacks.

### M5 — "Integrations" with external systems
- **Sources:** Marketing (assets/SEO mention connectors), general implication.
- **Current wording:** references to connectors/integrations and metric ingestion.
- **Recommended wording:** *"AdOS is self-contained; external connectors and
  automatic metric ingestion are on the roadmap. Today, performance metrics are
  entered manually."*
- **Reason:** `connector-hub` is an unwired stub; analytics metrics are hand-entered.
- **Evidence:** `PRODUCT_TRUTH.md` §2.5; `domains/connector-hub/src/events.ts:9-20`;
  `routes.ts:1026-1048`.
- **Impact:** Material if a buyer expects turnkey ad-platform integration.

---

## 3. MINOR gaps

### N1 — Real AI output implied by default
- **Sources:** all families.
- **Current wording:** implies real model answers out of the box.
- **Recommended wording:** *"Ships with a deterministic offline mode; connect a local
  engine (Ollama/vLLM) for live model output."*
- **Reason:** Default is `OfflineAIManager` (templates); live output needs a local
  engine. **Evidence:** `PRODUCT_TRUTH.md` §2.9; `ai-factory.ts:24-27`.
- **Impact:** Minor — the local-AI claim itself is true; only the default needs a note.

### N2 — "Runs advertising campaigns"
- **Sources:** Website, Presentation (`presentation/PRESENTATION_CONTENT.md:300`).
- **Current wording:** *"Run advertising campaigns."*
- **Recommended wording:** *"Plans and drafts advertising campaigns (ready for human
  launch)."*
- **Reason:** Campaigns never leave `draft`; nothing is launched to a platform.
- **Evidence:** `PRODUCT_TRUTH.md` §2.4; `campaign.test.ts:86-87`.
- **Impact:** Minor overstatement in otherwise code-aligned copy.

### N3 — Durable/enterprise persistence implied
- **Sources:** Sales/Marketing (enterprise framing).
- **Current wording:** enterprise-grade data platform implication.
- **Recommended wording:** *"Durable storage (SQLite/Postgres) is opt-in via
  `DATABASE_URL`; the default runtime is in-memory."*
- **Reason:** Default is in-memory. **Evidence:** `PRODUCT_TRUTH.md` §2.10; `app.ts:72`.
- **Impact:** Minor.

### N4 — Declared AI modalities (vision/image/speech)
- **Source:** any capability lists.
- **Current wording:** broad "AI capabilities."
- **Recommended wording:** limit claims to text generation + embeddings.
- **Reason:** Only chat/embedding engines exist; image/vision/speech are typed-only.
- **Evidence:** `PRODUCT_TRUTH.md` §4; `contracts/.../ai-task.ts:14-24`.
- **Impact:** Minor (not heavily marketed).

---

## 4. COSMETIC gaps

### K1 — `package.json` dual identity
- **Current wording:** *"AdOS — Enterprise AI Operating System. Autonomous AI
  advertising platform."* — `package.json:5`.
- **Recommended wording:** pick one canonical description consistent with the chosen
  positioning (e.g. *"AdOS — AI advertising-agency operating system (local, offline-
  capable)"*).
- **Reason:** Self-contradictory metadata. **Evidence:** `package.json:5`.
- **Impact:** Cosmetic; but it is the machine-readable identity.

### K2 — README/ARCHITECTURE tagline vs body
- **Current wording:** `# AdOS — Enterprise AI Operating System` (title) over a body
  describing an *"autonomous AI advertising agency"* — `README.md:1,3`;
  `ARCHITECTURE.md:3`.
- **Recommended wording:** align title and body to one positioning (advertising-
  accurate is recommended, per code).
- **Reason:** The brand-audit tagline swap introduced a title/body mismatch.
- **Evidence:** `README.md:1-3`.
- **Impact:** Cosmetic.

### K3 — Presentation "living memory" framing
- **Current wording:** Company Brain as *"your organization's living memory"* —
  `presentation/PRESENTATION_CONTENT.md:242`.
- **Recommended wording:** reframe to marketing-performance memory (per C2).
- **Reason:** Generic-KM framing of a marketing-metrics store.
- **Evidence:** `PRODUCT_TRUTH.md` §1.10.
- **Impact:** Cosmetic-to-minor (depends on adjacent claims).

---

## 5. Alignment scorecard by source

| Source | Positioning vs code | Dominant gap severity |
|---|---|---|
| **Website** (`website/`) | Advertising — **largely aligned** (new tagline reads "Enterprise AI OS that runs an autonomous AI ad agency") | Minor (M3, N2, K2) |
| **Presentation** (`presentation/`) | Mixed — advertising + KM pillars | Critical (C2, C3) + Minor |
| **Sales Kit** (`sales/`) | Enterprise-KM — **contradicts code** | Critical (C1–C4) |
| **Marketing** (`marketing/`) | Enterprise-KM — **contradicts code** | Critical (C1–C4) |
| **Demo** (`demo/`) | Enterprise-KM manufacturer — **contradicts code** | Critical (C5) |
| **README/ARCHITECTURE** | Advertising | Cosmetic (K2) |
| **Repo metadata** (`package.json`) | Both (contradiction) | Cosmetic (K1) |

---

## 6. The decision this forces

Every gap traces to one unmade decision: **is AdOS an advertising-agency OS (what the
code is) or a generic Enterprise AI Operating System (what sales/marketing/demo
claim)?** Two coherent resolutions exist:

- **A. Position to the code (recommended, low-risk):** market AdOS as the AI
  advertising-agency OS. Fix C1–C5 by rewriting sales/marketing/demo to the
  advertising reality; website/presentation need only Minor edits.
- **B. Build to the marketing (high-cost):** implement the document Company Brain,
  Digital Employees, permission-aware AI, and audit trail — a large engineering
  program — then the current sales/marketing/demo become true.

`POSITIONING_ALIGNMENT_PLAN.md` groups the required changes for **Option A** by area
with risk/time/effort estimates.

---

*No files were modified to produce this analysis. All "current wording" is quoted
from committed collateral; all "evidence" traces to `PRODUCT_TRUTH.md` and
`path:line` in source.*
