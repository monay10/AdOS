# Organization Layer (Digital Company)

> **Layer:** Organization · **Build:** BOOK 13 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

The corporate structure: CEO/CMO Offices and Creative, Performance Marketing, Sales, Finance, Legal, Customer Success, HR, PMO, QA and R&D departments. Each department owns managers, specialist agents, KPIs, memory and procedures — turning the agent collection into a real operating company.

## Sub-modules
- CEO Office
- CMO Office
- Creative Department
- Performance Marketing Department
- Sales Department
- Finance Department
- Legal Department
- Customer Success Department
- HR Department
- PMO
- QA Office
- R&D Office

## Published events
- `org.department.spawned.v1`
- `org.kpi.assigned.v1`
- `org.procedure.updated.v1`

## Consumed events
- `exec.*`
- `analytics.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
