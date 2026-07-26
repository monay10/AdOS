# AdOS — Demo Constitution

**Document type:** Specification for the **official AdOS sales demonstration
environment**. This is **not** sample data, **not** test data, and **not**
production data. It is a deliberately designed, internally consistent, repeatable
demonstration world used in every AdOS sales engagement.
**Owner:** Chief Demo Experience Architect.
**Status:** v1.0 — canonical source of truth for the demo.
**Isolation:** everything lives under `demo/`. The demo environment never touches
production data or the AdOS application's own tests.

**The demo world in one line:** a realistic mid-to-large industrial manufacturing
group — **NovaMak Endüstri A.Ş. ("NovaMak Industries")** — running its entire
knowledge, workflow and AI operation on AdOS, entirely on its own infrastructure.

**The golden rule of the demo:** *every screen must feel like a real company on a
normal working day.* No "Lorem ipsum," no "test_user_1," no empty states in the
happy path. If a prospect clicks anywhere reasonable, they find believable,
consistent data.

---

## 1. Demo philosophy

- **Believability over breadth.** A smaller world that feels completely real beats
  a large world full of placeholders. Every name, document and number is
  plausible and consistent.
- **Show the outcome, not the plumbing.** The demo proves business value —
  knowledge found instantly, work approved faster, campaigns produced locally —
  not technical features.
- **Sovereignty is always visible.** Every scenario reinforces the core message:
  this runs on the company's own infrastructure; nothing leaves the building.
- **The customer sees themselves.** The demo company mirrors the prospect's own
  structure (departments, factories, approvals, compliance), so they picture
  their own organization.
- **Deterministic and repeatable.** The same click path produces the same result
  every time. A demo that surprises the presenter is a failed demo.
- **Honest.** AI answers are grounded in the demo knowledge base and cite it; the
  demo never fakes intelligence it doesn't have.

---

## 2. Demo objectives

1. **Prove the Company Brain:** any employee gets an accurate, cited answer from
   the company's own documents in seconds.
2. **Prove Digital Employees:** department AI assistants do real work within clear
   limits and escalate to humans correctly.
3. **Prove governed workflows:** approvals, incidents, maintenance and quality
   flows move faster with AI assistance and full audit trails.
4. **Prove sovereignty & security:** show it running locally, with tenant
   isolation and audit, and state plainly that no data leaves.
5. **Prove breadth with depth:** one platform serving every department of a real
   enterprise — HR, Finance, IT, Operations, Maintenance, Quality, Sales,
   Procurement, Engineering, Production, Security, Warehouse, Support.
6. **Enable a confident presenter:** a scripted, reliable path that always works.

**Success = the prospect asks "can we run this on our data?" —** the cue to move
to a pilot.

---

## 3. Demo audience

The demo serves the same executive and operational buyers as the presentation,
plus hands-on evaluators:

| Audience | What the demo must show them |
| --- | --- |
| CEO / GM | Business outcomes, adoption simplicity, one platform |
| CIO / IT | On-prem operation, control, isolation, no lock-in |
| CTO | Real, governed AI grounded in company knowledge |
| CISO / Security | Isolation, audit trail, no data egress |
| Department heads (HR/Finance/Ops/Quality…) | Their own daily work, made faster |
| Public institutions / OIZ | Compliance, multi-tenant potential, Turkish UI |
| End users | An assistant that actually knows their company |

The demo is delivered **bilingually (TR/EN)**; for OIZ and public-sector
audiences it runs primarily in Turkish.

---

## 4. Demo scenarios

Each scenario is a short, scripted story (2–5 minutes) with a fixed click path.
Detailed steps live in `DEMO_WORKFLOWS.md`; the canonical demo scenarios are:

1. **"Ask the company anything."** A new maintenance engineer asks the Knowledge
   Assistant how to handle a specific machine fault; it answers from the real
   maintenance manual and cites it. *(Proves Company Brain.)*
2. **"Approve a purchase in minutes."** A production manager raises a purchase
   request; the Finance Assistant checks budget and policy; it routes to the right
   approver; approved with a full audit trail. *(Proves governed workflow + AI.)*
3. **"Onboard a new hire in a day."** HR Assistant answers a new employee's policy
   questions (leave, expenses, safety) instantly from the HR handbook. *(Proves
   knowledge + adoption.)*
4. **"Handle an incident correctly."** A quality incident is logged; the Quality
   Assistant proposes the correct CAPA steps from the ISO procedures; a human
   approves. *(Proves compliance + governance.)*
5. **"Produce a campaign, locally."** Marketing states an objective; AdOS produces
   brief → creative → campaign, on a local model, with approvals. *(Proves the
   advertising pipeline + sovereignty.)*
6. **"See it all from the top."** The Executive Dashboard shows knowledge usage,
   workflow throughput, and AI activity across the company. *(Proves the platform
   value.)*

Every scenario ends by restating: *"and none of this left the building."*

---

## 5. Demo personas

Personas the presenter can "log in as." Full roster in `DEMO_USERS.md`; the
headline demo personas are:

- **Elif Demir — General Manager.** Sees the Executive Dashboard; asks strategic
  questions.
- **Kerem Yılmaz — Production Manager.** Raises purchase and maintenance requests;
  uses the Operations/Production assistants.
- **Ayşe Kaya — HR Manager.** Manages leave and onboarding; uses the HR Assistant.
- **Mehmet Aslan — Maintenance Engineer.** New hire; asks the Knowledge/Maintenance
  Assistant about machine faults.
- **Zeynep Şahin — Quality Manager.** Runs incidents/CAPA with the Quality
  Assistant.
- **Burak Öztürk — IT Manager.** Handles access requests; shows admin, isolation
  and audit.
- **Canan Arslan — Finance Manager.** Approves expenses and invoices with the
  Finance Assistant.

Each persona has realistic permissions (see §9) so the same data looks different,
and correctly restricted, per role.

---

## 6. Demo company

**NovaMak Endüstri A.Ş. ("NovaMak Industries")** — a fictional but realistic
industrial machinery and metal-components manufacturer headquartered in Dudullu
OSB, İstanbul, with plants in İstanbul, Bursa and Gebze, ~1,850 employees, founded
1994. Full profile in `DEMO_COMPANY.md`. It is chosen because a manufacturer
naturally exercises **every** department the demo needs and mirrors the OIZ/
enterprise prospects AdOS targets.

---

## 7. Demo departments

The demo models these departments, each with real users, documents, workflows and
an AI assistant:
Executive/Management · HR · Finance & Accounting · IT · Operations · Maintenance ·
Quality · Sales · Marketing · Procurement · Engineering · Production · Health,
Safety & Environment (HSE) · Security · Warehouse & Logistics · Customer Support.

Each department is internally consistent: its people report to a head, own their
documents, run their workflows, and use their assistant.

---

## 8. Demo users

Approximately **40 users** spanning executives, managers and front-line staff
across all departments. Each has a role, department, responsibilities,
permissions, typical daily tasks, AI usage, and workflow ownership. Defined in
`DEMO_USERS.md`. Users are realistic Turkish names with plausible titles and
reporting lines that match the org chart in `DEMO_COMPANY.md`.

---

## 9. Demo permissions

Permissions make the demo credible: the same system shows each role only what they
should see.

- **Role-based access.** Executives see everything; managers see their department;
  staff see their own tasks and the shared knowledge they're entitled to.
- **Knowledge visibility.** Some documents are company-wide (handbook, safety);
  some are department-only (finance policies, HR records); some are restricted
  (board materials, salaries).
- **Workflow authority.** Approval limits are role-based (e.g. a manager approves
  up to a threshold; above it escalates to a director).
- **Audit.** Every access and action is recorded and visible to Security/IT.
- **Tenant isolation (for the OIZ story).** The demo can show NovaMak as one
  tenant among several, with strict isolation between member companies.

Permissions are deterministic and documented in `DEMO_USERS.md` and
`DEMO_DATASET_SPEC.md`.

---

## 10. Demo workflows

Approximately **25 realistic enterprise workflows** — purchase approval, leave,
expense, recruitment, asset request, incident, maintenance, corrective action,
customer complaint, supplier evaluation, risk assessment, contract approval,
invoice, document approval, training, IT request, password reset, access request,
visitor management, CAPA, quality inspection, production change, internal audit,
management approval, emergency process. Each defines actors, steps, approvals,
SLA, AI assistance and KPIs. Defined in `DEMO_WORKFLOWS.md`.

---

## 11. Demo AI interactions

Every AI interaction in the demo is:
- **Grounded** in the demo knowledge base (`DEMO_KNOWLEDGE_BASE.md`) and **cites**
  its sources.
- **Scoped** to the user's permissions (an assistant won't reveal restricted docs).
- **Governed** — it escalates to a human when a decision or approval is required.
- **Deterministic** — canned-but-realistic exchanges so the demo never varies.
- **Bilingual** — answers in the user's language (TR/EN).

Representative interactions are scripted per scenario (§4) and per agent
(`DEMO_AI_AGENTS.md`).

---

## 12. Demo Company Brain

The Company Brain is NovaMak's living memory: policies, procedures, manuals, work
instructions, forms, standards, meeting notes, incident and maintenance records,
and reference documents — organized in a hierarchy with metadata, tags and
relationships. Fully specified in `DEMO_KNOWLEDGE_BASE.md`. In the demo it visibly
grows as work happens and always stays inside NovaMak's perimeter.

---

## 13. Demo Digital Employees

A set of department AI assistants (Digital Employees): HR, Legal, Finance,
Operations, Quality, Production, Maintenance, Knowledge, Document, Executive, Risk
and Security assistants. Each has defined responsibilities, capabilities,
knowledge sources, limits, prompt style, typical conversations and escalation
rules. Defined in `DEMO_AI_AGENTS.md`.

---

## 14. Demo dashboards

Role-specific dashboards: Executive, Department, Knowledge, Workflow, AI,
Operations, HR, Finance, Security and Analytics. Each defines its widgets, KPIs,
charts, filters, permissions, refresh policy and drill-downs. Defined in
`DEMO_DASHBOARDS.md`. Dashboards are populated with the same consistent dataset so
numbers reconcile across views.

---

## 15. Demo reports

Pre-built, believable reports the presenter can open on cue: monthly operations
summary, quality/CAPA report, maintenance report, HR headcount & leave report,
finance approval report, procurement/supplier report, security & access audit
report, and a marketing campaign performance report. Each is generated from the
demo dataset and is internally consistent with the dashboards.

---

## 16. Demo documents

A realistic corpus of company documents (policies, procedures, manuals, forms,
standards, records) — enough to make knowledge search convincing, curated so every
demo question has a good, citable answer. Specified in `DEMO_KNOWLEDGE_BASE.md`
with a hierarchy, metadata, tags and relationships.

---

## 17. Demo analytics

The demo shows analytics that reconcile with the underlying data: knowledge usage
(questions asked, answer quality, top documents), workflow throughput (volume,
cycle time, SLA adherence), AI activity (interactions per assistant, escalation
rate), and operational KPIs (production, quality, maintenance). Defined across
`DEMO_DASHBOARDS.md` and `DEMO_DATASET_SPEC.md`.

---

## 18. Demo KPIs

Headline demo KPIs (illustrative but internally consistent):
- **Knowledge:** average answer time, % answered from the Brain, top questions.
- **Workflows:** average approval cycle time, SLA adherence %, backlog.
- **AI:** interactions/day per assistant, human-escalation %, satisfaction.
- **Operations:** on-time production %, first-pass quality %, maintenance
  compliance %.
- **Adoption:** active users, questions per user, workflows automated.

All KPI values are fixed in the dataset so every dashboard and report agrees.

---

## 19. Demo success criteria

A demo is successful when:
- Every scripted scenario runs end-to-end without an empty state or error.
- Every AI answer is accurate, cited, and permission-scoped.
- Dashboards, reports and analytics reconcile (no contradictory numbers).
- The sovereignty message lands (the prospect understands nothing leaves).
- The prospect asks about running it on their own data (the pilot cue).

---

## 20. Reset strategy

The demo must return to a pristine, identical state on demand.
- **One-click / one-command reset** restores all users, permissions, knowledge,
  workflows, AI memory, dashboards and reports to the canonical baseline.
- **Deterministic:** the reset always yields byte-for-byte the same demo world.
- **Fast:** target a short, predictable reset window between demos.
- **Safe:** reset never corrupts data and never touches anything outside the demo.
- Full design in `DEMO_RESET.md`; the seed and validation in the `demo/`
  implementation.

---

## 21. Demo maintenance

- **Single source of truth:** the demo dataset is defined once
  (`DEMO_DATASET_SPEC.md`) and seeded programmatically; docs and data never drift.
- **Versioned:** the demo world is versioned with AdOS releases; when the product
  changes, the demo is re-validated.
- **Validated:** an automated consistency check confirms the dataset is internally
  coherent (every workflow actor exists, every citation resolves, every KPI
  reconciles) before a demo is trusted.
- **Owned:** the Demo Experience Architect owns changes; additions must preserve
  believability, determinism and the sovereignty message.
- **Refreshed deliberately:** dates and figures are advanced on a schedule so the
  world never looks stale, always via the single source of truth.

---

## Appendix — Demo guardrails
- Not sample/test/production data — a designed, consistent demonstration world.
- Everything under `demo/`; never touches production or the app's tests.
- Believable, deterministic, permission-scoped, bilingual, sovereignty-forward.
- One company (NovaMak), one consistent dataset, many views.
- Every asset traces to this constitution and to `DEMO_DATASET_SPEC.md`.
