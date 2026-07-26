# AdOS Demo — Users

**~42 realistic users** for the demo enterprise **NovaMak Endüstri A.Ş.**,
consistent with the org chart in `DEMO_COMPANY.md`. Each user has: **Role**,
**Department**, **Responsibilities**, **Permissions**, **Typical daily tasks**,
**AI usage**, **Workflow ownership**. Fictional; isolated to `demo/`.

**Permission tiers (referenced below):**
- **T0 Executive** — company-wide read; strategic dashboards; no HR-restricted PII.
- **T1 Director** — full access to their division + company-wide knowledge.
- **T2 Manager** — full access to their department; approves within limits.
- **T3 Specialist** — their department's tools/knowledge; task-level actions.
- **T4 Operator/Staff** — own tasks + shared company knowledge; no approvals.
- **Admin (IT)** and **Audit (Security)** are cross-cutting overlays.

Login format for the demo: `ad.soyad@novamak.com.tr`.

---

## Executive / Management

### Elif Demir — General Manager · Executive `T0`
- **Responsibilities:** overall performance, strategy, board reporting, cross-
  division decisions.
- **Permissions:** company-wide read; Executive Dashboard; all reports; no salary-
  level PII.
- **Daily tasks:** review Executive Dashboard, approve above-threshold items, ask
  strategic questions of the Executive Assistant.
- **AI usage:** Executive Assistant (KPIs, summaries, "how are the three plants
  doing?").
- **Workflow ownership:** final approver on Management Approval and above-limit
  Contract/Purchase Approvals.

---

## Operations

### Hakan Çelik — Operations Director · Operations `T1`
- **Responsibilities:** production, maintenance, warehouse across all plants;
  operational KPIs.
- **Permissions:** full Operations division; Operations Dashboard; company-wide
  knowledge.
- **Daily tasks:** review plant output, resolve escalations, approve operational
  spend within limit.
- **AI usage:** Operations Assistant (cross-plant status, bottleneck questions).
- **Workflow ownership:** Production Change (approver), Management Approval (Ops).

### Kerem Yılmaz — Production Manager · Production `T2`
- **Responsibilities:** production planning and output at Plant 1; shift teams.
- **Permissions:** Production department; raises purchase/maintenance requests;
  approves within manager limit.
- **Daily tasks:** plan shifts, monitor output, raise material purchases, log
  production changes.
- **AI usage:** Production Assistant (schedules, work instructions), Finance
  Assistant (budget check on purchases).
- **Workflow ownership:** Purchase Approval (initiator), Production Change (owner).

### Serkan Aydın — Production Supervisor (Plant 1) · Production `T3`
- **Responsibilities:** shift execution, team leadership, first-line issues.
- **Permissions:** Plant 1 production tasks; shared work instructions.
- **Daily tasks:** run shift, assign operators, escalate stoppages, confirm output.
- **AI usage:** Production/Knowledge Assistant (work instructions, setup sheets).
- **Workflow ownership:** Incident (initiator), Maintenance request (initiator).

### Emre Koç — Production Supervisor (Plant 2) · Production `T3`
- **Responsibilities:** welding/fabrication shift at Plant 2.
- **Permissions:** Plant 2 production tasks; shared knowledge; HSE read.
- **Daily tasks:** manage welding cells, monitor HSE compliance, report output.
- **AI usage:** Production/HSE Assistant (procedures, PPE rules).
- **Workflow ownership:** Incident (initiator), Quality Inspection (requester).

### Fatma Şen — Production Planner · Production `T3`
- **Responsibilities:** master schedule, capacity, material availability.
- **Permissions:** Production planning; read Warehouse stock; read Sales orders.
- **Daily tasks:** build/adjust schedule, check material, flag shortages.
- **AI usage:** Operations Assistant (capacity/lead-time questions).
- **Workflow ownership:** Production Change (contributor).

### Ali Vural — CNC Operator / Team Lead · Production `T4`
- **Responsibilities:** operate machining centers; lead a small team.
- **Permissions:** own tasks; work instructions; report faults.
- **Daily tasks:** run parts, first-off checks, log a fault if a machine stops.
- **AI usage:** Knowledge Assistant (setup sheets, tolerances).
- **Workflow ownership:** Maintenance request (initiator).

---

## Maintenance

### Mustafa Doğan — Maintenance Manager · Maintenance `T2`
- **Responsibilities:** preventive + corrective maintenance across plants; asset
  reliability.
- **Permissions:** Maintenance department; asset records; approves maintenance
  spend within limit.
- **Daily tasks:** schedule PM, assign work orders, review recurring faults.
- **AI usage:** Maintenance Assistant (fault diagnosis, manuals, history).
- **Workflow ownership:** Maintenance (owner), Asset Request (approver).

### Mehmet Aslan — Maintenance Engineer (new hire) · Maintenance `T3`
- **Responsibilities:** diagnose and fix machine faults; improve reliability.
- **Permissions:** Maintenance tasks; asset manuals; maintenance history.
- **Daily tasks:** respond to work orders, diagnose faults, record fixes.
- **AI usage:** **Primary demo persona** — asks the Maintenance/Knowledge
  Assistant how to handle a specific fault; gets a cited answer from the manual.
- **Workflow ownership:** Maintenance (executor), Corrective Action (contributor).

### Okan Er — Maintenance Technician · Maintenance `T4`
- **Responsibilities:** hands-on repairs and PM tasks.
- **Permissions:** own work orders; manuals; spare-parts lookup.
- **Daily tasks:** execute PM checklists, replace parts, close work orders.
- **AI usage:** Maintenance Assistant (step-by-step procedures, part numbers).
- **Workflow ownership:** Maintenance (executor).

---

## Quality

### Zeynep Şahin — Quality Manager · Quality `T2`
- **Responsibilities:** quality management system, ISO compliance, CAPA, audits.
- **Permissions:** Quality department; CAPA/inspection records; company-wide
  procedures.
- **Daily tasks:** review inspections, manage CAPA, prepare for audits.
- **AI usage:** **Demo persona** — Quality Assistant proposes CAPA steps from ISO
  procedures; human approves.
- **Workflow ownership:** CAPA (owner), Corrective Action (owner), Quality
  Inspection (approver), Internal Audit (owner).

### Deniz Acar — Quality Engineer · Quality `T3`
- **Responsibilities:** process quality, root-cause analysis, supplier quality.
- **Permissions:** Quality tasks; inspection + supplier records.
- **Daily tasks:** investigate non-conformities, run 8D/root-cause, update
  standards.
- **AI usage:** Quality Assistant (root-cause guidance, standard lookup).
- **Workflow ownership:** Corrective Action (executor), Supplier Evaluation
  (contributor).

### Gökhan Uz — Quality Inspector · Quality `T4`
- **Responsibilities:** incoming/in-process/final inspection.
- **Permissions:** inspection tasks; standards; measurement records.
- **Daily tasks:** inspect parts, record results, raise non-conformities.
- **AI usage:** Quality/Knowledge Assistant (inspection criteria, standards).
- **Workflow ownership:** Quality Inspection (executor).

---

## Health, Safety & Environment (HSE)

### Barış Yıldız — HSE Manager · HSE `T2`
- **Responsibilities:** occupational safety, environmental compliance, risk
  assessment, emergency preparedness.
- **Permissions:** HSE department; incident/risk records; company-wide safety
  knowledge.
- **Daily tasks:** review incidents, run risk assessments, drive corrective
  actions, prepare ISO 45001/14001 evidence.
- **AI usage:** Risk/HSE Assistant (risk methodology, legal requirements).
- **Workflow ownership:** Risk Assessment (owner), Incident (approver), Emergency
  Process (owner).

### Selin Ak — HSE Officer · HSE `T3`
- **Responsibilities:** site safety at the plants; training; PPE; audits.
- **Permissions:** HSE tasks; incident records; training records.
- **Daily tasks:** site walks, log incidents, run safety training, check PPE.
- **AI usage:** HSE Assistant (procedures, PPE matrix, training content).
- **Workflow ownership:** Incident (executor), Training (initiator).

---

## Human Resources

### Ayşe Kaya — HR Director · HR `T1`
- **Responsibilities:** people strategy, recruitment, payroll oversight, policy,
  labor compliance.
- **Permissions:** full HR (including restricted PII); HR Dashboard; company-wide
  policy.
- **Daily tasks:** approve leave/recruitment, resolve HR cases, oversee payroll.
- **AI usage:** **Demo persona** — HR Assistant answers policy questions;
  onboarding.
- **Workflow ownership:** Recruitment (owner), Vacation/Leave (approver),
  Training (approver).

### Nalan Er — HR Specialist (Recruitment) · HR `T3`
- **Responsibilities:** hiring pipeline, interviews, onboarding.
- **Permissions:** recruitment records; candidate data; onboarding checklists.
- **Daily tasks:** post roles, screen candidates, schedule interviews, onboard
  hires.
- **AI usage:** HR Assistant (job descriptions, onboarding steps).
- **Workflow ownership:** Recruitment (executor).

### Tuğçe Al — HR Specialist (Payroll & Records) · HR `T3`
- **Responsibilities:** payroll input, leave records, employee data.
- **Permissions:** payroll + leave records (restricted PII).
- **Daily tasks:** process leave requests, maintain records, prepare payroll.
- **AI usage:** HR Assistant (leave policy, calculations guidance).
- **Workflow ownership:** Vacation/Leave (processor).

---

## Finance & Accounting

### Canan Arslan — Finance Director · Finance `T1`
- **Responsibilities:** financial control, budgets, approvals, reporting,
  compliance.
- **Permissions:** full Finance; Finance Dashboard; approves above manager limit.
- **Daily tasks:** review budgets, approve expenses/invoices/contracts, close
  month.
- **AI usage:** **Demo persona** — Finance Assistant checks budget/policy on
  approvals.
- **Workflow ownership:** Expense (approver), Invoice (approver), Contract
  Approval (approver), Management Approval (Finance).

### Ozan Kurt — Accounting Manager · Finance `T2`
- **Responsibilities:** accounts payable/receivable, ledger, tax.
- **Permissions:** accounting records; invoice processing; approves within limit.
- **Daily tasks:** process invoices, reconcile accounts, manage AP/AR.
- **AI usage:** Finance Assistant (invoice matching, policy checks).
- **Workflow ownership:** Invoice (owner), Expense (processor).

### Derya Kılıç — Accountant · Finance `T3`
- **Responsibilities:** bookkeeping, expense processing, documentation.
- **Permissions:** accounting tasks; expense records.
- **Daily tasks:** enter transactions, process expenses, file documents.
- **AI usage:** Finance/Document Assistant (categorization, form help).
- **Workflow ownership:** Expense (processor).

---

## Procurement

### Levent Bozkurt — Procurement Manager · Procurement `T2`
- **Responsibilities:** purchasing, supplier management, contracts, cost.
- **Permissions:** Procurement; supplier + contract records; approves within
  limit.
- **Daily tasks:** process purchase requests, negotiate, evaluate suppliers.
- **AI usage:** Finance/Knowledge Assistant (policy, supplier history, contracts).
- **Workflow ownership:** Purchase Approval (owner), Supplier Evaluation (owner),
  Contract Approval (initiator).

### Pelin Ay — Buyer · Procurement `T3`
- **Responsibilities:** RFQs, POs, delivery follow-up.
- **Permissions:** purchasing tasks; supplier catalog; PO records.
- **Daily tasks:** raise RFQs, issue POs, chase deliveries.
- **AI usage:** Knowledge Assistant (supplier terms, part sourcing).
- **Workflow ownership:** Purchase Approval (processor).

---

## IT

### Burak Öztürk — IT Manager · IT `T2` + **Admin**
- **Responsibilities:** infrastructure, applications, access, IT security, the
  on-prem AdOS deployment.
- **Permissions:** IT admin; access management; audit read; AI Dashboard.
- **Daily tasks:** approve access, manage systems, monitor AdOS, run IT tickets.
- **AI usage:** **Demo persona** — shows admin, tenant isolation, audit trail.
- **Workflow ownership:** IT Request (owner), Access Request (approver), Password
  Reset (owner).

### Cem Yalın — System Administrator · IT `T3` + **Admin**
- **Responsibilities:** servers, backups, monitoring, AdOS operations.
- **Permissions:** system admin; backup/monitoring; no HR PII.
- **Daily tasks:** run backups, monitor health, patch systems, support AdOS.
- **AI usage:** Knowledge Assistant (runbooks, procedures).
- **Workflow ownership:** IT Request (executor).

### Ece Nur — IT Support Specialist · IT `T4`
- **Responsibilities:** help desk, first-line support, device setup.
- **Permissions:** ticket system; knowledge base; device records.
- **Daily tasks:** resolve tickets, reset passwords (with approval), set up
  devices.
- **AI usage:** Knowledge/Document Assistant (support articles, how-tos).
- **Workflow ownership:** Password Reset (executor), IT Request (executor).

---

## Security

### Tarık Güneş — Security Manager · Security `T2` + **Audit**
- **Responsibilities:** physical + information security, access control, audit,
  visitor management.
- **Permissions:** Security Dashboard; full audit log; access + visitor records.
- **Daily tasks:** review audit trail, manage access, oversee visitors, respond
  to alerts.
- **AI usage:** Security Assistant (audit queries, policy, anomaly summaries).
- **Workflow ownership:** Access Request (reviewer), Visitor Management (owner),
  Emergency Process (contributor).

### Volkan Ateş — Security Officer · Security `T4`
- **Responsibilities:** site security, gate control, visitor check-in.
- **Permissions:** visitor + access tasks; incident logging.
- **Daily tasks:** manage gate, register visitors, patrol, log incidents.
- **AI usage:** Security Assistant (procedures, visitor policy).
- **Workflow ownership:** Visitor Management (executor).

---

## Engineering & R&D

### Onur Kaplan — Engineering Director · Engineering `T1`
- **Responsibilities:** product design, R&D, industrialization, technical
  standards.
- **Permissions:** full Engineering; design + standards records; company-wide
  knowledge.
- **Daily tasks:** review designs, approve engineering changes, guide R&D.
- **AI usage:** Knowledge/Document Assistant (standards, prior designs).
- **Workflow ownership:** Document Approval (engineering), Production Change
  (technical approver).

### Sibel Demirtaş — Design Engineer · Engineering `T3`
- **Responsibilities:** CAD design, drawings, BOMs, revisions.
- **Permissions:** design tasks; drawing + standards library.
- **Daily tasks:** create/revise drawings, manage BOMs, submit for approval.
- **AI usage:** Document Assistant (standards, drawing templates, revision help).
- **Workflow ownership:** Document Approval (initiator).

### Kaan Yücel — R&D Engineer · Engineering `T3`
- **Responsibilities:** prototypes, testing, new product development.
- **Permissions:** R&D tasks; test records; standards.
- **Daily tasks:** run experiments, record results, propose designs.
- **AI usage:** Knowledge Assistant (research notes, test standards).
- **Workflow ownership:** Document Approval (contributor).

---

## Commercial — Sales

### Murat Şahin — Commercial Director · Sales `T1`
- **Responsibilities:** sales, marketing, support; revenue and customer strategy.
- **Permissions:** full Commercial; sales pipeline; company-wide knowledge.
- **Daily tasks:** review pipeline, approve quotes/contracts, manage key accounts.
- **AI usage:** Executive/Knowledge Assistant (pipeline, account summaries).
- **Workflow ownership:** Contract Approval (commercial), Customer Complaint
  (escalation).

### İpek Kara — Sales Manager · Sales `T2`
- **Responsibilities:** domestic sales team, quotes, orders, targets.
- **Permissions:** Sales department; customer + order records; approves quotes
  within limit.
- **Daily tasks:** manage quotes, follow orders, coach reps.
- **AI usage:** Knowledge Assistant (product specs, pricing policy).
- **Workflow ownership:** Contract Approval (initiator), Customer Complaint
  (owner).

### Berk Aydın — Sales Representative · Sales `T3`
- **Responsibilities:** accounts, quotes, order entry, customer relationships.
- **Permissions:** own accounts; quote + order tasks.
- **Daily tasks:** visit customers, prepare quotes, enter orders.
- **AI usage:** Knowledge Assistant (specs, lead times, references).
- **Workflow ownership:** Customer Complaint (initiator).

### Ceren Işık — Export Sales Specialist · Sales `T3`
- **Responsibilities:** export accounts (English), customs docs, compliance.
- **Permissions:** export accounts; documentation; standards.
- **Daily tasks:** manage export orders, prepare docs, coordinate logistics.
- **AI usage:** Document Assistant (English docs, export paperwork).
- **Workflow ownership:** Contract Approval (export), Document Approval (export
  docs).

---

## Marketing

### Aslı Yıldırım — Marketing Manager · Marketing `T2`
- **Responsibilities:** brand, campaigns, content, lead generation.
- **Permissions:** Marketing department; brand assets; campaign tools.
- **Daily tasks:** plan campaigns, approve creative, manage brand.
- **AI usage:** **Advertising pipeline** — states an objective; AdOS produces
  brief → creative → campaign on local models (sovereignty scenario).
- **Workflow ownership:** Management Approval (marketing spend), campaign approvals.

### Efe Demir — Marketing Specialist · Marketing `T3`
- **Responsibilities:** content, social, campaign execution, assets.
- **Permissions:** campaign tasks; asset library.
- **Daily tasks:** produce content, run campaigns, manage the asset library.
- **AI usage:** Creative/Document Assistant (copy, asset versioning).
- **Workflow ownership:** Document Approval (marketing assets).

---

## Customer Support

### Gizem Ünal — Support Manager · Support `T2`
- **Responsibilities:** after-sales support, complaints, field-service
  coordination, SLAs.
- **Permissions:** Support department; complaint + service records; customer data.
- **Daily tasks:** manage tickets, resolve complaints, dispatch field service.
- **AI usage:** Knowledge Assistant (product manuals, complaint history).
- **Workflow ownership:** Customer Complaint (owner), CAPA (initiator from field).

### Hüseyin Bal — Support Specialist / Field-Service Coordinator · Support `T3`
- **Responsibilities:** handle tickets, coordinate on-site service, spare parts.
- **Permissions:** ticket + service tasks; manuals; parts lookup.
- **Daily tasks:** log/triage tickets, schedule service, order spares.
- **AI usage:** Maintenance/Knowledge Assistant (manuals, part numbers).
- **Workflow ownership:** Customer Complaint (executor).

---

## Warehouse & Logistics

### Serdar Kaya — Warehouse Manager · Warehouse `T2`
- **Responsibilities:** inventory, receiving, dispatch, logistics across the
  central warehouse and plant stores.
- **Permissions:** Warehouse department; stock + movement records; approves within
  limit.
- **Daily tasks:** manage stock, oversee receiving/dispatch, coordinate logistics.
- **AI usage:** Operations Assistant (stock levels, movement history).
- **Workflow ownership:** Asset Request (fulfilment), Purchase Approval (goods
  receipt).

### Melis Tan — Logistics Coordinator · Warehouse `T3`
- **Responsibilities:** inbound/outbound scheduling, carriers, customs
  coordination.
- **Permissions:** logistics tasks; shipment + carrier records.
- **Daily tasks:** schedule shipments, track deliveries, coordinate carriers.
- **AI usage:** Knowledge Assistant (shipping docs, carrier terms).
- **Workflow ownership:** Visitor Management (carriers), Document Approval
  (shipping docs).

### Yusuf Er — Warehouse Operator / Team Lead · Warehouse `T4`
- **Responsibilities:** receiving, put-away, picking, dispatch; lead a small team.
- **Permissions:** warehouse tasks; stock lookup.
- **Daily tasks:** receive goods, pick orders, stage dispatch, update stock.
- **AI usage:** Operations/Knowledge Assistant (procedures, locations).
- **Workflow ownership:** Asset Request (executor).

---

## Roster summary

| Department | Users |
| --- | --- |
| Executive | 1 |
| Operations | 1 |
| Production | 5 |
| Maintenance | 3 |
| Quality | 3 |
| HSE | 2 |
| HR | 3 |
| Finance | 3 |
| Procurement | 2 |
| IT | 3 |
| Security | 2 |
| Engineering | 3 |
| Sales | 4 |
| Marketing | 2 |
| Support | 2 |
| Warehouse | 3 |
| **Total** | **42** |

All users, permissions and workflow ownerships are fixed and reconcile with
`DEMO_COMPANY.md`, `DEMO_WORKFLOWS.md`, `DEMO_AI_AGENTS.md` and
`DEMO_DATASET_SPEC.md`.
