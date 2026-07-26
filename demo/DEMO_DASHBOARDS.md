# AdOS Demo — Dashboards

**10 role-specific dashboards** for **NovaMak Endüstri A.Ş.** Each defines
**Widgets**, **KPIs**, **Charts**, **Filters**, **Permissions** (tiers from
`DEMO_USERS.md`), **Refresh policy**, and **Drill-down**. All dashboards draw from
the single consistent dataset (`DEMO_DATASET_SPEC.md`), so numbers reconcile
across views. Fictional; isolated to `demo/`. Bilingual labels (TR/EN).

**Global rules:**
- **One dataset, many views** — a KPI shows the same value everywhere it appears.
- **Permission-scoped** — a user sees only their entitled data; restricted PII is
  hidden.
- **Drill-down everywhere** — every KPI/chart links to the underlying records
  (workflow items, documents, tickets), respecting permissions.
- **Refresh** is stated per dashboard; the demo dataset is fixed so values are
  stable during a demo (a "live" indicator shows recency without changing numbers).

---

## D1 — Executive Dashboard
- **Audience/Permissions:** `T0` GM (Elif Demir), `T1` directors. No salary-level
  PII.
- **Widgets:** company health score; three-plant status tiles; knowledge usage;
  workflow throughput; AI activity; open risks; revenue vs plan.
- **KPIs:** on-time production %, first-pass quality %, avg approval cycle time,
  questions answered by the Brain/day, active users, open high-risks.
- **Charts:** trend line (production on-time, 12 weeks); bar (workflow volume by
  type); donut (AI interactions by assistant); gauge (company health).
- **Filters:** plant, business unit, department, time range.
- **Refresh:** hourly (demo: fixed snapshot, "as of today").
- **Drill-down:** each tile → the department dashboard or the underlying records.

## D2 — Department Dashboard (template)
- **Audience/Permissions:** `T2` department manager; `T1` director (all depts).
- **Widgets:** department KPIs; my team's open tasks; department workflow queue;
  department knowledge usage; department AI assistant activity.
- **KPIs:** department cycle time, SLA adherence %, backlog, top questions asked.
- **Charts:** bar (tasks by status); line (SLA adherence trend); list (top
  documents).
- **Filters:** team, workflow type, status, time range.
- **Refresh:** every 15 min (demo: fixed).
- **Drill-down:** task → workflow item; question → cited document.
- *Instantiated per department (HR, Finance, Ops, Quality, etc.) with that
  department's data.*

## D3 — Knowledge Dashboard
- **Audience/Permissions:** `T2`+; knowledge managers; IT.
- **Widgets:** total documents by category; questions asked (volume + answer
  rate); top documents cited; unanswered/low-confidence questions; freshness
  (docs due for review).
- **KPIs:** % questions answered from the Brain, avg answer time, top-10 documents,
  docs overdue for review.
- **Charts:** bar (documents by category, 18 categories); line (questions/day);
  heat (usage by department); list (overdue reviews).
- **Filters:** category, department, language (TR/EN), time range.
- **Refresh:** hourly.
- **Drill-down:** document → metadata + related graph; question → transcript +
  citation.

## D4 — Workflow Dashboard
- **Audience/Permissions:** `T2`+ (own workflows); `T1` all.
- **Widgets:** active workflows by type; approvals pending (mine/all); cycle-time
  by workflow; SLA breaches; bottleneck stages.
- **KPIs:** avg approval cycle time, SLA adherence %, backlog count, escalation %.
- **Charts:** bar (volume by workflow, 25 types); box/line (cycle time);
  funnel (stage bottlenecks); list (breaches).
- **Filters:** workflow type, department, status, approver, time range.
- **Refresh:** every 15 min.
- **Drill-down:** workflow item → full audit trail + actors + AI assistance log.

## D5 — AI Dashboard
- **Audience/Permissions:** `T2`+ IT (Burak Öztürk); executives (summary).
- **Widgets:** interactions per assistant; human-escalation rate; answer
  confidence; top intents; local-model status (sovereignty indicator: "running
  locally, no egress").
- **KPIs:** interactions/day per assistant, escalation %, cited-answer %, avg
  response time, satisfaction.
- **Charts:** donut (interactions by assistant, 12 agents); line (usage trend);
  bar (escalation by assistant); status chip (local model, no cloud).
- **Filters:** assistant, department, language, time range.
- **Refresh:** every 5 min.
- **Drill-down:** assistant → conversation samples (permission-scoped) + cited
  sources.

## D6 — Operations Dashboard
- **Audience/Permissions:** `T1` Operations Director (Hakan Çelik); `T2` Production/
  Maintenance/Warehouse managers.
- **Widgets:** production output vs plan (3 plants); machine uptime; maintenance
  backlog; stock levels/shortages; on-time dispatch.
- **KPIs:** on-time production %, machine uptime %, MTTR, PM compliance %, stock
  coverage days.
- **Charts:** bar (output by plant); line (uptime trend); list (maintenance
  backlog); gauge (stock coverage).
- **Filters:** plant, line, asset, shift, time range.
- **Refresh:** every 15 min.
- **Drill-down:** asset → maintenance history (KB-MNT-003); shortage → purchase
  workflow.

## D7 — HR Dashboard
- **Audience/Permissions:** `T1` HR Director (Ayşe Kaya); `T2` HR managers.
  Restricted PII visible only to HR.
- **Widgets:** headcount by department/site; open leave requests; recruitment
  pipeline; training compliance; onboarding status.
- **KPIs:** headcount, leave approval time, time-to-hire, mandatory-training
  compliance %, onboarding completion %.
- **Charts:** bar (headcount by department); funnel (recruitment); donut (training
  compliance); list (pending leave).
- **Filters:** department, site, status, time range.
- **Refresh:** hourly.
- **Drill-down:** requisition → recruitment workflow; leave → leave workflow.

## D8 — Finance Dashboard
- **Audience/Permissions:** `T1` Finance Director (Canan Arslan); `T2` accounting.
- **Widgets:** spend vs budget; pending approvals (purchase/expense/invoice);
  invoice-match exceptions; on-time payment; approval cycle time.
- **KPIs:** spend vs budget, avg approval cycle time, match-exception %, on-time
  payment %, expense-policy violations.
- **Charts:** bar (spend by department/unit); line (approval cycle trend); list
  (pending approvals); donut (invoice status).
- **Filters:** department, unit, workflow type, amount band, time range.
- **Refresh:** hourly.
- **Drill-down:** approval → workflow item + policy check log (Finance Assistant).

## D9 — Security Dashboard
- **Audience/Permissions:** `T2` Security Manager (Tarık Güneş) + IT; **Audit
  overlay**. Restricted.
- **Widgets:** access requests (pending/granted); audit-event stream; visitor log;
  anomaly flags; least-privilege findings; sovereignty indicator ("no data
  egress").
- **KPIs:** access provisioning time, over-privilege findings, unescorted-visitor
  incidents, audit coverage %, open security actions.
- **Charts:** line (audit events/day); bar (access by system); list (visitors
  today); flag list (anomalies).
- **Filters:** system, user, event type, area, time range.
- **Refresh:** every 5 min.
- **Drill-down:** event → full audit record (KB-SEC-004 scope); access → access
  workflow.

## D10 — Analytics Dashboard
- **Audience/Permissions:** `T1`+ analysts; executives.
- **Widgets:** cross-domain analytics — knowledge vs adoption; workflow efficiency
  trends; AI ROI proxy (time saved); department comparison; correlation views.
- **KPIs:** adoption (active users, questions/user), workflow efficiency (cycle-
  time trend), AI leverage (interactions, escalation %), quality/ops composite.
- **Charts:** multi-line (trends); scatter (usage vs cycle time); bar
  (department comparison); cohort (adoption over time). All illustrative,
  reconciling to the dataset.
- **Filters:** metric, department, site, time range, segment.
- **Refresh:** hourly.
- **Drill-down:** any point → underlying dashboard (D3/D4/D5) records.

---

## Dashboard index

| # | Dashboard | Primary audience | Refresh | Key drill-down |
| --- | --- | --- | --- | --- |
| D1 | Executive | GM, directors | hourly | dept dashboards |
| D2 | Department | dept managers | 15 min | workflow items |
| D3 | Knowledge | knowledge mgrs, IT | hourly | documents + graph |
| D4 | Workflow | managers | 15 min | audit trails |
| D5 | AI | IT, execs | 5 min | conversations |
| D6 | Operations | Ops Director, mgrs | 15 min | asset history |
| D7 | HR | HR (restricted PII) | hourly | recruitment/leave |
| D8 | Finance | Finance | hourly | approval items |
| D9 | Security | Security + IT (audit) | 5 min | audit records |
| D10 | Analytics | analysts, execs | hourly | source dashboards |

## Consistency contract
- Every KPI is defined once in `DEMO_DATASET_SPEC.md` and shown identically
  wherever it appears.
- Every drill-down resolves to a real seeded record (workflow item, document,
  ticket, conversation).
- Permissions match `DEMO_USERS.md`; restricted data (PII, audit, board notes)
  never appears to unentitled roles.
- Every dashboard shows the **sovereignty indicator** — data local, no egress —
  reinforcing the core message.
