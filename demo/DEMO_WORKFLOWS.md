# AdOS Demo — Workflows

**25 realistic enterprise workflows** for **NovaMak Endüstri A.Ş.** Each defines
**Actors** (from `DEMO_USERS.md`), **Steps**, **Approvals**, **SLA**, **AI
assistance** (from `DEMO_AI_AGENTS.md`), and **KPIs**. Grounded in the knowledge
base (`DEMO_KNOWLEDGE_BASE.md`). Fictional; isolated to `demo/`.

**Conventions:** approval limits follow `KB-POL-004` (Delegation of Authority).
Every workflow is audited; every AI step cites its source and escalates to a
human for decisions.

---

### WF-01 — Purchase Approval
- **Actors:** initiator (Kerem Yılmaz / any manager), Buyer (Pelin Ay),
  Procurement Manager (Levent Bozkurt), Finance approver (Ozan Kurt / Canan
  Arslan), Warehouse (Serdar Kaya, receipt).
- **Steps:** raise request (KB-FRM-001) → budget/policy check → sourcing/RFQ →
  approval → PO → goods receipt → close.
- **Approvals:** manager ≤ ₺25k; Procurement Manager ≤ ₺100k; Finance Director ≤
  ₺500k; GM above.
- **SLA:** approval within 2 business days; PO within 1 day of approval.
- **AI assistance:** Finance Assistant checks budget + policy; Knowledge Assistant
  suggests approved suppliers (KB-PUR-002).
- **KPIs:** avg approval cycle time, % within SLA, spend vs budget, maverick-buy %.

### WF-02 — Vacation / Leave
- **Actors:** employee, line manager, HR Specialist (Tuğçe Al), HR Director (Ayşe
  Kaya).
- **Steps:** submit (KB-FRM-002) → balance check → manager approval → HR record.
- **Approvals:** line manager; HR for policy exceptions.
- **SLA:** decision within 1 business day.
- **AI assistance:** HR Assistant checks leave policy (KB-HR-002) and balance.
- **KPIs:** avg approval time, leave utilization, policy exceptions.

### WF-03 — Expense
- **Actors:** employee, manager, Accountant (Derya Kılıç), Finance (Ozan/Canan).
- **Steps:** submit (KB-FRM-003) → policy check → manager approval → finance
  processing → reimbursement.
- **Approvals:** manager ≤ ₺10k; Finance above.
- **SLA:** reimbursement within 5 business days.
- **AI assistance:** Finance Assistant validates against expense policy (KB-HR-003).
- **KPIs:** cycle time, policy-violation %, reimbursement backlog.

### WF-04 — Recruitment
- **Actors:** hiring manager, HR Specialist (Nalan Er), HR Director, interview
  panel.
- **Steps:** raise requisition → approval → post → screen → interview → offer →
  onboarding.
- **Approvals:** department director + HR Director; GM for new headcount.
- **SLA:** shortlist within 10 business days.
- **AI assistance:** HR Assistant drafts job descriptions (KB-HR-005), prepares
  onboarding (KB-HR-004).
- **KPIs:** time-to-hire, offer-accept %, onboarding completion.

### WF-05 — Asset Request
- **Actors:** requester, manager, Warehouse (Serdar Kaya / Yusuf Er), IT (for IT
  assets: Burak Öztürk).
- **Steps:** request → approval → fulfil from stock or purchase → issue → record.
- **Approvals:** manager; Procurement if purchase needed.
- **SLA:** fulfil within 3 business days if in stock.
- **AI assistance:** Operations Assistant checks stock/availability.
- **KPIs:** fulfilment time, in-stock %, asset utilization.

### WF-06 — Incident
- **Actors:** reporter (any), HSE Officer (Selin Ak), HSE Manager (Barış Yıldız),
  Quality (if quality-related).
- **Steps:** report (KB-FRM-004) → triage → immediate action → investigation →
  corrective action → close.
- **Approvals:** HSE Manager closes; escalation to director for serious incidents.
- **SLA:** acknowledge within 1 hour; investigation within 5 days.
- **AI assistance:** Risk/HSE Assistant classifies severity, cites procedures
  (KB-EMG-001, KB-STD-003).
- **KPIs:** incidents by type, time-to-close, recurrence, near-miss ratio.

### WF-07 — Maintenance
- **Actors:** requester (Ali Vural / supervisor), Maintenance Manager (Mustafa
  Doğan), Engineer (Mehmet Aslan), Technician (Okan Er).
- **Steps:** raise work order → prioritize → diagnose → repair → verify → close;
  update asset history (KB-MNT-003).
- **Approvals:** Maintenance Manager for spend/parts.
- **SLA:** critical fault response within 2 hours; PM per plan (KB-MNT-001).
- **AI assistance:** Maintenance Assistant diagnoses from fault guide (KB-MNT-004)
  and history. **← demo scenario.**
- **KPIs:** MTTR, PM compliance %, repeat-fault %, machine uptime.

### WF-08 — Corrective Action
- **Actors:** Quality Engineer (Deniz Acar), Quality Manager (Zeynep Şahin),
  process owner.
- **Steps:** identify → root cause → action plan → implement → verify → close
  (KB-PRC-003).
- **Approvals:** Quality Manager verifies and closes.
- **SLA:** plan within 3 days; closure within 30 days.
- **AI assistance:** Quality Assistant guides root-cause and links related NCRs
  (KB-INC-003).
- **KPIs:** open actions, on-time closure %, recurrence.

### WF-09 — Customer Complaint
- **Actors:** Support Specialist (Hüseyin Bal), Support Manager (Gizem Ünal),
  Sales (İpek Kara), Quality (if product fault).
- **Steps:** log → categorize → investigate → resolve → respond → (CAPA if
  systemic).
- **Approvals:** Support Manager; Quality for CAPA.
- **SLA:** acknowledge within 4 hours; resolve within 5 business days.
- **AI assistance:** Knowledge Assistant retrieves product manuals + history;
  drafts a response.
- **KPIs:** complaint volume, resolution time, CSAT, repeat complaints.

### WF-10 — Supplier Evaluation
- **Actors:** Procurement Manager (Levent Bozkurt), Quality Engineer (Deniz Acar),
  requesting dept.
- **Steps:** schedule evaluation → score (quality, delivery, price, risk) →
  review → approve/flag (KB-PUR-003).
- **Approvals:** Procurement + Quality joint sign-off.
- **SLA:** quarterly for strategic suppliers.
- **AI assistance:** Knowledge Assistant compiles supplier history + incidents.
- **KPIs:** supplier score, on-time delivery %, defect ppm, single-source risks.

### WF-11 — Risk Assessment
- **Actors:** HSE Manager (Barış Yıldız), area owner, Quality.
- **Steps:** identify hazards → assess (likelihood × severity) → controls →
  approve → review.
- **Approvals:** HSE Manager; director for high risks.
- **SLA:** review annually or after change/incident.
- **AI assistance:** Risk Assistant applies methodology, cites legal requirements.
- **KPIs:** open high-risks, controls implemented %, overdue reviews.

### WF-12 — Contract Approval
- **Actors:** initiator (İpek Kara / Levent Bozkurt), Legal review (Legal
  Assistant + Finance), Finance Director (Canan Arslan), GM (Elif Demir).
- **Steps:** draft → legal/finance review → approval → sign → archive
  (KB-PUR-004).
- **Approvals:** Finance Director ≤ ₺1M; GM above; Board for strategic.
- **SLA:** review within 5 business days.
- **AI assistance:** Legal Assistant flags non-standard clauses; cites policy.
- **KPIs:** review cycle time, non-standard-clause rate, contracts in effect.

### WF-13 — Invoice
- **Actors:** Accountant (Derya Kılıç), Accounting Manager (Ozan Kurt), Finance
  Director.
- **Steps:** receive → 3-way match (PO/receipt/invoice) → approve → schedule
  payment.
- **Approvals:** Accounting Manager; Finance Director above limit.
- **SLA:** processed within 3 business days.
- **AI assistance:** Finance Assistant performs matching, flags discrepancies.
- **KPIs:** processing time, match-exception %, on-time payment %.

### WF-14 — Document Approval
- **Actors:** author (e.g. Sibel Demirtaş), reviewer, owner (dept head), Quality
  (document control, KB-PRC-001).
- **Steps:** draft → review → approve → publish (versioned) → notify.
- **Approvals:** department owner; Quality for controlled documents.
- **SLA:** review within 5 business days.
- **AI assistance:** Document Assistant checks template/standard, manages versions.
- **KPIs:** approval time, overdue reviews, superseded-version cleanliness.

### WF-15 — Training
- **Actors:** HR (Nalan Er), line manager, HSE (for safety training), employee.
- **Steps:** identify need → schedule → deliver → assess → record.
- **Approvals:** manager + HR; HSE for mandatory safety.
- **SLA:** mandatory training completed before role start.
- **AI assistance:** HR/HSE Assistant recommends modules, tracks completion.
- **KPIs:** completion %, mandatory-compliance %, competency coverage.

### WF-16 — IT Request
- **Actors:** requester, IT Support (Ece Nur), System Admin (Cem Yalın), IT
  Manager (Burak Öztürk).
- **Steps:** raise ticket → triage → resolve/provision → verify → close.
- **Approvals:** IT Manager for hardware/spend.
- **SLA:** standard 2 business days; priority same day.
- **AI assistance:** Knowledge Assistant answers from IT KB (KB-IT-004), suggests
  fixes.
- **KPIs:** resolution time, first-contact-resolution %, reopened tickets.

### WF-17 — Password Reset
- **Actors:** requester, IT Support (Ece Nur), IT Manager (policy).
- **Steps:** request → identity verification → reset → confirm (KB-IT-003).
- **Approvals:** automated with verification; manager for privileged accounts.
- **SLA:** within 1 hour.
- **AI assistance:** Knowledge Assistant guides self-service steps.
- **KPIs:** reset time, self-service %, security exceptions.

### WF-18 — Access Request
- **Actors:** requester, manager, IT Manager (Burak Öztürk), Security (Tarık
  Güneş, review).
- **Steps:** request (KB-FRM-005) → manager approval → security review → grant →
  record + audit (KB-IT-002).
- **Approvals:** manager + IT Manager; Security review for sensitive systems.
- **SLA:** within 2 business days.
- **AI assistance:** Security Assistant checks least-privilege, flags conflicts.
- **KPIs:** provisioning time, over-privilege findings, access-review coverage.

### WF-19 — Visitor Management
- **Actors:** host employee, Security Officer (Volkan Ateş), Security Manager
  (Tarık Güneş).
- **Steps:** pre-register → approve → check-in (badge) → escort rules → check-out
  (KB-SEC-003).
- **Approvals:** host + Security for restricted areas.
- **SLA:** pre-registration 1 day ahead; check-in < 5 minutes.
- **AI assistance:** Security Assistant applies visitor policy, restricted-area
  rules.
- **KPIs:** on-time registration %, unescorted-visitor incidents, throughput.

### WF-20 — CAPA (Corrective & Preventive Action)
- **Actors:** Quality Manager (Zeynep Şahin), process owner, HSE (if safety).
- **Steps:** trigger (incident/NCR/audit) → root cause → corrective +
  preventive actions → implement → verify effectiveness → close (KB-QUA-003).
- **Approvals:** Quality Manager closes after effectiveness check.
- **SLA:** corrective ≤ 30 days; preventive ≤ 60 days.
- **AI assistance:** Quality Assistant proposes CAPA steps from ISO procedures.
  **← demo scenario.**
- **KPIs:** open CAPAs, on-time closure %, effectiveness %, recurrence.

### WF-21 — Quality Inspection
- **Actors:** Inspector (Gökhan Uz), Quality Engineer (Deniz Acar), Production.
- **Steps:** trigger (incoming/in-process/final) → inspect vs standard → record →
  pass/hold/reject → disposition (KB-QUA-002).
- **Approvals:** Quality Engineer for rejects/concessions.
- **SLA:** incoming within 1 day of receipt.
- **AI assistance:** Quality Assistant retrieves inspection criteria and standards.
- **KPIs:** first-pass yield, defect ppm, inspection backlog, hold rate.

### WF-22 — Production Change
- **Actors:** initiator (Kerem Yılmaz / Fatma Şen), Engineering (Onur Kaplan),
  Quality (Zeynep Şahin), Operations Director (Hakan Çelik).
- **Steps:** propose change → impact assessment → approvals → implement → verify
  (KB-PRD-003, KB-PRC-002).
- **Approvals:** Engineering + Quality + Operations Director.
- **SLA:** assessment within 3 business days.
- **AI assistance:** Production Assistant summarizes impact, links standards.
- **KPIs:** change lead time, change-related defects, on-time implementation.

### WF-23 — Internal Audit
- **Actors:** Quality Manager (Zeynep Şahin), auditors, auditees, management.
- **Steps:** plan → conduct → findings → corrective actions → follow-up → report
  (KB-QUA-004).
- **Approvals:** Quality Manager; management review of results (KB-MTG-001).
- **SLA:** per annual audit plan; findings closed ≤ 30 days.
- **AI assistance:** Quality Assistant compiles evidence, tracks findings.
- **KPIs:** audits completed %, findings by severity, closure rate.

### WF-24 — Management Approval
- **Actors:** initiator, relevant director, General Manager (Elif Demir), Board
  (strategic).
- **Steps:** proposal → director endorsement → GM decision → record.
- **Approvals:** GM above director limits; Board for strategic/CAPEX.
- **SLA:** decision within 5 business days.
- **AI assistance:** Executive Assistant summarizes the proposal + supporting data.
- **KPIs:** decision cycle time, approval rate, value approved.

### WF-25 — Emergency Process
- **Actors:** any employee (trigger), HSE Manager (Barış Yıldız), Security (Tarık
  Güneş), Operations Director, GM.
- **Steps:** detect → alarm/evacuate → respond per plan → account for people →
  stabilize → review (KB-EMG-001, KB-EMG-002).
- **Approvals:** HSE Manager coordinates; GM for business-continuity decisions
  (KB-EMG-003).
- **SLA:** immediate; drills quarterly.
- **AI assistance:** Risk/Security Assistant surfaces the correct emergency
  procedure instantly (read-only; humans act).
- **KPIs:** drill completion %, response time, evacuation time, review actions.

---

## Workflow index

| # | Workflow | Owner (dept) | AI assistant |
| --- | --- | --- | --- |
| 01 | Purchase Approval | Procurement | Finance / Knowledge |
| 02 | Vacation / Leave | HR | HR |
| 03 | Expense | Finance | Finance |
| 04 | Recruitment | HR | HR |
| 05 | Asset Request | Warehouse/IT | Operations |
| 06 | Incident | HSE | Risk / HSE |
| 07 | Maintenance | Maintenance | Maintenance |
| 08 | Corrective Action | Quality | Quality |
| 09 | Customer Complaint | Support | Knowledge |
| 10 | Supplier Evaluation | Procurement | Knowledge |
| 11 | Risk Assessment | HSE | Risk |
| 12 | Contract Approval | Commercial/Finance | Legal |
| 13 | Invoice | Finance | Finance |
| 14 | Document Approval | Quality/dept | Document |
| 15 | Training | HR | HR / HSE |
| 16 | IT Request | IT | Knowledge |
| 17 | Password Reset | IT | Knowledge |
| 18 | Access Request | IT/Security | Security |
| 19 | Visitor Management | Security | Security |
| 20 | CAPA | Quality | Quality |
| 21 | Quality Inspection | Quality | Quality |
| 22 | Production Change | Production/Eng | Production |
| 23 | Internal Audit | Quality | Quality |
| 24 | Management Approval | Executive | Executive |
| 25 | Emergency Process | HSE/Security | Risk / Security |

Every actor exists in `DEMO_USERS.md`; every cited document exists in
`DEMO_KNOWLEDGE_BASE.md`; every assistant exists in `DEMO_AI_AGENTS.md`; every KPI
is populated in `DEMO_DASHBOARDS.md` / `DEMO_DATASET_SPEC.md`.
