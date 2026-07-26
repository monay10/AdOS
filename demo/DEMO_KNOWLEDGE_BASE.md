# AdOS Demo — Company Brain Knowledge Base

The complete knowledge corpus for **NovaMak Endüstri A.Ş.** — the "Company Brain"
the demo searches, cites and grows. **~120 documents across 18 categories**, with
a defined hierarchy, metadata, tags and relationships so every demo question has a
believable, citable answer. Fictional; isolated to `demo/`. All documents are
bilingual-aware (TR primary, EN where noted).

---

## 1. Metadata schema (every document)

| Field | Meaning | Example |
| --- | --- | --- |
| `id` | Stable identifier | `KB-MNT-004` |
| `title` | Document title (TR / EN) | "CNC Arıza Giderme Kılavuzu / CNC Fault Guide" |
| `category` | One of the 18 categories (§3) | Maintenance |
| `type` | policy \| procedure \| manual \| work-instruction \| form \| standard \| record \| note \| reference | manual |
| `owner` | Owning department + role | Maintenance / Maintenance Manager |
| `visibility` | `company` \| `dept:<X>` \| `restricted:<group>` | company |
| `version` | Semantic version | v3.1 |
| `status` | draft \| approved \| superseded | approved |
| `effective` | Effective date | 2026-03-01 |
| `review_due` | Next review | 2027-03-01 |
| `language` | tr \| en \| tr+en | tr+en |
| `tags` | Controlled tags (§5) | [machining, fault, plant-1, iso-9001] |
| `related` | Linked doc ids (§6) | [KB-MNT-001, KB-QUA-002] |
| `source_of` | Which AI agents cite it | [Maintenance, Knowledge] |

**Rule:** every AI answer in the demo cites `id` + `title` + `version`, and never
returns a document the asking user's `visibility` does not permit.

---

## 2. Knowledge hierarchy

```
NovaMak Company Brain
├── 1. Governance & Organization
│   ├── Policies
│   ├── Organization (charts, roles, delegation of authority)
│   └── Standards (ISO, internal)
├── 2. People (HR)
│   ├── HR policies, handbook, forms
│   └── Training materials
├── 3. Finance & Procurement
│   ├── Finance policies, approval matrix, forms
│   └── Purchasing procedures, supplier docs, contracts
├── 4. Operations
│   ├── Production procedures & work instructions
│   ├── Maintenance manuals, procedures, records
│   └── Warehouse & logistics procedures
├── 5. Quality & Compliance
│   ├── Quality manual, procedures, inspection standards
│   ├── CAPA & incident records
│   └── Internal audit reports
├── 6. HSE & Environment
│   ├── Safety procedures, risk assessments, PPE
│   ├── Environmental procedures & permits
│   └── Emergency plans
├── 7. IT & Security
│   ├── IT policies & runbooks
│   └── Security policies, access, audit, visitor
├── 8. Commercial
│   ├── Sales procedures, product specs, pricing policy
│   ├── Marketing brand & campaign assets
│   └── Customer support manuals
└── 9. Records & Notes
    ├── Meeting notes
    └── AI reference documents (curated Q&A, glossaries)
```

Every document belongs to exactly one category (its "home") but may relate to
many others via `related`.

---

## 3. The 18 categories (with representative documents)

### C1 — Policies (company-wide) · ~8 docs
- `KB-POL-001` **Code of Conduct** (company, v2.0) — tags [ethics, company-wide].
- `KB-POL-002` **Data Protection & KVKK Policy** (company) — [kvkk, security,
  data] · related [KB-SEC-001].
- `KB-POL-003` **Information Security Policy** (company) — [iso-27001, security].
- `KB-POL-004` **Delegation of Authority / Approval Limits** (company) —
  [finance, approval] · related [KB-FIN-002].
- `KB-POL-005` **Anti-Bribery & Procurement Ethics** (company) — [procurement].

### C2 — Procedures · ~10 docs
- `KB-PRC-001` **Document Control Procedure** (company, ISO 9001) — [iso-9001,
  document-control] · related [KB-QUA-001].
- `KB-PRC-002` **Change Management Procedure** — [change, production].
- `KB-PRC-003` **Corrective & Preventive Action (CAPA) Procedure** — [capa,
  quality] · related [KB-QUA-003].

### C3 — Manuals · ~12 docs
- `KB-MAN-001` **Machining Center Operation Manual — Model HMC-500** (dept:
  Production) — [machining, plant-1, manual].
- `KB-MAN-002` **Robotic Welding Cell Manual — Plant 2** — [welding, plant-2].
- `KB-MAN-003` **PLC/Automation Integration Manual — Plant 3** — [automation,
  plant-3].
- `KB-MAN-004` **Product Service Manual — NovaLine 200** (company, tr+en) —
  [product, service].

### C4 — Work instructions · ~12 docs
- `KB-WI-001` **First-Off Inspection Work Instruction** — [quality, inspection].
- `KB-WI-002` **CNC Setup Sheet — Part 4471** — [machining, setup, plant-1].
- `KB-WI-003` **Welding Parameter Sheet — Frame Assembly** — [welding, plant-2].
- `KB-WI-004` **Goods Receiving Work Instruction** — [warehouse, receiving].

### C5 — Organization · ~6 docs
- `KB-ORG-001` **Organization Chart** (company) — [org, roles] · related
  [KB-ORG-002].
- `KB-ORG-002` **Role & Responsibility Matrix (RACI)** — [roles, raci].
- `KB-ORG-003` **Site Directory (plants, contacts)** — [sites, contacts].

### C6 — Forms · ~10 docs
- `KB-FRM-001` **Purchase Request Form** — [procurement, form] · related
  [WF Purchase Approval].
- `KB-FRM-002` **Leave Request Form** — [hr, form].
- `KB-FRM-003` **Expense Claim Form** — [finance, form].
- `KB-FRM-004` **Incident Report Form** — [hse, quality, form].
- `KB-FRM-005` **Access Request Form** — [it, security, form].

### C7 — Standards · ~8 docs
- `KB-STD-001` **ISO 9001 Quality Manual** (company) — [iso-9001, quality].
- `KB-STD-002` **ISO 14001 Environmental Manual** — [iso-14001, environment].
- `KB-STD-003` **ISO 45001 OH&S Manual** — [iso-45001, safety].
- `KB-STD-004` **Internal Machining Tolerance Standard** — [machining, standard].

### C8 — Meeting notes · ~8 docs
- `KB-MTG-001` **Management Review — 2026 Q1** (restricted: executives) —
  [management, review] · related [KB-STD-001].
- `KB-MTG-002` **Production Planning Weekly — W12** (dept: Production) —
  [production, planning].
- `KB-MTG-003` **Quality Council — March 2026** (dept: Quality) — [quality, capa].

### C9 — Incident reports · ~8 docs
- `KB-INC-001` **Incident — Hydraulic Leak, Plant 1 Press** (dept: HSE/Quality) —
  [incident, plant-1, safety] · related [KB-CAPA-001, KB-MNT-004].
- `KB-INC-002` **Near-Miss — Forklift, Warehouse** — [incident, warehouse].
- `KB-INC-003` **Quality Non-Conformity — Batch 5583** — [quality, ncr] · related
  [KB-CAPA-002].

### C10 — Maintenance · ~12 docs
- `KB-MNT-001` **Preventive Maintenance Plan — Plant 1** — [maintenance, plant-1,
  pm].
- `KB-MNT-002` **Maintenance Procedure — Spindle Replacement** — [maintenance,
  machining].
- `KB-MNT-003` **Asset Register (major machines)** — [assets, maintenance].
- `KB-MNT-004` **CNC Fault Troubleshooting Guide — HMC-500** (dept: Maintenance,
  tr+en) — [machining, fault, plant-1] · related [KB-MAN-001, KB-INC-001].
  **← primary demo answer for Mehmet Aslan's fault question.**

### C11 — Purchasing · ~8 docs
- `KB-PUR-001` **Procurement Procedure** — [procurement, purchasing] · related
  [KB-POL-004].
- `KB-PUR-002` **Approved Supplier List** — [supplier, procurement].
- `KB-PUR-003` **Supplier Evaluation Criteria** — [supplier, quality] · related
  [WF Supplier Evaluation].
- `KB-PUR-004` **Framework Contract — GüvenLojistik** (restricted: procurement) —
  [contract, logistics].

### C12 — HR · ~10 docs
- `KB-HR-001` **Employee Handbook** (company, tr+en) — [hr, handbook, onboarding]
  · related [KB-HR-002, KB-STD-003].
- `KB-HR-002` **Leave & Vacation Policy** (company) — [hr, leave] · related
  [KB-FRM-002, WF Vacation].
- `KB-HR-003` **Expense Policy** (company) — [hr, finance, expense] · related
  [KB-FRM-003, WF Expense].
- `KB-HR-004` **Onboarding Checklist** (dept: HR) — [hr, onboarding].
- `KB-HR-005` **Recruitment Procedure** (dept: HR) — [hr, recruitment] · related
  [WF Recruitment].

### C13 — IT · ~8 docs
- `KB-IT-001` **IT Acceptable Use Policy** (company) — [it, policy].
- `KB-IT-002` **Access Management Procedure** (dept: IT) — [it, access, security]
  · related [WF Access Request, KB-SEC-002].
- `KB-IT-003` **Password Policy & Reset Procedure** — [it, security] · related
  [WF Password Reset].
- `KB-IT-004` **AdOS Operations Runbook** (dept: IT) — [it, ados, runbook].

### C14 — Security · ~8 docs
- `KB-SEC-001` **Information Security Policy (detailed)** — [security, iso-27001].
- `KB-SEC-002` **Physical Access & Badge Procedure** — [security, access].
- `KB-SEC-003` **Visitor Management Procedure** — [security, visitor] · related
  [WF Visitor Management].
- `KB-SEC-004` **Audit & Logging Standard** (restricted: security/IT) — [security,
  audit].

### C15 — Quality · ~10 docs
- `KB-QUA-001` **Quality Manual** (company, ISO 9001) — [quality, iso-9001] ·
  related [KB-STD-001].
- `KB-QUA-002` **Incoming Inspection Standard** — [quality, inspection].
- `KB-QUA-003` **CAPA Records Register** (dept: Quality) — [capa, quality] ·
  related [KB-PRC-003, KB-INC-003].
- `KB-QUA-004` **Internal Audit Report — 2026 H1** (dept: Quality) — [audit,
  iso-9001].

### C16 — Production · ~10 docs
- `KB-PRD-001` **Production Control Procedure** — [production, planning].
- `KB-PRD-002` **Shift Handover Standard** — [production, shift].
- `KB-PRD-003` **Production Change Procedure** — [production, change] · related
  [WF Production Change, KB-PRC-002].

### C17 — Environmental · ~6 docs
- `KB-ENV-001` **Environmental Management Procedure** (ISO 14001) — [environment,
  iso-14001].
- `KB-ENV-002` **Waste Handling Procedure — Plant 2 (paint/solvent)** —
  [environment, plant-2, waste].
- `KB-ENV-003` **Environmental Permits Register** (restricted: HSE) — [environment,
  permit].

### C18 — Emergency · ~6 docs
- `KB-EMG-001` **Emergency Response Plan** (company) — [emergency, safety] ·
  related [WF Emergency Process].
- `KB-EMG-002` **Fire & Evacuation Procedure** — [emergency, fire].
- `KB-EMG-003` **Business Continuity Plan** (restricted: executives/IT) —
  [emergency, continuity] · related [KB-IT-004].

### C19 (cross) — AI reference documents · ~6 docs
Curated documents that make the AI answers crisp:
- `KB-AI-001` **Company Glossary (TR/EN)** — abbreviations, machine names, terms.
- `KB-AI-002` **Frequently Asked Questions (curated)** — top employee questions +
  vetted answers, each linking to a source document.
- `KB-AI-003` **Answer Style Guide** — how assistants should cite and format
  answers.
- `KB-AI-004` **Escalation Directory** — which human owns which decision (maps to
  `DEMO_USERS.md`).

---

## 4. Visibility model (worked examples)

| Document | Visibility | Who sees it |
| --- | --- | --- |
| KB-HR-001 Employee Handbook | company | everyone |
| KB-HR (payroll records) | restricted: HR | HR only |
| KB-MNT-004 CNC Fault Guide | dept: Maintenance (readable company-wide) | all staff can read; Maintenance owns |
| KB-PUR-004 Framework Contract | restricted: procurement | Procurement + Finance Director |
| KB-MTG-001 Management Review | restricted: executives | GM + directors |
| KB-SEC-004 Audit Standard | restricted: security/IT | Security + IT |
| KB-ENV-003 Permits | restricted: HSE | HSE + Executives |

An assistant answering a question **filters by the asking user's permission** and
never cites a document they may not see.

---

## 5. Tag taxonomy (controlled vocabulary)

- **Department:** hr, finance, procurement, it, security, quality, hse,
  production, maintenance, engineering, sales, marketing, warehouse, support.
- **Site:** plant-1, plant-2, plant-3, warehouse, company-wide.
- **Standard:** iso-9001, iso-14001, iso-45001, iso-27001, kvkk, ce.
- **Topic:** policy, procedure, manual, work-instruction, form, standard, record,
  onboarding, approval, incident, capa, audit, fault, machining, welding,
  automation, supplier, contract, visitor, access, emergency, environment,
  training.

Tags are drawn only from this list so search and relationships stay consistent.

---

## 6. Relationships (graph)

Documents form a knowledge graph via `related`. Representative edges:
- **Policy → Procedure → Form → Workflow:** `KB-POL-004` (approval limits) →
  `KB-PUR-001` (procurement procedure) → `KB-FRM-001` (purchase form) → *WF
  Purchase Approval*.
- **Incident → CAPA → Corrective action:** `KB-INC-003` → `KB-QUA-003` →
  `KB-PRC-003`.
- **Manual → Fault guide → Maintenance procedure:** `KB-MAN-001` → `KB-MNT-004` →
  `KB-MNT-002`.
- **Handbook → Leave policy → Leave form → Workflow:** `KB-HR-001` → `KB-HR-002` →
  `KB-FRM-002` → *WF Vacation*.
- **Standard → Manual/Procedure evidence:** `KB-STD-001` (ISO 9001) ↔
  `KB-QUA-001`, `KB-PRC-001`, `KB-QUA-004`.

The graph is what lets an assistant answer "what's the procedure, which form, and
who approves?" in one grounded response.

---

## 7. Category counts (reconciles to ~120)

| Category | Docs | Category | Docs |
| --- | --- | --- | --- |
| Policies | 8 | Purchasing | 8 |
| Procedures | 10 | HR | 10 |
| Manuals | 12 | IT | 8 |
| Work instructions | 12 | Security | 8 |
| Organization | 6 | Quality | 10 |
| Forms | 10 | Production | 10 |
| Standards | 8 | Environmental | 6 |
| Meeting notes | 8 | Emergency | 6 |
| Incident reports | 8 | AI reference | 6 |
| Maintenance | 12 | | |
| **Subtotal** | | **Total** | **~176 slots → curated to ~120 canonical docs** |

The demo seeds a curated **~120 documents** (the representative set above plus
filler within each category) so every category is populated and every scripted
question resolves. Exact seeded records are enumerated in `DEMO_DATASET_SPEC.md`.

---

## Appendix — Knowledge guardrails
- Every document has full metadata (§1); no orphan or untagged documents.
- Every AI citation resolves to a real seeded document and respects visibility.
- Tags come only from the controlled vocabulary (§5).
- Relationships are bidirectional and consistent (§6).
- All content is fictional and lives under `demo/`; it never leaves the perimeter
  (the sovereignty message applies to the demo's own story too).
