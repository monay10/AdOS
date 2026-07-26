# AdOS Demo — The Company: NovaMak Endüstri A.Ş.

**The official fictional enterprise used in every AdOS demonstration.** Realistic,
internally consistent, and designed to mirror the OIZ/enterprise prospects AdOS
targets. All other demo documents (`DEMO_USERS.md`, `DEMO_WORKFLOWS.md`,
`DEMO_KNOWLEDGE_BASE.md`, `DEMO_DASHBOARDS.md`, `DEMO_DATASET_SPEC.md`) reference
the facts on this page. Fictional — any resemblance to a real company is
coincidental.

---

## 1. Company identity

| Field | Value |
| --- | --- |
| Legal name | **NovaMak Endüstri A.Ş.** |
| Trading name (EN) | **NovaMak Industries** |
| Founded | 1994 (İstanbul) |
| Sector | Industrial machinery & precision metal components |
| Ownership | Privately held (family + institutional investor) |
| HQ | Dudullu Organized Industrial Zone (OSB), Ümraniye, İstanbul |
| Employees | **~1,850** |
| Annual revenue | ~₺4.2 billion (illustrative) |
| Exports | ~40% of revenue, to 28 countries |
| Certifications | ISO 9001, ISO 14001, ISO 45001, ISO 27001 (in progress), CE |
| Languages | Turkish (primary), English (exports & documentation) |

**One-line description:** NovaMak designs and manufactures industrial machinery
and precision metal components — from CNC-machined parts to complete automation
lines — for automotive, white-goods, energy and defense-adjacent customers.

---

## 2. Mission, vision, values

- **Mission (EN):** To manufacture precise, reliable industrial machinery that
  helps our customers produce more, safely and efficiently.
- **Misyon (TR):** Müşterilerimizin daha fazlasını güvenle ve verimli üretmesine
  yardımcı olan hassas ve güvenilir endüstriyel makineler üretmek.
- **Vision (EN):** To be the most trusted machinery manufacturer in the region —
  known for precision, on-time delivery, and engineering depth.
- **Vizyon (TR):** Hassasiyet, zamanında teslimat ve mühendislik derinliğiyle
  tanınan, bölgenin en güvenilir makine üreticisi olmak.
- **Values:** Precision · Safety first · Keep our promises · Learn continuously ·
  Respect people and data.

---

## 3. Locations

| Site | Type | Location | Headcount | Notes |
| --- | --- | --- | --- | --- |
| **HQ + Plant 1** | Head office + factory | Dudullu OSB, İstanbul | ~900 | Machining, assembly, engineering, admin |
| **Plant 2** | Factory | Gebze OSB, Kocaeli | ~520 | Sheet metal, welding, surface treatment |
| **Plant 3** | Factory | Bursa OSB | ~330 | Automation lines, electronics assembly |
| **Central Warehouse** | Warehouse / logistics | Gebze | ~70 | Raw material + finished-goods hub |
| **Sales offices** | Offices | Ankara, İzmir | ~30 | Domestic sales & service |

Three factories, one central warehouse, two sales offices — all connected to the
same on-prem AdOS deployment inside NovaMak's own network.

---

## 4. Business units

1. **Machinery Systems** — complete machines and automation lines (project-based).
2. **Precision Components** — CNC-machined and fabricated parts (volume/OEM).
3. **Aftermarket & Service** — spare parts, maintenance contracts, field service.
4. **Engineering & R&D** — design, prototyping, industrialization.

Each unit has its own P&L, sales pipeline and production capacity, but shares HR,
Finance, IT, Quality, Procurement and the central warehouse.

---

## 5. Departments (16)

Executive/Management · HR · Finance & Accounting · IT · Operations · Maintenance ·
Quality · Sales · Marketing · Procurement · Engineering · Production · Health,
Safety & Environment (HSE) · Security · Warehouse & Logistics · Customer Support.

(Headcount, heads and users per department are defined in `DEMO_USERS.md`.)

---

## 6. Organizational chart (top structure)

```
                          Board of Directors
                                  │
                   General Manager — Elif Demir
   ┌───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
   │           │           │           │           │           │           │
 Operations  Finance      HR          IT       Commercial   Engineering  Quality & HSE
 Director    Director     Director    Manager   Director     Director     Director
   │           │           │           │           │           │           │
 ┌─┴─┐       Finance      HR staff   IT staff  ┌───┴───┐    Eng. teams  ┌──┴──┐
 │   │       Mgr,                              Sales   Marketing         Quality Maint.
Prod. Maint. Accounting                        Mgr     Mgr              Mgr    (dotted)
Mgr   Mgr    Procurement (dotted)              │
      │      Mgr                             Support Mgr
   Warehouse Mgr
   Security Mgr (dotted to IT + HSE)
```

- **General Manager:** Elif Demir.
- **Directors:** Operations, Finance, HR, Commercial, Engineering, Quality & HSE.
- **Managers** report to directors; front-line staff report to managers.
- **Dotted lines:** Security (IT + HSE), Maintenance (Operations + Quality),
  Procurement (Finance + Operations).

Full names, titles and reporting lines: `DEMO_USERS.md`.

---

## 7. Factories (detail)

- **Plant 1 (İstanbul / Dudullu OSB):** CNC machining centers, assembly halls,
  the engineering center, and head-office functions. Runs 2 shifts. ~40 major
  machine assets (machining centers, lathes, cranes, compressors).
- **Plant 2 (Gebze):** Sheet-metal fabrication, robotic welding cells, painting
  and surface treatment. 3 shifts on welding. Higher HSE and environmental load
  (paint booths, waste handling).
- **Plant 3 (Bursa):** Automation-line assembly and electronics/PLC integration.
  1–2 shifts. Cleaner environment, ESD controls.

Each plant has its own maintenance team, quality inspectors, warehouse annex and
HSE officer, all coordinated centrally.

---

## 8. Warehouses & logistics

- **Central Warehouse (Gebze):** raw materials (steel, aluminum, components),
  consumables, and finished-goods staging; feeds all three plants.
- **Plant annex stores:** each plant keeps a small buffer store for WIP and fast-
  moving consumables.
- **Logistics:** inbound from ~120 suppliers; outbound to domestic customers and
  export forwarders. Managed with defined receiving, put-away, picking and
  dispatch workflows (`DEMO_WORKFLOWS.md`).

---

## 9. Suppliers (representative)

~120 active suppliers; representative set used in the demo:

| Supplier | Category | Notes |
| --- | --- | --- |
| Marmara Çelik A.Ş. | Steel & metal stock | Strategic, high spend |
| EgeAlü Ltd. | Aluminum profiles | Dual-sourced |
| Anadolu Rulman | Bearings & drives | Critical, long lead |
| TeknikElektronik | PLC / electronics | Single-source risk (flagged) |
| Kalite Kaplama | Surface treatment | Subcontract (Plant 2) |
| GüvenLojistik | Freight & logistics | Framework contract |
| OfisMax | Indirect / MRO | Low-value, high-volume |

Suppliers carry evaluation scores, contracts and risk flags used in the supplier-
evaluation and procurement workflows.

---

## 10. Customers (representative)

~300 active customers; representative set:

| Customer | Segment | Notes |
| --- | --- | --- |
| Otomotiv Sanayi A.Ş. | Automotive OEM | Largest account, strict quality |
| BeyazEşya Ltd. | White goods | High-volume components |
| EnerjiTürk | Energy | Project machinery |
| Savunma Teknik | Defense-adjacent | Confidential, restricted docs |
| Avrupa Makine GmbH | Export (Germany) | English documentation |
| KOBİ Üretim | Domestic SME | Aftermarket & service |

Customers drive the sales pipeline, complaints/CAPA, and campaign scenarios.

---

## 11. Digital transformation goals

NovaMak's stated transformation objectives (the "why AdOS" for the demo):
1. **Stop losing knowledge** when experienced staff retire or leave.
2. **Answer any operational question in seconds**, from official documents.
3. **Speed up approvals and workflows** without losing control or audit.
4. **Adopt AI without sending data outside** — a hard requirement from defense-
   adjacent and export customers and from KVKK obligations.
5. **Onboard new staff faster** across three plants.
6. **Give management one real-time view** of knowledge, workflow and operations.

These map directly to AdOS capabilities demonstrated in the scenarios.

---

## 12. Knowledge challenges

- **Tribal knowledge:** critical machine-fix know-how lives in a few veterans'
  heads.
- **Scattered documents:** procedures spread across shared drives, email and
  paper; nobody can find the current version.
- **Version confusion:** multiple copies of the same work instruction; unclear
  which is approved.
- **Language split:** documents in Turkish and English, inconsistently.
- **Access uncertainty:** some documents are sensitive (defense customer,
  salaries) and must not be broadly visible.
- **Onboarding drag:** new hires take months to become productive because
  knowledge is hard to reach.

The Company Brain (`DEMO_KNOWLEDGE_BASE.md`) is designed to answer each of these.

---

## 13. Current pain points

| Area | Pain |
| --- | --- |
| Maintenance | Repeat faults; slow diagnosis; know-how not captured |
| Quality | CAPA paperwork slow; audit prep painful; ISO evidence scattered |
| Procurement | Approvals bounce via email; supplier risk not visible |
| HR | Same policy questions asked constantly; onboarding slow |
| Finance | Expense/invoice approvals stall; limited visibility |
| Operations | No single view across three plants |
| IT/Security | Access requests slow; audit trail incomplete; cloud AI banned |
| Sales/Marketing | Campaign production slow; brand consistency hard |

Each pain point is the setup for a demo scenario that resolves it.

---

## 14. AI opportunities

- **Knowledge Assistant / Company Brain:** instant, cited answers from official
  documents — for every department.
- **Digital Employees:** HR, Finance, Quality, Maintenance, Operations and more
  assistants that do routine work within limits.
- **Governed workflows:** AI-assisted approvals, incidents, CAPA and maintenance
  with full audit.
- **Local advertising pipeline:** marketing campaigns produced on local models.
- **Executive intelligence:** a live view of knowledge, workflow and operations.

All of it on NovaMak's own infrastructure — the sovereignty story throughout.

---

## 15. Enterprise scale (summary figures)

| Dimension | Figure (illustrative, fixed for the demo) |
| --- | --- |
| Employees | ~1,850 |
| Sites | 3 plants + 1 warehouse + 2 sales offices |
| Departments | 16 |
| Business units | 4 |
| Demo users (modeled) | ~40 (see `DEMO_USERS.md`) |
| Knowledge documents (modeled) | ~120 across 18 categories (see `DEMO_KNOWLEDGE_BASE.md`) |
| Workflows (modeled) | ~25 (see `DEMO_WORKFLOWS.md`) |
| AI assistants (Digital Employees) | 12 (see `DEMO_AI_AGENTS.md`) |
| Dashboards | 10 (see `DEMO_DASHBOARDS.md`) |
| Suppliers / customers (modeled) | ~7 / ~6 representative, in a stated larger base |
| Machine assets (modeled) | ~40 major assets across plants |

These figures are fixed so every dashboard, report and workflow in the demo
reconciles to the same world.

---

## Appendix — Consistency contract
- The company name is always **NovaMak Endüstri A.Ş. / NovaMak Industries**.
- The GM is **Elif Demir**; the six directors and their reports are fixed in
  `DEMO_USERS.md`.
- Sites, units, departments and scale figures on this page are canonical; other
  demo documents must not contradict them.
- Everything is fictional and lives under `demo/`.
