# AdOS — Enterprise Risk Register

**Owner:** Office of the COO
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** ../PRODUCT_TRUTH.md

> This register governs risk to the **AdOS company/business** — the organization
> that builds, licenses, and supports the product — not the product's internal
> engineering backlog. It sits one level above the product and is governed by the
> in-repo `BUSINESS_OPERATIONS_CONSTITUTION.md`. Product-shape risks are stated
> truthfully against ../PRODUCT_TRUTH.md; capabilities that are not yet shipped are
> named as **Roadmap** (see ../ROADMAP.md), never as present-tense product features.

---

## 1. Purpose and scope

The Risk Register is the company's single, versioned inventory of material risks and
their mitigations. It exists to make risk **visible, owned, scored, and reviewed on a
fixed cadence** so leadership can allocate attention and budget deliberately rather
than reactively.

**In scope:** strategic, financial, operational, technical, security, legal, market,
and competitive risks to the *business*. Where a risk concerns the *product*, it is
recorded here only insofar as it affects the company's ability to sell, deliver, and
support AdOS — and it is described in terms consistent with what the product actually
is today.

**Out of scope:** product feature specification, engineering task tracking, and
customer-instance operational incidents. Product-side disaster recovery and backup
are governed separately by ../DISASTER_RECOVERY.md and ../RUNBOOK.md; this register
references them where a business risk depends on them but does not restate them.

**Key product-truth constraints reflected throughout this register (per
../PRODUCT_TRUTH.md and ../KNOWN_LIMITATIONS.md):**

- AdOS is an **offline-first, 100% local-AI advertising-agency platform** ("Agency
  OS"). It **drafts** campaigns through a human-approved pipeline; it **never launches
  live ads**.
- **The customer self-hosts.** There is **no vendor cloud, no phone-home, and no
  standing vendor access.** The company therefore **cannot auto-collect** any
  customer-instance usage, adoption, or health data. Every such signal in this
  business is **customer-reported / customer-attested**, and its absence is itself a
  tracked operational risk (RISK-0201).
- **Revenue is license/subscription resale + direct license, implementation &
  services, support / managed services, and referral fees.** There is **no cloud
  markup, no per-token, and no consumption billing** — the product has no metering.
- A set of frequently-marketed capabilities — document Q&A / cited answers, "Digital
  Employees" / autonomous agents, live ad launch/optimization, external connectors,
  enforced RBAC / permission-aware AI, immutable audit trail, cloud inference — are
  **Roadmap, not shipped** (../PRODUCT_TRUTH.md §4–§6). Treating any of them as
  present today is a governance and positioning risk in its own right (RISK-0001,
  RISK-0603, RISK-0703).

---

## 2. Register model

### 2.1 Probability scale (1–5)

| Level | Label | Definition (over the next 12 months, absent new mitigation) |
|---|---|---|
| 1 | Rare | <10% — would be surprising; no current indicators. |
| 2 | Unlikely | 10–30% — plausible but not expected. |
| 3 | Possible | 30–55% — could reasonably occur; some indicators present. |
| 4 | Likely | 55–80% — expected more often than not. |
| 5 | Almost certain | >80% — effectively a question of when, not if. |

### 2.2 Impact scale (1–5)

Impact is scored on the **worst credible** business outcome across finance, customers,
reputation, and continuity — whichever axis is highest.

| Level | Label | Financial (annualized) | Business meaning |
|---|---|---|---|
| 1 | Negligible | < 1% of revenue | Absorbed in normal operations. |
| 2 | Minor | 1–3% | Noticeable; handled by the owning department. |
| 3 | Moderate | 3–8% | Cross-department response; management attention. |
| 4 | Major | 8–20% | Executive response; plan/budget re-forecast. |
| 5 | Severe | > 20% | Threatens continuity, a key market, or the company's credibility. |

### 2.3 Scoring and severity bands

**Score = Probability × Impact** (range 1–25). Severity band drives review intensity
and escalation:

| Score | Band | Handling |
|---|---|---|
| 1–4 | **Low** | Monitor; owner reviews on normal cadence. |
| 5–9 | **Moderate** | Active mitigation; reviewed at Monthly business review. |
| 10–14 | **High** | Named mitigation with owner + date; reviewed at every QBR. |
| 15–25 | **Critical** | Executive-owned; standing agenda item until score falls below 15. |

### 2.4 Status values

Per the risk model in `BUSINESS_OPERATIONS_CONSTITUTION.md`:

- **Open** — identified, mitigation not yet effective.
- **Mitigating** — mitigation actively in progress and reducing exposure.
- **Accepted** — residual risk consciously retained (rationale recorded); revisited
  at Annual review.
- **Closed** — no longer credible or fully mitigated.

### 2.5 Review cadence

Cadence follows the company operating rhythm defined in
`BUSINESS_OPERATIONS_CONSTITUTION.md`:

| Cadence | Forum | Risk activity |
|---|---|---|
| Weekly | Operational review | Critical-band risks with an active this-week action only. |
| Monthly | Business review | Moderate-and-above risks; threshold breaches; new-risk intake. |
| **Quarterly** | **QBR** | **Full risk-register review** — re-score every risk, retire Closed, confirm owners. This is the primary review gate. |
| Annual | Strategy + planning | Complete re-baseline, category coverage check, appetite reset, Accepted-risk re-justification. |

Each risk row carries its **own Review cycle** (Monthly / Quarterly / Annual). The
whole register is nonetheless re-scored **every quarter at the QBR**; a row's stated
cycle is the *minimum* frequency, not a cap.

### 2.6 Ownership

Every risk has exactly one **accountable department** (one of the ten functions in
`BUSINESS_OPERATIONS_CONSTITUTION.md`: Executive, Engineering, Product, Sales,
Marketing, Customer Success, Partners, Finance, Legal, Operations). The department's
accountable lead owns the mitigation and reports status into the cadence above.

### 2.7 Risk appetite (summary)

| Category | Appetite | Note |
|---|---|---|
| Strategic | Low | Positioning integrity is non-negotiable; truthful GTM is a hard constraint. |
| Financial | Low–Moderate | Conservative cash runway; diversified revenue streams. |
| Operational | Moderate | Accepted trade-offs from the self-hosted, no-telemetry model. |
| Technical | Low | Product correctness and honest capability claims are protected. |
| Security | Very low | Zero appetite for mishandled credentials or customer trust. |
| Legal | Very low | Contractual, IP, and licensing compliance strictly maintained. |
| Market | Moderate | Early-stage category ambiguity is expected and actively managed. |
| Competition | Moderate | Differentiation is defensible but must be continuously earned. |

---

## 3. Register

Rows are grouped by the eight categories mandated by
`BUSINESS_OPERATIONS_CONSTITUTION.md`. IDs are stable (`RISK-NNNN`) and are not reused
when a risk closes.

### 3.1 Strategic

**Context.** Strategic risk appetite is **Low**: the company's most valuable asset is
the integrity of its positioning. The single largest strategic exposure is the gap
between the broad GTM narrative and the concrete advertising-agency product the code
actually implements (../PRODUCT_TRUTH.md §7). These risks are owned at the Executive
level and reviewed at every QBR until the positioning is reconciled per
../POSITIONING_ALIGNMENT_PLAN.md.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0001 | **Positioning gap.** GTM narrative ("Enterprise AI Operating System") is broader than what the code is — an advertising-agency OS (../PRODUCT_TRUTH.md §7). If external messaging out-runs the product, it creates credibility, sales-cycle, and churn risk. | 4 | 4 | 16 | Critical | Enforce the truthful one-liner ("Enterprise AI Operating System **for Advertising**") across all collateral; run the reconciliation in ../POSITIONING_ALIGNMENT_PLAN.md; gate GTM claims against ../PRODUCT_TRUTH.md; track open items in ../POSITIONING_GAP_ANALYSIS.md. | Executive | Mitigating | Quarterly |
| RISK-0002 | **Over-reliance on a single vertical.** Product is advertising-native throughout; a downturn in agency/advertising demand concentrates company exposure. | 3 | 4 | 12 | High | Maintain adjacency roadmap (../ROADMAP.md) without over-promising; diversify target sub-segments (in-house marketing teams, SMB agencies); avoid capability claims outside shipped scope. | Executive | Open | Quarterly |
| RISK-0003 | **Roadmap-vs-shipped drift in strategy.** Strategy narratives may quietly assume Roadmap items (connectors, RBAC enforcement, document Q&A) are near-term, mis-timing hiring and spend. | 3 | 3 | 9 | Moderate | Every strategic plan cites capability status from ../PRODUCT_TRUTH.md §4–§5; Roadmap items carry explicit target windows in ../ROADMAP.md; no revenue plan books un-shipped capability. | Product | Mitigating | Quarterly |
| RISK-0004 | **Founder / key-person concentration in strategy.** Direction and key relationships concentrated in a small executive group. | 3 | 4 | 12 | High | Documented decision records (ADR process in the constitution); cross-brief on key accounts; succession notes maintained by Operations (see RISK-0206). | Executive | Open | Quarterly |
| RISK-0005 | **Self-hosted model limits growth telemetry for strategy.** Because there is no vendor telemetry, strategic bets on adoption rest on customer-reported data, slowing course-correction. | 3 | 3 | 9 | Moderate | Formalize customer-reported/attested reporting in QBRs and success reviews; treat all such inputs as customer-reported per the constitution; triangulate with pipeline and support signals the company *does* own. | Executive | Accepted | Quarterly |
| RISK-0006 | **Mission dilution.** Pressure to chase enterprise-KM opportunities the product does not serve could pull engineering off the advertising core. | 2 | 4 | 8 | Moderate | Product Council guards scope against ../PRODUCT_TRUTH.md §1–§2; net-new capability enters via Roadmap governance, not ad-hoc sales commitments. | Product | Open | Quarterly |
| RISK-0007 | **Timing risk on Roadmap monetization.** Company value narrative may lean on Roadmap capabilities (connectors, RBAC enforcement, audit) maturing on schedule; slippage undercuts the growth story. | 3 | 3 | 9 | Moderate | Sequence the Roadmap conservatively in ../ROADMAP.md; never pre-sell un-shipped capability; tie strategic milestones to shipped-and-tested status in ../PRODUCT_TRUTH.md. | Product | Open | Quarterly |

### 3.2 Financial

**Context.** Financial appetite is **Low–Moderate**. The revenue model is
deliberately non-metered — license/resale + direct license, implementation &
services, support / managed services, and referral fees — so there is no consumption
upside to smooth lumpy license and services income. Conservative runway management and
a diversified revenue mix are the core defenses. No financial risk or mitigation here
assumes usage, per-token, or consumption revenue, consistent with
`BUSINESS_OPERATIONS_CONSTITUTION.md`.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0101 | **Revenue concentration.** A few license/resale customers make up a large share of revenue; loss of one materially dents the forecast. | 3 | 4 | 12 | High | Diversify logos across partners and direct; enforce renewal-risk tracking in the Monthly business review; maintain 4-stream revenue mix (license, services, support, referral) per the constitution. | Finance | Mitigating | Monthly |
| RISK-0102 | **No consumption revenue floor.** The product has no metering; there is no per-token or usage upside to smooth revenue between deals — income is lumpy license/services. | 3 | 3 | 9 | Moderate | Cash-flow modeled on contractual license + recurring support; services scheduled to smooth troughs; **no plan books usage/consumption ARR** (constitution). | Finance | Accepted | Quarterly |
| RISK-0103 | **Cash runway / burn.** Early-stage spend outpaces collections during a slow quarter. | 3 | 5 | 15 | Critical | Maintain minimum runway threshold with Warning/Critical bands in the KPI catalog; rolling 13-week cash forecast; discretionary-spend freeze trigger at Critical band. | Finance | Mitigating | Monthly |
| RISK-0104 | **Services margin erosion.** Where a partner delivers implementation, services revenue is 100% partner-retained; company margin then depends on license and support only. | 3 | 3 | 9 | Moderate | Price license/support to stand alone; monitor blended margin monthly; keep referral-fee and discount tiers to illustrative baselines per the constitution. | Finance | Open | Monthly |
| RISK-0105 | **FX / currency exposure.** TR-based operations with `TRY` base and mixed-currency deals expose margins to currency swings (../KNOWN_LIMITATIONS.md notes TRY/`Europe/Istanbul` as base format). | 4 | 3 | 12 | High | Price in hard currency where feasible; natural hedging of TRY costs against TRY revenue; review FX assumptions each Monthly business review. | Finance | Mitigating | Monthly |
| RISK-0106 | **Long enterprise sales cycles strain working capital.** Self-hosted enterprise procurement (security review, on-prem sign-off) delays cash. | 4 | 3 | 12 | High | Milestone-based billing; deposits on services; pipeline-weighted cash forecast; partner-led motion to shorten cycles. | Finance | Open | Monthly |
| RISK-0107 | **Under-costed support obligations.** Self-hosted support (many environments, versions) can exceed the support fee if scope is loose. | 3 | 3 | 9 | Moderate | Tiered support SLAs; version-support window tied to SemVer policy in `BUSINESS_OPERATIONS_CONSTITUTION.md`; track cost-to-serve per account. | Finance | Open | Quarterly |

### 3.3 Operational

**Context.** Operational appetite is **Moderate** — the company knowingly accepts
certain trade-offs that flow directly from the self-hosted, offline, no-telemetry
architecture. The defining operational reality is that the company **cannot observe**
what happens inside a customer's instance; every health, adoption, and usage signal is
**customer-reported / customer-attested** and never auto-collected. This shapes
customer success, support, and release communication throughout.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0201 | **No vendor telemetry limits early churn / health signal.** Because AdOS is self-hosted, offline, and does not phone home, the company **cannot observe** customer usage, adoption, or product health. Churn and expansion risk surface late, only through customer-reported channels. | 4 | 4 | 16 | Critical | Structured, scheduled **customer-reported / customer-attested** health check-ins owned by Customer Success; QBR account reviews; proactive support outreach; leading indicators from the data the company *does* own (support volume, renewal dates, invoice timing). Never describe any of this as telemetry or auto-collected. | Customer Success | Mitigating | Monthly |
| RISK-0202 | **Manual customer-reported metrics are incomplete or stale.** Health/adoption inputs depend on customers choosing to report; coverage gaps distort the picture. | 4 | 3 | 12 | High | Standardize a lightweight customer-export/attestation format; make reporting a contractual touchpoint at renewal; flag non-reporting accounts as elevated-risk by default. | Customer Success | Open | Monthly |
| RISK-0203 | **Onboarding / implementation delays.** Self-hosted install (infra prep, `DATABASE_URL` for durability, `AUTH_MODE=password` for production) can stall if customer environments are not ready (../KNOWN_LIMITATIONS.md). | 3 | 3 | 9 | Moderate | Pre-flight environment checklist in ../INSTALLATION_GUIDE.md / ../DEPLOYMENT.md; partner-delivered implementations; staged go-live with the Docker compose stack in staging first. | Operations | Mitigating | Monthly |
| RISK-0204 | **Support knowledge concentrated in few engineers.** Deep product support depends on a small team; absence degrades response. | 3 | 3 | 9 | Moderate | Runbook coverage (../RUNBOOK.md, ../OPERATIONS_GUIDE.md); on-call rotation; recorded resolutions to build a shared knowledge base. | Operations | Open | Quarterly |
| RISK-0205 | **Customer runs an unsupported / default-insecure configuration.** E.g. leaving dev passwordless login enabled, or in-memory persistence (no durability) in production (../KNOWN_LIMITATIONS.md). | 3 | 4 | 12 | High | Hardening guidance in ../SECURITY_GUIDE.md and ../ADMIN_GUIDE.md; production readiness checklist requiring `AUTH_MODE=password` and a set `DATABASE_URL`; call these out at handover. | Customer Success | Mitigating | Monthly |
| RISK-0206 | **Key-person dependency (business operations).** Loss of a critical individual (lead engineer, key AE, finance lead) disrupts continuity. | 3 | 4 | 12 | High | Documented processes, cross-training, succession notes; business-continuity plan governed by the constitution's continuity vocabulary (distinct from product DR). | Operations | Open | Quarterly |
| RISK-0207 | **Release-communication failure to self-hosting customers.** Because releases are versioned builds distributed to self-hosters (not an auto-push), a customer may run an outdated build and miss a fix. | 3 | 3 | 9 | Moderate | Release notification is a **communication** step (email/changelog per ../CHANGELOG.md and ../RELEASE_NOTES.md); maintain a customer/partner contact registry; track adopted-version by account via customer-reported status. | Operations | Mitigating | Monthly |
| RISK-0208 | **Local-model performance mismatch on customer hardware.** A 7B model on CPU can take ~40–50 s per brief→creative→campaign chain, disappointing users who expect instant output (../KNOWN_LIMITATIONS.md). | 3 | 2 | 6 | Moderate | Set expectations at sale; recommend GPU / smaller quantized model, or the default sub-millisecond offline deterministic manager; document sizing guidance in ../AI_GUIDE.md. | Customer Success | Mitigating | Quarterly |

### 3.4 Technical

**Context.** Technical appetite is **Low**: product correctness and honest capability
claims are protected. Most technical risks trace directly to documented constraints in
../KNOWN_LIMITATIONS.md (live Postgres/MinIO not exercised in CI, tenant-slug
collisions, non-durable in-memory default, forward-only migrations). None blocks
production use; each has a documented mitigation and a supported-configuration path.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0301 | **Postgres / MinIO not exercised live in CI.** SQL and storage ports are verified against embedded SQLite and local file storage plus contracts; live Postgres/MinIO run only in staging (../KNOWN_LIMITATIONS.md). A production-only adapter defect could surface at a customer. | 3 | 3 | 9 | Moderate | Run the Docker compose stack in staging before customer go-live (../DEPLOYMENT_REPORT.md); expand adapter contract tests; treat first production deploy of each backend as a supervised milestone. | Engineering | Mitigating | Quarterly |
| RISK-0302 | **Tenant-slug collision.** Tenant = slugified company name; two companies slugifying identically would share a tenant (../KNOWN_LIMITATIONS.md). | 2 | 4 | 8 | Moderate | Enforce unique company names at signup; validation guard at provisioning; documented in ../ADMIN_GUIDE.md. | Engineering | Mitigating | Quarterly |
| RISK-0303 | **Local model output-quality variance.** Small local models occasionally mix TR/EN in long free-form prose; structured JSON and ad copy render correctly (../KNOWN_LIMITATIONS.md). | 3 | 2 | 6 | Moderate | Recommend larger / Turkish-tuned local models; system prompt already enforces target language; guide expectations in ../AI_GUIDE.md. | Engineering | Accepted | Quarterly |
| RISK-0304 | **In-memory default is non-durable.** With `DATABASE_URL` unset, data does not survive restart; a customer could lose work by mis-deploying (../KNOWN_LIMITATIONS.md). | 3 | 3 | 9 | Moderate | Loud production guidance to set `DATABASE_URL`; readiness checklist; startup warning surfaced in operations docs. | Engineering | Mitigating | Quarterly |
| RISK-0305 | **No streaming in the web UI.** `stream()` exists but the app uses `submit()`, so long generations appear only when complete, hurting perceived responsiveness (../KNOWN_LIMITATIONS.md). | 3 | 1 | 3 | Low | Set expectations; recommend faster local engines; UI streaming tracked as a product improvement in ../ROADMAP.md (Roadmap, not a company metric). | Product | Accepted | Annual |
| RISK-0306 | **Upgrade / migration risk.** Forward-only migrations mean a botched upgrade at a self-hosted customer is hard to reverse without a backup. | 3 | 4 | 12 | High | Mandatory pre-upgrade backup per ../BACKUP_GUIDE.md; documented rollback via restore in ../DISASTER_RECOVERY.md; version-upgrade procedure in ../UPGRADE_GUIDE.md. | Engineering | Mitigating | Quarterly |
| RISK-0307 | **Dependency / supply-chain drift.** Runtime relies on local engines (Ollama / OpenAI-compatible) and node runtimes the customer controls; version skew can break inference. | 3 | 3 | 9 | Moderate | Pin supported engine/runtime versions in ../INSTALLATION_GUIDE.md; compatibility matrix maintained per release; validate on the supported matrix in CI. | Engineering | Open | Quarterly |

### 3.5 Security

**Context.** Security appetite is **Very low**. The product ships genuine security
primitives — Argon2id password hashing, HMAC-signed HttpOnly sessions with per-session
CSRF, brute-force lockout, and CSP/HSTS headers (../PRODUCT_TRUTH.md §1). The dominant
security risks are (a) customers deploying default-insecure configurations, and (b)
correctly representing capabilities that are **Roadmap, not shipped** — enforced RBAC,
permission-aware AI, immutable audit, and DB-level row-level security — so that no
customer relies on a control the current product does not provide.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0401 | **Customer deploys with dev passwordless login.** The open dev login is default; production requires `AUTH_MODE=password` (Argon2id). Running the open login in production exposes the instance (../KNOWN_LIMITATIONS.md). | 3 | 5 | 15 | Critical | Production hardening checklist mandating `AUTH_MODE=password`; explicit warnings in ../SECURITY_GUIDE.md / ../ADMIN_GUIDE.md; verify at go-live handover; document as a top install caveat. | Engineering | Mitigating | Monthly |
| RISK-0402 | **No enforced RBAC in-product (permission enforcement is Roadmap).** Roles are defined but not enforced; the product does not restrict actions by role today (../PRODUCT_TRUTH.md §2.6, §4). Customers with least-privilege requirements may be mis-sold or mis-configured. | 3 | 4 | 12 | High | State plainly in security collateral that permission enforcement is **Roadmap** (../ROADMAP.md); advise compensating controls (network isolation, per-instance separation); never present RBAC as shipped. | Product | Open | Quarterly |
| RISK-0403 | **No immutable audit trail (Roadmap).** The product provides structured logging, per-approval timelines, and a bounded activity feed — **not** a tamper-evident audit log (../PRODUCT_TRUTH.md §2.7). Customers with strict audit mandates may have unmet needs. | 3 | 3 | 9 | Moderate | Position current logging accurately; immutable audit is **Roadmap**; recommend customer-side log shipping/retention as a compensating control; document in ../SECURITY_GUIDE.md. | Product | Open | Quarterly |
| RISK-0404 | **Company-side credential / secret mishandling.** Internal handling of code-signing keys, partner portals, and customer contacts could leak. | 2 | 5 | 10 | High | Secret management and least-privilege for internal systems; periodic access review by Operations; incident runbook; zero-appetite policy. | Operations | Mitigating | Quarterly |
| RISK-0405 | **Vulnerability disclosed in a shipped version at self-hosted customers.** A CVE in the product or a bundled dependency requires customers to patch themselves (no auto-push). | 3 | 4 | 12 | High | Coordinated-disclosure process; security advisory via ../CHANGELOG.md / ../SECURITY_REPORT.md; hotfix/emergency-release path in the constitution's release governance; proactive customer notification. | Engineering | Mitigating | Monthly |
| RISK-0406 | **Customer data confidentiality during services engagements.** Implementation staff may touch customer data on-prem; mishandling breaches trust. | 2 | 5 | 10 | High | NDAs and data-handling clauses (Legal); access strictly scoped and time-boxed; no data leaves customer environment; reinforced because the product itself has no phone-home. | Legal | Mitigating | Quarterly |
| RISK-0407 | **Weak tenant isolation assumptions oversold.** Isolation is application-level (no DB row-level security); positioning it as DB-enforced would misrepresent the product (../PRODUCT_TRUTH.md §6.2). | 2 | 4 | 8 | Moderate | Describe isolation accurately as application-enforced; DB-level RLS is **Roadmap**; single-tenant deployment offered where a customer needs stronger separation. | Product | Open | Quarterly |

### 3.6 Legal

**Context.** Legal appetite is **Very low**. The largest legal exposure mirrors the
strategic one: any contractual or marketing statement that presents a Roadmap
capability as shipped is a misrepresentation risk. Legal review of commitments against
../PRODUCT_TRUTH.md is a hard gate. The self-hosted, no-telemetry architecture is a
genuine privacy advantage that must be described accurately, not overstated.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0501 | **Capability over-claim in contracts/marketing.** A signed statement of work or datasheet promising a Roadmap capability (document Q&A, connectors, RBAC, live ad launch) as shipped creates breach/misrepresentation exposure. | 3 | 4 | 12 | High | Legal review of all commitments against ../PRODUCT_TRUTH.md; capability language pulled from approved copy; Roadmap items flagged as forward-looking with no delivery warranty. | Legal | Mitigating | Quarterly |
| RISK-0502 | **Open-source license compliance.** Bundled dependencies and local engines carry licenses that must be honored in a redistributed, self-hosted product. | 2 | 4 | 8 | Moderate | Maintain an SBOM / license inventory per release; automated license scan in CI; legal sign-off on new dependencies. | Legal | Open | Quarterly |
| RISK-0503 | **Data-protection / KVKK & GDPR obligations.** Even though AdOS is self-hosted and the company collects no customer-instance data, services engagements and company-held contact data carry obligations. | 3 | 4 | 12 | High | Data-processing terms in contracts; the no-telemetry, self-hosted architecture is itself a strong privacy posture (state accurately); DPA templates maintained by Legal. | Legal | Mitigating | Quarterly |
| RISK-0504 | **Partner/reseller agreement ambiguity.** Discount tiers, referral fees, and 100%-partner-retained services must be unambiguous to avoid disputes (constitution §4.7 commercial vocabulary). | 3 | 3 | 9 | Moderate | Standardized partner agreements; illustrative-baseline discounts/fees stated as such; margin and retention terms explicit; align with ../partner materials where present. | Legal | Open | Quarterly |
| RISK-0505 | **IP ownership and contribution provenance.** Unclear ownership of contributions or third-party code could impair licensing. | 2 | 4 | 8 | Moderate | Contributor terms; IP assignment for employees/contractors; provenance tracking; legal review of third-party inclusions. | Legal | Open | Annual |
| RISK-0506 | **Advertising-content liability.** The product drafts ad copy; a customer could publish drafted copy that is non-compliant in their jurisdiction/industry. | 2 | 3 | 6 | Moderate | Contract terms placing publication responsibility on the customer (product **drafts, never launches** — ../PRODUCT_TRUTH.md §2.4); human-approval gates documented; disclaimers in ../USER_GUIDE.md. | Legal | Accepted | Quarterly |

### 3.7 Market

**Context.** Market appetite is **Moderate**: early-stage category ambiguity is
expected and managed rather than eliminated. The central market risk is expectation
inflation — a broad "Enterprise AI OS" narrative attracting buyers who want generic
document knowledge management or "Digital Employees" the product does not provide
(../PRODUCT_TRUTH.md §6.3). Disciplined, truthful messaging that leads with the
Advertising frame is the primary control.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0601 | **Category ambiguity slows buyers.** "AI Operating System" is a crowded, ill-defined label; buyers may not understand what AdOS uniquely does, lengthening cycles. | 4 | 3 | 12 | High | Lead with the concrete, truthful frame ("Enterprise AI Operating System **for Advertising**", Agency OS); crisp before/after demos of the human-approved pipeline; messaging discipline per ../POSITIONING_ALIGNMENT_PLAN.md. | Marketing | Mitigating | Quarterly |
| RISK-0602 | **Offline / local-AI value not understood.** Prospects conditioned to cloud SaaS may undervalue air-gapped, no-per-token, no-vendor-access deployment. | 3 | 3 | 9 | Moderate | Educate on the genuine differentiators (data never leaves premises, no per-token billing, air-gap capable — ../PRODUCT_TRUTH.md §6.1); target privacy/sovereignty-sensitive segments. | Marketing | Mitigating | Quarterly |
| RISK-0603 | **Expectation inflation from the market narrative.** Broad "Enterprise AI OS" positioning attracts buyers wanting generic document-KM / Digital Employees the product does not provide, producing bad-fit deals and churn (../PRODUCT_TRUTH.md §6.3). | 4 | 4 | 16 | Critical | Qualify hard against real capabilities; disqualify generic-KM use cases early; sales enablement anchored to ../PRODUCT_TRUTH.md §1–§2; Roadmap items presented as Roadmap only. | Sales | Mitigating | Monthly |
| RISK-0604 | **Small / early reference base.** Few public references make risk-averse enterprise buyers hesitate. | 3 | 3 | 9 | Moderate | Cultivate reference customers and case studies (customer-attested results only); partner co-selling; pilot-to-production motion. | Marketing | Open | Quarterly |
| RISK-0605 | **Macro / advertising-spend sensitivity.** Advertising budgets are cyclical; a downturn suppresses demand for an advertising-agency platform. | 3 | 4 | 12 | High | Emphasize cost-efficiency value (local AI, no per-token) that appeals in downturns; diversify segments per RISK-0002; conservative demand forecasting. | Marketing | Open | Quarterly |
| RISK-0606 | **Regional concentration.** Early demand concentrated in TR / regional market limits TAM and adds geo-specific exposure. | 3 | 3 | 9 | Moderate | Bilingual TR/EN product supports expansion; partner-led entry into new geographies; staged localization beyond TR/EN as a Roadmap consideration. | Marketing | Open | Quarterly |

### 3.8 Competition

**Context.** Competitive appetite is **Moderate**. AdOS deliberately does **not**
compete on the breadth axis where cloud AI marketing suites are strong (live campaign
launch, external connectors, analytics ingestion) — those are outside the product's
thesis, and several appear only as Roadmap (../PRODUCT_TRUTH.md §4). Differentiation
rests on axes cloud suites structurally cannot match: 100% local, offline / air-gap
capable, no per-token billing, no vendor access, and data sovereignty. That
differentiation is defensible but must be continuously earned through domain depth and
references.

| ID | Description | Prob | Impact | Score | Band | Mitigation | Owner | Status | Review |
|---|---|---|---|---|---|---|---|---|---|
| RISK-0701 | **Cloud AI marketing suites out-feature on breadth.** Well-funded cloud competitors ship connectors, live campaign launch, and analytics ingestion AdOS deliberately does not. | 4 | 3 | 12 | High | Compete on the axes cloud suites cannot match: 100% local, offline/air-gap, no per-token billing, no vendor access, data sovereignty; do not chase feature parity on capabilities outside the product's thesis. | Product | Mitigating | Quarterly |
| RISK-0702 | **Commoditization of local-LLM tooling.** Open local-inference stacks lower the barrier for others to assemble a similar offline pipeline. | 3 | 4 | 12 | High | Defend with the domain depth — agency domain model, human-approved pipeline, marketing-performance Company Brain, bilingual UX — that is hard to replicate; keep raising switching value. | Product | Open | Quarterly |
| RISK-0703 | **Competitors exploit the capability gap.** Rivals may highlight that AdOS lacks shipped document Q&A, connectors, enforced RBAC, and immutable audit (all Roadmap per ../PRODUCT_TRUTH.md §4). | 3 | 3 | 9 | Moderate | Honest positioning that reframes scope as a deliberate offline-first trade-off; publish a truthful, dated ../ROADMAP.md; never counter with capability claims the product cannot back. | Marketing | Mitigating | Quarterly |
| RISK-0704 | **Partner / channel poaching.** A partner adopts a competing product or builds a substitute, taking accounts. | 2 | 4 | 8 | Moderate | Strong partner economics (retained services revenue, referral fees per the constitution); joint business plans; multi-partner coverage to avoid single-channel dependence. | Partners | Open | Quarterly |
| RISK-0705 | **Fast-follower on offline positioning.** A competitor copies the "local / air-gapped advertising AI" angle once it is validated. | 3 | 3 | 9 | Moderate | Move first on references and partnerships; deepen the Company Brain and domain model as a moat; maintain release velocity via the constitution's release governance. | Product | Open | Quarterly |
| RISK-0706 | **Buyer builds in-house.** A large customer assembles its own local pipeline instead of licensing. | 2 | 3 | 6 | Moderate | Emphasize total cost of ownership, support, and maintained roadmap vs. build-and-maintain burden; services and support streams make "buy" cheaper than "build". | Sales | Open | Quarterly |
| RISK-0707 | **Roadmap parity race.** Competitors ship the Roadmap capabilities (connectors, RBAC, audit) before AdOS does, eroding the "coming soon" story. | 3 | 3 | 9 | Moderate | Keep the Roadmap honest and dated (../ROADMAP.md); win on the offline/sovereignty thesis that does not depend on those items; maintain release velocity per the constitution's release governance. | Product | Open | Quarterly |

---

## 4. Critical-risk deep dive

The five Critical-band risks (score ≥ 15) carry a standing executive owner and remain
a QBR agenda item until re-scored below 15. Each is summarized here for leadership
visibility; full mitigation detail lives in the category tables above.

- **RISK-0001 — Positioning gap (Strategic, 16).** The defining company risk: GTM
  says "Enterprise AI Operating System" while the code is an advertising-agency OS
  (../PRODUCT_TRUTH.md §7). Reconciliation is tracked in ../POSITIONING_ALIGNMENT_PLAN.md;
  every external claim is gated against ../PRODUCT_TRUTH.md.
- **RISK-0103 — Cash runway / burn (Financial, 15).** Early-stage burn against lumpy,
  non-metered revenue. Managed via a rolling 13-week cash forecast, runway
  Warning/Critical thresholds in the KPI catalog, and a discretionary-spend freeze
  trigger.
- **RISK-0201 — No vendor telemetry (Operational, 16).** The self-hosted, offline,
  no-phone-home architecture means the company cannot observe customer health; churn
  signals arrive late and only via customer-reported channels. Managed with scheduled
  customer-attested check-ins and by exploiting the signals the company does own
  (support volume, renewal dates, invoice timing).
- **RISK-0401 — Default-insecure customer deployment (Security, 15).** Running the dev
  passwordless login or non-durable in-memory mode in production
  (../KNOWN_LIMITATIONS.md). Managed with a mandatory production-hardening checklist
  (`AUTH_MODE=password`, `DATABASE_URL` set) verified at go-live handover.
- **RISK-0603 — Expectation inflation (Market, 16).** The broad narrative attracts
  bad-fit buyers wanting generic KM / Digital Employees the product does not provide.
  Managed by hard qualification against ../PRODUCT_TRUTH.md §1–§2 and early
  disqualification of out-of-scope use cases.

---

## 5. Heat map (score summary)

Counts of risks by probability × impact. Cells show risk IDs; band follows §2.3.

| Prob ↓ / Impact → | 1 (Negligible) | 2 (Minor) | 3 (Moderate) | 4 (Major) | 5 (Severe) |
|---|---|---|---|---|---|
| **5 (Almost certain)** | — | — | — | — | — |
| **4 (Likely)** | — | — | 0105, 0106, 0202, 0601 | 0001, 0201, 0603, 0701 | — |
| **3 (Possible)** | 0305 | 0208, 0303 | 0003, 0005, 0007, 0102, 0104, 0107, 0203, 0204, 0207, 0301, 0304, 0307, 0403, 0504, 0602, 0604, 0606, 0703, 0705, 0707 | 0002, 0004, 0101, 0205, 0206, 0306, 0402, 0405, 0501, 0503, 0605, 0702 | 0103, 0401 |
| **2 (Unlikely)** | — | — | 0506, 0706 | 0006, 0302, 0407, 0502, 0505, 0704 | 0404, 0406 |
| **1 (Rare)** | — | — | — | — | — |

**Critical-band risks (score ≥ 15), standing executive agenda until score < 15:**
RISK-0001, RISK-0103, RISK-0201, RISK-0401, RISK-0603.

---

## 6. Governance notes

- **New-risk intake.** Any department may raise a risk at any time; it is logged at the
  next Monthly business review, scored, and assigned an owner. Material risks may be
  escalated immediately to the Executive team.
- **Re-scoring.** Every row is re-scored at the **Quarterly QBR** (constitution
  operating rhythm). A row's own Review cycle sets its *minimum* review frequency.
- **Accepted risks** are re-justified at the **Annual** review; if the rationale no
  longer holds, they revert to Open or Mitigating.
- **Traceability.** Product-shape risks trace to ../PRODUCT_TRUTH.md and
  ../KNOWN_LIMITATIONS.md; Roadmap references trace to ../ROADMAP.md; continuity and
  security mitigations reference ../DISASTER_RECOVERY.md, ../RUNBOOK.md,
  ../BACKUP_GUIDE.md, ../SECURITY_GUIDE.md, and ../DEPLOYMENT.md. Governance model,
  cadence, departments, and commercial vocabulary follow
  `BUSINESS_OPERATIONS_CONSTITUTION.md`.
- **Truthfulness constraint.** No mitigation in this register may imply a product
  capability absent from ../PRODUCT_TRUTH.md, and no customer-instance metric is
  treated as auto-collected — all such signals are **customer-reported / attested**.

### 6.1 Escalation matrix

Escalation is driven by severity band (§2.3), independent of a row's stated Review
cycle. A risk that crosses a band boundary is escalated at the next applicable forum.

| Band | Escalates to | Cadence of review | Trigger to de-escalate |
|---|---|---|---|
| Critical (15–25) | Executive team (CEO/COO) | Standing QBR item; Weekly if an action is live | Re-scored below 15 for one full quarter |
| High (10–14) | Department lead + accountable C-level | Every QBR | Re-scored below 10 |
| Moderate (5–9) | Accountable department | Monthly business review | Re-scored below 5 |
| Low (1–4) | Risk owner | Normal cadence / Annual | Judged no longer credible → Closed |

### 6.2 How to read a row

- **Score is worst-credible, pre-new-mitigation.** It reflects exposure before any
  *additional* control is applied, so the value of a mitigation is visible. Where a
  mitigation is already effective, Status is **Mitigating** and the score reflects the
  reduced residual exposure agreed at the last review.
- **One accountable department per row.** Consulted/Informed parties are handled in the
  RACI model in `BUSINESS_OPERATIONS_CONSTITUTION.md`, not duplicated here.
- **Roadmap language is deliberate.** Where a row references a capability as Roadmap
  (connectors, RBAC enforcement, document Q&A, immutable audit, cloud inference), it is
  a forward-looking product item in ../ROADMAP.md and must never be sold, contracted,
  or measured as a shipped feature.

### 6.3 Category coverage

All eight mandated categories carry at least six scored risks: Strategic (7),
Financial (7), Operational (8), Technical (7), Security (7), Legal (6), Market (6),
Competition (7) — 55 risks in total. Coverage completeness is re-confirmed at the
Annual review; any category falling below meaningful coverage is flagged as a gap.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
