# AdOS Partner Toolkit — Checklists & Templates

| | |
|---|---|
| **Owner** | Partner Tools |
| **Status** | Official — aligned to PRODUCT_TRUTH.md |
| **Version** | 1.0.0 · Aligned to AdOS v1.0.0 |
| **Source of truth** | [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md) |

> **AdOS — Enterprise AI Operating System for Advertising.** An offline-first, 100%
> local-AI platform that takes a client's advertising objective (a **Mission**)
> through a **human-approved pipeline** — marketing brief → creative (ad copy) →
> campaign **draft** → performance report → executive dashboard — and remembers what
> works in a marketing-performance **Company Brain**. It **drafts**; it never launches
> live ads.

---

## 0. How to use this toolkit

These are ready-to-use, copy-and-fill artifacts for **Implementation (Delivery)
Partners**, **Reseller Partners**, and **Referral Partners**. Copy any section into
your engagement workspace and check the boxes as you go.

**Grounding rules — read before you delete a box:**

- Every checklist item reflects **real, shipped v1.0.0 behavior** per
  [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md). Anything that depends on an unshipped
  capability lives ONLY under a labeled **🟣 Roadmap** callout — never as a live step.
- **AdOS is customer self-hosted.** Partners install and operate it on the customer's
  own infrastructure. There is **no vendor cloud, no vendor telemetry, and no standing
  vendor access.** Every metric, health input, and status figure in this toolkit is
  **partner-reported or customer-shared**, never auto-collected from a customer
  instance.
- Phase names, delivery roles, partner tiers, and severity levels are consistent with
  [./PARTNER_PROGRAM_CONSTITUTION.md](./PARTNER_PROGRAM_CONSTITUTION.md),
  [./IMPLEMENTATION_METHODOLOGY.md](./IMPLEMENTATION_METHODOLOGY.md), and the CS
  program docs referenced throughout.

**Delivery roles used below:** Engagement Lead (partner PM/owner) · Solution Architect
· Implementation Consultant · Trainer · Support Engineer · customer-side Executive
Sponsor · customer-side Admin/Champion.

**⛔ Steps you will NOT find here — because the product does not do them in v1.0.0:**
*configure external connectors / ad-platform sync · set RBAC permissions that restrict
what the AI can surface · verify an immutable/tamper-proof audit trail · ingest or
Q&A over documents · launch or optimize live ads.* Each appears once, correctly, under
**🟣 Roadmap** (§11).

---

## 1. Implementation checklist — mapped to the 10 phases

Fixed phase order (per [./IMPLEMENTATION_METHODOLOGY.md](./IMPLEMENTATION_METHODOLOGY.md)):
**Discovery → Planning → Installation → Configuration → Migration → Training →
Go-live → Hypercare → Acceptance → Closure.** Owner shown per row.

### Phase 1 — Discovery
- [ ] Confirm the opportunity is deal-registered and in good standing *(Engagement Lead)*
- [ ] Run the Discovery Questionnaire (§3) with the Executive Sponsor + Admin/Champion *(Engagement Lead)*
- [ ] Confirm the use case is **advertising/marketing** (Missions → drafts), not generic document Q&A *(Solution Architect)*
- [ ] Capture target infrastructure: self-hosted host/VM/on-prem, OS, CPU/RAM, whether air-gapped *(Solution Architect)*
- [ ] Decide AI engine intent: **Offline default** (deterministic templates, no server) vs. **local Ollama / OpenAI-compatible** for genuine prose *(Solution Architect)*
- [ ] Record success criteria in customer terms → feeds the Acceptance checklist (§8) *(Engagement Lead)*
- **Exit:** signed-off Discovery summary + confirmed scope.

### Phase 2 — Planning
- [ ] Produce the implementation plan, RACI, and timeline *(Engagement Lead)*
- [ ] Stand up the Risk Register (§6) with starter rows tailored to this customer *(Engagement Lead)*
- [ ] Confirm the persistence decision: in-memory (default) vs. **SQLite/Postgres via `DATABASE_URL`** *(Solution Architect)* — see [../DEPLOYMENT.md](../DEPLOYMENT.md)
- [ ] Plan TLS termination so **HSTS** is meaningful, and plan the session-secret handling *(Solution Architect)*
- [ ] Schedule the Discovery/Design Workshop (§4) and the Kickoff (§5.1) *(Engagement Lead)*
- **Exit:** approved plan + booked workshop/kickoff.

### Phase 3 — Installation (self-hosted)
- [ ] Install AdOS on the customer's infrastructure per [../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md) *(Implementation Consultant)*
- [ ] Apply the deployment configuration per [../DEPLOYMENT.md](../DEPLOYMENT.md) *(Implementation Consultant)*
- [ ] Set a strong, unique session/HMAC secret and environment config *(Implementation Consultant)*
- [ ] Terminate TLS/HTTPS in front of the app so **CSP/HSTS** headers are effective *(Implementation Consultant)*
- [ ] Boot the app; confirm health endpoint / start-up succeeds *(Implementation Consultant)*
- **Exit:** app reachable over HTTPS on customer infra.

### Phase 4 — Configuration
- [ ] Verify **built-in security hardening** is in effect (nothing to "turn on" — confirm it is present): Argon2id password hashing, HMAC HttpOnly sessions + per-session **CSRF**, brute-force **lockout**, **CSP/HSTS** headers *(Solution Architect)* — see [../SECURITY_GUIDE.md](../SECURITY_GUIDE.md)
- [ ] Test brute-force lockout by exceeding the login attempt threshold on a test account *(Implementation Consultant)*
- [ ] Select and configure the **local AI engine**: keep the **Offline default**, or point AdOS at a **local Ollama / OpenAI-compatible** server (localhost, **no API key, no cloud**) — see [../AI_GUIDE.md](../AI_GUIDE.md) *(Solution Architect)*
- [ ] If persistence is in scope, set `DATABASE_URL` (SQLite/Postgres) and run forward-only migrations *(Implementation Consultant)*
- [ ] Set UI/AI **language (TR/EN)** default for the customer *(Implementation Consultant)*
- [ ] Create the first admin user and hand off credentials securely *(Implementation Consultant)*
- **Exit:** secured, engine-selected, (optionally) persistent instance.

### Phase 5 — Migration *(see full checklist §7)*
- [ ] Hand-enter/config the customer's **Clients → Brands → Products** *(Implementation Consultant)*
- [ ] Populate Brand voice/rules/banned words and Product pricing *(Implementation Consultant + Admin/Champion)*
- [ ] Hand-enter **historical KPI figures** (CTR/CPC/CPA/CPL/ROAS/ROI) via the form *(Admin/Champion)*
- [ ] Seed the **Company Brain** with known winning-campaign/marketing-performance context *(Solution Architect)*
- **Exit:** customer's advertising entities and baseline figures present.

### Phase 6 — Training
- [ ] Deliver **Administrator training** per [../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md) *(Trainer)*
- [ ] Deliver **End-user training** per [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md) *(Trainer)*
- [ ] Walk the Admin/Champion through the **onboarding wizard** and the **human-approved pipeline** end to end *(Trainer)*
- [ ] Confirm at least one customer staff member is on track toward certification per [../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md) *(Engagement Lead)*
- **Exit:** trained admin + trained end users; training attendance logged.

### Phase 7 — Go-live *(see full checklist §9)*
- [ ] Complete the Go-live Readiness review (§5.4) with a Go/No-Go decision *(Engagement Lead)*
- [ ] Run the **first real Mission** through the full pipeline with all approval gates *(Admin/Champion + Solution Architect)*
- [ ] Confirm backup + **restore** was rehearsed (if persistence enabled) *(Implementation Consultant)*
- **Exit:** signed Go/No-Go = Go; production use begins.

### Phase 8 — Hypercare
- [ ] Run the agreed hypercare window with heightened support per [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md) *(Support Engineer)*
- [ ] Triage issues using the shared **Sev 1–4** model per [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md) *(Support Engineer)*
- [ ] Hold daily/every-other-day check-ins; log Missions run and issues *(Engagement Lead)*
- **Exit:** stable operation, open issues at/under agreed threshold.

### Phase 9 — Acceptance *(see full checklist §8)*
- [ ] Walk the Acceptance checklist (§8) against the Discovery success criteria *(Engagement Lead + Executive Sponsor)*
- [ ] Obtain written customer sign-off *(Executive Sponsor)*
- **Exit:** signed acceptance.

### Phase 10 — Closure
- [ ] Transition from hypercare to steady-state support (partner Tier-1 fronts the customer) *(Support Engineer)*
- [ ] Record the reference implementation toward the partner's tier requirements *(Engagement Lead)*
- [ ] Capture lessons learned; update the Risk Register outcomes *(Engagement Lead)*
- [ ] Schedule the first **QBR** (§5.3) and the health-review cadence (§10) *(Engagement Lead)*
- **Exit:** engagement closed; ongoing cadence booked.

---

## 2. Sales checklist

For Reseller and Referral motions. Revenue = **license/subscription resale margin**,
**implementation & services** (100% partner-retained), **support/managed services**,
and **referral fees**. There is **no per-token, usage, or cloud-consumption billing** —
never quote one.

**Qualify**
- [ ] Confirmed advertising/marketing use case (Missions → drafts), not generic document KM
- [ ] Buyer accepts a **customer self-hosted** model (their infra / on-prem / private)
- [ ] Infra can host the app (+ optional local model engine, + optional DB)
- [ ] Executive Sponsor identified and engaged

**Position (truthful value)**
- [ ] Led with: 100% **local AI**, **no cloud / no API keys / no per-token billing**, air-gap capable
- [ ] Led with: **human-approved pipeline** (brief → creative copy → campaign draft → report → dashboard)
- [ ] Led with: **Company Brain** = marketing-performance memory (learns what worked)
- [ ] Led with: bilingual **TR/EN**, real auth, optional persistence, backup/recovery
- [ ] Stated the honest boundary: AdOS **drafts** — it does **not** launch/optimize live ads
- [ ] Did NOT imply: document Q&A, Digital Employees, live ad launch, connectors, enforced RBAC, immutable audit (see §11 Roadmap if asked)

**Commercials**
- [ ] Deal registered (illustrative protection window, e.g. 90 days) *(Reseller/Referral)*
- [ ] Correct tier discount applied (illustrative: Registered 10% / Silver 15% / Gold 20% / Platinum 25% off list)
- [ ] Services scoped separately (100% partner-retained)
- [ ] Referral fee terms confirmed if Referral motion (illustrative: 10% of first-year license)

**Handoff to delivery**
- [ ] Discovery Questionnaire (§3) scheduled
- [ ] Signed order + agreement executed per [./PARTNER_AGREEMENT_TEMPLATE.md](./PARTNER_AGREEMENT_TEMPLATE.md)

---

## 3. Discovery questionnaire (template)

Copy and fill with the Executive Sponsor + Admin/Champion.

**A. Business & scope**
1. What advertising/marketing objectives will you state as **Missions**? ______
2. Which **Clients / Brands / Products** must exist on day one? ______
3. Per brand: voice, rules, **banned words**? Per product: **pricing**? ______
4. Primary UI/AI **language**: TR / EN / both? ______

**B. Infrastructure (self-hosted)**
5. Where will AdOS run (VM / on-prem server / private cloud)? OS? CPU/RAM? ______
6. Is the environment **air-gapped** or internet-restricted? ______
7. Who owns TLS/HTTPS termination in front of the app? ______

**C. AI engine**
8. Is the **Offline default** (deterministic templates, no server) sufficient, or do you need **genuine model prose**? ______
9. If prose: **local Ollama** or **OpenAI-compatible** local server? Which model? (Reminder: local only, **no API key, no cloud**.) ______

**D. Persistence & continuity**
10. Do you need durable storage (**SQLite/Postgres via `DATABASE_URL`**) or is in-memory acceptable for the pilot? ______
11. Backup destination and required **restore** drill cadence? (See [../BACKUP_GUIDE.md](../BACKUP_GUIDE.md), [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md).) ______

**E. Data to bring in (hand-entered/config — see §7)**
12. Do you have **historical KPI figures** (CTR/CPC/CPA/CPL/ROAS/ROI) to enter by hand? Format? ______
13. Any known **winning-campaign** context to seed the Company Brain? ______

**F. People & success**
14. Executive Sponsor / Admin-Champion / end users and counts? ______
15. What does "**done and successful**" mean to you? (These become Acceptance criteria, §8.) ______

> **🟣 Roadmap — do NOT scope as v1.0.0:** questions about connecting Meta/Google/CRM,
> ingesting documents for Q&A, permission-restricted AI answers, or auto-launching ads.
> If raised, capture as future interest and flag against §11 — do not commit delivery.

---

## 4. Discovery / design workshop agenda (half-day)

| Time | Topic | Lead | Output |
|---|---|---|---|
| 0:00 | Welcome, goals, ground rules | Engagement Lead | Shared agenda |
| 0:15 | Truthful product walkthrough: Missions → human-approved pipeline → drafts → Company Brain | Solution Architect | Aligned expectations |
| 0:45 | Advertising model mapping: Clients/Brands/Products, voice/rules/pricing | Solution Architect | Entity list for §7 |
| 1:15 | Infrastructure & security: self-hosted target, TLS, built-in Argon2id/CSRF/lockout/CSP-HSTS | Implementation Consultant | Install prerequisites |
| 1:45 | AI engine choice: Offline default vs. local Ollama / OpenAI-compatible | Solution Architect | Engine decision |
| 2:15 | Persistence & continuity: DATABASE_URL, backup/restore expectations | Implementation Consultant | Persistence decision |
| 2:45 | Data-in plan: hand-entered entities + historical KPIs; Company Brain seed | Implementation Consultant | Migration scope (§7) |
| 3:15 | Success criteria + risks | Engagement Lead | Acceptance criteria + Risk Register seed |
| 3:45 | Next steps, owners, dates | Engagement Lead | Actioned plan |

> **🟣 Roadmap parking lot:** connectors, document Q&A, enforced RBAC, live ad launch,
> autonomous agents. Park visibly; do not fold into the delivery plan.

---

## 5. Meeting templates

### 5.1 Kickoff
- **Attendees:** Engagement Lead, Solution Architect, Executive Sponsor, Admin/Champion
- [ ] Confirm scope, success criteria, timeline, RACI
- [ ] Confirm self-hosted target + who owns infra/TLS
- [ ] Confirm AI engine and persistence decisions
- [ ] Review Risk Register (§6) and communication cadence
- [ ] Confirm phase gates and the Go-live readiness date
- **Decisions / Actions / Owners / Dates:** ______

### 5.2 Weekly status
- **Attendees:** Engagement Lead, Implementation Consultant, Admin/Champion
- [ ] Current phase (of 10) and % complete
- [ ] Done since last / planned before next
- [ ] Blockers + open **Sev 1–4** issues (per [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md))
- [ ] Risk Register changes; schedule/scope/budget status (RAG)
- **Notes / Actions:** ______

### 5.3 Quarterly Business Review (QBR)
- **Attendees:** Engagement Lead, Executive Sponsor, (Solution Architect as needed)
- [ ] Adoption & value review using **customer-shared** figures only (no vendor telemetry)
- [ ] Health review (§10) walkthrough + RAG trend
- [ ] Missions run / drafts + reports produced (customer-reported)
- [ ] Support summary (Sev mix, SLA response performance)
- [ ] Roadmap alignment: which §11 items the customer is waiting on
- [ ] Renewal outlook, expansion, joint plan actions
- **Decisions / Actions:** ______

### 5.4 Go-live readiness (Go/No-Go)
- **Attendees:** Engagement Lead, Solution Architect, Implementation Consultant, Executive Sponsor
- [ ] Go-live checklist (§9) complete
- [ ] Acceptance criteria testable
- [ ] Support/hypercare coverage confirmed (partner Tier-1)
- [ ] Rollback/restore path confirmed (if persistence enabled)
- **Decision:** ☐ Go ☐ Conditional Go ☐ No-Go — **Owner/Date:** ______

---

## 6. Risk register — starter rows

Likelihood (L) / Impact (I): H/M/L. Tailor and add rows per engagement.

| # | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Buyer expects **document Q&A / "ask your documents"** — not in product | M | H | Reset expectations at Discovery; show Company Brain = marketing-performance memory; flag as 🟣 Roadmap (§11) | Solution Architect |
| R2 | Buyer expects AdOS to **launch/optimize live ads** | M | H | State drafts-only boundary in Sales (§2) and Kickoff; position export-to-your-platform; 🟣 Roadmap for connectors | Engagement Lead |
| R3 | Buyer expects **enforced RBAC / permission-aware AI** | M | H | Explain roles exist but AI is not permission-scoped in v1.0.0; 🟣 Roadmap; use human approval gates as the control | Solution Architect |
| R4 | Expected **genuine AI prose** but only Offline default configured | M | M | Confirm engine intent at Discovery; configure local Ollama / OpenAI-compatible before Go-live | Implementation Consultant |
| R5 | **Data loss** because persistence not enabled (in-memory default) | M | H | Decide persistence early; set `DATABASE_URL`; rehearse **restore** ([../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md)) | Implementation Consultant |
| R6 | **HSTS/CSP ineffective** without TLS termination | M | M | Assign TLS ownership in Planning; verify headers in Configuration | Solution Architect |
| R7 | **Historical KPIs** larger/messier than expected (hand-entry effort) | H | M | Scope volume in Discovery (§3-E); agree entry batch plan; set realistic timeline | Engagement Lead |
| R8 | Air-gapped install blocks model/package fetch | M | M | Pre-stage all artifacts; validate against [../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md) offline steps | Implementation Consultant |
| R9 | Customer expects **vendor monitoring/telemetry** of their instance | M | M | State no phone-home / no standing access; health is customer-shared (§10) | Engagement Lead |
| R10 | Low adoption after Go-live | M | H | Training (§ Phase 6), hypercare check-ins, health review cadence (§10) | Support Engineer |

---

## 7. Migration checklist

**Scope:** importing the customer's advertising entities and **historical KPI figures
by hand / configuration.** This is **NOT** document ingestion and **NOT** ad-platform
sync — neither exists in v1.0.0.

**Entities (hand-entered / config)**
- [ ] Create all **Clients**
- [ ] Create all **Brands**; set **voice, rules, banned words** per brand
- [ ] Create all **Products**; set **pricing** per product
- [ ] Verify the Workspace → Client → Brand → Product hierarchy matches the customer's structure

**Historical figures (hand-entered via form)**
- [ ] Enter **historical KPI figures** (CTR / CPC / CPA / CPL / ROAS / ROI) via the performance form
- [ ] Spot-check entered values against the customer's source sheet
- [ ] Record the **as-of date** for each figure batch

**Company Brain seed**
- [ ] Capture known **winning-campaign / winning-ad** context and marketing-performance history
- [ ] Confirm the Company Brain reflects the customer's prior learnings

**Verification & sign-off**
- [ ] Reconcile entity counts (Clients/Brands/Products) with the customer's list
- [ ] Admin/Champion confirms migrated data is correct
- [ ] If persistence enabled, confirm entities persist across a restart

> **🟣 Roadmap — NOT part of v1.0.0 migration:** document ingestion/embedding, ad-platform
> data sync (Meta/Google/CRM), automated connector imports. Do not attempt or promise these.

---

## 8. Acceptance checklist

Test against the Discovery success criteria (§3-F). Sign-off is customer-owned.

- [ ] App installed on customer infrastructure and reachable over **HTTPS**
- [ ] Built-in security **verified present**: Argon2id hashing, CSRF, brute-force lockout, CSP/HSTS
- [ ] AI engine matches decision (Offline default **or** local Ollama / OpenAI-compatible working)
- [ ] Persistence decision honored; if enabled, **backup + restore** rehearsed successfully
- [ ] Onboarding wizard completed: Workspace → Client → Brand → Product → Mission
- [ ] A **Mission** ran the full **human-approved pipeline** with all approval gates (`strategy_and_budget`, `creative_assets`, `campaign_launch`)
- [ ] Outputs produced: marketing brief → creative (ad **copy**) → campaign **draft** (channels/ad sets/budget split, remains `draft`) → performance report → executive dashboard
- [ ] Migrated entities + historical KPIs (§7) present and reconciled
- [ ] Company Brain seeded and reflecting prior learnings
- [ ] TR/EN language behaves as configured
- [ ] Admin + end users trained (§ Phase 6); attendance logged
- [ ] Each Discovery success criterion demonstrably met: ______
- [ ] **Executive Sponsor written sign-off:** ____________ Date: ______

> **Out of acceptance scope (🟣 Roadmap, §11):** live ad launch, connector syncs, document
> Q&A/citations, enforced RBAC, immutable audit verification. Do not list these as acceptance tests.

---

## 9. Go-live checklist

- [ ] Go/No-Go review (§5.4) held; decision = **Go**
- [ ] Production instance on customer infra, HTTPS/TLS live (HSTS effective)
- [ ] Strong session/HMAC secret set; default/admin credentials rotated
- [ ] Built-in security confirmed in the production instance (Argon2id/CSRF/lockout/CSP-HSTS)
- [ ] AI engine finalized (Offline default or local Ollama / OpenAI-compatible reachable on localhost)
- [ ] Persistence finalized (`DATABASE_URL` set) **and** a **restore** drill passed — if in scope
- [ ] First real **Mission** completed end to end through all approval gates
- [ ] Historical KPIs + entities present (§7); Company Brain seeded
- [ ] Backups scheduled; recovery runbook in customer's hands ([../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md))
- [ ] Hypercare window scheduled; partner **Tier-1** support fronting the customer; **Sev 1–4** intake ready
- [ ] Known limitations reviewed with customer ([../KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md))
- [ ] Rollback plan documented
- **Go-live owner / date:** ______

---

## 10. Health review template (customer-shared inputs, RAG)

**Cadence:** monthly light-touch + at each QBR (§5.3). Aligns to the CS Customer Health
model in [../customer-success/CUSTOMER_HEALTH.md](../customer-success/CUSTOMER_HEALTH.md).

**Non-negotiable:** AdOS is self-hosted with **no vendor telemetry**. **Every input
below is customer-shared** (the admin exports, screen-shares, or reports it). Always
record an **as-of / data-shared date** and note any dimension the customer did not share.

| Dimension | Signal (real product) | Source | Score 0–100 | RAG |
|---|---|---|---|---|
| Adoption | Workspaces/Clients/Brands/Products configured; users onboarded | Customer-shared onboarding & user roster | | 🟢🟡🔴 |
| Usage | Missions run; login activity (in-product activity feed) | Customer-reported counts / shared feed | | 🟢🟡🔴 |
| AI utilization | Stages generating drafts; engine type configured | Customer states engine + volume | | 🟢🟡🔴 |
| Campaign throughput | CampaignDrafts + reports produced/approved; KPIs hand-entered | Customer-shared counts + KPI reports | | 🟢🟡🔴 |
| Data continuity | Persistence enabled; backups + restore verified | Customer confirms config + drill | | 🟢🟡🔴 |
| Security posture | Built-in hardening in effect; TLS/HSTS live | Customer confirms deployment | | 🟢🟡🔴 |
| Support health | Open Sev 1–4 mix; SLA response performance | Partner support records | | 🟢🟡🔴 |
| Training/enablement | Admin + users trained; certification progress | Partner + customer records | | 🟢🟡🔴 |
| Renewal probability | Stated intent + budget | CSM/partner judgment from shared signals | | 🟢🟡🔴 |
| Expansion opportunity | More seats/brands/clients; local engine + persistence maturity | Customer conversations + shared config | | 🟢🟡🔴 |

**Composite:** ____ / 100 → **Overall RAG:** 🟢 / 🟡 / 🔴
**As-of / data-shared date:** ______ · **Dimensions not shared this cycle:** ______
**Top 3 actions / owners / dates:** ______

RAG legend: 🟢 Green = healthy · 🟡 Amber = drifting/watch · 🔴 Red = at risk.

---

## 11. 🟣 Roadmap — NOT available in v1.0.0

These capabilities are **not shipped**. Never scope, promise, test, or check them as
present-tense delivery. Track customer interest here and against
[../ROADMAP.md](../ROADMAP.md); the honest v1.0.0 boundary is
[../KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md).

- **External connectors / ad-platform & CRM sync** (Meta/Google/TikTok/LinkedIn/CRM). Today: export the draft to run in your own platform; KPIs are hand-entered.
- **Live ad launch & optimization.** Today: AdOS produces **drafts** that never leave `draft`.
- **Document knowledge base / document Q&A / cited answers.** Today: Company Brain is marketing-performance memory only.
- **Enforced RBAC / permission-aware AI.** Roles are defined but not enforced; the AI is not permission-scoped. Today the control is human approval at every gate.
- **Immutable / tamper-proof audit trail.** Today: activity log + per-approval timeline only.
- **Autonomous agents / "Digital Employees."** Today: AI-assisted, human-in-the-loop pipeline.
- **Cloud / hosted / external AI inference.** Today: 100% local models on the customer's own infrastructure.
- **Tiered approval authority (T0–T4 spend limits).** Today: approval gates only, no tiered authority model.
- **DB-level Row-Level Security.** Today: application-level multi-tenant isolation.
- **Vision / speech / image / video AI.** Not available.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
