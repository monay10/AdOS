# AdOS Demo — Dataset Specification

The **single source of truth** for the demo data. Everything the demo shows is
seeded from this spec so it is **internally consistent**: every reference resolves,
every KPI reconciles, and a reset reproduces it exactly. Fictional; isolated to
`demo/`. The `demo/` implementation seeds precisely these datasets and validates
them (`DEMO_RESET.md`).

**Design invariants (must always hold):**
1. Every foreign key resolves (no dangling references).
2. Every workflow item's actors exist in Employees; every approval respects the
   limits in `KB-POL-004`.
3. Every AI conversation cites a document that exists and is visible to the asking
   user.
4. Every KPI shown on a dashboard equals the aggregate of its underlying records.
5. All timestamps fall in a fixed demo window ending "today" (the reset date).
6. Determinism: same seed → byte-identical dataset.

**Determinism:** a fixed integer **seed = 20260726** drives all generated values;
no wall-clock, no randomness without the seed. Dates are computed relative to a
fixed `DEMO_TODAY` (set at reset) so the world never looks stale.

---

## 1. Employees (`emp`)
- **Count:** 42 modeled (of ~1,850 stated). Source: `DEMO_USERS.md`.
- **Fields:** `id`, `name`, `email` (`ad.soyad@novamak.com.tr`), `title`,
  `department_id`, `site_id`, `manager_id`, `permission_tier`, `roles[]`,
  `active`, `hired_on`, `locale`.
- **Consistency:** `manager_id` forms the org tree in `DEMO_COMPANY.md`;
  `department_id`/`site_id` resolve to §2; tiers/roles match `DEMO_USERS.md`.

## 2. Departments & sites (`dept`, `site`)
- **Departments:** 16 (Executive, HR, Finance, IT, Operations, Maintenance,
  Quality, Sales, Marketing, Procurement, Engineering, Production, HSE, Security,
  Warehouse, Support). Fields: `id`, `name_tr`, `name_en`, `head_emp_id`,
  `parent_dept_id`.
- **Sites:** 6 (Plant 1 İstanbul, Plant 2 Gebze, Plant 3 Bursa, Central Warehouse,
  Ankara office, İzmir office). Fields: `id`, `name`, `type`, `city`, `headcount`.
- **Business units:** 4 (Machinery Systems, Precision Components, Aftermarket &
  Service, Engineering & R&D). Fields: `id`, `name`, `lead_emp_id`.
- **Consistency:** `head_emp_id` is a `T1/T2` user; headcounts sum to the
  `DEMO_COMPANY.md` totals.

## 3. Assets (`asset`)
- **Count:** ~40 major machine assets across plants.
- **Fields:** `id`, `name`, `type` (machining/welding/automation/crane/utility),
  `site_id`, `criticality`, `manual_doc_id`, `install_date`, `status`.
- **Consistency:** `manual_doc_id` → a Manual document (§5); assets referenced by
  maintenance workflows/records; criticality drives maintenance SLA.

## 4. Documents / Knowledge (`doc`)
- **Count:** ~120 across 18 categories. Source: `DEMO_KNOWLEDGE_BASE.md`.
- **Fields:** the full metadata schema in `DEMO_KNOWLEDGE_BASE.md §1` (`id`,
  `title`, `category`, `type`, `owner`, `visibility`, `version`, `status`,
  `effective`, `review_due`, `language`, `tags[]`, `related[]`, `source_of[]`).
- **Consistency:** `related[]` edges are bidirectional; `tags[]` come from the
  controlled vocabulary; `owner` resolves to a department/role; visibility drives
  what each employee and AI answer can see. This is the Company Brain.

## 5. Knowledge relationships (`doc_edge`)
- **Fields:** `from_doc_id`, `to_doc_id`, `relation` (references / supersedes /
  evidence-for / form-of / part-of).
- **Consistency:** every edge's endpoints exist; forms the knowledge graph shown
  on the Knowledge Dashboard.

## 6. Workflow definitions & instances (`wf_def`, `wf_item`, `wf_step`)
- **Definitions:** 25 (Source: `DEMO_WORKFLOWS.md`). Fields: `id`, `name`,
  `owner_dept_id`, `sla`, `assistant_id`, `approval_matrix`.
- **Instances (`wf_item`):** ~180 across the 25 types, in mixed states (open,
  pending-approval, approved, rejected, closed) to populate dashboards. Fields:
  `id`, `wf_def_id`, `initiator_emp_id`, `status`, `current_step`, `created_at`,
  `closed_at`, `sla_due`, `linked_docs[]`, `linked_records[]`.
- **Steps (`wf_step`):** each instance's step history. Fields: `wf_item_id`,
  `seq`, `actor_emp_id`, `action`, `decision`, `note`, `at`.
- **Consistency:** actors exist and have authority per the approval matrix;
  cycle-time = `closed_at − created_at`; SLA-adherence aggregates to the Workflow/
  Executive dashboards.

## 7. Tickets (`ticket`)
- **Count:** ~60 (IT requests, support tickets, complaints).
- **Fields:** `id`, `type` (it/support/complaint), `requester_emp_id` or
  `customer_id`, `assignee_emp_id`, `priority`, `status`, `sla_due`, `created_at`,
  `resolved_at`, `linked_wf_item_id`, `linked_docs[]`.
- **Consistency:** IT/support tickets map to WF-16/09; resolution times feed the
  Department/AI dashboards.

## 8. Approvals (`approval`)
- **Count:** derived from `wf_item` approval steps (~120 approval events).
- **Fields:** `id`, `wf_item_id`, `approver_emp_id`, `level`, `limit_applied`,
  `decision`, `at`, `assistant_check` (Finance/Legal/Security check log).
- **Consistency:** `limit_applied` matches `KB-POL-004`; escalations occur when an
  amount exceeds a tier; every approval has an audit record (§14).

## 9. Tasks (`task`)
- **Count:** ~150 (personal + workflow tasks assigned to employees).
- **Fields:** `id`, `title`, `owner_emp_id`, `department_id`, `type`, `status`
  (todo/doing/done), `due`, `linked_wf_item_id`.
- **Consistency:** "my open tasks" on department dashboards aggregates these;
  owners exist; due dates within the demo window.

## 10. Meetings & notes (`meeting`)
- **Count:** ~20 (management reviews, planning, quality council, etc.).
- **Fields:** `id`, `title`, `type`, `date`, `attendee_emp_ids[]`, `minutes_doc_id`,
  `visibility`.
- **Consistency:** `minutes_doc_id` → a Meeting-notes document (`KB-MTG-*`);
  attendees exist; restricted meetings only visible to entitled roles.

## 11. AI conversations (`ai_convo`)
- **Count:** ~80 seeded conversations (covering the demo scenarios + realistic
  history for the AI Dashboard).
- **Fields:** `id`, `assistant_id`, `user_emp_id`, `locale`, `messages[]`
  (role/text), `cited_doc_ids[]`, `escalated_to_emp_id?`, `outcome`, `at`.
- **Consistency:** `assistant_id` ∈ the 12 agents; every `cited_doc_ids[]` exists
  and is visible to `user_emp_id`; escalations target the agent's defined owner;
  the scripted demo conversations (Mehmet's fault, Zeynep's CAPA, purchase
  approval, HR onboarding, campaign) are fixed verbatim.

## 12. Analytics (`metric`, `metric_point`)
- **Definition:** each KPI on `DEMO_DASHBOARDS.md` defined once. Fields: `id`,
  `name`, `unit`, `owner_dashboard`, `formula` (aggregate over records).
- **Series (`metric_point`):** time series over the demo window for trend charts.
- **Consistency:** every metric value equals the aggregate of its source records
  (workflows, tickets, docs, conversations) — invariant #4. No standalone,
  unreconciled numbers.

## 13. History (`history`)
- **Purpose:** back-history so trends look real (12+ weeks) without contradicting
  current state.
- **Fields:** `entity_type`, `entity_id`, `field`, `old`, `new`, `at`,
  `actor_emp_id`.
- **Consistency:** history reconstructs current values when replayed; timestamps
  strictly increasing; only within the demo window.

## 14. Audit (`audit`)
- **Purpose:** the security/compliance trail shown on the Security Dashboard.
- **Fields:** `id`, `at`, `actor_emp_id`, `action`, `object_type`, `object_id`,
  `tenant_id`, `result`, `ip_scope` (internal), `visibility` (security/IT).
- **Consistency:** every access, approval, document view, workflow action and AI
  conversation emits an audit record; `tenant_id` = NovaMak (with an optional
  second tenant for the OIZ isolation story); records are immutable and complete.

---

## 15. Volumes (seeded, fixed)

| Dataset | Count | Reconciles to |
| --- | --- | --- |
| Employees | 42 | `DEMO_USERS.md` |
| Departments / Sites / Units | 16 / 6 / 4 | `DEMO_COMPANY.md` |
| Assets | ~40 | Operations/Maintenance |
| Documents | ~120 | `DEMO_KNOWLEDGE_BASE.md` |
| Doc relationships | ~200 edges | Knowledge graph |
| Workflow definitions | 25 | `DEMO_WORKFLOWS.md` |
| Workflow instances | ~180 | Workflow/Executive dashboards |
| Tickets | ~60 | IT/Support/AI dashboards |
| Approvals | ~120 | Finance/Workflow dashboards |
| Tasks | ~150 | Department dashboards |
| Meetings | ~20 | Knowledge/Executive |
| AI conversations | ~80 | AI/Knowledge dashboards |
| Metrics | ~40 KPIs + series | All dashboards |
| History records | ~1,500 | Trend charts |
| Audit records | ~3,000 | Security Dashboard |

All counts are fixed; the reset reproduces exactly these volumes.

---

## 16. Cross-dataset consistency checks (validated on seed)

The seeder runs these checks; a demo is not "green" until all pass:
1. **Referential integrity:** every FK resolves (emp, dept, site, doc, wf, ticket).
2. **Authority:** every approval's `limit_applied` ≤ approver's tier limit, or an
   escalation exists.
3. **Citations:** every `ai_convo.cited_doc_ids[]` exists and is visible to the
   user.
4. **KPI reconciliation:** every dashboard metric equals its aggregate of records.
5. **Visibility:** no restricted document appears in a non-entitled view or answer.
6. **Temporal:** all timestamps within `[DEMO_TODAY − 90d, DEMO_TODAY]`, history
   monotonic.
7. **Determinism:** re-seeding with the same seed yields an identical dataset
   (checksum match).
8. **Audit completeness:** every state-changing action has an audit record.

Failure of any check blocks the demo and is reported by the validator
(`DEMO_RESET.md`, `demo/` implementation).

---

## Appendix — Dataset guardrails
- One source of truth (this file); documents and data never drift.
- Deterministic (seed = 20260726); dates relative to `DEMO_TODAY`.
- Internally consistent by construction and by validation (§16).
- Fictional, isolated to `demo/`, never touching production or the app's tests.
