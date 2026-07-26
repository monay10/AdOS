# AdOS — Solution Proposal

**Prepared for:** {{Customer Name}}
**Prepared by:** {{AdOS Account Executive}}, AdOS
**Proposal reference:** {{Proposal ID}}
**Version:** {{Proposal Version}} · **Date:** {{Date}}
**Classification:** Confidential — for {{Customer Name}} internal use only

---

> **How to use this template (delete before sending).**
> This is a reusable, consulting-grade proposal template. Replace every `{{token}}`
> with deal-specific content. **Commercial figures are placeholders only** — the
> AdOS Deal Desk fills every `{{investment ...}}` token after value is quantified
> (Constitution §16–§17). Never ship this document with invented prices. Every
> solution and architecture statement below traces to the AdOS Canonical Brief;
> do not add claims that are not grounded in it. Keep product names in English in
> both languages: **AdOS**, **Company Brain**, **Digital Employees**.

> **Bilingual note / İki dilli not.**
> This proposal is English-primary and filled per deal. Section headings for the
> **Executive Summary** and **Acceptance Criteria** are provided in Turkish (TR)
> and English (EN). On request, AdOS supplies the full proposal side-by-side in
> Turkish and English; both language versions carry the **same** claims and
> numbers. / Bu teklif İngilizce esaslıdır ve her anlaşmaya göre doldurulur.
> **Yönetici Özeti** ve **Kabul Kriterleri** bölüm başlıkları Türkçe ve İngilizce
> olarak verilmiştir. Talep hâlinde tam teklif Türkçe ve İngilizce yan yana
> sunulur; her iki dil de aynı iddiaları ve rakamları taşır.

---

## 1. Cover / Title Block — {{Customer Name}}

| Field | Detail |
|---|---|
| **Customer** | {{Customer Name}} |
| **Prepared for** | {{Sponsor Name}}, {{Sponsor Title}} |
| **Industry / vertical** | {{Vertical}} |
| **Organization profile** | {{Employee count}} employees · {{Number of sites}} sites · {{Number of business units}} business units |
| **Prepared by** | {{AdOS Account Executive}} · {{AE Email}} · {{AE Phone}} |
| **Solution Engineer** | {{Solution Engineer}} |
| **Proposal reference** | {{Proposal ID}} |
| **Version / Date** | {{Proposal Version}} · {{Date}} |
| **Valid until** | {{Validity Date}} |
| **AdOS platform version** | v1.0.0 |

*AdOS — an enterprise AI operating system that runs 100% on your own
infrastructure. Your data never leaves your building, and it works with no
internet at all.*

---

## 2. Executive Summary
### Yönetici Özeti (TR) · Executive Summary (EN)

*{{Write 3–5 short paragraphs. Confident, precise, honest, executive-readable.
Prefer verbs and numbers. No hype adjectives. Follow the value order:
Sovereign → Capable → Accountable.}}*

**Situation.** {{One paragraph restating the customer's world in their own words:
organization shape, sites/units, current knowledge and approval pain, and why
data must stay on their premises.}}

**What we propose.** We propose **AdOS**, an AI-powered enterprise operating system
that runs entirely on {{Customer Name}}'s own infrastructure. AdOS unifies your
knowledge, your people, and your daily work under three pillars — **Company
Brain**, **Digital Employees**, and **Workflows & Approvals** — with all AI
inference running on your own hardware. No external API, no API keys, no internet
connection required to operate.

**Why it matters to {{Customer Name}}.** {{Two or three sentences mapping AdOS to
the buyer's quantified problem: faster answers, fewer stalled approvals, retained
institutional knowledge, and data that never leaves the building. Reference the
ROI model built with the customer; present payback period first.}}

**The three value pillars.**
1. **Sovereign** — 100% on your infrastructure; your data never leaves your premises.
2. **Capable** — a real AI operating system, not a chatbot: knowledge, agents, and approvals in one platform.
3. **Accountable** — permission-aware, source-cited, and fully audited.

**Honest trade-off.** Local inference on modest CPU hardware is slower than a
hosted frontier API — seconds, not milliseconds. Better hardware closes the gap.
We state this plainly; sovereignty, cost control, and independence outweigh it for
organizations that cannot let their data leave the building.

**Recommended next step.** {{e.g., a pilot on {{Customer Name}} hardware against
the acceptance criteria in §12, targeted to start {{Pilot Start Date}}.}}

---

## 3. Customer Challenges

*This section restates {{Customer Name}}'s challenges in their own words, as
captured during discovery. It is the problem definition the rest of the proposal
answers.*

| # | Challenge (as {{Customer Name}} described it) | Current impact | Owner / affected function |
|---|---|---|---|
| C1 | {{Knowledge is hard to find; answers are buried in documents}} | {{e.g., staff spend {{minutes}} per lookup}} | {{Function}} |
| C2 | {{Approvals wait on people rather than rules}} | {{e.g., {{n}} approvals/week delayed}} | {{Operations}} |
| C3 | {{Knowledge is lost when experts leave}} | {{Retraining cost, single points of failure}} | {{HR / People}} |
| C4 | {{Data must not leave the premises (regulatory / policy)}} | {{Blocks adoption of public-cloud AI}} | {{CISO / Legal}} |
| C5 | {{Repeated training load across sites}} | {{Cost and inconsistency}} | {{HR / Ops}} |
| C6 | {{Add customer-specific challenge}} | {{Impact}} | {{Owner}} |

**Constraints and requirements we heard.**
- **Data sovereignty:** {{where it is unacceptable for data to leave the building}}.
- **Regulatory / residency drivers:** {{e.g., sector data-residency mandates}}.
- **IT posture:** {{owns/controls infrastructure; IT/BT function present}}.
- **Success as {{Customer Name}} defines it:** {{buyer's own words}}.

---

## 4. Proposed Solution — AdOS

AdOS is an AI-powered enterprise operating system that runs entirely on
{{Customer Name}}'s own infrastructure. It unifies your organization's knowledge,
your people, and your day-to-day work under one system, built on three pillars.

### 4.1 Company Brain — your private, permission-aware knowledge base
Company Brain is {{Customer Name}}'s private knowledge base. Every AI answer is
grounded in your own documents and **cites its sources**. Citations are
**permission-scoped**: a user only ever sees, and the AI only ever cites,
documents that user is entitled to. The model can never surface or cite content a
user is not authorized to see.

*Addresses: {{C1, C3, C4}}.*

### 4.2 Digital Employees — AI agents that do real work
Digital Employees are AI agents that perform real knowledge work — answering
questions, drafting content, routing requests, preparing approvals, and moving
workflows forward — acting within defined roles and permissions.

*Addresses: {{C1, C2, C5}}.*

### 4.3 Workflows & Approvals — structured, deterministic, audited
Workflows & Approvals are structured business processes with tiered approval
authority, deterministic routing, and full audit trails. Every consequential
action is recorded in an immutable audit trail.

*Addresses: {{C2, C4}}.*

### 4.4 How the pillars map to {{Customer Name}}'s challenges

| Challenge | AdOS pillar(s) | Outcome for {{Customer Name}} |
|---|---|---|
| {{C1 — finding answers}} | Company Brain, Digital Employees | {{Faster, cited answers}} |
| {{C2 — stalled approvals}} | Workflows & Approvals | {{Deterministic routing; fewer delays}} |
| {{C3 — knowledge loss}} | Company Brain | {{Institutional knowledge retained}} |
| {{C4 — data residency}} | On-prem architecture (§5) | {{Data never leaves premises}} |
| {{C5 — training load}} | Company Brain, Digital Employees | {{Self-service answers; lower training cost}} |

### 4.5 What AdOS is not (scope clarity)
AdOS is not a public-cloud SaaS, not a wrapper around a hosted AI API, not
dependent on any external model provider, not a website chatbot, and not a data
collector. AdOS does not monetize, transmit, or train on {{Customer Name}}'s data.

---

## 5. Architecture — On-Prem, Local AI, Data Sovereignty

AdOS deploys on-premise (or in {{Customer Name}}'s private cloud/VPC). The
customer owns the **entire** stack — application, data, and model.

### 5.1 Local AI
All AI inference runs on {{Customer Name}}'s own hardware via a local engine —
**Ollama**, or any OpenAI-compatible local server such as **vLLM, LM Studio,
llama.cpp, or SGLang**. AdOS requires **no external API, no API keys, and no
internet connection** to operate. {{Customer Name}} **chooses and owns the model**;
models can be swapped without re-architecting.

### 5.2 Data sovereignty
Customer data — documents, prompts, answers, workflows — **never leaves
{{Customer Name}}'s premises**. There is no telemetry of business content.

### 5.3 Offline-first / air-gap capable
The platform is designed to run fully air-gapped. It continues to operate with no
internet connection at all.

### 5.4 Multi-tenant isolation
Strict tenant isolation: one deployment can serve {{Customer Name}}'s multiple
business units with segregated data.

### 5.5 Permission-aware and auditable
Access is permission-aware end to end — including the AI, which can never cite or
reveal what a user may not see. Every consequential action is written to an
immutable audit trail.

### 5.6 Deployment model
AdOS deploys with standard, documented tooling: **Docker, one-command bring-up**.
Documented **backup, restore, upgrade, and disaster-recovery** runbooks ship with
the platform. Platform version: **v1.0.0**.

### 5.7 No vendor lock-in
Open local engines, an OpenAI-compatible interface, and portable, exportable data.
{{Customer Name}} can export everything and is never locked to a single model or
provider.

### 5.8 Reference architecture (conceptual)

```
{{Customer Name}} premises / private VPC — no internet path required
┌─────────────────────────────────────────────────────────────────┐
│  Users (TR/EN UI, auto-detected)                                  │
│        │                                                          │
│        ▼                                                          │
│  AdOS application  ──►  Company Brain (permission-aware, cited)   │
│        │                Digital Employees (role-scoped agents)    │
│        │                Workflows & Approvals (tiered, audited)   │
│        ▼                                                          │
│  Local AI engine (Ollama / vLLM / LM Studio / llama.cpp / SGLang) │
│        │                                                          │
│        ▼                                                          │
│  Customer-owned model + customer-owned data (never leaves)        │
│                                                                   │
│  Immutable audit trail · Backup / Restore / DR runbooks           │
└─────────────────────────────────────────────────────────────────┘
   No external API · No API keys · No telemetry of business content
```

*{{Replace with a customer-specific diagram during technical deep-dive. Confirm
node counts, storage, and model sizing against §Appendix B prerequisites.}}*

---

## 6. Implementation Timeline (Phased)

AdOS is delivered in phases. Dates and durations below are **placeholders**;
confirm against {{Customer Name}}'s change windows and resourcing.

### 6.1 Phase overview (Gantt-style)

| Phase | Workstream | Start | End | Duration | Key milestone |
|---|---|---|---|---|---|
| **P0** | Mobilize & discovery confirmation | {{Wk 0}} | {{Wk 1}} | {{1 wk}} | Kickoff; success criteria signed |
| **P1** | Environment & deployment (Docker bring-up) | {{Wk 1}} | {{Wk 2}} | {{1 wk}} | AdOS running on {{Customer Name}} hardware |
| **P2** | Local AI engine + model selection | {{Wk 2}} | {{Wk 3}} | {{1 wk}} | Local inference validated, offline |
| **P3** | Company Brain seeding & permissions | {{Wk 3}} | {{Wk 5}} | {{2 wks}} | Cited answers on customer content |
| **P4** | Digital Employees configuration | {{Wk 5}} | {{Wk 6}} | {{1 wk}} | Role-scoped agents completing tasks |
| **P5** | Workflows & Approvals setup | {{Wk 6}} | {{Wk 7}} | {{1 wk}} | Tiered approval running end to end |
| **P6** | Security review & audit validation | {{Wk 7}} | {{Wk 8}} | {{1 wk}} | Audit trail + air-gap verified |
| **P7** | UAT against acceptance criteria (§12) | {{Wk 8}} | {{Wk 9}} | {{1 wk}} | Acceptance criteria met |
| **P8** | Go-live & handover to day-2 ops | {{Wk 9}} | {{Wk 10}} | {{1 wk}} | Production go-live; runbooks handed over |
| **P9** | Adoption & expansion (optional) | {{Wk 10}} | {{Wk N}} | {{ongoing}} | Additional units/sites/seats |

### 6.2 Gantt bar view (illustrative)

```
Phase   Wk1  Wk2  Wk3  Wk4  Wk5  Wk6  Wk7  Wk8  Wk9  Wk10
P0 ██
P1     ██
P2          ██
P3               ████████
P4                         ██
P5                              ██
P6                                   ██
P7                                        ██
P8                                             ██
```

*{{Adjust phase lengths to customer scope. Air-gapped deployments may extend P1–P2
for offline artifact staging (see Appendix B).}}*

---

## 7. Deliverables

| # | Deliverable | Description | Phase |
|---|---|---|---|
| D1 | Deployed AdOS platform (v1.0.0) | Running on {{Customer Name}} infrastructure via Docker, one-command bring-up | P1 |
| D2 | Local AI engine configured | {{Engine}} with {{Customer Name}}-selected model, validated offline | P2 |
| D3 | Company Brain, seeded | {{Customer Name}} documents ingested; permission-scoped, source-cited answers | P3 |
| D4 | Permission model | Role/entitlement mapping enforced across UI and AI | P3 |
| D5 | Digital Employees | {{n}} configured agents within defined roles/permissions | P4 |
| D6 | Workflows & Approvals | {{n}} workflows with tiered approval and deterministic routing | P5 |
| D7 | Audit trail validated | Immutable audit trail verified for consequential actions | P6 |
| D8 | Security review pack | Architecture, controls, and data-flow documentation (Appendix A) | P6 |
| D9 | Day-2 runbooks | Backup, restore, upgrade, disaster-recovery runbooks | P8 |
| D10 | Admin & user enablement | Bilingual (TR/EN) training and handover | P8 |
| D11 | Acceptance sign-off | UAT results against §12 acceptance criteria | P7 |

*{{Add/remove deliverables to match scope. Do not promise deliverables that are
not grounded in the AdOS platform.}}*

---

## 8. Roles & Responsibilities (RACI)

**Legend:** R = Responsible · A = Accountable · C = Consulted · I = Informed.

| Activity | AdOS | {{Customer Name}} |
|---|---|---|
| Project governance & kickoff | A/R | C |
| Provision infrastructure & compute | C | A/R |
| Network / air-gap environment prep | C | A/R |
| AdOS deployment (Docker bring-up) | A/R | C |
| Local AI engine & model selection | R | A |
| Provide source documents for Company Brain | C | A/R |
| Define permission / entitlement model | C | A/R |
| Configure Company Brain & citations | A/R | C |
| Configure Digital Employees | A/R | C |
| Design Workflows & Approvals | C | A/R |
| Configure Workflows & Approvals | A/R | C |
| Security review & audit validation | R | A |
| User Acceptance Testing (UAT) | C | A/R |
| Data backup / restore / DR execution (day-2) | C | A/R |
| Day-2 operations after handover | C | A/R |
| Enablement & training delivery | A/R | C |
| Acceptance sign-off | C | A/R |

*{{Confirm the accountable owner on the customer side for each row. AdOS advises;
the customer owns and operates its stack.}}*

---

## 9. Support & SLA

*All support respects data sovereignty: AdOS support does not require, and does
not receive, {{Customer Name}}'s business content or telemetry. Air-gapped
support is delivered via documented offline procedures.*

### 9.1 Support tiers (structure — confirm the selected tier)

| Item | {{Standard}} | {{Enterprise}} |
|---|---|---|
| Support hours | {{Business hours, TR/EN}} | {{Extended / {{24×7}}}} |
| Channels | {{Email / portal}} | {{Email / portal / phone}} |
| Named contact | {{—}} | {{Customer Success Manager}} |
| Runbook access (backup/restore/upgrade/DR) | Included | Included |
| Release upgrades | {{Included}} | {{Included + assisted}} |

### 9.2 Response & restore targets (placeholders — Deal Desk confirms)

| Severity | Definition | Target response | Target workaround/restore |
|---|---|---|---|
| **Sev 1 — Critical** | Production down; core function unavailable | {{response}} | {{restore}} |
| **Sev 2 — High** | Major function impaired; no workaround | {{response}} | {{restore}} |
| **Sev 3 — Medium** | Minor function impaired; workaround exists | {{response}} | {{restore}} |
| **Sev 4 — Low** | Question / cosmetic / enhancement | {{response}} | {{restore}} |

*{{SLA figures are placeholders. Confirm targets, hours, and coverage with Deal
Desk and Support before issuing.}}*

---

## 10. Commercial Section

> **PLACEHOLDERS ONLY.** Pricing is **value-based** (Constitution §17): a
> **platform license + support/success**, per deployment or per-seat band. There
> is **no per-token and no per-query metering** — local inference has no marginal
> API cost; inference cost is {{Customer Name}}'s own electricity and hardware.
> **The AdOS Deal Desk fills every `{{investment ...}}` token below after value is
> quantified with the customer.** Do not invent or infer prices. Present price only
> after the ROI is quantified and the champion is aligned — **one number at a
> time: payback first, then annual investment, then terms.**

### 10.1 Commercial structure

| Component | Basis | Investment |
|---|---|---|
| Platform license | {{Per deployment / per-seat band}} | {{investment.license}} |
| Support & success | {{Selected tier, §9}} | {{investment.support}} |
| Implementation services | {{Phased, §6}} | {{investment.services}} |
| Optional: expansion (units/sites/seats) | {{As added}} | {{investment.expansion}} |
| **Total contract value** | {{Term}} | {{investment.total}} |

### 10.2 Commercial terms (placeholders)

- **Term:** {{investment.term}}
- **Billing schedule:** {{investment.billing}}
- **Payment terms:** {{investment.payment}}
- **Currency:** {{investment.currency}}
- **Payback period (from ROI model):** {{investment.payback}}
- **What is explicitly excluded from cost:** per-token fees, per-query fees, and
  any metered API charges — there are none.

### 10.3 Value basis
Pricing is anchored to the quantified value in the ROI model built with
{{Customer Name}} (annual savings, ROI %, payback period, efficiency gain), not to
feature count. {{Reference the specific ROI outputs agreed with the customer.}}

---

## 11. Acceptance Criteria
### Kabul Kriterleri (TR) · Acceptance Criteria (EN)

*Acceptance is objective and defined **up front**. AdOS considers the engagement
accepted when the following criteria are demonstrably met on {{Customer Name}}'s
infrastructure during UAT (Phase P7).*

| # | Acceptance criterion | How it is verified | Met? |
|---|---|---|---|
| A1 | AdOS runs on {{Customer Name}} infrastructure | One-command Docker bring-up completes; platform reachable | ☐ |
| A2 | Local AI inference runs on customer hardware | Inference served by the local engine; no external API/keys | ☐ |
| A3 | Operates offline / air-gapped | Disconnect network → core functions still work | ☐ |
| A4 | Company Brain answers are **cited** | Answers show sources from {{Customer Name}} documents | ☐ |
| A5 | Citations are **permission-scoped** | Restricted document is invisible to an unentitled user; AI does not cite it | ☐ |
| A6 | Digital Employees complete real tasks | {{n}} agents perform their defined tasks within permissions | ☐ |
| A7 | Tiered approval runs end to end | A workflow routes through its approval tiers deterministically | ☐ |
| A8 | Immutable audit trail records actions | Consequential actions appear, unaltered, in the audit trail | ☐ |
| A9 | Bilingual UI (TR/EN) | UI auto-detects and presents Turkish and English | ☐ |
| A10 | Day-2 runbooks validated | Backup and restore executed successfully | ☐ |
| A11 | {{Customer-specific outcome}} | {{Verification method}} | ☐ |

**Sign-off.** When all applicable criteria are met, {{Customer Name}} and AdOS
sign the acceptance record (D11). Any unmet criterion is logged with a remediation
owner and target date before go-live.

---

## 12. Appendices

### Appendix A — Security Overview

- **Primary control:** {{Customer Name}}'s data never leaves its premises.
- **Attack surface:** no external API calls means no third-party data path to
  breach; the platform is air-gap capable.
- **Access control:** permission-aware AI — the model cannot cite or reveal what a
  user is not authorized to see.
- **Auditability:** every consequential action is recorded in an immutable audit
  trail.
- **Compliance posture:** on-premise / air-gap deployment directly supports
  data-residency mandates ({{public sector / healthcare / finance as applicable}}).
- **No data monetization:** AdOS does not monetize, transmit, or train on customer
  data; there is no telemetry of business content.
- **Discipline:** this proposal describes AdOS architecture and controls. It does
  **not** claim certifications AdOS has not earned. {{List any certifications only
  if genuinely held; otherwise omit.}}

### Appendix B — Deployment Prerequisites

- **Compute:** {{CPU/GPU, cores, RAM per node}} sized for the selected model(s).
- **Storage:** {{capacity}} for documents, indexes, and audit trail.
- **Container runtime:** Docker (standard, one-command bring-up).
- **Local AI engine:** one of Ollama, vLLM, LM Studio, llama.cpp, or SGLang
  (OpenAI-compatible).
- **Model(s):** {{Customer Name}}-selected; staged locally (offline media for
  air-gapped sites).
- **Identity / permissions:** {{directory / entitlement source}} for the
  permission model.
- **Network:** internet **not required** to operate; {{list any internal network
  requirements}}.
- **Access for implementation:** {{customer-provided access to the environment}}.
- **Backup target:** {{location}} for backup/restore/DR runbooks.

*{{Confirm final sizing during the technical deep-dive. Local CPU-only inference
is slower than a hosted frontier API (seconds, not milliseconds); better hardware
closes the gap — size accordingly.}}*

### Appendix C — Glossary

| Term | Meaning |
|---|---|
| **AdOS** | AI-powered enterprise operating system that runs entirely on the customer's own infrastructure. |
| **Company Brain** | The organization's private, permission-aware knowledge base; every answer is grounded in the company's own documents and cites its sources. |
| **Digital Employees** | AI agents that perform real knowledge work within defined roles and permissions. |
| **Workflows & Approvals** | Structured business processes with tiered approval authority, deterministic routing, and full audit trails. |
| **Local AI** | AI inference that runs on the customer's own hardware via a local engine — no external API, no API keys, no internet required. |
| **Local engine** | Ollama or an OpenAI-compatible local server (vLLM, LM Studio, llama.cpp, SGLang) that serves the model on-premise. |
| **Data sovereignty** | Customer data never leaves the customer's premises; no telemetry of business content. |
| **On-premise** | Deployed on the customer's own infrastructure (or private cloud/VPC); the customer owns the entire stack. |
| **Air-gap** | Operating with no internet connection at all. |
| **Permission-aware** | Access control extends to the AI: it can never surface or cite content a user is not entitled to see. |
| **Immutable audit trail** | A tamper-evident record of every consequential action. |
| **Multi-tenant** | Strict tenant isolation; one deployment serves multiple business units with segregated data. |
| **Deal Desk** | The AdOS commercial function that fills the `{{investment ...}}` placeholders and governs pricing/discounting. |

---

*This proposal conforms to the AdOS Canonical Brief and the Sales Kit
Constitution (§16 proposal strategy, §17 pricing principles). Commercial figures
are placeholders until completed by the AdOS Deal Desk. All solution and
architecture claims trace to the Canonical Brief. — {{AdOS Account Executive}},
{{Date}}.*
