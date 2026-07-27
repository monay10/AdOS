# AdOS — Onboarding Playbook

> **Owner:** Onboarding / Customer Success
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

---

## 0. Purpose & scope

This is the complete, timeline-structured playbook the Customer Success team uses to
take a new customer from a signed contract to durable, repeatable value with **AdOS —
the Enterprise AI Operating System for Advertising**. AdOS is an offline-first, 100%
local-AI platform that takes a client's advertising objective (a **Mission**) through a
**human-approved pipeline** — marketing brief → creative (ad copy) → campaign **draft**
→ performance report → executive dashboard — and remembers what works in a
marketing-performance **Company Brain**. It **drafts**; it never launches live ads.

This playbook covers three lifecycle stages from the shared CS canon (`CUSTOMER_SUCCESS_CONSTITUTION.md`):

| Lifecycle stage | Timeline | This playbook |
|---|---|---|
| **Evaluate** | pre-sale → signed | out of scope (prerequisite) |
| **Onboard** | Day 0 → Month 1 | **covered** — install, configure, first Mission |
| **Adopt** | Month 1 → 3 | **covered** — teams run Missions routinely |
| **Realize Value** | Month 3 → 6 | **covered** — measurable throughput + Company Brain growth |
| Mature & Optimize | Month 6 → 12 | transition + first EBRs (bridged here; owned by the Adoption/Renewal playbooks) |
| Renew & Expand | Month 12+ | out of scope (see renewal playbook) |

The playbook is organized by timeline: **Day 0 · Week 1 · Month 1 · Month 3 · Month 6 ·
Month 12**. It also maps each block to the **Adoption Maturity** model M1–M5
(`CUSTOMER_SUCCESS_CONSTITUTION.md`).

### 0.1 CRITICAL onboarding constraint — self-hosted, no vendor telemetry

AdOS is **self-hosted and offline with no phone-home telemetry**. The vendor has **no
standing access** to the customer's instance and **cannot auto-collect** usage. Every
"Validation" and "Success checkpoint" in this playbook is therefore verified from **what
the customer's Admin shows or exports from their own instance** during a live working
session or check-in — the on-screen activity log, the per-approval timeline, KPI/
performance reports, Mission counts, and Company Brain growth. **Nothing in onboarding is
confirmed from vendor-side dashboards, because none exist.** When a checkpoint says
"verified", it means "verified by the Admin demonstrating it, screen-shared or exported,
to the CSM/Solution Architect".

### 0.2 Roles (from `CUSTOMER_SUCCESS_CONSTITUTION.md`)

| Abbrev. | Role | Side | Owns during onboarding |
|---|---|---|---|
| **CSM** | Customer Success Manager | Vendor | Relationship, plan, health, checkpoints, renewal trajectory |
| **SA** | Solution Architect | Vendor | Install, security config, AI engine, persistence, backups, scale |
| **Trainer** | Trainer | Vendor | Enablement + certification (references training docs) |
| **Support** | Support Engineer | Vendor | Severity triage during onboarding (see `CUSTOMER_SUCCESS_CONSTITUTION.md`) |
| **Admin** | Customer Admin | Customer | Runs the install, holds the environment, exports evidence |
| **Champion** | Customer Champion (power user) | Customer | First real Missions, internal enablement, Company Brain seeding |
| **Exec Sponsor** | Executive Sponsor | Customer | Business objectives, resourcing, EBR attendance |

---

## Day 0 — Kickoff & environment readiness (Lifecycle: Onboard · Target maturity: pre-M1)

**Theme:** Align on outcomes, confirm the self-hosted deployment target, and prepare the
environment. Nothing is installed in production yet; the goal is a green light to install.

### Meetings
- **Internal handoff (Sales → CS):** CSM + SA review the signed scope, the customer's
  advertising use case, brands/clients they intend to model, and infrastructure.
- **Customer kickoff (60–90 min):** CSM, SA, Exec Sponsor, Admin, Champion. Confirm
  success definition, lifecycle plan, cadence, and the "first Mission" candidate.

### Tasks
| Task | Owner |
|---|---|
| Confirm business objectives + one concrete first-Mission advertising objective | CSM · Exec Sponsor |
| Confirm infrastructure meets requirements: **Node.js ≥ 20**, **pnpm 9**, host OS, optional Docker/Postgres/local-inference host | SA · Admin |
| Decide deployment shape: single-host dev-style run vs. container stack (`docker compose`) | SA · Admin |
| Decide AI engine path for onboarding: default **deterministic OfflineAIManager** (no model server) now; local **Ollama** or OpenAI-compatible local server later | SA |
| Decide persistence: in-memory (evaluation only) vs. opt-in durable **SQLite/Postgres** via `DATABASE_URL` | SA · Admin |
| Provision access to `INSTALLATION_GUIDE.md`, `DEPLOYMENT.md`, `ADMIN_GUIDE.md` | CSM |
| Schedule Week 1 install session and weekly onboarding cadence | CSM |

### Owners
CSM leads relationship + plan; SA leads all technical readiness; Admin owns the target
environment; Exec Sponsor confirms objectives and resourcing.

### Deliverables
- Signed-off **Onboarding Plan** (objectives, first-Mission candidate, cadence, roles).
- **Environment Readiness Checklist** (Node ≥ 20, pnpm 9, chosen persistence & AI paths).
- Shared success definition tied to the [Definition of Done](#definition-of-done-for-onboarding).

### Training
- Trainer schedules the **Administrator track** — see `ADMINISTRATOR_TRAINING.md`.
- Trainer schedules the **End-user track** for the Champion — see `END_USER_TRAINING.md`.

### Validation
- Admin confirms host meets requirements (Node/pnpm versions shown from their machine).
- Because there is no telemetry, "readiness" = Admin-demonstrated prerequisites, not a
  vendor probe.

### Success checkpoint
Kickoff complete, plan signed, environment confirmed installable, first-Mission candidate
chosen, training scheduled.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Customer expects a hosted SaaS login | Reset expectation early: AdOS is **self-hosted/offline**; SA walks the install topology in `DEPLOYMENT.md`. |
| Customer expects AdOS to launch/optimize live ads or connect to Meta/Google | State plainly: AdOS produces **drafts**; analytics are **hand-entered via a form**. See [Roadmap](#roadmap). |
| Infra below requirements (Node < 20) | Block install until remediated; SA provides the requirement list from `INSTALLATION_GUIDE.md`. |
| No named Champion / Exec Sponsor | Escalate to CSM; do not proceed without both — adoption depends on them. |

---

## Week 1 — Install, secure, and configure (Lifecycle: Onboard · Target maturity: M1 — Deployed)

**Theme:** Stand up a secured, single-workspace instance the customer controls. By end of
week the customer can log in, and security + (optionally) persistence are configured.

### Meetings
- **Install working session (SA + Admin, screen-shared):** perform the real install path.
- **Security review (SA + Admin):** confirm production auth posture.
- **Week 1 checkpoint (CSM + Admin + Champion):** confirm M1 readiness.

### Tasks — the real install path
| Step | Command / action | Owner |
|---|---|---|
| Install & build all workspaces | `pnpm install` → `pnpm turbo run build` | Admin · SA |
| (Optional) run the test suite for confidence | `pnpm turbo run test` (~64 files, ~368 cases) | SA |
| First run (offline AI, in-memory) to verify boot | `PORT=4000 AUTH_SECURE_COOKIES=false node apps/web/dist/main.js` | Admin |
| **Configure production security** | `AUTH_MODE=password` (Argon2id) + `SESSION_SECRET=$(openssl rand -hex 32)` + `AUTH_SECURE_COOKIES=true` | SA · Admin |
| (Optional) enable durable persistence | set `DATABASE_URL` (SQLite via `node:sqlite`, or Postgres); **migrations run at startup, forward-only, idempotent** | SA · Admin |
| (Optional) container stack | `docker compose up -d` (web + workers + Postgres + observability) | SA · Admin |
| Confirm security headers + lockout are active | verify CSP/HSTS served; brute-force lockout behavior | SA |

**Built-in security is not something the customer builds** — Argon2id password hashing,
HMAC-signed HttpOnly sessions, per-session CSRF, brute-force lockout, and CSP/HSTS headers
are **already implemented** in the product. Week 1 is about *turning on production mode*
(`AUTH_MODE=password`, stable `SESSION_SECRET`, secure cookies), not writing security code.

### Owners
SA owns install, security configuration, persistence, and (if used) the container stack.
Admin executes on their infrastructure and retains all secrets. CSM tracks the checkpoint.

### Deliverables
- A **running, secured AdOS instance** on customer infrastructure (one workspace/tenant).
- **Security configuration record** (auth mode, secure cookies, secret rotation owner).
- If persistence enabled: a **verified schema** (migrations applied at startup) and a
  **first successful backup + restore drill** (see `BACKUP_GUIDE.md` referenced by
  `DEPLOYMENT.md`).

### Training
- **Administrator training begins** — see `ADMINISTRATOR_TRAINING.md`: install, env vars,
  auth modes, persistence, backup/restore, activity log, and the approval workflow.
- Champion completes the **End-user orientation** — see `END_USER_TRAINING.md`: logging in,
  the onboarding wizard, and the human-approved pipeline.

### Validation
- Admin logs in successfully with production auth (`AUTH_MODE=password`).
- Admin **shows** the running instance, security headers present, and — if persistence is
  on — data surviving a restart (proves durable storage engaged). No vendor telemetry is
  used; the Admin demonstrates each item live/screen-shared.
- If backups configured: a **restore drill passes** and the Admin confirms it.

### Success checkpoint — **M1 (Deployed)**
Installed, secured (production auth on), one workspace live. If persistence chosen:
migrations verified + at least one backup/restore drill passed.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Runs in-memory in production and loses data on restart | SA sets `DATABASE_URL`; validate persistence by restart test. In-memory is **dev/evaluation only**. |
| `SESSION_SECRET` unstable across replicas/restarts → users logged out | SA fixes a stable secret; document rotation ownership. |
| Backups configured but never tested | Require a **restore drill** before M1 sign-off (per `DEPLOYMENT.md` pre-flight). |
| Customer expects enforced role permissions now | Clarify: roles exist but are **not enforced**; control is via **human approval at every stage**. See [Roadmap](#roadmap). |
| Postgres pool exhaustion in container stack | Apply pool math from `DEPLOYMENT.md`: `(web + worker replicas) × DATABASE_MAX_CONNECTIONS ≤ Postgres max_connections`. |

---

## Month 1 — Configure the AI engine, run the wizard, complete the FIRST Mission (Lifecycle: Onboard→Adopt · Target maturity: M2 — Operating)

**Theme:** Choose the AI engine, run the onboarding wizard, and take one real advertising
objective all the way through the human-approved pipeline with approvals at the gates.
This is the single most important onboarding outcome.

### Meetings
- **AI engine decision session (SA + Admin):** keep default offline vs. stand up a local model.
- **First-Mission working session (SA + Champion + CSM):** run the wizard and the pipeline live.
- **Month 1 checkpoint (CSM + Champion + Admin + Exec Sponsor):** confirm first value.

### Tasks
| Task | Owner |
|---|---|
| Choose AI engine: keep **default deterministic OfflineAIManager** (no model server, no network) **or** configure a local model | SA |
| (Optional) enable a local model: `ollama pull qwen2.5:7b` then `AI_ENGINE=ollama AI_MODEL=qwen2.5:7b …`; or any OpenAI-compatible local server (`AI_ENGINE=vllm\|lmstudio\|llamacpp\|sglang` + `AI_BASE_URL`) — **still 100% local, no cloud, no API key** | SA · Admin |
| Run the **onboarding wizard**: workspace → client → brand → product → mission | Champion (SA assists) |
| Configure the **Brand** (voice, rules, banned words) and **Product** (pricing) | Champion |
| State the first advertising objective as a **Mission** in natural language | Champion |
| Drive the pipeline through each gate with explicit human approval clicks | Champion · approver |
| Begin populating the **Company Brain** (marketing-performance memory) | Champion |

### The first Mission — human-approved pipeline
The Champion runs one Mission end-to-end. **Every stage requires an explicit human
approval click**; default approval gates are `strategy_and_budget` and `campaign_launch`
(the `creative_assets` gate is also available):

1. **Mission** — advertising objective stated in natural language.
2. **Marketing Brief** — generated (with provenance).
3. **Creative Set** — **ad copy only** (headline / adCopy / CTA / socialPost / landingPage /
   email). No campaign is touched and no ad platform is contacted.
4. **Campaign Draft** — channels, ad sets, budget split assembled. **It never leaves
   `draft` status — nothing is launched.**
5. **Campaign Report** — deterministic ad-KPI math (CTR, CPC, CPA, CPL, ROAS, ROI) over
   **hand-entered** metrics (entered via a form, not ingested from ad platforms).
6. **Executive Report / CEO dashboard** — a single AI synthesis for leadership.

At each gate the approver clicks to approve; the **per-approval timeline** and the
**activity log** (bounded in-memory ring of 50 in the web feed, plus structured logs)
record the progression.

### Owners
SA owns the AI-engine configuration; Champion owns the wizard, the Mission, and approvals;
CSM owns the checkpoint and the value narrative for the Exec Sponsor.

### Deliverables
- A configured AI engine (offline default or a named local model, documented).
- A **completed first Mission** with all gate approvals, visible in the activity log and
  per-approval timeline.
- The pipeline artifacts: brief, creative set (copy), campaign **draft**, campaign report,
  executive dashboard.
- Initial **Company Brain** entries seeded from the first Mission.

### Training
- **Administrator training continues** — see `ADMINISTRATOR_TRAINING.md`: AI engine env
  vars (`AI_ENGINE`/`AI_MODEL`/`AI_BASE_URL`/`AI_TEMPERATURE`), language settings, activity
  log, approvals.
- **End-user training** — see `END_USER_TRAINING.md`: running the wizard, writing a good
  Mission objective, brand voice/rules, and approving each pipeline gate.

### Validation
- Champion **demonstrates** a completed Mission: all gates approved, draft assembled (and
  confirmed *not* launched), report KPIs computed, executive dashboard rendered.
- Admin **exports/shows** the activity log and per-approval timeline as evidence.
- If a local model is used: SA confirms the local engine is reachable and prose is being
  generated locally (no cloud call, no API key). All verification is customer-demonstrated;
  there is no vendor-side confirmation.

### Success checkpoint — **M2 (Operating)**
The team runs the pipeline end-to-end; at least one Mission is complete with routine
approvals; Company Brain has its first entries.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Disappointment that default offline output is templated, not model prose | Set expectations: default is **deterministic templates**; stand up a **local model** (Ollama / OpenAI-compatible) for genuine prose. |
| Champion expects the draft to publish to an ad platform | Reinforce: AdOS **drafts**; export the draft to run it in the customer's own ad platform. See [Roadmap](#roadmap). |
| Analytics assumed to auto-sync from Meta/Google | Metrics are **hand-entered via a form**; set up the entry routine. See [Roadmap](#roadmap). |
| Approvals feel like friction | Reframe: human-in-the-loop is the product's control model; every gate is intentional. |
| Local model host underpowered → slow generation | SA right-sizes the inference host or falls back to offline default for onboarding. |

---

## Month 3 — Routine operation & scaling the footprint (Lifecycle: Adopt→Realize Value · Target maturity: M3 — Scaling)

**Theme:** Move from one Mission to a weekly operating rhythm across multiple clients/
brands and multiple internal users, on a persistent, backed-up, real-model deployment.

### Meetings
- **Monthly check-in (CSM + Admin + Champion):** review Mission cadence and blockers.
- **Scale-out session (SA + Admin):** add clients/brands/users; confirm persistence + backups.
- **First value review (CSM + Exec Sponsor):** early throughput narrative.

### Tasks
| Task | Owner |
|---|---|
| Onboard additional **clients / brands / products** via the wizard | Champion |
| Add and orient additional **internal users** (multiple people running the pipeline) | Champion · Admin |
| Confirm **local model engine** configured (move off offline default if genuine prose needed) | SA |
| Confirm **persistence enabled** (`DATABASE_URL`) and **backups verified** with a restore drill | SA · Admin |
| Establish a **weekly Mission cadence** and a KPI-entry routine | Champion |
| Grow the **Company Brain** across Missions (brand profiles, creative/marketing insights, SOP performance) | Champion |

### Owners
Champion owns operating cadence and Company Brain growth; SA owns scale, persistence, and
backups; CSM owns the value narrative and health tracking (all inputs customer-shared).

### Deliverables
- Multiple clients/brands live; multiple internal users active weekly.
- A **verified backup/restore** posture on the persistent deployment.
- A running **Company Brain** with cross-Mission marketing-performance memory.
- First cut of a customer-shared **health snapshot** (see [handoff](#handoff-to-adoption)).

### Training
- **Administrator training completion** — see `ADMINISTRATOR_TRAINING.md`: multi-tenant
  workspaces, persistence operations, backup/restore, monitoring (`/metrics`).
- **End-user enablement rollout** — see `END_USER_TRAINING.md` delivered to the new users
  by the Champion (train-the-trainer).

### Validation
- Admin **shows** multiple clients/brands and multiple active users from their instance.
- Admin **exports** Mission counts and KPI reports for the check-in (customer-shared, not
  vendor-collected).
- SA confirms a **passing restore drill** on the persistent store.

### Success checkpoint — **M3 (Scaling)**
Multiple clients/brands, multiple internal users, local model engine configured,
persistence enabled + backups verified.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Usage stalls at one Mission / one user | CSM + Champion set a weekly cadence and a small user cohort with assigned first Missions. |
| Growth on in-memory instance → data loss risk | Enforce persistence before scale; block M3 sign-off without verified backups. |
| No structured way to share health (no telemetry) | Establish the **Admin export routine** (activity log, Mission counts, KPI reports) for every check-in. |
| Application-level isolation misread as DB-level isolation | Clarify: isolation is **application-level** (tenant_id scoping), not DB-level RLS. See [Roadmap](#roadmap). |
| Company Brain treated as a document Q&A tool | Reframe: Company Brain is **marketing-performance memory** — it learns which ads/campaigns/channels/budgets worked; it does not answer from documents. See [Roadmap](#roadmap). |

---

## Month 6 — Realized value & reuse of the Company Brain (Lifecycle: Realize Value · Target maturity: M4 — Optimizing)

**Theme:** Demonstrate measurable throughput and start **reusing** the Company Brain —
win-patterns from past campaigns inform new Missions, and a KPI review cadence is
established. This is the value-realization milestone and the first EBR.

### Meetings
- **Quarterly EBR (CSM + Exec Sponsor + Champion + Admin):** value delivered, health,
  maturity trajectory. Built entirely from **customer-shared** data.
- **Optimization session (Champion + CSM):** reuse win-patterns in new Missions.

### Tasks
| Task | Owner |
|---|---|
| Establish a **KPI review cadence** over campaign reports (CTR/CPC/CPA/CPL/ROAS/ROI) | Champion · CSM |
| **Reuse the Company Brain**: apply winning-ad patterns and past-campaign experience to new Missions | Champion |
| Quantify **throughput**: Missions completed, drafts produced, brands/clients served | CSM (from Admin exports) |
| Build the **EBR pack** from customer-exported evidence | CSM |
| Confirm operational health: backups, monitoring, restart-safe persistence | SA · Admin |

### Owners
Champion drives Company Brain reuse and KPI cadence; CSM owns the EBR and the value story;
SA confirms operational health; Exec Sponsor validates business impact.

### Deliverables
- A documented **KPI review cadence** with a customer-shared trend view.
- Evidence of **Company Brain reuse** (win-patterns informing new Missions).
- An **EBR pack** assembled from customer exports (activity log, Mission counts, KPI
  reports, Company Brain growth).

### Training
- Advanced **Administrator** topics as needed — see `ADMINISTRATOR_TRAINING.md`.
- Certification progression (Associate → Professional → Administrator; see `CUSTOMER_SUCCESS_CONSTITUTION.md`
  §4.5) via the Trainer.

### Validation
- Champion **demonstrates** a new Mission that reused a prior win-pattern from the Company
  Brain.
- Admin **exports** the KPI trend and Mission throughput for the EBR (customer-shared; no
  vendor telemetry).

### Success checkpoint — **M4 (Optimizing)**
Company Brain actively reused; win-patterns inform new Missions; KPI review cadence
established; first EBR delivered.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Value invisible because there's no vendor dashboard | CSM builds the value story from **Admin exports**; make the export routine a standing agenda item. |
| Company Brain grows but is never reused | Champion runs an "apply a past win-pattern" step in each new Mission; CSM tracks it. |
| KPI numbers questioned (hand-entered) | Document the entry routine and owner; KPI **math is deterministic** — verify inputs, not the calculation. |
| Executive engagement fades | CSM ties EBR to the Exec Sponsor's original Day 0 objectives. |

---

## Month 12 — Standardization & renewal readiness (Lifecycle: Mature & Optimize → Renew & Expand bridge · Target maturity: M5 — Transforming)

**Theme:** AdOS becomes the standard operating layer for the customer's advertising work
across teams, with internal champions and certified admins. Onboarding is long complete;
this block is the bridge to the renewal/expansion motion and confirms durable maturity.

### Meetings
- **Annual renewal review + EBR (CSM + Exec Sponsor + Champion + Admin):** value to date,
  maturity, expansion, renewal.
- **Best-practices roundtable (Champion + Trainer):** internal standardization.

### Tasks
| Task | Owner |
|---|---|
| Confirm AdOS is the **standard advertising operating layer** across teams | Exec Sponsor · Champion |
| Certify admins and champions (up to Administrator / Architect; see `CUSTOMER_SUCCESS_CONSTITUTION.md`) | Trainer |
| Document internal **best practices / SOPs** for Missions and approvals | Champion |
| Assemble the **annual value review** from customer-shared evidence | CSM |
| Identify **expansion** (more seats, more brands/clients) | CSM · Exec Sponsor |

### Owners
Exec Sponsor + Champion own internal standardization; Trainer owns certification; CSM owns
the renewal/expansion narrative and health.

### Deliverables
- **Certified** admins/champions and an internal best-practices set.
- An **annual value review** from customer-shared data.
- A renewal/expansion recommendation (handoff to the renewal playbook).

### Training
- Certification to **Administrator / Architect** — Trainer, per `CUSTOMER_SUCCESS_CONSTITUTION.md`,
  building on `ADMINISTRATOR_TRAINING.md` and `END_USER_TRAINING.md`.

### Validation
- Multiple teams **shown** operating the pipeline routinely from the customer's instance.
- Certified internal admins/champions confirmed by the Trainer.
- Annual value review assembled from **Admin exports** (no vendor telemetry).

### Success checkpoint — **M5 (Transforming)**
AdOS is the standard operating layer for advertising work across teams; internal champions
and certified admins in place; renewal/expansion identified.

### Risks & mitigations
| Risk | Mitigation |
|---|---|
| Bus-factor: single Champion/Admin | Certify a second admin and a backup champion. |
| Value not re-proven at renewal | CSM refreshes the value review from current Admin exports; tie to Exec Sponsor objectives. |
| Scope creep toward forbidden capabilities at renewal | Anchor expansion to shipped capability; route new asks to [Roadmap](#roadmap). |

---

## Definition of Done for onboarding

Onboarding is **done** when **all** of the following are true and **customer-demonstrated**
(no item is confirmed from vendor telemetry — every one is shown or exported by the Admin/
Champion):

- [ ] **Deployed & secured (M1):** AdOS installed on customer infrastructure with production
      auth (`AUTH_MODE=password`, stable `SESSION_SECRET`, secure cookies); Argon2id/CSRF/
      lockout/CSP-HSTS active. One workspace/tenant live.
- [ ] **Durable (if in production):** persistence enabled via `DATABASE_URL` (SQLite/
      Postgres), migrations verified at startup, **backup + restore drill passed**.
- [ ] **AI engine chosen:** default deterministic OfflineAIManager confirmed working, **or**
      a local model (Ollama / OpenAI-compatible local server) configured and generating
      locally — no cloud, no API key.
- [ ] **Wizard run:** workspace → client → brand → product → mission completed; brand voice/
      rules and product pricing configured.
- [ ] **First Mission complete (M2):** brief → creative (copy) → campaign **draft** →
      report → executive dashboard, with **explicit human approval at every gate**; visible
      in the activity log and per-approval timeline; draft confirmed *not launched*.
- [ ] **Company Brain seeded:** initial marketing-performance memory populated from the
      first Mission.
- [ ] **Enablement:** Admin trained (`ADMINISTRATOR_TRAINING.md`) and Champion trained
      (`END_USER_TRAINING.md`).
- [ ] **Evidence routine:** the Admin export routine (activity log, Mission counts, KPI
      reports, Company Brain growth) is established for all future check-ins/EBRs.

Reaching **M2 (Operating)** with the above satisfied is the minimum bar to exit Onboarding.
**M3 (Scaling)** is the target for a healthy transition into the Adopt stage.

---

## Handoff to Adoption

When the Definition of Done is met, the CSM formally transitions the account from the
**Onboard** stage to the **Adopt → Realize Value** stages.

**Handoff package (CSM assembles, all customer-shared):**
- Final onboarding status against the Definition of Done, with the achieved maturity level
  (M2 minimum; M3 target).
- The **evidence export routine**: how the Admin exports the activity log, Mission counts,
  KPI reports, and Company Brain growth — the sole basis for health scoring, since there is
  **no vendor telemetry** (`CUSTOMER_SUCCESS_CONSTITUTION.md`).
- Open risks + mitigations carried forward.
- Training/certification status and the plan to certify a second admin (bus-factor).
- The value narrative tied to the Exec Sponsor's Day 0 objectives, for the first EBR.

**Cadence handed to the Adopt stage** (`CUSTOMER_SUCCESS_CONSTITUTION.md`): weekly during onboarding →
**monthly check-in** → **quarterly EBR** → annual renewal review. Support severity/SLA
during and after onboarding follows `CUSTOMER_SUCCESS_CONSTITUTION.md` (SLA = vendor **response**, not
remote fix, because the instance is on customer infrastructure).

Health scoring for the Adopt stage uses the 10-dimension RAG model (`CUSTOMER_SUCCESS_CONSTITUTION.md`) —
Adoption, Usage, AI utilization, Campaign throughput, Knowledge growth, Support tickets,
Training completion, Executive engagement, Renewal probability, Expansion opportunity —
**all inputs customer-shared, never vendor-collected**.

---

## Roadmap

The following capabilities are **NOT part of AdOS today** and MUST NOT be positioned as
current onboarding outcomes. They are recorded here, clearly labeled, only so CS can manage
expectations. All are drawn from PRODUCT_TRUTH.md §4/§5 as absent or stubbed. If a customer
requests any of these during onboarding, acknowledge as **Roadmap / Planned / Future** and
anchor the plan to shipped capability.

- **Planned — Document knowledge base & cited answers:** "ask your documents", document
  ingestion/embeddings, and citations. Today the Company Brain is **marketing-performance
  memory only**; it does not answer from documents and produces no citations.
- **Planned — Autonomous agents ("Digital Employees"):** an agent workforce doing real work
  without humans. Today every pipeline stage is **human-approved**; agent/autonomy layers
  are empty stubs.
- **Planned — Live ad launch & optimization:** publishing/running/optimizing campaigns on
  Meta/Google/TikTok/LinkedIn. Today AdOS produces **drafts** only — nothing is launched.
- **Planned — External connectors / syncs:** integrations to ad platforms, CRMs, or data
  warehouses. Today `connector-hub` is an unwired stub and analytics are **hand-entered**.
- **Planned — Enforced RBAC / permission-aware AI:** roles exist but are **never enforced**;
  the AI is not permission-scoped. Control today is human approval at every stage.
- **Planned — Immutable / tamper-proof audit trail:** today there are structured logs and a
  bounded in-memory activity ring + per-approval timeline, **not** an immutable audit log.
- **Planned — DB-level Row-Level Security:** isolation today is **application-level**
  (tenant_id scoping), not database RLS.
- **Planned — Cloud / hosted inference:** the cloud-inference flag exists but is never read;
  all inference today is **100% local**.
- **Planned — Vision / speech / image / video AI:** declared in a type enum only; no engine
  exists.
- **Planned — Tiered approval authority (T0–T4 spend limits):** today only approval **gates**
  exist (`strategy_and_budget`, `creative_assets`, `campaign_launch`) — no tiered authority
  model.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
