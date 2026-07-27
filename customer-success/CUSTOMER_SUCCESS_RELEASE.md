# AdOS Customer Success Platform — Release

> **Owner:** Office of the Chief Customer Success Officer (CCSO)
> **Status:** ✅ Released — validated, aligned to `PRODUCT_TRUTH.md`.
> **Version:** 1.0.0 · Aligned to AdOS v1.0.0
> **Source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md)

This release publishes the complete **Customer Success Platform** for AdOS — the
**Enterprise AI Operating System for Advertising**. It standardizes every process
after purchase: onboarding, adoption, training, operations, support, health, and
certification. It is **documentation only** and promises nothing the product does
not implement today; future capabilities are carried under explicit **Roadmap**
labels.

---

## 1. Deliverables

| # | Document | Purpose |
|---|---|---|
| 049 | [`CUSTOMER_SUCCESS_CONSTITUTION.md`](CUSTOMER_SUCCESS_CONSTITUTION.md) | Governing charter: lifecycle, philosophy, health, maturity, expansion, renewal, EBRs, KPIs, escalation, risk, governance |
| 050 | [`ONBOARDING_PLAYBOOK.md`](ONBOARDING_PLAYBOOK.md) | Day 0 → Month 12 onboarding with meetings, owners, deliverables, checkpoints, risks |
| 051 | [`ADMINISTRATOR_TRAINING.md`](ADMINISTRATOR_TRAINING.md) | Bilingual (TR/EN) administrator course — 9 modules + assessment |
| 052 | [`END_USER_TRAINING.md`](END_USER_TRAINING.md) | Bilingual (TR/EN) end-user course — 10 lessons + exercises + assessment |
| 053 | [`OPERATIONS_RUNBOOK.md`](OPERATIONS_RUNBOOK.md) | Daily → quarterly operations, incident response, backup/restore, health checks |
| 054 | [`SUPPORT_PLAYBOOK.md`](SUPPORT_PLAYBOOK.md) | Severity model, SLAs, triage, escalation, RCA, communication, closure |
| 055 | [`CUSTOMER_HEALTH.md`](CUSTOMER_HEALTH.md) | 10-dimension RAG health model (customer-shared inputs) |
| 056 | [`CERTIFICATION_PROGRAM.md`](CERTIFICATION_PROGRAM.md) | 6-level certification with exam blueprints and practical labs |
| 057 | [`CUSTOMER_SUCCESS_VALIDATION.md`](CUSTOMER_SUCCESS_VALIDATION.md) | Validation report — **PASS** |
| — | [`README.md`](README.md) | Package index and reading order |

---

## 2. Statistics

| Metric | Value |
|---|---|
| Content documents (049–056) | 8 |
| Total documents (incl. validation, release, README) | 11 |
| Approx. content lines | ~5,000 |
| Bilingual (TR/EN) courses | 2 (admin, end-user) |
| Playbooks | 2 (onboarding, support) |
| Runbooks | 1 (operations) |
| Certification levels | 6 |
| Health dimensions | 10 |
| Support severity levels | 4 (Sev 1–4) |
| Lifecycle stages | 6 |
| Maturity levels | 5 (M1–M5) |
| Validation result | ✅ PASS |

## 3. Training hours (indicative)

Delivery estimates for planning; adjust to the customer's context.

| Track | Content | Indicative instructor-led hours |
|---|---|---|
| End-user (Associate) | Lessons 1–7 + exercises | ~6–8 h |
| End-user (Professional) | Lessons 8–10 + full assessment | ~3–4 h |
| Administrator | 9 modules + labs + assessment | ~14–16 h |
| Architect (delta) | scale, local model, persistence, DR labs | ~6–8 h |
| Trainer enablement | teach-back + rubric | ~4 h |

## 4. Playbooks, runbooks, certifications

- **Playbooks:** Onboarding (050), Support (054).
- **Runbook:** Operations (053) — customer-run procedures on their self-hosted
  instance.
- **Certifications:** Associate, Professional, Administrator, Architect, Partner,
  Trainer (056) — all labs run on the learner's own local instance; badges are
  registry-verified, never by inspecting a customer deployment.

## 5. Validation

`CUSTOMER_SUCCESS_VALIDATION.md` records a full **PASS** across cross references,
terminology, lifecycle, training, support, TR/EN parity, and product-truth
alignment. No forbidden capability is asserted as shipped anywhere in the package;
all cross-references resolve; both bilingual courses are at full parity.

## 6. Known limitations

These are honest boundaries of the **platform and the product**, stated so no one
over-promises:

- **No vendor telemetry.** AdOS is self-hosted and offline with no phone-home; the
  CS team cannot auto-collect usage. Every health/adoption/EBR metric is
  **customer-exported/shared**. Health scores are only as fresh as the last shared
  export.
- **SLAs are vendor response targets**, not remote-fix guarantees — the vendor has
  no standing access to the customer's instance.
- **Health scoring is manual/assisted**, not an automated dashboard (an opt-in,
  customer-controlled export helper is **Roadmap** only).
- The platform reflects **AdOS v1.0.0**; it does not describe document Q&A, cited
  answers, autonomous agents, live ad launch, external connectors, enforced RBAC,
  immutable audit, DB-level RLS, cloud inference, vision/speech AI, or tiered
  approval authority — those are **Roadmap** and appear only under labeled sections.

## 7. Future roadmap (platform)

Clearly labeled as **not shipped**:

- Opt-in, customer-controlled, on-prem **usage-export helper** feeding health
  scoring (never phones home).
- **In-product ticketing** and consented remote-diagnostics upload for support.
- Additional certification tracks that would only exist **if** the corresponding
  product capabilities ship.

Product-level roadmap items are owned by `../PRODUCT_TRUTH.md` and `../ROADMAP.md`;
this package never restates them as shipped.

---

## 8. Governance

`CUSTOMER_SUCCESS_CONSTITUTION.md` is binding on every artifact here. Any future
addition must trace each capability claim to `PRODUCT_TRUTH.md` or carry it under an
explicit Roadmap label — and must re-run the validation in
`CUSTOMER_SUCCESS_VALIDATION.md` before release.

**Status: ✅ Released — Customer Success Platform v1.0.0.**

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
