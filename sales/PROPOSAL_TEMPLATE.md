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
> both languages: **AdOS**, **Company Brain**.

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

*AdOS — an Enterprise AI Operating System for Advertising that runs 100% on your
own infrastructure. Your data never leaves your building, and it works with no
internet at all.*

---

## 2. Executive Summary
### Yönetici Özeti (TR) · Executive Summary (EN)

*{{Write 3–5 short paragraphs. Confident, precise, honest, executive-readable.
Prefer verbs and numbers. No hype adjectives. Follow the value order:
Sovereign → Capable → Accountable.}}*

**Situation.** {{One paragraph restating the customer's world in their own words:
organization shape, sites/units, current campaign-production and approval pain, and
why data must stay on their premises.}}

**What we propose.** We propose **AdOS**, an Enterprise AI Operating System for
Advertising that runs entirely on {{Customer Name}}'s own infrastructure. AdOS takes
an advertising objective through a human-approved pipeline under three pillars —
**Company Brain**, an **AI-assisted campaign pipeline**, and **human approval
gates** — with all AI inference running on your own hardware. No external API, no
API keys, no internet connection required to operate.

**Why it matters to {{Customer Name}}.** {{Two or three sentences mapping AdOS to
the buyer's quantified problem: faster campaign briefs and drafts, fewer stalled
approvals, retained campaign know-how, and data that never leaves the building.
Reference the ROI model built with the customer; present payback period first.}}

**The three value pillars.**
1. **Sovereign** — 100% on your infrastructure; your data never leaves your premises.
2. **Capable** — a real AI operating system for advertising, not a chatbot: marketing-performance memory, an AI-assisted campaign pipeline, and human approval gates in one platform.
3. **Accountable** — human-approved at every stage, with an activity log and per-approval timeline.

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
| C1 | {{Campaign briefs and creative take too long to produce}} | {{e.g., staff spend {{hours}} per campaign}} | {{Marketing}} |
| C2 | {{Campaign approvals wait on people rather than a clear process}} | {{e.g., {{n}} approvals/week delayed}} | {{Marketing Ops}} |
| C3 | {{What worked in past campaigns is lost when people leave}} | {{Repeated mistakes; lost know-how}} | {{Marketing / People}} |
| C4 | {{Data must not leave the premises (regulatory / policy)}} | {{Blocks adoption of public-cloud AI}} | {{CISO / Legal}} |
| C5 | {{Inconsistent brand voice and quality across teams/sites}} | {{Off-brand output; rework}} | {{Brand / Marketing}} |
| C6 | {{Add customer-specific challenge}} | {{Impact}} | {{Owner}} |

**Constraints and requirements we heard.**
- **Data sovereignty:** {{where it is unacceptable for data to leave the building}}.
- **Regulatory / residency drivers:** {{e.g., sector data-residency mandates}}.
- **IT posture:** {{owns/controls infrastructure; IT/BT function present}}.
- **Success as {{Customer Name}} defines it:** {{buyer's own words}}.

---

## 4. Proposed Solution — AdOS

AdOS is an Enterprise AI Operating System for Advertising that runs entirely on
{{Customer Name}}'s own infrastructure. It takes an advertising objective through a
human-approved pipeline and remembers what works, built on three pillars.

### 4.1 Company Brain — your private marketing-performance memory
Company Brain is {{Customer Name}}'s private marketing-performance memory. It learns
from your own campaign history — which creatives, channels, and budgets performed —
and surfaces those patterns to inform the next brief and draft. It holds brand
voice and rules, a campaign→ad→lead→ROI knowledge graph, a winning-ad pattern
library, and a past-campaign experience engine. All of it stays on
{{Customer Name}}'s infrastructure.

*Addresses: {{C1, C3, C5}}.*

### 4.2 AI-Assisted Campaign Pipeline — brief to draft, human-approved
A human-in-the-loop pipeline takes an advertising objective through AI-assisted
stages — marketing brief, creative (ad copy), campaign draft (channels, ad sets,
budget split), performance report, and an executive dashboard. The AI drafts; your
team reviews and approves at each stage. AdOS **prepares** campaigns for you to run
in your own ad platforms; it does **not** launch, run, or optimize live ads.

*Addresses: {{C1, C2, C5}}.*

### 4.3 Human Approval Gates — structured, deterministic, traceable
Every consequential stage passes through an explicit human approval gate (strategy
& budget, creative assets, campaign launch). Routing is deterministic, and each
approval is recorded with a per-approval timeline and an activity log.

*Addresses: {{C2, C4}}.*

### 4.4 How the pillars map to {{Customer Name}}'s challenges

| Challenge | AdOS pillar(s) | Outcome for {{Customer Name}} |
|---|---|---|
| {{C1 — slow briefs/creative}} | Company Brain, AI-assisted pipeline | {{Faster briefs and drafts}} |
| {{C2 — stalled approvals}} | Human approval gates | {{Deterministic routing; fewer delays}} |
| {{C3 — campaign know-how loss}} | Company Brain | {{Marketing-performance memory retained}} |
| {{C4 — data residency}} | On-prem architecture (§5) | {{Data never leaves premises}} |
| {{C5 — inconsistent brand}} | Company Brain, AI-assisted pipeline | {{Consistent brand voice; less rework}} |

### 4.5 What AdOS is not (scope clarity)
AdOS is not a public-cloud SaaS, not a wrapper around a hosted AI API, not
dependent on any external model provider, not a website chatbot, and not a data
collector. It does **not** launch, run, or optimize live advertising campaigns — it
produces human-approved **drafts** you export to run in your own ad platforms. It
is **not** a generic document knowledge base and does **not** answer free-text
questions over uploaded documents. AdOS does not monetize, transmit, or train on
{{Customer Name}}'s data.

### 4.6 Roadmap (not contracted)
The following are planned future directions, listed for transparency only — they
are **not** in this proposal's scope and **not** among the deliverables in §7:
document knowledge base with cited answers; autonomous AI agents that act without
human approval; direct connectors that launch and optimize live campaigns on
external ad platforms (Meta/Google/TikTok/LinkedIn); enforced role-based access
control and permission-aware AI; an immutable, tamper-evident audit trail;
database-level row-level security; cloud inference; image/vision/speech AI; and
tiered approval-authority (spend-limit) models.

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
Customer data — briefs, creatives, campaign drafts, reports, and performance
metrics — **never leaves {{Customer Name}}'s premises**. There is no telemetry of
business content.

### 5.3 Offline-first / air-gap capable
The platform is designed to run fully air-gapped. It continues to operate with no
internet connection at all.

### 5.4 Multi-tenant isolation
Application-level tenant isolation: one deployment can serve {{Customer Name}}'s
multiple business units with data scoped per tenant.

### 5.5 Human-approved and traceable
Every consequential stage requires an explicit human approval gate — the AI drafts
and a person approves before anything proceeds. Each approval is captured with a
per-approval timeline, and platform activity is recorded in an activity log.
(Enforced role-based access control and an immutable audit trail are Roadmap items —
see §4.6.)

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
│  AdOS application  ──►  Company Brain (marketing-performance)     │
│        │                AI-assisted campaign pipeline (drafts)     │
│        │                Human approval gates (deterministic)       │
│        ▼                                                          │
│  Local AI engine (Ollama / vLLM / LM Studio / llama.cpp / SGLang) │
│        │                                                          │
│        ▼                                                          │
│  Customer-owned model + customer-owned data (never leaves)        │
│                                                                   │
│  Activity log · Per-approval timeline · Backup / Restore / DR     │
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
| **P3** | Company Brain seeding (campaign history) | {{Wk 3}} | {{Wk 5}} | {{2 wks}} | Marketing-performance memory seeded |
| **P4** | AI-assisted pipeline configuration | {{Wk 5}} | {{Wk 6}} | {{1 wk}} | Pipeline drafts brief→creative→campaign |
| **P5** | Approval gates setup | {{Wk 6}} | {{Wk 7}} | {{1 wk}} | Approval gates running end to end |
| **P6** | Security review & activity-log validation | {{Wk 7}} | {{Wk 8}} | {{1 wk}} | Activity log + air-gap verified |
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
| D3 | Company Brain, seeded | {{Customer Name}} campaign history loaded; marketing-performance memory active | P3 |
| D4 | Brand, product & approval-gate setup | Brand voice/rules, products, and approval gates configured | P3 |
| D5 | AI-assisted pipeline | Brief→creative→draft→report→dashboard stages configured | P4 |
| D6 | Approval gates | {{n}} approval gates with deterministic routing | P5 |
| D7 | Activity log validated | Activity log + per-approval timeline verified for consequential actions | P6 |
| D8 | Security review pack | Architecture, controls, and data-flow documentation (Appendix A) | P6 |
| D9 | Day-2 runbooks | Backup, restore, upgrade, disaster-recovery runbooks | P8 |
| D10 | Admin & user enablement | Bilingual (TR/EN) training and handover | P8 |
| D11 | Acceptance sign-off | UAT results against §12 acceptance criteria | P7 |

*{{Add/remove deliverables to match scope. Do not promise deliverables that are
not grounded in the AdOS platform. Roadmap items (§4.6) are never contracted here.}}*

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
| Provide campaign history for Company Brain | C | A/R |
| Define brand voice / rules & approval gates | C | A/R |
| Configure Company Brain (campaign memory) | A/R | C |
| Configure AI-assisted pipeline | A/R | C |
| Design approval gates | C | A/R |
| Configure approval gates | A/R | C |
| Security review & activity-log validation | R | A |
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
| A4 | Company Brain surfaces past-campaign performance | Company Brain shows relevant prior-campaign patterns/metrics | ☐ |
| A5 | Campaigns remain drafts (never auto-launched) | A campaign draft is produced for approval; nothing is pushed to a live ad platform | ☐ |
| A6 | AI-assisted pipeline completes its stages | Pipeline drafts brief, creative, and campaign for a {{Customer Name}} objective | ☐ |
| A7 | Approval gates run end to end | A campaign routes through its approval gates deterministically | ☐ |
| A8 | Activity log records actions | Consequential actions appear in the activity log and per-approval timeline | ☐ |
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
- **Human-in-the-loop control:** every consequential stage requires an explicit
  human approval before it proceeds — the AI drafts, a person approves.
- **Traceability:** consequential actions are recorded in an activity log with
  per-approval timelines. (Enforced RBAC and an immutable audit trail are Roadmap —
  §4.6.)
- **Compliance posture:** on-premise / air-gap deployment directly supports
  data-residency mandates ({{public sector / healthcare / finance as applicable}}).
- **No data monetization:** AdOS does not monetize, transmit, or train on customer
  data; there is no telemetry of business content.
- **Discipline:** this proposal describes AdOS architecture and controls. It does
  **not** claim certifications AdOS has not earned. {{List any certifications only
  if genuinely held; otherwise omit.}}

### Appendix B — Deployment Prerequisites

- **Compute:** {{CPU/GPU, cores, RAM per node}} sized for the selected model(s).
- **Storage:** {{capacity}} for campaign data, Company Brain memory, and logs.
- **Container runtime:** Docker (standard, one-command bring-up).
- **Local AI engine:** one of Ollama, vLLM, LM Studio, llama.cpp, or SGLang
  (OpenAI-compatible).
- **Model(s):** {{Customer Name}}-selected; staged locally (offline media for
  air-gapped sites).
- **Identity:** {{directory source}} for user accounts and approval assignments.
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
| **AdOS** | Enterprise AI Operating System for Advertising that runs entirely on the customer's own infrastructure. / Reklam için Kurumsal Yapay Zekâ İşletim Sistemi. |
| **Company Brain** | The organization's private marketing-performance memory; it learns from the company's own campaign history (creatives, channels, budgets, ROI) and surfaces what works. |
| **AI-assisted campaign pipeline** | The human-in-the-loop stages — marketing brief → creative (ad copy) → campaign draft → performance report → executive dashboard — where the AI drafts and a person approves. |
| **Human approval gates** | Explicit human approval gates (strategy & budget, creative assets, campaign launch) with deterministic routing, an activity log, and per-approval timelines. |
| **Local AI** | AI inference that runs on the customer's own hardware via a local engine — no external API, no API keys, no internet required. |
| **Local engine** | Ollama or an OpenAI-compatible local server (vLLM, LM Studio, llama.cpp, SGLang) that serves the model on-premise. |
| **Data sovereignty** | Customer data never leaves the customer's premises; no telemetry of business content. |
| **On-premise** | Deployed on the customer's own infrastructure (or private cloud/VPC); the customer owns the entire stack. |
| **Air-gap** | Operating with no internet connection at all. |
| **Human-in-the-loop** | The AI drafts; a person reviews and approves at every stage before anything proceeds. |
| **Activity log & per-approval timeline** | A record of consequential actions and approvals. (A tamper-evident immutable audit trail is a Roadmap item — §4.6.) |
| **Multi-tenant** | Application-level tenant isolation; one deployment serves multiple business units with data scoped per tenant. |
| **Deal Desk** | The AdOS commercial function that fills the `{{investment ...}}` placeholders and governs pricing/discounting. |

---

*This proposal conforms to the AdOS Canonical Brief and the Sales Kit
Constitution (§16 proposal strategy, §17 pricing principles). Commercial figures
are placeholders until completed by the AdOS Deal Desk. All solution and
architecture claims trace to the Canonical Brief. — {{AdOS Account Executive}},
{{Date}}.*
