# Executive AI

> **Layer:** Organization / Executives · **Build:** BOOK 12 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

C-suite agents (CEO, CMO, Creative/Sales/Finance/Legal/Support Directors). Each can set goals, delegate, review, approve, monitor KPIs, allocate budget, request reports and command lower agents. The CEO agent coordinates the whole company autonomously via the Cognitive Core.

## Sub-modules
- CEO Agent (coordinator)
- CMO Agent
- Creative Director
- Sales Director
- Finance Director
- Legal Director
- Support Director
- Goal Delegation
- Output Review + Approval
- KPI Monitoring
- Budget Allocation
- Report Requests

## Published events
- `exec.goal.created.v1`
- `exec.work.delegated.v1`
- `exec.approval.granted.v1`
- `exec.budget.allocated.v1`
- `exec.report.requested.v1`

## Consumed events
- `analytics.*`
- `agent.*`
- `workflow.approval.requested.v1`
- `campaign.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
