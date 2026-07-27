# AdOS Certification Program

**Owner:** Certification / Enablement
**Status:** Official — aligned to PRODUCT_TRUTH.md
**Version:** 1.0.0 · Aligned to AdOS v1.0.0
**Source of truth:** [../PRODUCT_TRUTH.md](../PRODUCT_TRUTH.md)

> **Product framing (verbatim).** AdOS is the **Enterprise AI Operating System for
> Advertising** — an offline-first, 100% local-AI platform that takes a client's
> advertising objective (a **Mission**) through a **human-approved pipeline**
> (marketing brief → creative ad copy → campaign **draft** → performance report →
> executive dashboard) and remembers what works in a marketing-performance
> **Company Brain**. It **drafts**; it never launches live ads.
> TR: **"Reklam için Kurumsal Yapay Zekâ İşletim Sistemi"**.
> The phrase "Advertising Operating System" appears nowhere in this program.

---

## 0. Purpose & scope of this program

This document is the official specification for AdOS certification. It defines six
credential levels, and for each: target audience, prerequisites, learning
objectives, a weighted exam blueprint, the passing score, hands-on practical labs,
and the badge awarded.

**Foundational constraint — everything here is testable against REAL product
behavior only.** Because AdOS is **self-hosted, offline, and emits no vendor
telemetry**, every practical lab runs on the **candidate's own local instance**.
No part of any exam or lab depends on a hosted service, cloud AI, external
connector, or any capability not present in `PRODUCT_TRUTH.md`. Candidates provide
their own evidence (exports, screenshots, activity-log entries, KPI reports) from
their local instance; there is no vendor-side data collection.

Anything not yet shipped is confined to the clearly-labeled **[§10 Roadmap](#10-roadmap--future-certification-capability)**
section and is **never** exam or lab content.

Training alignment:
- **Associate** and **Professional** map to `END_USER_TRAINING.md`.
- **Administrator** maps to `ADMINISTRATOR_TRAINING.md`.

---

## 1. Program at a glance

| # | Level | Audience | Pass score | Practical component | Recert |
|---|-------|----------|-----------|---------------------|--------|
| 1 | **AdOS Certified Associate (ACA)** | End users / operators | 70% | Guided lab | 24 months |
| 2 | **AdOS Certified Professional (ACP)** | Power users / marketing leads | 75% | Scenario lab | 24 months |
| 3 | **AdOS Certified Administrator (ACAD)** | Sysadmins / deployers | 80% | Deploy + operate lab | 24 months |
| 4 | **AdOS Certified Architect (ACAR)** | Solution architects | 80% | Design + defense lab | 24 months |
| 5 | **AdOS Certified Partner (ACPT)** | Implementation partner orgs | 80% (per-person) | Reference deployment | 12 months |
| 6 | **AdOS Certified Trainer (ACT)** | Enablement / trainers | 85% | Teach-back | 12 months |

All exams are testable against the shipped pipeline and platform only. See
[§9 Integrity & Proctoring](#9-integrity--proctoring) and
[§8 Badge & Credential System](#8-badge--credential-system).

---

## 2. Level 1 — AdOS Certified Associate (ACA)

Maps to `END_USER_TRAINING.md` (foundational track).

**Target audience.** Day-to-day operators: marketing coordinators, campaign
assistants, agency staff who run Missions and click approvals on a shared local
instance.

**Prerequisites.** None. Access to an AdOS instance (in-memory default is fine).

**Learning objectives.** After certifying, the candidate can:
1. Explain what AdOS is and is not — an offline, human-in-the-loop advertising
   pipeline that produces **drafts**, never launches live ads.
2. Complete the onboarding wizard: workspace → client → brand → product → mission.
3. State a Mission (a client's advertising objective in natural language).
4. Walk a Mission through the full pipeline — marketing brief → creative (ad copy)
   → campaign draft → performance report → executive dashboard.
5. Recognize the three approval gates (`strategy_and_budget`, `creative_assets`,
   `campaign_launch`) and act on each explicit approval click.
6. Read the creative outputs (headline, adCopy, CTA, socialPost, landingPage,
   email) and the campaign draft (channels, ad sets, budget split).
7. Switch the UI/AI language between TR and EN.
8. Locate the activity log and a per-approval timeline.

**Exam blueprint (weighted domains).** 40 questions, closed-book, 60 minutes.

| Domain | Weight |
|--------|-------:|
| AdOS identity & the human-approved pipeline (what it does / does not do) | 25% |
| Onboarding & starting a Mission | 20% |
| Approval gates & moving a Mission stage-by-stage | 25% |
| Reading creative copy, campaign drafts & KPI reports | 20% |
| Bilingual (TR/EN) use & finding the activity log | 10% |

**Passing score.** 70%.

**Practical labs (local instance).**
- **Lab A1 — First Mission end to end.** On your own instance, run the onboarding
  wizard to create a workspace, client, brand (with voice/rules/banned words), and
  product, then state a Mission. Advance it through every pipeline stage, clicking
  each approval gate, and produce an executive dashboard. Submit the activity-log
  export showing the completed run.
- **Lab A2 — Read the outputs.** From your Mission, identify each creative field
  produced and the campaign draft's channels and budget split; confirm the draft
  remains in `draft` status (nothing is launched). Submit annotated screenshots.

**Badge.** `AdOS Certified Associate` — Tier 1 (foundational). Verifiable
credential ID; see [§8](#8-badge--credential-system).

---

## 3. Level 2 — AdOS Certified Professional (ACP)

Maps to `END_USER_TRAINING.md` (advanced track).

**Target audience.** Power users and marketing leads who own outcomes across many
Missions, brands, and clients, and who use the Company Brain to improve results.

**Prerequisites.** ACA credential (current).

**Learning objectives.** The candidate can:
1. Design effective Missions and brand profiles (voice, rules, banned words) so
   creative copy stays on-brand.
2. Run multiple Missions across several clients/brands within a workspace.
3. Interpret the deterministic ad KPIs — CTR, CPC, CPA, CPL, ROAS, ROI — in a
   campaign performance report (metrics are **hand-entered via a form**, not
   ingested from ad platforms).
4. Explain the **Company Brain** as a **marketing-performance memory**: CompanyDNA,
   BrandProfile, MarketingInsight, CreativeInsight, SalesInsight, SOP performance,
   the campaign→ad→lead→ROI knowledge graph, the winning-ad pattern library, and
   the experience engine — and how prior results inform new Missions.
5. Understand the difference between the default deterministic OfflineAIManager
   output and genuine model prose from a locally-run engine.
6. Export drafts and reports for use in the customer's own downstream tools.

**Exam blueprint (weighted domains).** 50 questions, 75 minutes.

| Domain | Weight |
|--------|-------:|
| Mission & brand design for quality creative | 20% |
| Multi-client / multi-brand operation within a workspace | 15% |
| Ad-KPI interpretation (CTR/CPC/CPA/CPL/ROAS/ROI) & report reading | 25% |
| Company Brain as marketing-performance memory | 25% |
| Local AI engines vs. deterministic default; language control | 15% |

**Passing score.** 75%.

**Practical labs (local instance).**
- **Lab P1 — Multi-brand run.** Create two brands under one client with distinct
  voice/banned-word rules; run a Mission for each and show the creative copy
  reflects each brand profile. Submit the two creative sets and the brand configs.
- **Lab P2 — KPI report & Company Brain.** Hand-enter performance metrics for a
  completed campaign via the report form; generate the campaign report and read
  the KPI set. Show at least one Company Brain artifact (e.g., a MarketingInsight
  or a pattern-library entry) that reflects the run. Submit report + Company Brain
  view.
- **Lab P3 — Engine comparison.** Generate a brief with the default OfflineAIManager
  and again with a locally-run engine (Ollama or an OpenAI-compatible local
  server), and explain the difference in output character. Submit both outputs and
  your engine configuration note (no cloud, no API key).

**Badge.** `AdOS Certified Professional` — Tier 2 (advanced practitioner).

---

## 4. Level 3 — AdOS Certified Administrator (ACAD)

Maps to `ADMINISTRATOR_TRAINING.md`.

**Target audience.** System administrators and deployers who install, secure,
configure, back up, and operate an AdOS instance on customer infrastructure.

**Prerequisites.** ACA credential (current); ACP recommended.

**Learning objectives.** The candidate can:
1. Install and run AdOS locally; select the AI engine (deterministic
   OfflineAIManager default; optional local Ollama or any OpenAI-compatible local
   server — vLLM / LM Studio / llama.cpp / SGLang), confirming no cloud endpoint
   and no API key are used.
2. Enable optional persistence via `DATABASE_URL` (SQLite or Postgres) and run
   forward-only migrations; understand the in-memory default.
3. Configure real authentication and security: Argon2id password hashing,
   HMAC-signed HttpOnly sessions, per-session CSRF, brute-force lockout, and
   CSP/HSTS security headers.
4. Explain and verify **application-level** multi-tenant isolation (ambient
   TenantContext; tenant_id scoping) — not DB-level RLS.
5. Perform backup and restore, and exercise recovery, using the shipped
   backup/recovery tooling.
6. Manage users and the defined roles, understanding that roles are **not**
   currently enforced as permission gates (see reframes and Roadmap).
7. Read structured logs and the bounded in-memory activity feed; understand it is
   an activity log + per-approval timeline, **not** an immutable audit trail.
8. Support end users' bilingual (TR/EN) configuration.

**Exam blueprint (weighted domains).** 55 questions, 90 minutes.

| Domain | Weight |
|--------|-------:|
| Installation & AI engine configuration (local-only) | 20% |
| Persistence (SQLite/Postgres, migrations) & in-memory default | 15% |
| Authentication & security hardening (Argon2id/CSRF/lockout/CSP-HSTS) | 25% |
| Application-level multi-tenancy | 15% |
| Backup / restore / recovery | 15% |
| Operations: logs, activity feed, users/roles, language | 10% |

**Passing score.** 80%.

**Practical labs (local instance).**
- **Lab AD1 — Secure install with persistence.** Install AdOS, enable Postgres or
  SQLite via `DATABASE_URL`, run migrations, and confirm the security headers
  (CSP/HSTS) and session/CSRF behavior are active. Submit config (secrets
  redacted) and evidence of a successful lockout after repeated bad logins.
- **Lab AD2 — Local engine.** Configure a local Ollama or OpenAI-compatible engine
  and generate a real brief; prove no outbound call leaves the host except to the
  local engine. Submit the engine config and a network note.
- **Lab AD3 — Backup & restore.** Take a backup, simulate loss, restore, and verify
  a Mission's data survived. Submit backup artifact reference and restore log.
- **Lab AD4 — Tenant isolation check.** Create two tenants and demonstrate that one
  tenant cannot see the other's aggregates. Submit the evidence.

**Badge.** `AdOS Certified Administrator` — Tier 3 (platform operator).

---

## 5. Level 4 — AdOS Certified Architect (ACAR)

**Target audience.** Solution architects who design AdOS deployments for scale:
engine strategy, persistence topology, tenancy layout, backup/DR, and integration
of exported drafts into the customer's own downstream tooling.

**Prerequisites.** ACAD credential (current).

**Learning objectives.** The candidate can:
1. Design a deployment topology using only shipped capabilities: engine choice
   (offline default vs. local model server), persistence adapter (SQLite vs.
   Postgres), tenancy layout, and backup/recovery strategy.
2. Model the fixed agency domain (Workspace → Client → Brand → Product → Project →
   Mission → Approval → Asset → PerformanceReport) onto a customer's org structure.
3. Plan capacity for local inference on customer hardware (air-gap capable, no
   per-token billing).
4. Define a manual data-flow at the edges: drafts/reports are **exported** for the
   customer to use in their own ad platforms; AdOS has no external connectors and
   never launches ads.
5. Articulate the true security and isolation posture (application-level tenancy;
   real auth; activity log — not immutable audit; roles defined but not enforced)
   and design compensating operational controls around those truths.
6. Produce a DR plan grounded in the shipped backup/recovery/deploy/observability
   packages.

**Exam blueprint (weighted domains).** 50 questions + design defense; 120 minutes.

| Domain | Weight |
|--------|-------:|
| Deployment topology (engine, persistence, tenancy) using shipped features | 25% |
| Domain modeling onto the fixed agency model | 15% |
| Local-inference capacity & offline/air-gap design | 15% |
| Edge data flow: export-only, no connectors, drafts-only | 15% |
| Security/isolation posture & honest limitations | 20% |
| DR & operability design | 10% |

**Passing score.** 80% (written) **and** a passing design-defense (below).

**Practical labs (local instance).**
- **Lab AR1 — Reference architecture.** Produce a written deployment design for a
  multi-brand agency: chosen engine, persistence adapter + migration plan, tenancy
  layout, backup/DR, and the manual export boundary to downstream ad platforms.
  Every element must map to a shipped capability. Submit the design document.
- **Lab AR2 — Build & defend.** Stand up the design on a local instance (persistence
  on, local or offline engine, ≥2 tenants, backup verified) and defend it in a live
  proctored review, including a candid statement of what AdOS does not do
  (no live launch, no connectors, no enforced RBAC, no immutable audit, no DB RLS).

**Badge.** `AdOS Certified Architect` — Tier 4 (design authority).

---

## 6. Level 5 — AdOS Certified Partner (ACPT)

**Target audience.** Implementation-partner organizations that deliver AdOS to
end customers. This is an **organizational** credential earned through certified
individuals plus a validated reference deployment.

**Prerequisites (organizational).**
- At least **two** individuals holding current **ACAD** (Administrator).
- At least **one** individual holding current **ACAR** (Architect).
- At least **one** individual holding current **ACP** (Professional).
- A signed commitment to represent AdOS strictly per `PRODUCT_TRUTH.md` — no
  claims of live ad launch, document Q&A, autonomous agents, external connectors,
  enforced RBAC, or immutable audit.

**Learning objectives (org capability).** The partner can:
1. Deliver a secure, persistent, local-AI AdOS deployment on customer
   infrastructure end to end.
2. Run onboarding and enablement for the customer's operators (Associate/
   Professional pathways) and admins (Administrator pathway).
3. Position AdOS truthfully as the Enterprise AI Operating System for Advertising,
   using only shipped capabilities and clearly separating any Roadmap discussion.
4. Operate under the self-hosted, no-telemetry model: all customer metrics are
   customer-shared, never vendor-collected.

**Exam blueprint.** Partner assessment = organizational review + a per-nominated-
individual knowledge check (80% each) on truthful positioning and delivery.

| Domain | Weight |
|--------|-------:|
| Truthful positioning & scope discipline (no forbidden claims) | 30% |
| Secure, persistent local delivery | 25% |
| Enablement & onboarding delivery | 20% |
| Self-hosted / no-telemetry engagement model | 15% |
| Roadmap handling (labeled, never sold as shipped) | 10% |

**Passing score.** 80% per assessed individual, plus a passing reference deployment.

**Practical labs (customer-representative local instance).**
- **Lab PT1 — Reference deployment.** Deliver a complete deployment on a
  representative local instance: secure auth, persistence + verified backup, chosen
  local/offline engine, ≥2 tenants, and a documented export boundary. Submit the
  deployment runbook and evidence.
- **Lab PT2 — Positioning review.** Present a customer-facing pitch and have it
  reviewed for scope discipline against `PRODUCT_TRUTH.md`; any forbidden claim is
  an automatic fail until corrected.

**Badge.** `AdOS Certified Partner` — Tier 5 (organizational). Includes a partner
directory listing while current.

---

## 7. Level 6 — AdOS Certified Trainer (ACT)

**Target audience.** Trainers and enablement staff (vendor or partner) authorized
to teach AdOS courses and proctor Associate/Professional/Administrator labs.

**Prerequisites.** Current **ACP** and current **ACAD** (so the trainer can teach
both the end-user and administrator tracks). ACAR recommended.

**Learning objectives.** The candidate can:
1. Deliver the `END_USER_TRAINING.md` and `ADMINISTRATOR_TRAINING.md` curricula
   accurately, including bilingual (TR/EN) delivery.
2. Teach the human-approved pipeline and approval gates without overstating
   autonomy (default AI is deterministic; every stage is human-gated).
3. Correctly draw the boundary between shipped capability and Roadmap, and refuse
   to teach forbidden claims as present-tense features.
4. Proctor practical labs on candidates' local instances and evaluate submitted
   evidence fairly.
5. Explain the self-hosted, no-telemetry reality when teaching metrics/health
   topics (all data is customer-shared).

**Exam blueprint.** 40 questions + a live teach-back; 90 minutes written.

| Domain | Weight |
|--------|-------:|
| Curriculum mastery (end-user + admin tracks) | 30% |
| Scope discipline: shipped vs. Roadmap; forbidden-claim avoidance | 30% |
| Bilingual (TR/EN) delivery quality | 15% |
| Lab proctoring & evidence evaluation | 15% |
| Self-hosted / no-telemetry framing | 10% |

**Passing score.** 85% (highest bar in the program) **and** a passing teach-back.

**Practical labs (local instance).**
- **Lab T1 — Teach-back.** Deliver a 20-minute recorded or live segment covering
  the full pipeline and its approval gates, correctly stating at least three things
  AdOS does not do. Evaluated for accuracy and scope discipline.
- **Lab T2 — Proctor simulation.** Grade a sample Associate lab submission,
  identifying whether the evidence proves real product behavior. Submit your
  scoring rationale.

**Badge.** `AdOS Certified Trainer` — Tier 6 (authorized instructor). Grants
proctoring rights for Tiers 1–3.

---

## 8. Badge & credential system

- **Credential ID.** Every awarded credential gets a unique ID of the form
  `ADOS-<LEVEL>-<YYYY>-<serial>` (e.g., `ADOS-ACA-2026-000142`).
- **Badge artifact.** A digital badge (image + metadata) records: level, holder
  name, credential ID, issue date, expiry date, and the AdOS version the exam was
  aligned to (v1.0.0).
- **Verification — self-hosted friendly.** Because AdOS ships with no vendor
  telemetry, verification does not depend on the customer's instance. A holder can
  present the signed badge metadata and credential ID; the issuing
  Certification/Enablement function maintains the registry of issued IDs and their
  status (active / expired / revoked). Verification confirms the ID against that
  registry — it never inspects a customer's live deployment.
- **Levels & progression.** Tier 1 → Tier 6 as in [§1](#1-program-at-a-glance).
  Higher tiers require lower-tier prerequisites as stated per level.
- **Revocation.** A credential may be revoked for integrity violations
  ([§9](#9-integrity--proctoring)) or for a Partner/Trainer making forbidden claims;
  revoked IDs are marked revoked in the registry.

---

## 9. Integrity & proctoring

- **Local-instance evidence.** Practical labs are validated from artifacts the
  candidate exports from **their own** local instance (activity-log exports, KPI
  reports, config with secrets redacted, screenshots). There is no vendor
  auto-collection; the burden of evidence is on the candidate.
- **Proctoring.** Written exams for Tiers 3–6 and all live/design/teach-back
  components are proctored by an ACT (Trainer) or the Certification function.
  Tiers 1–2 written exams may be proctored or supervised-remote.
- **Identity.** Candidates verify identity at exam start; the verified identity is
  bound to the credential ID.
- **Originality.** Lab submissions must come from the candidate's own instance and
  work. Shared or fabricated evidence is an integrity violation.
- **Prohibited during closed-book exams.** External assistance, unauthorized
  materials, or copying. Open-resource is allowed only where a lab explicitly says
  so.
- **Consequences.** Confirmed violations void the attempt and may revoke existing
  credentials ([§8](#8-badge--credential-system)).
- **Appeals.** A candidate may appeal a failing or voided result to the
  Certification function within 30 days.

---

## 10. Recertification policy

| Level | Validity | Recert method |
|-------|----------|---------------|
| Associate (ACA) | 24 months | Delta exam OR retake current exam |
| Professional (ACP) | 24 months | Delta exam OR retake |
| Administrator (ACAD) | 24 months | Delta exam + one refreshed practical lab |
| Architect (ACAR) | 24 months | Delta exam + refreshed design defense |
| Partner (ACPT) | 12 months | Re-validate prerequisites + reference deployment |
| Trainer (ACT) | 12 months | Delta exam + teach-back + hold current ACP & ACAD |

**Version alignment.** Each credential names the AdOS version it was aligned to
(v1.0.0). A major AdOS release publishes a **delta exam** covering only changed,
**shipped** behavior. Recertification never tests Roadmap items. Holders in good
standing recertify via the delta path; lapsed holders retake the full exam.

**Grace period.** 60 days past expiry to complete recertification before the
credential moves to *expired* in the registry.

---

## 11. Candidate journey (text diagram)

```
                         START
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Get access to a LOCAL AdOS instance  │
        │  (in-memory default is enough to start)│
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Study END_USER_TRAINING.md           │
        │  → Sit ACA exam (70%) + Labs A1–A2    │
        └──────────────────────────────────────┘
                           │  pass → Tier 1 badge
                           ▼
        ┌──────────────────────────────────────┐
        │  Study advanced END_USER_TRAINING.md  │
        │  → Sit ACP exam (75%) + Labs P1–P3    │
        └──────────────────────────────────────┘
              │ pass → Tier 2 badge
              │
   ┌──────────┴───────────────────────────────┐
   │ (end-user path)          (admin path)     │
   ▼                                            ▼
(stay ACP,                    ┌──────────────────────────────────┐
 recertify)                   │ Study ADMINISTRATOR_TRAINING.md   │
                              │ → ACAD exam (80%) + Labs AD1–AD4  │
                              └──────────────────────────────────┘
                                       │ pass → Tier 3 badge
                                       ▼
                              ┌──────────────────────────────────┐
                              │ ACAR exam (80%) + design defense  │
                              │ Labs AR1–AR2                      │
                              └──────────────────────────────────┘
                                       │ pass → Tier 4 badge
                                       ▼
                         ┌──────────────────────┴─────────────────┐
                         ▼                                          ▼
        ┌──────────────────────────────┐        ┌──────────────────────────────┐
        │ PARTNER org path (ACPT):     │        │ TRAINER path (ACT):          │
        │ 2×ACAD + 1×ACAR + 1×ACP      │        │ hold ACP + ACAD              │
        │ + reference deployment       │        │ → ACT exam (85%) + teach-back│
        │ → Tier 5 org badge (12-mo)   │        │ → Tier 6 badge (12-mo)       │
        └──────────────────────────────┘        └──────────────────────────────┘
                         │                                          │
                         └──────────────► RECERTIFY (§10) ◄─────────┘
                                             │
                                             ▼
                                            END
```

Every step above validates only shipped, `PRODUCT_TRUTH.md`-backed behavior on the
candidate's own local instance.

---

## 12. Roadmap — future certification capability

> **Roadmap (not shipped; never exam or lab content).** The items below are
> potential **future** additions. They are listed here solely so the program has a
> single, clearly-labeled place for future direction. No current exam question,
> practical lab, or badge tests any of them. Nothing here is a present-tense AdOS
> capability.

- **Automated badge verification portal** — a hosted verification page for
  credential IDs. *Planned.* (Today, verification is registry-based and does not
  touch any customer instance.)
- **Instance-assisted lab auto-grading** — automated checking of lab evidence.
  *Planned.* This would remain compatible with the self-hosted, no-telemetry model
  and would require explicit customer opt-in; it is not available today.
- **Certification tracks for future product capabilities.** If and only if these
  ship, corresponding modules could follow: document knowledge base / cited answers
  over documents; autonomous agents ("Digital Employees"); live ad launch &
  campaign optimization; external connectors/syncs to ad platforms and CRMs;
  enforced RBAC / permission-aware AI; immutable audit trail; DB-level Row-Level
  Security; cloud inference; vision/speech/image AI; tiered approval authority
  (spend limits). *All Roadmap — none exist today; none are certifiable now.*

---

*Documentation only. No application code, packages, domains, or tests were
modified. Aligned to PRODUCT_TRUTH.md.*
