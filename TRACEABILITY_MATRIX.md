# AdOS — Claim Traceability Matrix

**Purpose:** every material claim made in AdOS go-to-market collateral (sales,
marketing, website, presentation, demo) traces to evidence in **`PRODUCT_TRUTH.md`**
— the single source of truth, itself derived only from source code, tests, and
implementation-tied comments. No claim may promise a capability absent from
PRODUCT_TRUTH.md; future capabilities are carried explicitly as **Roadmap**.

**Date:** 2026-07-27 · **Product:** AdOS v1.0.0

---

## A. Shipped claims → evidence

| # | Claim (as stated in collateral) | PRODUCT_TRUTH basis | Code evidence (from PRODUCT_TRUTH) |
|---|---|---|---|
| A1 | AdOS is the **Enterprise AI Operating System for Advertising** (an AI advertising-agency OS) | §1.1–1.4, §6.3 | `agency-os/.../mission.ts:73-79`; domain model `workspace…report/`; ad vocab `campaign ×306` |
| A2 | Takes a client objective through a **human-approved pipeline**: brief → creative → campaign draft → report → executive dashboard | §1.3 | `routes.ts:731-1184`; brief/creative/draft/report/dashboard services |
| A3 | **Every stage requires an explicit human approval**; gates strategy_and_budget / creative_assets / campaign_launch | §1.3, §6.1 | `mission.ts:110`, `routes.ts:743-753` |
| A4 | **Drafts** campaigns; a campaign draft is **never launched** | §2.4, §3 | `campaign-draft.ts:48-49`; `campaign.test.ts:86-87` |
| A5 | Creative stage produces **ad copy only**; never touches ad platforms | §2.4 | `creative-set.ts:16-17` |
| A6 | **Company Brain = marketing-performance memory** (CompanyDNA, brand profiles, campaign→ad→lead→ROI graph, winning-ad pattern library, experience engine) | §1.10, §6.2 | `in-memory-company-brain.ts:32-37`, `knowledge-graph.ts:4-6`, `pattern-library.ts:4-6`, `experience-engine.ts:6-11` |
| A7 | **Deterministic ad-KPIs**: CTR, CPC, CPA, CPL, ROAS, ROI | §3 | `analytics-engine/.../kpi.ts:39-50`, `campaign-report.test.ts:31-45` |
| A8 | **100% local, offline-capable AI; no cloud; no API keys; air-gap capable** | §1.5, §6.1 | `ollama-engine.ts:10`, `openai-compatible-engine.ts:8`, `ai.ts:8-13`, `ai-factory.ts:24-57` |
| A9 | **Deterministic** offline generation by default (no model server needed) | §2.9, §6.1 | `ai.ts:13`, `ai-factory.ts:24-27` |
| A10 | **No per-token / metered billing** | §6.1 | inference is local; only localhost `fetch` exists |
| A11 | **Application-level multi-tenant isolation** | §1.6, §6.2 | `tenant-context.ts:19-55`, `aggregate-store.ts:36-47` |
| A12 | **Real authentication** (Argon2id, HMAC HttpOnly sessions, CSRF, brute-force lockout, CSP/HSTS) | §1.7 | `auth/password.ts:9-22`, `session.ts:51-95`, `security.ts:10-43` |
| A13 | **Optional persistence** (SQLite + Postgres, opt-in via DATABASE_URL) | §1.8, §2.10 | `sqlite-database.ts`, `postgres-database.ts`, `db/repositories.test.ts:130-175` |
| A14 | **Activity log + per-approval timeline** (not an immutable audit trail) | §2.7, §6.2 | `app.ts:66-67,126-127` |
| A15 | **Bilingual TR/EN** UI and AI output language | §1.11, §6.1 | `i18n.ts`, `ai-live.ts:139-141` |
| A16 | **Substantial automated test suite** (~64 files, ~368 cases) | §1.9 | `onboarding/mission-processing/campaign/approval/db` tests |

---

## B. Roadmap claims → why they are Roadmap (not shipped)

Each of these appears in collateral **only** under an explicit "Roadmap" / "Yol
Haritası" label or a negation, mapped to PRODUCT_TRUTH §2/§4/§5.

| # | Roadmap item | PRODUCT_TRUTH basis | Reality |
|---|---|---|---|
| R1 | Document knowledge base / document Q&A | §2.1, §4 | No ingestion/chunking/embedding of documents anywhere |
| R2 | Cited answers over documents | §2.2, §4 | `cite`/`citation` = 0 in domain code |
| R3 | "Digital Employees" / autonomous agents doing real work | §2.3, §5 | `agent-framework`/`autonomy` = event-name stubs, 0 importers |
| R4 | Live ad launch / campaign optimization | §2.4, §4 | drafts only; no ad-platform client |
| R5 | External integrations / connectors (Meta/Google/…) | §2.5, §4 | `connector-hub` stub, 0 importers |
| R6 | Enforced RBAC / permission-aware AI | §2.6, §4 | roles defined, never enforced (`roles.ts:6-9`, `routes.ts:56`) |
| R7 | Immutable / tamper-evident audit trail | §2.7, §4 | logger lines + bounded ring only |
| R8 | DB-level Row-Level Security | §4, §6.2 | claimed in a comment only; not configured |
| R9 | Cloud inference | §2.8, §4 | flag exists, never read (`config/schema.ts:58-59`) |
| R10 | Image / vision / speech AI | §4 | declared in a type enum, no engine |
| R11 | Tiered approval authority (T0–T4 spend limits) | §6.2 | approval gates exist; no tiered authority model |

---

## C. Reconciliations applied during alignment

| Legacy framing (removed) | Aligned framing (shipped truth) |
|---|---|
| "Advertising Operating System" / "Reklam İşletim Sistemi" | "Enterprise AI Operating System for Advertising" |
| Generic Enterprise-KM / "ask your documents" | Advertising-agency OS; Company Brain = campaign-performance memory |
| "Company Brain cites its sources" | "Company Brain surfaces what worked (winning ads/channels/budgets)" |
| "Digital Employees" | "AI-assisted pipeline stages" (autonomy → Roadmap) |
| "launches / runs / optimizes campaigns" | "drafts campaigns; export to your own ad platform" |
| "permission-aware AI / RBAC enforced" | "human-approved at every stage" (RBAC → Roadmap) |
| "immutable audit trail" | "activity log + per-approval timeline" (immutable → Roadmap) |
| "strict / DB-level isolation" | "application-level multi-tenant isolation" |
| "autonomous AI runs your marketing" | "AI-assisted, human-in-the-loop pipeline" |

---

*This matrix is the contract for future collateral: any new sales or marketing
material must trace each capability claim to a row in §A, or carry it as an
explicitly-labeled Roadmap item per §B. If a claim cannot be traced, it must be cut.*
