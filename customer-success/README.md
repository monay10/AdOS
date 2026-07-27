# AdOS — Customer Success Platform

The complete post-sale operating system for **AdOS — the Enterprise AI Operating
System for Advertising**. It standardizes onboarding, adoption, training,
operations, support, health, and certification so every customer outcome is
repeatable.

> **Single source of truth:** [`../PRODUCT_TRUTH.md`](../PRODUCT_TRUTH.md). No
> document here promises a capability AdOS does not implement today; future
> capabilities appear only under explicit **Roadmap** labels.
>
> **A note on the product's shape that governs everything here:** AdOS is
> **self-hosted, offline-first, and 100% local-AI** with **no phone-home
> telemetry**. The Customer Success team therefore **cannot auto-collect usage** —
> every health, adoption, and EBR metric is **exported/shared by the customer's
> own admin**. AdOS **drafts** human-approved advertising campaigns; it never
> launches live ads, and the **Company Brain** is a marketing-performance memory,
> not a document knowledge base.

---

## Contents

| Doc | What it is |
|---|---|
| [`CUSTOMER_SUCCESS_CONSTITUTION.md`](CUSTOMER_SUCCESS_CONSTITUTION.md) | **Start here.** The binding charter — lifecycle, health, maturity, expansion, renewal, EBRs, KPIs, escalation, risk, governance |
| [`ONBOARDING_PLAYBOOK.md`](ONBOARDING_PLAYBOOK.md) | Day 0 → Month 12 onboarding |
| [`ADMINISTRATOR_TRAINING.md`](ADMINISTRATOR_TRAINING.md) | Bilingual TR/EN administrator course |
| [`END_USER_TRAINING.md`](END_USER_TRAINING.md) | Bilingual TR/EN end-user course |
| [`OPERATIONS_RUNBOOK.md`](OPERATIONS_RUNBOOK.md) | Daily → quarterly operations, incidents, backup/restore |
| [`SUPPORT_PLAYBOOK.md`](SUPPORT_PLAYBOOK.md) | Severity, SLAs, triage, escalation, RCA |
| [`CUSTOMER_HEALTH.md`](CUSTOMER_HEALTH.md) | 10-dimension RAG health model |
| [`CERTIFICATION_PROGRAM.md`](CERTIFICATION_PROGRAM.md) | 6-level certification |
| [`CUSTOMER_SUCCESS_VALIDATION.md`](CUSTOMER_SUCCESS_VALIDATION.md) | Validation report — ✅ PASS |
| [`CUSTOMER_SUCCESS_RELEASE.md`](CUSTOMER_SUCCESS_RELEASE.md) | Release summary, statistics, known limitations, roadmap |

## Reading order

1. **Everyone:** `CUSTOMER_SUCCESS_CONSTITUTION.md` (the shared vocabulary and
   models).
2. **CSM / Solution Architect (a new customer):** `ONBOARDING_PLAYBOOK.md` →
   `CUSTOMER_HEALTH.md`.
3. **Customer admins:** `ADMINISTRATOR_TRAINING.md` → `OPERATIONS_RUNBOOK.md`.
4. **Customer end-users:** `END_USER_TRAINING.md`.
5. **Support:** `SUPPORT_PLAYBOOK.md`.
6. **Anyone certifying:** `CERTIFICATION_PROGRAM.md`.

## Shared vocabulary (defined authoritatively in the Constitution)

- **Lifecycle (6):** Evaluate → Onboard → Adopt → Realize Value → Mature & Optimize
  → Renew & Expand.
- **Maturity (M1–M5):** Deployed → Operating → Scaling → Optimizing → Transforming.
- **Health:** RAG (Green ≥80 / Yellow 60–79 / Red <60) over 10 customer-shared
  dimensions.
- **Support severity:** Sev 1 Critical → Sev 4 Low (SLA = vendor **response** time).
- **Certification (6):** Associate → Professional → Administrator → Architect →
  Partner → Trainer.

---

*Documentation only. No application code, packages, domains, or tests were modified.
Aligned to PRODUCT_TRUTH.md.*
