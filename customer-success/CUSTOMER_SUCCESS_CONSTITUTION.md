# AdOS Customer Success Constitution

> **Owner:** Office of the Chief Customer Success Officer (CCSO)
> **Status:** Official — binding on every Customer Success artifact; aligned to `PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

---

## 0. Product identity (verbatim framing — do not paraphrase)

**AdOS — Enterprise AI Operating System for Advertising.** An offline-first, 100%
local-AI platform that takes a client's advertising objective (a **Mission**) through
a **human-approved pipeline** — marketing brief → creative (ad copy) → campaign
**draft** → performance report → executive dashboard — and remembers what works in a
marketing-performance **Company Brain**. **It drafts; it never launches live ads.**

TR label: **"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"**.

> The phrases **"Advertising Operating System"** / **"Reklam İşletim Sistemi"** must
> appear **nowhere** in any Customer Success artifact. The **Company Brain** is a
> **marketing-performance memory** — never a document knowledge base.

---

## 1. Purpose & scope

### 1.1 Purpose

This Constitution is the **governing document** for AdOS Customer Success. It defines
the authoritative models — customer lifecycle, health scoring, maturity, escalation,
governance, KPIs — that every other Customer Success artifact **references and must
not contradict**. Where a sibling document elaborates a model, it points back here;
where this Constitution and a sibling disagree, **this Constitution wins**. Where this
Constitution and `PRODUCT_TRUTH.md` disagree, **`PRODUCT_TRUTH.md` wins**.

### 1.2 Scope

This Constitution is **binding on every document in `customer-success/`**, including
(non-exhaustive) `CUSTOMER_HEALTH.md`, `SUPPORT_PLAYBOOK.md`, onboarding runbooks,
EBR templates, certification curricula, expansion and renewal playbooks, and any
future CS artifact. Every claim in every CS artifact must be traceable to a supported
capability in `PRODUCT_TRUTH.md` §3. Anything not so traceable must be cut or placed
under an explicit **Roadmap** heading (see §15).

### 1.3 The three non-negotiable constraints

1. **`PRODUCT_TRUTH.md` is the only source of capability truth.** No CS artifact may
   promise a capability absent from it.
2. **AdOS is self-hosted, offline, with no phone-home telemetry.** See §3.3 — this
   shapes *every* metric, health score, and EBR input in this document.
3. **Forbidden capabilities appear only under Roadmap.** See §15.

---

## 2. Success philosophy

### 2.1 What "success" means at AdOS

> **Success = the customer's own teams draft more and better campaigns over time, and
> their Company Brain compounds** — accumulating marketing-performance memory that
> makes each subsequent Mission faster and sharper.

Success is **not** measured by vendor-side usage graphs (we have none — see §3.3). It
is measured by outcomes the customer's teams can see inside their own instance and
choose to share with us: more Missions run, more drafts produced and approved, a
richer Company Brain, and advertising KPIs the customer considers better.

### 2.2 Three philosophical commitments

1. **Self-hosted & offline-first.** AdOS runs entirely on the customer's own
   infrastructure — 100% local AI, no cloud, no API keys, no per-token billing,
   air-gap capable. Customer Success operates *around* an instance we do not host and
   do not observe remotely. Our value is enablement, guidance, and evidence-based
   partnership — not remote operation.
2. **Human-in-the-loop by design.** The pipeline is AI-assisted and **human-approved
   at every stage** (gates: `strategy_and_budget`, `creative_assets`,
   `campaign_launch`). We coach customers to make approvals fast, confident, and
   routine — never to remove the human.
3. **The Company Brain compounds.** The core long-term value is a
   **marketing-performance memory** (CompanyDNA, BrandProfile, MarketingInsight,
   CreativeInsight, SalesInsight, SOP performance, a campaign→ad→lead→ROI knowledge
   graph, a winning-ad pattern library, an experience engine). Our adoption strategy
   is oriented toward making this memory grow and get reused.

### 2.3 What we never claim in service of "success"

We never tell a customer that AdOS launches, runs, or optimizes live ads; answers
questions from their documents or cites sources; ships "Digital Employees" or
autonomous agents; connects to Meta/Google/CRM; enforces RBAC; keeps an immutable
audit trail; or reports usage back to us. These are addressed truthfully — as absent
today, or under **Roadmap** (§15).

---

## 3. Foundational operating truths (bind all CS work)

### 3.1 True capabilities Customer Success may rely on

- 100% local / offline-capable AI. No cloud, no API keys, no per-token billing,
  air-gap capable. Default engine = deterministic **OfflineAIManager** (no model
  server required); optional local **Ollama** or any **OpenAI-compatible local
  server** (vLLM / LM Studio / llama.cpp / SGLang) for genuine model prose.
- Human-approved pipeline: Mission → MarketingBrief → CreativeSet (ad copy only) →
  CampaignDraft (channels / ad sets / budget split; **never leaves `draft`**) →
  CampaignReport → ExecutiveReport / CEO dashboard. **Every stage requires an
  explicit human approval click.**
- Creative = **ad copy only** (headline / adCopy / CTA / socialPost / landingPage /
  email).
- Deterministic **ad KPIs**: CTR, CPC, CPA, CPL, ROAS, ROI. Analytics are
  **hand-entered via a form**, not ingested from ad platforms.
- **Company Brain** = marketing-performance memory (see §2.2.3).
- **Application-level** multi-tenant isolation (ambient TenantContext; every query
  scoped by `tenant_id`). Say "application-level" — never "DB-level RLS".
- Real auth: Argon2id hashing, HMAC HttpOnly sessions, per-session CSRF, brute-force
  lockout, CSP/HSTS.
- Optional persistence: SQLite / Postgres, opt-in via `DATABASE_URL`; in-memory by
  default. Backup / recovery / deploy / monitoring packages exist and are tested.
- Activity log + per-approval timeline (bounded in-memory ring of 50 in the web
  feed; structured logs). **Not** an immutable audit trail.
- Bilingual **TR/EN** UI and AI output language.
- Onboarding wizard: workspace → client → brand → product → mission.

### 3.2 Capabilities that are NOT present today

Document Q&A / "ask your documents"; cited answers / citations; "Digital Employees" /
autonomous agents doing real work; launching / running / optimizing **live** ads;
external connectors / syncs; enforced RBAC / permission-aware AI; immutable audit
trail; DB-level Row-Level Security; cloud / hosted inference; vision / speech / image
/ video AI; tiered approval authority (T0–T4 spend limits). These may appear **only**
under **Roadmap** (§15) — never as present-tense capability.

### 3.3 CRITICAL — No vendor telemetry (governs all metrics in this document)

> **AdOS is self-hosted and offline with no phone-home telemetry. The Customer
> Success team CANNOT auto-collect a customer's usage.**

Every health score, adoption metric, maturity assessment, KPI, and EBR input in this
Constitution — and in every sibling document — is built **exclusively from what the
customer's own admin exports or shares** from their instance during check-ins and
EBRs (e.g. activity log, per-approval timelines, Mission counts, KPI reports, Company
Brain growth figures). **Nothing auto-populates on the vendor side.** No CS artifact
may imply a vendor-side dashboard, a usage feed, or any automatic reporting from the
customer's instance back to AdOS.

Practical consequence: the cadence of measurement equals the cadence of
**customer-shared exports**. If the customer shares nothing, we measure nothing — so
enabling and normalizing lightweight exports is itself a Customer Success objective.

---

## 4. Customer lifecycle (6 stages)

The authoritative AdOS customer lifecycle has **six stages**. Every CS artifact uses
these exact names. Timeboxes are guidance, not contracts.

| # | Stage | Window | One-line intent |
|---|---|---|---|
| 1 | **Evaluate** | pre-sale → signed | Prove fit; set truthful expectations |
| 2 | **Onboard** | Day 0 → Month 1 | Install, configure, first Mission |
| 3 | **Adopt** | Month 1 → 3 | Teams run Missions routinely |
| 4 | **Realize Value** | Month 3 → 6 | Measurable throughput + Company Brain growth |
| 5 | **Mature & Optimize** | Month 6 → 12 | Scale users/brands; EBRs; best practices |
| 6 | **Renew & Expand** | Month 12+ | Renew subscription/support; more seats/brands |

### 4.1 Stage entry/exit criteria

**1. Evaluate** — *pre-sale → signed*
- **Entry:** qualified opportunity; prospect exploring AdOS.
- **Exit:** signed subscription/support agreement; success criteria drafted with the
  customer (expressed in *their* KPIs); an Executive Sponsor and a prospective
  Champion identified.

**2. Onboard** — *Day 0 → Month 1*
- **Entry:** contract signed; deployment target (customer infrastructure) confirmed.
- **Exit:** AdOS installed and secured on customer infrastructure (auth configured);
  onboarding wizard completed (workspace → client → brand → product → mission);
  **first Mission run end-to-end through all approval gates** to an executive
  dashboard; admin trained to **export** an activity/KPI snapshot for check-ins.

**3. Adopt** — *Month 1 → 3*
- **Entry:** first Mission completed; at least one trained internal user.
- **Exit:** a team runs the pipeline **routinely** (weekly Missions); approvals are a
  normal habit at all three gates; customer shares a first adoption snapshot; ≥1
  Associate/Professional certification in progress.

**4. Realize Value** — *Month 3 → 6*
- **Entry:** routine weekly operation established.
- **Exit:** customer-shared evidence of **measurable throughput** (Missions/drafts
  per period) and **Company Brain growth** (accumulating insights/patterns); at least
  one KPI the customer regards as improved; documented time-to-first-Mission
  reduction for new users.

**5. Mature & Optimize** — *Month 6 → 12*
- **Entry:** value realized and evidenced by the customer.
- **Exit:** multiple clients/brands and multiple internal users live; local model
  engine configured where genuine prose is wanted; persistence enabled + **backups
  verified**; quarterly EBR cadence running; Company Brain win-patterns actively
  reused; certified administrator(s) in place.

**6. Renew & Expand** — *Month 12+*
- **Entry:** approaching renewal window (annual review).
- **Exit:** subscription/support **renewed**; expansion realized where warranted
  (more seats / brands / clients; local model engine; persistence + backups); renewed
  success plan for the next cycle.

Lifecycle stage, health RAG (§6), and maturity level (§7) are **independent axes**: a
customer can be in *Realize Value* at **M3** and **Yellow** simultaneously.

---

## 5. Adoption strategy

Adoption is the deliberate progression from a single installed instance to a team
habit to an organizational standard — measured entirely through **customer-shared**
signals (§3.3).

### 5.1 Adoption principles

1. **First value fast.** The Onboard exit gate is a *complete* Mission through every
   approval stage — not merely a running install. Time-to-first-Mission is a headline
   KPI (§11).
2. **Make approvals frictionless.** Because every stage is human-gated, adoption
   lives or dies on approval habit. We train approvers on each gate
   (`strategy_and_budget`, `creative_assets`, `campaign_launch`) so review is fast
   and confident.
3. **Grow the Company Brain deliberately.** We coach teams to run enough Missions and
   record enough performance that the marketing-performance memory begins to compound
   and win-patterns become reusable.
4. **Widen from one team to many.** Add internal users, then brands, then clients —
   each expansion is also an adoption milestone.
5. **Certify the operators.** Certification (§12 / §13) converts ad-hoc usage into
   durable internal capability and reduces support load.

### 5.2 Adoption levers (all real)

- Onboarding wizard completion; first-Mission runbook.
- Approval-gate enablement for each of the three gates.
- Local model engine configuration (Ollama / OpenAI-compatible) for teams that want
  genuine model prose beyond the deterministic default.
- Persistence enablement (`DATABASE_URL` → SQLite/Postgres) + verified backups, so
  the Company Brain and history survive restarts.
- Bilingual TR/EN enablement for mixed-language teams.
- Certification pathway (§13).

### 5.3 How adoption is observed

Adoption is inferred **only** from customer-shared exports during check-ins/EBRs:
activity-log snapshots, Mission/draft counts, approval-timeline samples, Company Brain
growth figures, and certification records. There is no vendor-side adoption feed.

---

## 6. Health scoring model

This Constitution **defines** the health model; the **operational detail, weights, and
scoring worksheet live in [`CUSTOMER_HEALTH.md`](CUSTOMER_HEALTH.md)**, which must not
contradict this section.

### 6.1 Model

Customer health is a **RAG** (Red / Amber-"Yellow" / Green) status derived from a
**weighted composite of 10 dimensions**. **All inputs are customer-shared** (§3.3) —
there is no automatic collection.

**The 10 health dimensions:**

1. **Adoption** — breadth of teams/users actively using AdOS.
2. **Usage** — frequency of pipeline runs (customer-shared activity).
3. **AI utilization** — deterministic default vs configured local model engine; how
   the AI stages are used.
4. **Campaign throughput** — Missions/drafts produced per period.
5. **Knowledge growth (Company Brain)** — accumulation/reuse of marketing-performance
   memory.
6. **Support tickets** — volume/severity trend (ties to §10 and `SUPPORT_PLAYBOOK.md`).
7. **Training completion** — enablement and certification progress.
8. **Executive engagement** — sponsor participation in check-ins/EBRs.
9. **Renewal probability** — CSM's evidence-based assessment.
10. **Expansion opportunity** — headroom for more seats/brands/clients/engine.

### 6.2 Banding

| Band | Composite score | Meaning |
|---|---|---|
| 🟢 **Green** | **≥ 80** | Healthy; on track to renew/expand |
| 🟡 **Yellow** | **60–79** | At risk; mitigation plan required |
| 🔴 **Red** | **< 60** | Churn/failure risk; escalation required |

### 6.3 Scoring discipline

- Every dimension is scored from **customer-shared** evidence with the source noted
  (which export, which date). Unknowns are recorded as *unknown*, not assumed healthy.
- Health is reviewed at each cadence touchpoint (§14.2) and always refreshed at the
  EBR (§9).
- A Red on **Renewal probability** or **Executive engagement** triggers the
  escalation model (§10) regardless of composite.

---

## 7. Customer maturity model (M1–M5) — "Adoption Maturity"

Maturity describes *how deeply embedded* AdOS is, independent of lifecycle stage (§4)
and health (§6).

| Level | Name | Definition (evidence is customer-shared) |
|---|---|---|
| **M1** | **Deployed** | Installed, secured, one workspace live. |
| **M2** | **Operating** | A team runs the pipeline end-to-end **weekly**; approvals routine at all gates. |
| **M3** | **Scaling** | Multiple clients/brands, multiple internal users; local model engine configured; persistence enabled + **backups verified**. |
| **M4** | **Optimizing** | Company Brain **actively reused**; win-patterns inform new Missions; KPI-review cadence established. |
| **M5** | **Transforming** | AdOS is the **standard operating layer** for the customer's advertising work across teams; internal champions + certified admins. |

**Advancement:** a customer advances a level only when the customer **shares evidence**
that the next level's definition is met. Maturity is a deliberate coaching target in
the success plan, not an automatic reading.

---

## 8. Expansion strategy

Expansion is pursued only from a position of realized, customer-evidenced value
(typically *Realize Value* → *Mature & Optimize* at M3+, Green/Yellow). Every lever
below is a **real** capability in `PRODUCT_TRUTH.md`.

### 8.1 Real expansion levers

1. **More seats (internal users).** Additional trained/certified operators within the
   customer's teams.
2. **More brands.** Additional Brands (voice/rules/banned words) under existing
   clients.
3. **More clients.** Additional Clients/Workspaces served through the same instance
   (application-level multi-tenant isolation).
4. **Local model engine.** Moving from the deterministic OfflineAIManager default to
   a configured local Ollama / OpenAI-compatible engine for genuine model prose —
   still 100% local, no cloud, no API keys.
5. **Persistence + backups.** Enabling SQLite/Postgres via `DATABASE_URL` and
   verifying backup/recovery — durability for a growing Company Brain and history.

### 8.2 Expansion discipline

- Expansion conversations are grounded in **customer-shared** value evidence (§11),
  never in vendor-observed usage (we have none).
- We never manufacture expansion by promising forbidden capabilities (connectors,
  live launch, document Q&A, agents). Those are **Roadmap** (§15) and must be labeled
  as such if raised.

---

## 9. Renewal strategy

### 9.1 What renews

AdOS renewal is a **subscription and support renewal** — the right to continued
updates, support (§10), enablement, and the CS relationship. Because inference is
**local with no per-token billing**, renewal value is *not* consumption-metered; it is
**capability + partnership + evidenced outcomes**.

### 9.2 Renewal is evidence-led

The renewal case is built from **customer-shared KPIs and value evidence** (§11):
Mission/draft throughput, Company Brain growth and reuse, KPI movement the customer
regards as improved, certification/enablement gains, and reduced time-to-first-Mission
for new users. The CSM assembles this into a value narrative at the annual renewal
review, anchored to the success criteria agreed at *Evaluate* (§4).

### 9.3 Renewal timeline

- **~120 days out:** renewal risk assessment (health §6 + maturity §7 + value evidence).
- **~90 days out:** value narrative drafted from the latest customer-shared exports;
  gaps flagged for mitigation.
- **~60 days out:** renewal EBR with Executive Sponsor; expansion options (§8) framed
  where warranted.
- **~30 days out:** commercial close; next-cycle success plan agreed.

A **Red** renewal-probability dimension (§6) escalates per §10 as early as detected.

---

## 10. Escalation model

The escalation model ties directly to the support severity levels defined for
self-hosted AdOS. **Operational triage detail lives in
[`SUPPORT_PLAYBOOK.md`](SUPPORT_PLAYBOOK.md)**; the authoritative severity/SLA
definitions are reproduced here for governance.

### 10.1 Severity levels & SLAs (self-hosted — SLA = vendor RESPONSE, not remote fix)

| Sev | Name | Trigger | Vendor response target |
|---|---|---|---|
| **Sev 1** | **Critical** | Production down / cannot log in / data-loss risk | **1 business hour**; workaround target 4h |
| **Sev 2** | **High** | Major function impaired (a pipeline stage failing), no workaround | **4 business hours** |
| **Sev 3** | **Normal** | Limited/partial impact, workaround exists | **1 business day** |
| **Sev 4** | **Low** | Question / cosmetic / how-to / enhancement idea | **2 business days** |

> Because the deployment runs on **customer infrastructure**, the vendor delivers
> guidance, patches, and remote assistance **where the customer permits it**. The
> vendor does **not** have standing access to the customer's instance. SLAs are
> **response** commitments, not remote-fix guarantees.

### 10.2 Business (non-technical) escalation

Distinct from technical severity, a **business escalation** is raised when health (§6)
goes **Red**, when Executive engagement lapses, or when renewal probability drops. The
CSM owns the mitigation plan; the Executive Sponsor (customer-side) and the CCSO
office are looped per the RACI (§13.3). Business escalations and Sev tickets are
tracked separately but reviewed together at check-ins/EBRs.

---

## 11. Success KPIs

All KPIs below are **customer-shared** (§3.3) — assembled from what the customer's
admin exports during check-ins/EBRs. None is vendor-collected; none auto-populates.

| KPI | What it measures | Source (customer-shared) |
|---|---|---|
| **Adoption** | Active internal users / teams / brands | Admin headcount + activity export |
| **Mission/draft throughput** | Missions run and drafts produced per period | Activity log / Mission counts export |
| **Company Brain growth** | Accumulation & reuse of marketing-performance memory | Company Brain figures shared by admin |
| **Time-to-first-Mission** | Days from access to first completed Mission (per user/team) | Onboarding records + activity export |
| **Training/certification completion** | Enablement progress across the 6 cert levels (§12) | Certification records |
| **Renewal probability** | CSM evidence-based renewal likelihood | CSM assessment over shared evidence |

Supporting advertising KPIs the customer may share (deterministic, hand-entered in
their instance): **CTR, CPC, CPA, CPL, ROAS, ROI**. We report movement the *customer*
attributes to their AdOS work; we never claim vendor-measured ad performance and never
imply AdOS launched or optimized live ads.

---

## 12. Certification levels (6)

Certification converts usage into durable internal capability and lowers support load.
Curriculum detail lives in the enablement artifacts; the **six levels** are:

1. **Associate** — run a Mission through the pipeline; understand the approval gates.
2. **Professional** — operate the full pipeline fluently; brief/creative/draft quality.
3. **Administrator** — install/secure AdOS; configure persistence + verified backups;
   manage users and workspaces.
4. **Architect** — configure local model engines (Ollama / OpenAI-compatible); design
   multi-brand/multi-client structure at scale.
5. **Partner** — deliver AdOS to others (implementation/enablement partner).
6. **Trainer** — certified to teach and certify AdOS operators.

Certification progress is a health dimension (§6) and a KPI (§11).

---

## 13. Success governance

### 13.1 Roles

| Role | Side | Responsibility |
|---|---|---|
| **CSM** (Customer Success Manager) | Vendor | Owns the relationship, health (§6), and renewal (§9). |
| **Solution Architect** | Vendor | Technical adoption: local model engine, persistence, backups, scale. |
| **Support Engineer** | Vendor | Sev triage and response per §10 / `SUPPORT_PLAYBOOK.md`. |
| **Trainer** | Vendor | Enablement and certification (§12). |
| **Executive Sponsor** | Customer | Executive owner of the AdOS initiative; EBR participant. |
| **Champion** | Customer | Power user driving day-to-day adoption internally. |

### 13.2 Artifacts governed by this Constitution

`CUSTOMER_HEALTH.md` (health detail), `SUPPORT_PLAYBOOK.md` (Sev triage), onboarding
runbooks, EBR templates, certification curricula, expansion & renewal playbooks, the
per-customer **success plan**, and the customer-shared **export/snapshot templates**
used to feed §6/§9/§11. All must trace to `PRODUCT_TRUTH.md` and this Constitution.

### 13.3 RACI (core CS motions)

| Activity | CSM | Solution Architect | Support Engineer | Trainer | Exec Sponsor | Champion |
|---|---|---|---|---|---|---|
| Onboarding to first Mission | A | R | C | R | I | R |
| Adoption plan & check-ins | A/R | C | I | C | I | R |
| Health scoring (§6) | A/R | C | C | C | I | C |
| Technical scale (engine/persistence/backups) | C | A/R | C | I | I | R |
| Sev triage & escalation (§10) | I | C | A/R | I | I | C |
| Certification (§12) | C | C | I | A/R | I | R |
| EBR (§9) | A/R | C | I | C | R | C |
| Renewal & expansion (§8/§9) | A/R | C | I | I | R | C |

*A = Accountable, R = Responsible, C = Consulted, I = Informed.*

### 13.4 Cadence

Weekly (onboarding phase) → **monthly check-in** → **quarterly EBR** → **annual
renewal review**. Each touchpoint refreshes health (§6) from the latest
customer-shared exports.

---

## 14. Executive Business Reviews (EBRs)

### 14.1 Purpose & rhythm

The EBR is a **quarterly** executive touchpoint with the customer's Executive Sponsor
and Champion, owned by the CSM. It reviews realized value, health, maturity, risks,
and the forward plan. **Every input is customer-exported/shared** (§3.3) — there is no
vendor-side EBR dashboard that auto-populates.

### 14.2 Standard quarterly EBR agenda

1. **Success criteria recap** — the KPIs agreed at *Evaluate* (§4).
2. **Value evidence** — customer-shared throughput, Company Brain growth/reuse, and
   the customer's own KPI movement (CTR/CPC/CPA/CPL/ROAS/ROI as they choose to share).
3. **Adoption & maturity** — lifecycle stage (§4), maturity level (§7), certification
   progress (§12) — from shared records.
4. **Health review** — the 10-dimension RAG (§6), each dimension sourced to a shared
   export.
5. **Support & risk** — Sev trends (§10) and the risk register (§16) with mitigations.
6. **Roadmap & expansion** — clearly-labeled Roadmap items (§15) and real expansion
   levers (§8); no forbidden capability presented as shipped.
7. **Forward plan & actions** — next-quarter success plan, owners, dates.

### 14.3 EBR input discipline

Ahead of each EBR the CSM requests a lightweight **export pack** from the customer's
admin (activity snapshot, Mission/draft counts, Company Brain growth figures, KPI
report, certification records). If the customer shares nothing, the EBR proceeds on
qualitative input and the gap is logged as a risk (§16) — we never fabricate metrics
or imply we measured them ourselves.

---

## 15. Roadmap

> Everything in this section is **future direction, not a current capability.** Nothing
> here may be presented — in any CS artifact, EBR, or conversation — as something AdOS
> does today. These map to `PRODUCT_TRUTH.md` §4/§5 (absent or stubbed).

Planned / future directions that CS may reference **only** as Roadmap:

- **Document knowledge base & cited answers** — Q&A over customer documents with
  source citations. *(Today: the Company Brain is marketing-performance memory only;
  no document ingestion, no citations.)*
- **Autonomous agents / "Digital Employees"** — AI that performs pipeline work without
  a human at each gate. *(Today: every stage is human-approved; agent/autonomy layers
  are empty stubs.)*
- **Live ad launch & optimization** — publishing/optimizing campaigns on ad platforms.
  *(Today: AdOS produces drafts only; nothing is ever launched.)*
- **External connectors** — syncs to Meta/Google/TikTok/LinkedIn/CRM/data warehouses.
  *(Today: connector-hub is an unwired stub; metrics are hand-entered.)*
- **Enforced RBAC / permission-aware AI** — roles that actually gate access and scope
  the AI. *(Today: roles are defined but never enforced.)*
- **Immutable audit trail** — tamper-evident, append-only logging. *(Today: structured
  logs + a bounded in-memory activity ring; not immutable.)*
- **DB-level Row-Level Security** — isolation enforced in the database. *(Today:
  application-level tenant isolation only.)*
- **Cloud inference** — hosted/external model inference. *(Today: 100% local; the
  cloud-inference flag is never read.)*
- **Vision / speech / image / video AI** — non-text generation. *(Today: declared in a
  type enum, no engine.)*
- **Tiered approval authority (T0–T4)** — delegated spend-limit authority levels.
  *(Today: only the three approval gates exist; no tiered authority.)*

**Roadmap discipline:** use the words **"Roadmap" / "Planned" / "Future"** — never
"Coming Soon" mixed with "beta" mixed with "now available"; never interleave a Roadmap
item with shipped capabilities in an unlabeled list. No delivery date is committed here.

---

## 16. Risk model

Risks are tracked in a per-customer register and reviewed at every check-in and EBR.
All risk signals are **customer-shared** (§3.3).

### 16.1 Churn / relationship risks

| Risk | Signal (customer-shared) | Mitigation |
|---|---|---|
| Low executive engagement | Sponsor absent from check-ins/EBRs | Re-establish sponsor; reframe value narrative (§9) |
| Weak value evidence | Few Missions/drafts; flat Company Brain | Targeted adoption plan (§5); first-value recovery |
| Renewal doubt | Red renewal-probability (§6) | Early business escalation (§10.2); value case (§9) |
| Champion loss | Departure of the internal power user | Certify a backup Champion (§12); broaden operators |

### 16.2 Adoption risks

| Risk | Signal | Mitigation |
|---|---|---|
| Stalled at first value | No completed Mission past Onboard | First-Mission runbook; approval-gate coaching |
| Approval friction | Approvals slow/avoided at a gate | Gate-specific enablement (`strategy_and_budget` / `creative_assets` / `campaign_launch`) |
| Company Brain not compounding | Low knowledge-growth signal | Coach Mission cadence + performance capture (§5.1.3) |
| Single-team silo | Usage confined to one team | Expansion plan: seats → brands → clients (§8) |

### 16.3 Technical risks

| Risk | Signal | Mitigation |
|---|---|---|
| No durability | Running in-memory only | Enable persistence (`DATABASE_URL`) + **verify backups** (Solution Architect) |
| Backup unverified | Backups never tested | Scheduled backup/recovery verification |
| Prose expectations unmet | Team expects rich prose from default | Configure local model engine (Ollama / OpenAI-compatible) |
| Self-hosted operations gap | Instance health unknown to customer | Enablement on local monitoring/observability; admin certification (§12) |
| Support access limits | Vendor lacks standing access (§10) | Pre-agree assisted-access procedure; escalate per Sev (§10) |

### 16.4 Risk of misalignment (a CS-owned risk)

Any CS artifact that promises a forbidden capability (§3.2) — or implies vendor
telemetry (§3.3) — is itself a churn and trust risk. Mitigation: this Constitution
governs; every artifact traces to `PRODUCT_TRUTH.md`; forbidden capabilities live only
under **Roadmap** (§15).

---

## 17. Amendment & precedence

- **Precedence:** `PRODUCT_TRUTH.md` > this Constitution > all other
  `customer-success/` artifacts.
- **Amendment:** changes to this Constitution are made by the Office of the CCSO and
  must remain aligned to the then-current `PRODUCT_TRUTH.md`. Sibling artifacts update
  to match; they never override this document.
- **Versioning:** this document is versioned with AdOS (currently v1.0.0). A change in
  `PRODUCT_TRUTH.md` capability status (e.g. a Roadmap item shipping) requires a
  review of this Constitution before any sibling artifact reflects the change.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to `PRODUCT_TRUTH.md`.*
