# AdOS — Standard Implementation Methodology

> **Owner:** Delivery / Partner
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

This is the standard methodology every AdOS **Implementation (Delivery) Partner**
follows to install, configure, migrate, train, and hand over an AdOS deployment on a
**customer's own infrastructure**. It is the delivery counterpart to the customer-side
[../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md)
and inherits its role definitions and program governance from the companion
partner-program document `PARTNER_PROGRAM_CONSTITUTION.md`.

---

## 0. What we are implementing (truthful framing)

AdOS is the **Enterprise AI Operating System for Advertising**
(TR: *"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"*). It is an offline-first,
100% local-AI platform that takes a client's advertising objective — a **Mission** —
through a **human-approved pipeline**:

> Mission → Marketing Brief → Creative Set (ad copy) → Campaign **Draft**
> (channels / ad sets / budget split) → Performance Report → Executive / CEO Dashboard

and remembers what works in a marketing-performance **Company Brain**. **Every stage
requires an explicit human approval click.** AdOS **drafts** campaigns; it never
launches live ads.

**Deployment model.** The customer self-hosts AdOS on their own infrastructure
(on-prem, private cloud, or air-gapped). There is **no vendor cloud, no vendor
telemetry, and no standing vendor access**. Every piece of acceptance evidence in
this methodology is therefore demonstrated on the **customer's own instance**, not
collected remotely.

### 0.1 What "Migration" means here (read this before Phase 5)

In AdOS, **Migration = importing the customer's business model into the product by
hand and by configuration**: their **Clients, Brands** (voice / rules / banned words),
**Products** (with pricing), and any **historical KPI figures** the customer wants the
Company Brain to learn from. Historical performance numbers (CTR / CPC / CPA / CPL /
ROAS / ROI) are **typed into the in-app analytics form**, exactly as day-to-day
metrics are entered.

Migration in AdOS is explicitly **NOT**:

- **Not document ingestion.** AdOS has no document knowledge base, no chunking, no
  embedding of uploaded files, and no document Q&A. There is nothing to "ingest."
- **Not ad-platform sync.** AdOS has **no connectors** to Meta / Google / TikTok /
  LinkedIn / CRMs / data warehouses. No metric is pulled automatically; there is no
  importer to configure.

Connector-based migration is **Roadmap only** — see §14.

---

## 1. Delivery roles (RACI legend)

Roles are consistent with the companion `PARTNER_PROGRAM_CONSTITUTION.md` and the
certification levels in
[../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md).

| Code | Role | Side | Typical certification |
|---|---|---|---|
| **EL** | Engagement Lead (partner PM / accountable owner) | Partner | Professional+ |
| **SA** | Solution Architect | Partner | Architect |
| **IC** | Implementation Consultant | Partner | Administrator |
| **TR** | Trainer | Partner | Trainer |
| **Sp** | Executive Sponsor | Customer | — |
| **Ad** | Admin / Champion | Customer | Administrator (post-training) |

RACI values in each phase table use **R** = Responsible, **A** = Accountable,
**C** = Consulted, **I** = Informed.

---

## 2. Timeline overview (illustrative)

Durations are **illustrative** for a mid-size single-tenant deployment; scale by
number of workspaces, brands, and historical-KPI volume.

| # | Phase | Primary outcome | Illustrative duration |
|---|---|---|---|
| 1 | **Discovery** | Confirmed scope, environment, and fit to real product | 3–5 days |
| 2 | **Planning** | Signed-off implementation plan, RACI, schedule | 2–4 days |
| 3 | **Installation** | AdOS built and running on customer infra | 1–3 days |
| 4 | **Configuration** | Security, local AI engine, persistence, backups set | 2–4 days |
| 5 | **Migration** | Clients/Brands/Products + historical KPIs loaded by hand | 3–8 days |
| 6 | **Training** | Admins and end users certified/enabled | 3–5 days |
| 7 | **Go-live** | First real Mission through the human-approved pipeline | 2–3 days |
| 8 | **Hypercare** | Stabilized operations, Sev 1–4 support live | 5–10 days |
| 9 | **Acceptance** | Signed acceptance on the customer's own instance | 2–3 days |
| 10 | **Closure** | Handover, retrospective, transition to run-state | 1–2 days |

Phases run in **fixed order**. Installation and Configuration may overlap; Migration
must not begin until Configuration exit criteria are met.

---

## 3. Phase 1 — Discovery

**Objectives.** Confirm the engagement is a fit for the **real** AdOS product,
capture the customer's advertising operating model, and inventory the target
infrastructure. Surface any expectation that maps to a **Roadmap** item (§14) early.

**Activities.**
- Map the customer's business to the AdOS domain model (Workspace → Client → Brand →
  Product → Project → Mission).
- Inventory infrastructure against [../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md):
  Node.js ≥ 20, pnpm 9, and optionally Docker, PostgreSQL, and a local inference
  engine (Ollama / vLLM / LM Studio / llama.cpp / SGLang).
- Decide the AI posture: default deterministic **OfflineAIManager** (no model server)
  vs. a **local** model engine (100% local — no cloud, no API keys).
- Decide the persistence posture: in-memory (evaluation only) vs. durable SQLite /
  Postgres via `DATABASE_URL`.
- Catalogue the customer's Brands, Products, Clients, and the volume/format of any
  **historical KPI figures** to be hand-entered in Migration.
- Explicitly flag out-of-scope asks (document Q&A, connectors, autonomous agents,
  live ad launch, enforced RBAC) and record them as **Roadmap**, not commitments.

**Deliverables.** Discovery report; domain-model mapping; infrastructure inventory;
AI/persistence posture decision; historical-KPI source inventory; Roadmap/expectation
register.

**Entry criteria.** Signed engagement / order; named customer Executive Sponsor.

**Exit criteria.** Scope, infrastructure, AI posture, and persistence posture agreed
in writing; historical-KPI sources catalogued; no unresolved dependency on a Roadmap
capability; sign-off by Engagement Lead and customer Sponsor.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Business/domain mapping | A | R | C | I | C | C |
| Infrastructure inventory | C | R | R | I | I | C |
| AI/persistence posture | A | R | C | I | C | I |
| Scope & Roadmap register | A | C | I | I | R | I |

**Risks & mitigations.**
- *Customer expects generic document Q&A or connectors.* → Anchor to
  [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md); move to Roadmap register before Planning.
- *Infra can't meet Node ≥ 20 / resource needs for a local model.* → Choose the
  OfflineAIManager posture or right-size hardware now.

**Duration (illustrative).** 3–5 days.

---

## 4. Phase 2 — Planning

**Objectives.** Convert Discovery into an executable, staffed, scheduled plan with
clear entry/exit gates and an acceptance definition.

**Activities.**
- Build the RACI staffing plan (EL / SA / IC / TR) and confirm customer Sponsor +
  Admin availability.
- Define the environment plan (build host, runtime host(s), optional Docker stack,
  Postgres, local model host) per [../DEPLOYMENT.md](../DEPLOYMENT.md).
- Draft the **acceptance criteria** to be demonstrated on the customer's own instance
  in Phase 9.
- Plan the training path against
  [../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md)
  and [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md).
- Agree the support model for Hypercare (Sev 1–4) per
  [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md).

**Deliverables.** Implementation plan; RACI; schedule/milestones; environment plan;
draft acceptance criteria; risk register.

**Entry criteria.** Discovery exit met.

**Exit criteria.** Plan, schedule, RACI, and draft acceptance criteria signed off by
Engagement Lead and customer Sponsor; environments provisioned or scheduled.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Staffing & schedule | A | C | C | C | C | I |
| Environment plan | C | A | R | I | I | C |
| Acceptance criteria draft | A | R | C | C | R | C |
| Training plan | C | I | I | A | I | C |

**Risks & mitigations.**
- *Ambiguous acceptance criteria.* → Tie every criterion to a demonstrable pipeline
  step on the customer instance.
- *Customer resource unavailability.* → Lock Sponsor/Admin time in the schedule now.

**Duration (illustrative).** 2–4 days.

---

## 5. Phase 3 — Installation

**Objectives.** Get AdOS built and running on the customer's infrastructure.

**Activities.** Per [../INSTALLATION_GUIDE.md](../INSTALLATION_GUIDE.md):
- Verify prerequisites: **Node.js ≥ 20**, **pnpm 9**
  (`corepack enable && corepack prepare pnpm@9.12.0 --activate`).
- Build:

  ```bash
  pnpm install
  pnpm turbo run build      # builds all workspaces
  pnpm turbo run test       # optional: full suite as an install smoke check
  ```

- Start the web process (baseline / evaluation run):

  ```bash
  PORT=4000 node apps/web/dist/main.js
  ```

- **Optional** production container stack per
  [../DEPLOYMENT.md](../DEPLOYMENT.md): `docker compose up -d`
  (web + workers + Postgres + observability), with a separate worker replica
  (`node apps/web/dist/worker.js`).

**Deliverables.** Running AdOS instance on customer infra; build/test log; install
smoke-check evidence.

**Entry criteria.** Planning exit met; hosts provisioned with prerequisites.

**Exit criteria.** `pnpm turbo run build` green; the web app serves and the login
screen renders on the customer instance; (if chosen) the Docker stack is up and the
readiness gate reports healthy.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Prereq verification | I | C | R | I | I | C |
| Build & run | I | C | R | I | I | I |
| Container stack (optional) | I | A | R | I | I | C |

**Risks & mitigations.**
- *Node/pnpm version drift.* → Pin versions via corepack; re-run build before
  proceeding.
- *Air-gapped host cannot fetch packages.* → Stage an internal package mirror /
  pre-built artifact during Planning.

**Duration (illustrative).** 1–3 days.

---

## 6. Phase 4 — Configuration

**Objectives.** Turn the running instance into a production-grade, secure, durable
deployment: enable built-in security, select the **local** AI engine, enable optional
persistence, and prove backups.

**Activities.**

**Security (built-in — enable and verify).** AdOS ships its security controls; you
configure them, you do not add them:
- `AUTH_MODE=password` for **Argon2id** email/password authentication.
- `SESSION_SECRET=$(openssl rand -hex 32)` for HMAC-signed HttpOnly sessions;
  `AUTH_SECURE_COOKIES=true` in production.
- **Per-session CSRF**, **brute-force lockout**, and **CSP/HSTS** headers are built
  in; verify they are active on the customer instance.

**Local AI engine (no cloud, no API keys).**
- Default: deterministic **OfflineAIManager** — no model server required.
- Or a **local** engine for genuine model prose:

  ```bash
  AI_ENGINE=ollama AI_MODEL=qwen2.5:7b node apps/web/dist/main.js
  # or AI_ENGINE=vllm|lmstudio|llamacpp|sglang with AI_BASE_URL
  ```

  All engines are localhost-only. Note that the default output is **deterministic
  templates**; genuine model prose requires a locally-run engine.

**Optional persistence.**
- Set `DATABASE_URL` (SQLite or Postgres) plus `DATABASE_MAX_CONNECTIONS`; migrations
  run **at startup**, **forward-only** and **idempotent**. Unset ⇒ in-memory
  (evaluation only).

**Backups & recoverability.** Per [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md)
and `BACKUP_GUIDE.md`: schedule backups and run a **verified restore drill** before
Migration begins. Wire the recovery health check into the readiness probe.

**Deliverables.** Configured environment matrix; security-verification checklist;
AI-engine decision recorded; persistence configured; **passing restore drill** report.

**Entry criteria.** Installation exit met.

**Exit criteria.** Password auth + secure cookies active; CSRF, lockout, and CSP/HSTS
verified; AI engine selected and responding; (if durable) `DATABASE_URL` set and
startup migrations applied; **a restore drill has passed** on the customer instance.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Security configuration | I | A | R | I | I | C |
| AI engine selection/setup | C | A | R | I | I | I |
| Persistence & migrations | I | A | R | I | I | C |
| Backup + restore drill | C | A | R | I | I | C |

**Risks & mitigations.**
- *Weak/rotating `SESSION_SECRET`.* → Generate once, store in the customer secret
  store, keep stable (config validation fails fast on short/missing secrets).
- *Local model host under-resourced.* → Fall back to OfflineAIManager or resize.
- *No proven restore.* → Do not exit this phase until a restore drill passes.

**Duration (illustrative).** 2–4 days.

---

## 7. Phase 5 — Migration

**Objectives.** Load the customer's business model and historical performance into
AdOS **by hand and configuration** (see the boundary in §0.1).

**Activities.**
- Run the **onboarding wizard** (Workspace → Client → Brand → Product → Mission) per
  [../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md).
- Configure **Brands** (voice / rules / banned words) and **Products** (with pricing).
- Create **Clients** and their **Projects**.
- Hand-enter **historical KPI figures** (CTR / CPC / CPA / CPL / ROAS / ROI) through
  the in-app analytics form so the marketing-performance **Company Brain** has a
  starting baseline.
- Validate tenant scoping: each customer workspace is an isolated tenant
  (application-level isolation).

**Explicitly out of scope for Migration (Roadmap only — §14):** document ingestion /
knowledge base, and any automated sync from ad platforms, CRMs, or warehouses. AdOS
has no connectors; nothing is imported automatically.

**Deliverables.** Populated Workspaces/Clients/Brands/Products; entered historical
KPIs; a migration validation checklist confirming counts and key fields.

**Entry criteria.** Configuration exit met (security, AI engine, persistence, and a
passing restore drill).

**Exit criteria.** All in-scope Brands, Products, and Clients present and correct;
agreed historical-KPI set entered and spot-checked against source; customer Admin can
navigate the populated model; no reliance on any connector or document import.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Onboarding wizard run | I | C | R | I | I | C |
| Brand/Product/Client config | I | C | R | I | C | R |
| Historical KPI hand-entry | I | I | R | I | I | R |
| Migration validation | A | C | R | I | C | C |

**Risks & mitigations.**
- *Customer expects a bulk connector import.* → Reaffirm the §0.1 boundary; plan
  hand-entry effort and, if desired, log connector-based migration as a Roadmap ask.
- *Large historical-KPI volume.* → Scope the minimum useful baseline; stage entry
  across the phase window.
- *Brand rules / banned words incomplete.* → Have the customer Admin own and confirm
  brand voice before Training.

**Duration (illustrative).** 3–8 days (scales with historical-KPI volume).

---

## 8. Phase 6 — Training

**Objectives.** Enable the customer's Admins and end users to operate AdOS
independently.

**Activities.**
- **Administrator training** per
  [../customer-success/ADMINISTRATOR_TRAINING.md](../customer-success/ADMINISTRATOR_TRAINING.md):
  configuration, security posture, persistence/backups, tenant/workspace management.
- **End-user training** per
  [../customer-success/END_USER_TRAINING.md](../customer-success/END_USER_TRAINING.md):
  creating Missions and driving the human-approved pipeline, brief → creative →
  campaign draft → report → dashboard, including the approval gates
  (`strategy_and_budget`, `creative_assets`, `campaign_launch`).
- Reinforce that **every stage needs a human approval click**, creative is **ad copy
  only**, and campaign drafts **never launch**.
- Align certification with
  [../customer-success/CERTIFICATION_PROGRAM.md](../customer-success/CERTIFICATION_PROGRAM.md).

**Deliverables.** Trained/certified Admins; enabled end users; training attendance
and competency record; role-specific quick-reference handouts.

**Entry criteria.** Migration exit met (users have a real, populated model to learn
on).

**Exit criteria.** At least one customer Admin demonstrably competent (configuration +
approvals); end users can independently create a Mission and advance it through each
approval gate; sign-off by Trainer and customer Sponsor.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Administrator training | I | C | C | R/A | I | R |
| End-user training | I | I | C | R/A | I | C |
| Competency sign-off | A | I | I | R | R | C |

**Risks & mitigations.**
- *Users expect autonomous / "hands-off" AI.* → Train the human-in-the-loop reality;
  the pipeline is AI-assisted, not autonomous.
- *Thin Admin bench.* → Certify a backup Admin before Go-live.

**Duration (illustrative).** 3–5 days.

---

## 9. Phase 7 — Go-live

**Objectives.** Take a **real** customer Mission through the full human-approved
pipeline in the production instance.

**Activities.** Per
[../customer-success/ONBOARDING_PLAYBOOK.md](../customer-success/ONBOARDING_PLAYBOOK.md):
- Customer creates a genuine Mission (real advertising objective).
- Advance through each stage with the customer clicking each approval gate:
  Marketing Brief → Creative Set (ad copy) → Campaign **Draft** (channels / ad sets /
  budget split) → Performance Report → Executive / CEO Dashboard.
- Confirm the campaign draft **stays a draft** (nothing is launched) and that the
  customer would **export** the draft to run it in their own ad platform.
- Confirm activity log and per-approval timeline reflect the run.

**Deliverables.** One completed Mission with all approvals recorded; go-live checklist;
executive dashboard produced on the customer instance.

**Entry criteria.** Training exit met; production instance configured and backed up.

**Exit criteria.** A real Mission has reached the Executive/CEO dashboard with every
approval gate exercised by customer staff; no P1 issues open; Sponsor confirms the
customer can operate the pipeline.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| First Mission run | A | C | R | C | C | R |
| Approval-gate walkthrough | C | I | R | C | I | R |
| Go-live sign-off | A | C | I | I | R | C |

**Risks & mitigations.**
- *Customer expects the draft to auto-launch to Meta/Google.* → Reaffirm drafts-only;
  demonstrate the export-then-run-elsewhere workflow; connectors are Roadmap (§14).
- *Approval bottleneck.* → Confirm named approvers per gate before go-live.

**Duration (illustrative).** 2–3 days.

---

## 10. Phase 8 — Hypercare

**Objectives.** Stabilize operations and provide heightened support while the customer
builds run-state muscle.

**Activities.**
- Stand up the support model (Sev 1–4) per
  [../customer-success/SUPPORT_PLAYBOOK.md](../customer-success/SUPPORT_PLAYBOOK.md);
  the partner fronts Tier-1 and escalates product defects to the vendor for Tier-2.
- Monitor the instance (`/metrics`, observability stack) and confirm scheduled backups
  are running with periodic restore verification per
  [../DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md).
- Run daily/again-tapering check-ins; triage issues; coach Admins on real Missions.

**Deliverables.** Hypercare log; incident/issue tracker with Sev classification;
backup/restore verification evidence; stabilization report.

**Entry criteria.** Go-live exit met.

**Exit criteria.** No open Sev 1/Sev 2 issues; agreed stabilization period elapsed
with the customer running Missions independently; support cadence transitioned toward
steady-state.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Sev 1–4 support | A | C | R | I | I | C |
| Monitoring & backup checks | C | A | R | I | I | C |
| Admin coaching | I | I | R | C | I | R |

**Risks & mitigations.**
- *No vendor telemetry to spot issues remotely.* → Rely on customer-shared metrics
  and the on-instance observability stack; agree a reporting cadence.
- *Backups silently failing.* → Verify restorability during Hypercare, not just backup
  success.

**Duration (illustrative).** 5–10 days.

---

## 11. Phase 9 — Acceptance

**Objectives.** Obtain formal customer acceptance against the Phase 2 criteria, with
**all evidence demonstrated on the customer's own instance**.

**Activities.**
- Walk the customer through each acceptance criterion live on their instance:
  security posture active, local AI engine responding, persistence + passing restore
  drill, populated model, a completed human-approved Mission, and the executive
  dashboard.
- Capture acceptance evidence as on-instance artifacts (screens, logs, timelines) —
  **not** vendor-collected telemetry.
- Record any agreed exceptions/waivers and residual Roadmap items.

**Deliverables.** Signed acceptance certificate; acceptance evidence package;
exceptions/waivers list.

**Entry criteria.** Hypercare exit met.

**Exit criteria.** Every acceptance criterion demonstrated on the customer instance
and signed by the customer Sponsor; exceptions formally logged.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Acceptance walkthrough | A | C | R | C | R | C |
| Evidence capture | C | C | R | I | I | C |
| Formal sign-off | A | I | I | I | R | C |

**Risks & mitigations.**
- *Criterion implies a Roadmap capability.* → Should already be resolved in Discovery;
  if not, log as a waiver/Roadmap item, not a defect.
- *Evidence expectation of remote/vendor proof.* → Reaffirm self-hosted model; all
  proof is on-instance.

**Duration (illustrative).** 2–3 days.

---

## 12. Phase 10 — Closure

**Objectives.** Formally close the implementation and transition to run-state.

**Activities.**
- Handover pack: as-built configuration, runbooks, backup/restore procedures, support
  contacts, and the Roadmap/expectation register.
- Transition support to the agreed steady-state model (Sev 1–4).
- Run the internal + customer retrospective; capture lessons and reference-story
  material.
- Close out the engagement per the companion `PARTNER_PROGRAM_CONSTITUTION.md`.

**Deliverables.** Handover pack; closure report; retrospective notes; reference-story
consent (if given).

**Entry criteria.** Acceptance exit met (signed).

**Exit criteria.** Handover accepted by customer Admin/Sponsor; support transitioned;
engagement financially and administratively closed.

**Roles (RACI).**

| Activity | EL | SA | IC | TR | Sp | Ad |
|---|---|---|---|---|---|---|
| Handover pack | A | C | R | C | I | R |
| Support transition | A | C | R | I | I | C |
| Retrospective | R | C | C | C | C | C |

**Risks & mitigations.**
- *Knowledge walks out with the delivery team.* → Handover pack + certified customer
  Admin are exit-gated.
- *Ambiguous run-state ownership.* → Confirm the steady-state support tier and
  contacts in writing.

**Duration (illustrative).** 1–2 days.

---

## 13. Consolidated risk summary

| # | Risk | Phase(s) | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | Customer expects document Q&A / knowledge base | 1, 5, 9 | Med | High | Anchor to PRODUCT_TRUTH.md; Roadmap register in Discovery |
| R2 | Customer expects connector-based / ad-platform sync migration | 1, 5, 7 | High | High | Enforce §0.1 boundary; plan hand-entry; Roadmap (§14) |
| R3 | Customer expects live ad launch / autonomous "hands-off" AI | 1, 6, 7 | Med | High | Train drafts-only, human-in-the-loop; export-to-run workflow |
| R4 | Node ≥ 20 / pnpm 9 / model-host resourcing gaps | 1, 3, 4 | Med | Med | Verify in Discovery; OfflineAIManager fallback |
| R5 | Air-gapped hosts cannot fetch packages/models | 3, 4 | Med | Med | Stage internal mirror / pre-pulled model |
| R6 | Unproven backups / no restore drill | 4, 8 | Med | High | Exit-gate a passing restore drill; verify in Hypercare |
| R7 | Weak/rotating SESSION_SECRET or misconfigured auth | 4 | Low | High | Generate once, store securely; config fails fast |
| R8 | Historical-KPI hand-entry volume underestimated | 2, 5 | Med | Med | Scope minimum baseline; stage entry |
| R9 | Thin customer Admin bench / approval bottlenecks | 6, 7 | Med | Med | Certify a backup Admin; name approvers per gate |
| R10 | Expectation of remote/vendor proof or telemetry | 8, 9 | Low | Med | Reaffirm self-hosted, on-instance evidence only |

---

## 14. Roadmap (future-only — NOT available today)

> **These capabilities are NOT part of AdOS today and MUST NOT be committed in any
> engagement.** They are directional only. If a customer needs one, record it in the
> Discovery Roadmap/expectation register — never as an acceptance criterion.

- **Connector-based migration** — automated import/sync of brands, products, and
  historical metrics from ad platforms (Meta / Google / TikTok / LinkedIn), CRMs, or
  data warehouses. *Today, Migration is hand-entry and configuration only (§0.1).*
- **Document knowledge base / document Q&A / cited answers.** *Today, the Company
  Brain holds marketing-performance data only — no documents, no citations.*
- **"Digital Employees" / autonomous AI agents doing knowledge work.** *Today, the
  pipeline is AI-assisted and human-gated at every stage.*
- **Live ad launch and campaign optimization.** *Today, AdOS produces drafts only;
  nothing is launched.*
- **External integrations / connectors** to ad platforms, CRMs, warehouses.
- **Enforced RBAC / permission-aware AI.** *Today, roles exist but are not enforced.*
- **Immutable / tamper-evident audit trail.** *Today, there is an activity log +
  per-approval timeline only.*
- **DB-level Row-Level Security.** *Today, isolation is application-level.*
- **Cloud / hosted AI inference.** *Today, all inference is 100% local.*
- **Vision / speech / image / video AI.**
- **Tiered approval authority (spend-limit / delegated levels).** *Today, only
  approval gates exist — no tiered authority model.*

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
