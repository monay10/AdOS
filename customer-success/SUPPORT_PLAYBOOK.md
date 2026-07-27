# AdOS Support Playbook

> **Owner:** Support / Customer Success
> **Status:** Official — aligned to PRODUCT_TRUTH.md
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

This is the official Support Playbook for **AdOS — Enterprise AI Operating System
for Advertising**. It governs how the Support and Customer Success team intakes,
triages, diagnoses, resolves, and closes customer issues, and how we escalate,
communicate, and record root cause. It is binding on all Support Engineers, CSMs,
Solution Architects, and Trainers.

Every capability referenced here traces to `PRODUCT_TRUTH.md`. Anything not shipped
today appears **only** under a clearly-labeled **Roadmap** callout and must never be
presented to a customer as an available support channel or product feature. Related
CS documents are referenced by exact filename (e.g. `CUSTOMER_SUCCESS_CONSTITUTION.md`,
`CUSTOMER_HEALTH.md`) for cross-consistency.

---

## 0. The support operating model — read this first

AdOS is **self-hosted on the customer's own infrastructure**. It is offline-first
and 100% local-AI, with **no phone-home telemetry and no cloud/SaaS control plane**.
This single fact shapes every process in this playbook:

- **The vendor has NO standing access to the customer's instance.** We cannot log
  in, run queries, restart services, or read their data unless the customer
  explicitly grants a supervised remote session on their side.
- **The vendor has NO usage telemetry.** Nothing about a customer's Missions,
  errors, performance, or adoption is reported back to us automatically. We do not
  and cannot "see" a customer's instance.
- **SLAs are vendor RESPONSE times, not remote-fix times.** What we commit to is how
  fast a qualified human responds and begins working the case. Because the software
  runs on the customer's hardware, we deliver **guidance, patches, and remote
  assistance only where the customer permits** — we do not guarantee a fix applied
  by us on their box.
- **Diagnosis is built entirely from what the customer SHARES.** Logs, activity-log
  exports, KPI/report exports, configuration (with secrets redacted), version/build
  info, environment details, and reproduction steps. If the customer cannot or will
  not share an artifact, we help them collect it; we never assume access to it.

If any instruction in this playbook appears to conflict with the no-access /
no-telemetry reality above, the reality wins. Do not imply otherwise to a customer.

---

## 1. Product surface a Support Engineer must know

Support decisions depend on knowing exactly what AdOS does. The authoritative list
is `PRODUCT_TRUTH.md`; the operational summary:

- **The pipeline (the core product surface).** A **Mission** (a client's advertising
  objective in natural language) flows through a **linear, human-gated pipeline**:
  Mission → **MarketingBrief** → **CreativeSet** (ad copy only) → **CampaignDraft**
  (channels / ad sets / budget split) → **CampaignReport** → **ExecutiveReport / CEO
  dashboard**. **Every stage requires an explicit human approval click.** Approval
  gates: `strategy_and_budget`, `creative_assets`, `campaign_launch`.
- **Drafts only.** A CampaignDraft **never leaves `draft` status**. AdOS does not
  launch, run, publish, or optimize live ads, and has no ad-platform client. "It
  won't publish my campaign" is **expected behavior**, not a defect (see §6).
- **Local AI, no keys, no cloud.** Default engine is the deterministic
  **OfflineAIManager** — no model server, no network, air-gap capable. Genuine model
  prose is optional and requires a **locally-run** engine: Ollama or any
  OpenAI-compatible local server (vLLM / LM Studio / llama.cpp / SGLang). No cloud
  endpoint or API key is used anywhere. "The AI output is templated/repetitive" out
  of the box is **expected** unless the customer has configured a local model engine.
- **Deterministic ad KPIs**: CTR, CPC, CPA, CPL, ROAS, ROI. Analytics are
  **hand-entered via a form**, not ingested from ad platforms.
- **Company Brain = marketing-performance memory** (CompanyDNA, BrandProfile,
  Marketing/Creative/Sales insights, SOP performance, a campaign→ad→lead→ROI
  knowledge graph, a winning-ad pattern library, an experience engine). It learns
  which ads/campaigns/channels/budgets worked. It is **not** a document knowledge
  base and does **not** answer questions over uploaded documents.
- **Application-level multi-tenant isolation** (ambient TenantContext, tenant_id
  scoping). Describe it as "application-level" — never "DB-level RLS".
- **Real auth**: Argon2id hashing, HMAC HttpOnly sessions, per-session CSRF,
  brute-force lockout, CSP/HSTS headers. Login/lockout issues are common Sev 1/2
  intake.
- **Optional persistence**: SQLite or Postgres, opt-in via `DATABASE_URL`;
  **in-memory by default** (data does not survive a restart unless persistence is
  configured — a frequent "data loss" report that is actually a config gap).
- **Activity log + per-approval timeline**: a bounded in-memory ring (50 entries) in
  the web feed plus structured logs. It is **not** an immutable audit trail. This
  bounded log is a primary shareable diagnostic artifact.
- **Backup / recovery / deploy / observability** packages exist and are tested — the
  customer operates these on their own infrastructure.
- **Bilingual TR/EN** UI and AI output language.
- **Onboarding wizard**: workspace → client → brand → product → mission.

> **Support rule:** If a customer reports that a *forbidden* capability is "broken"
> (document Q&A, cited answers, Digital Employees / autonomous agents, live ad
> launch, external connectors, enforced RBAC, immutable audit, cloud inference,
> vision/speech AI, tiered T0–T4 approval authority), it is **not a bug** — the
> capability does not exist in v1.0.0. Reclassify as a **Sev 4** expectation-gap /
> feature request, correct the expectation kindly, and route to product backlog
> (§7). See the **Roadmap** callout in §12.

---

## 2. Severity levels

Severity is set at intake by the Support Engineer using the **shared CS severity
model** (identical across all CS docs; source: `CUSTOMER_SUCCESS_CONSTITUTION.md`). Severity is a
function of **business impact and workaround availability**, not customer volume.

| Severity | Name | Definition | Typical examples |
|---|---|---|---|
| **Sev 1** | Critical | Production down / cannot log in / **data-loss risk** | Instance won't start; all users locked out; persistence/backup failure threatening data |
| **Sev 2** | High | Major function impaired (a **pipeline stage failing**), **no workaround** | Brief/Creative/Draft/Report generation errors for all users; local model engine unreachable blocking all AI stages |
| **Sev 3** | Normal | Limited / partial impact, **workaround exists** | One pipeline stage intermittently errors but retry succeeds; a single tenant/workspace affected; UI defect with a viable path around it |
| **Sev 4** | Low | Question / cosmetic / how-to / **enhancement idea** | "How do I configure Ollama?"; label typo; expectation-gap on a non-shipped capability; feature request |

**Severity is negotiable on evidence, not on pressure.** Re-triage up or down as
diagnosis reveals true impact, and record every change with a reason in the ticket.

---

## 3. SLAs — vendor response targets

SLAs below are **vendor RESPONSE targets**: the elapsed business time from a
correctly-submitted, correctly-triaged ticket to a qualified human responding and
beginning work. **They are not remote-fix guarantees** — AdOS runs on customer
infrastructure, so remediation is delivered as **guidance, a patch, or remote
assistance where the customer permits** (§0).

| Severity | Response target | Workaround target | Notes |
|---|---|---|---|
| **Sev 1 — Critical** | **1 business hour** | **4 hours** | Fastest path; may pull in Engineering immediately (§8) |
| **Sev 2 — High** | **4 business hours** | Best effort, tracked | No workaround exists by definition; drive toward one or a patch |
| **Sev 3 — Normal** | **1 business day** | Workaround already exists | Prioritize durable fix into a release |
| **Sev 4 — Low** | **2 business days** | N/A | Answer, document, or route to backlog (§7) |

**Business hours definition.** Support business hours are **09:00–18:00 in the
customer's contracted primary timezone, Monday–Friday, excluding the vendor's
published holidays**. SLA clocks run only during business hours: e.g. a Sev 2 raised
at 16:00 has its 4-business-hour response target satisfied by 11:00 the next business
day. The clock **pauses** while a ticket is in **"Awaiting customer"** (blocked on a
log, export, repro step, or a decision to grant a remote session) and resumes when
the customer responds. Around-the-clock coverage and shorter targets are **not** part
of v1.0.0 support (see **Roadmap**, §12).

---

## 4. Incident handling

Flow: **Intake → Triage → Diagnosis (from shared data) → Resolution / Patch →
Verification.**

### 4.1 Intake
Because there is no in-product ticketing (see **Roadmap**, §12), tickets arrive via
the published support channel (email / support portal). Capture at intake:

- Customer, workspace/tenant reference, and reporter identity.
- **AdOS version / build** and deployment shape (in-memory vs SQLite vs Postgres;
  OfflineAIManager vs a configured local engine and which one).
- Environment (OS, runtime, container/orchestration, air-gapped or not).
- Symptom, **when it started**, and blast radius (one user / one workspace / all).
- **Reproduction steps** and expected-vs-actual.
- Any artifacts the customer can already share (activity-log export, structured log
  excerpt, screenshots, KPI/report export), **with secrets redacted**.

Acknowledge receipt, assign a provisional severity, and start the SLA clock.

### 4.2 Triage
Confirm severity against §2. Separate **defect** from **expectation-gap** using §1:
if the "broken" behavior is drafts-only, in-memory-by-default, templated offline
output, or any forbidden capability, it is not a defect (reclassify per §1 / §6).
Set ownership: **Support Engineer** owns the ticket end-to-end; pull in specialists
per §8 as needed.

### 4.3 Diagnosis — from customer-shared data ONLY
We diagnose with **what the customer shares**, never by accessing their instance.

1. Request the **minimum diagnostic set** for the symptom: activity-log export,
   relevant structured log lines (timestamped, around the failure), config
   (redacted), version/build, exact repro steps, and one clean reproduction attempt.
2. Attempt to **reproduce in a vendor-side reference environment** matching the
   customer's version and deployment shape. Reproduction is our primary lever since
   we cannot inspect their box.
3. If reproduction requires data we cannot see, guide the customer to run a specific
   check on their side and share the result. Note in the ticket that findings are
   **customer-reported**, not vendor-observed.
4. Only if the customer **explicitly grants and supervises** a remote session do we
   observe their instance directly — scope, consent, and duration recorded in the
   ticket; the customer drives; we advise.

### 4.4 Resolution / Patch
- **Configuration / usage fix:** provide precise, copy-pasteable steps the customer
  applies themselves (e.g. set `DATABASE_URL` to enable persistence; point at a
  local Ollama/OpenAI-compatible engine; unlock a brute-force lockout).
- **Defect requiring code change:** Engineering produces a **patch** the customer
  installs on their infrastructure. Support delivers release notes, the upgrade path,
  and rollback guidance. We do not deploy to the customer's environment.
- **Workaround first for Sev 1/2:** stabilize (restore login, restore from the
  customer's backup, roll back a bad upgrade) before the durable fix lands.

### 4.5 Verification
An incident is only resolved when the **customer confirms** the symptom is gone in
**their** environment (§11) — we cannot verify remotely. Capture the verification
evidence the customer shares (a clean run, a passing check, a fresh log excerpt).

---

## 5. Bug triage

1. **Reproduce.** A bug needs a deterministic repro on a matching version +
   deployment shape. If it only reproduces with the customer's data, obtain a
   **minimal shareable dataset** or a redacted export; never request raw sensitive
   data you don't need.
2. **Assign severity** per §2 (impact × workaround). Default a first, unconfirmed
   report conservatively and re-triage on evidence.
3. **Confirm it is a defect, not an expectation-gap** (§1). Drafts-only,
   in-memory-by-default, and templated-offline-output behaviors are **working as
   designed**.
4. **Ownership.** Support Engineer owns the customer ticket and communication.
   Confirmed code defects are handed to **Engineering** with the repro, logs, and
   expected-vs-actual; the Support Engineer tracks the fix back to release and
   verification (§11). Environment/scale/persistence/local-model issues are
   co-owned with the **Solution Architect** (§8).
5. **Link** the customer ticket to the internal defect record so status updates
   (§10) stay accurate.

---

## 6. Common non-defects (expectation calibration)

Use these to resolve fast and correctly. All are **working as designed** in v1.0.0:

| Report | Reality | Action |
|---|---|---|
| "It won't launch/publish my campaign" | Drafts only; nothing is ever launched | Explain drafts→export flow; Roadmap: connectors/launch |
| "Data disappeared after restart" | In-memory by default | Guide enabling persistence via `DATABASE_URL`; verify backups |
| "AI output is repetitive/templated" | OfflineAIManager is deterministic by default | Guide configuring a local Ollama / OpenAI-compatible engine |
| "It can't answer questions about my documents" | No document KB / no Q&A | Clarify Company Brain = marketing-performance memory; Roadmap |
| "Roles aren't restricting access" | RBAC defined but not enforced | Correct expectation; Roadmap: enforced RBAC |
| "Where's the tamper-proof audit log?" | Activity log is a bounded in-memory ring | Explain activity log + timeline; Roadmap: immutable audit |
| "Connect it to Meta/Google Ads" | connector-hub is an unwired stub | Export draft to run manually; Roadmap: connectors |

Handle these as **Sev 4** (question / expectation-gap); where the customer wants the
capability, capture it as a feature request (§7).

---

## 7. Feature requests

Flow: **Intake → Product backlog → Roadmap linkage.**

1. **Intake** any enhancement idea or unmet-capability request (often surfaced from a
   Sev 4 or a §6 expectation-gap) with the customer's use case and business value.
2. **Never promise delivery or dates.** Support does not commit roadmap.
3. **Route to the product backlog** with a clear problem statement and the number of
   customers asking. The CSM adds relationship/renewal context (see
   `CUSTOMER_SUCCESS_CONSTITUTION.md`).
4. **Roadmap linkage.** If the request maps to a known future direction (document KB
   & cited answers, autonomous agents, live ad launch/optimization, external
   connectors, enforced RBAC, immutable audit, cloud inference, vision/speech AI,
   tiered approval authority), tag it to that **Roadmap** theme (§12) — while making
   clear it is **not available today** and carries **no committed date**.

---

## 8. Escalation

The **Support Engineer owns the ticket** at all times and coordinates specialists.
Escalate — do not hand off ownership — when the trigger below is met. Keep escalation
paths and role definitions consistent with `CUSTOMER_SUCCESS_CONSTITUTION.md`.

| Pull in… | When | They own |
|---|---|---|
| **Solution Architect** | Technical adoption issues: local model engine setup/performance, persistence (SQLite/Postgres) config, backup/recovery, deployment, scale, air-gapped environments | The technical remediation design |
| **Engineering** | Confirmed code defect needing a patch; any **Sev 1** without a fast workaround; suspected data-loss/security defect | The patch + release |
| **CSM** | Relationship/renewal risk, repeated pain, executive visibility, health-score impact (see `CUSTOMER_HEALTH.md`), or any request touching commercial scope | Customer relationship + expectation-setting |

**Severity-driven escalation.**
- **Sev 1:** engage **Engineering immediately** in parallel with triage; notify the
  **CSM** at once; pull the **Solution Architect** if the fault is environmental
  (persistence, deployment, local engine). Consider an incident bridge with the
  customer.
- **Sev 2:** engage the **Solution Architect** early (a failing pipeline stage is
  often environmental — engine reachability, persistence, resources); escalate to
  **Engineering** on confirming a defect.
- **Sev 3:** escalate to **Engineering** only after a defect is confirmed and a
  durable fix is warranted.
- **Sev 4:** normally Support-only; involve the **CSM** if it signals a broader
  adoption or expectation problem, and the **Trainer** if the resolution is
  enablement (see `CUSTOMER_SUCCESS_CONSTITUTION.md`).

**De-escalation** (severity or specialist involvement reduced) follows the same
rule: record the reason and notify all parties.

---

## 9. Root cause analysis (RCA)

An RCA is **required** for every **Sev 1** and every **Sev 2** that resulted in a
patch, and on request for recurring Sev 3s. RCA is grounded strictly in
**customer-shared evidence and vendor-side reproduction** — we do not assert internal
state we could not observe.

### 9.1 RCA template

```
RCA — <ticket id> — <short title>
Severity: Sev <1–4>            Status: Draft | Reviewed | Published
Customer: <name / tenant ref>  AdOS version/build: <x.y.z / build>
Deployment shape: <in-memory | SQLite | Postgres> · <OfflineAIManager | engine>

1. Summary            — what happened, in two sentences.
2. Customer impact    — who/what was affected, scope, duration (business hours).
3. Timeline           — detection → response → workaround → resolution → verification
                        (mark each entry vendor-observed vs customer-reported).
4. Evidence base      — exact artifacts the customer shared (log excerpts, activity
                        export, config redacted, repro). No unshared/assumed state.
5. Root cause         — the confirmed cause (5-whys, §9.2). Distinguish defect vs
                        configuration vs expectation-gap.
6. Resolution         — guidance / patch / remote-assist delivered; what the CUSTOMER
                        applied on their infrastructure.
7. Verification       — how the customer confirmed the fix (§11).
8. Corrective actions — durable fixes (code, docs, KB, this playbook) with owners.
9. Preventive actions — detection/guidance improvements so it recurs less.
```

### 9.2 5-Whys
Drive to the true cause; stop when a further "why" leaves AdOS's actual design (do
not invent internal mechanisms we cannot see).

> *Example — "Data was lost after a restart."*
> 1. **Why?** All aggregates were gone after the process restarted.
> 2. **Why?** The instance was running with **in-memory repositories**.
> 3. **Why?** `DATABASE_URL` was not set, so persistence never engaged.
> 4. **Why?** The install followed a quickstart that omits the persistence step.
> 5. **Why?** Onboarding did not flag persistence as required for durability.
> **Root cause:** expectation/config gap, not a defect. **Corrective:** persistence
> is enabled and backups verified; **preventive:** onboarding checklist and KB
> updated to require `DATABASE_URL` before go-live (coordinate with the
> **Solution Architect** and `CUSTOMER_SUCCESS_CONSTITUTION.md` onboarding gates).

---

## 10. Customer communication

Tone: factual, respectful, no over-promising. **Never imply vendor access or
telemetry.** Never present a **Roadmap** item as available. Bilingual **TR/EN** on
request — use correct Turkish diacritics (İ/ı/ş/ğ/ç/ö/ü) and the label **"Reklam için
Kurumsal Yapay Zekâ İşletim Sistemi"**; never "Advertising Operating System" /
"Reklam İşletim Sistemi".

**Sev 1 — Critical (acknowledgement).**
> We've received your critical report on your AdOS instance and a Support Engineer is
> engaged now (response target: 1 business hour). Because AdOS runs on your
> infrastructure, we work from what you can share — please send your latest structured
> logs and an activity-log export (secrets redacted), your AdOS version/build, and
> whether persistence (`DATABASE_URL`) is configured. We're targeting a workaround
> within 4 hours and will update you hourly. If you can grant a supervised remote
> session, tell us and we'll schedule it.

**Sev 2 — High.**
> Thanks for the report — a major function is impaired with no workaround. A Support
> Engineer is on it (response target: 4 business hours) and we've looped in a Solution
> Architect. Please share repro steps, the failing stage, relevant logs, and your
> engine configuration (OfflineAIManager or a local model engine) so we can reproduce
> on our side. We'll update you at least daily until it's resolved.

**Sev 3 — Normal.**
> Thanks — we've logged this and will respond within 1 business day. There's a viable
> workaround in the meantime: <workaround>. To pin down a durable fix, could you send
> repro steps and the relevant activity-log excerpt? We'll confirm target timing on
> first response.

**Sev 4 — Low / question / request.**
> Happy to help — we'll respond within 2 business days. <Answer or how-to.> If this is
> a capability request, we'll log it to the product backlog with your use case. Note
> it isn't part of AdOS v1.0.0 today, and we don't commit delivery dates.

**Expectation-gap correction (any Sev, use with §6).**
> Quick clarification: in v1.0.0, AdOS **drafts** campaigns for your approval and does
> not launch live ads / <the specific behavior>. That's by design, not a fault. Here's
> how to <achieve the goal within shipped capabilities>, and I've noted your interest
> for our Roadmap review.

---

## 11. Status updates — cadence per severity

Updates are proactive and continue until closure. Cadence pauses while a ticket is
**"Awaiting customer"** (§3) and resumes on their reply.

| Severity | Update cadence | Channel |
|---|---|---|
| **Sev 1 — Critical** | At least **hourly** during business hours until a workaround is in place, then per milestone | Direct + ticket; CSM copied |
| **Sev 2 — High** | At least **daily** until resolved | Ticket + direct |
| **Sev 3 — Normal** | At least **every 3 business days** or on state change | Ticket |
| **Sev 4 — Low** | On state change (answered / backlogged / closed) | Ticket |

Every update states: current status, what we've learned from shared evidence, what we
need from the customer next, and the next update time. "No progress yet" is still an
update — send it.

---

## 12. Closure process

Flow: **Verification → Customer sign-off → Knowledge-base entry.**

1. **Verification (customer-confirmed).** The customer confirms in **their**
   environment that the symptom is resolved (§4.5). Attach the evidence they shared.
   We cannot self-verify a remote instance.
2. **Customer sign-off.** Obtain explicit agreement to close. If the customer is
   unresponsive after the applicable cadence (§11) plus two follow-ups, move to
   **"Pending closure"**, send a final notice with the resolution, and auto-close
   after 5 business days — reopenable on request.
3. **Knowledge-base entry.** Every resolved ticket with reusable value produces or
   updates a KB article: symptom, environment/deployment shape, diagnosis from shared
   data, resolution (guidance/patch), and verification. Feed §6 (common non-defects)
   and onboarding/enablement so recurring issues shrink over time.
4. **RCA linkage.** For Sev 1 / patched Sev 2, attach the published RCA (§9) and
   confirm corrective/preventive actions have owners.
5. **Health + relationship.** Notify the **CSM** of closures that affect health
   (see `CUSTOMER_HEALTH.md`) or renewal, per `CUSTOMER_SUCCESS_CONSTITUTION.md`.

---

## 13. Roadmap — future support capabilities (NOT available today)

> **Roadmap callout — not shipped in v1.0.0. Do not present any item below as an
> available support channel, product feature, or commitment. No dates are implied.**

**Support-tooling Roadmap (future direction):**
- **In-product ticketing** — raising, tracking, and viewing support tickets from
  within AdOS. **Not shipped**: v1.0.0 support is handled via the external support
  channel (email / portal) only.
- **Opt-in remote diagnostics / customer-authorized log upload** — a streamlined,
  consented way for a customer to package and share diagnostics. Today this is manual
  (customer exports and sends). There is **no** automatic telemetry and none is
  planned to be non-consensual.
- **24×7 / follow-the-sun coverage and tighter SLA tiers** — beyond the business-hours
  response targets in §3.

**Product Roadmap themes** (a request mapping here is captured per §7, never promised):
document knowledge base & cited answers; autonomous agents ("Digital Employees");
live ad launch & campaign optimization; external connectors/syncs (Meta/Google/CRM);
enforced RBAC / permission-aware AI; immutable/tamper-proof audit trail; DB-level
Row-Level Security; cloud inference; vision/speech/image AI; tiered approval authority
(T0–T4 spend limits). All are **absent or stubbed** in v1.0.0 per `PRODUCT_TRUTH.md`.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
