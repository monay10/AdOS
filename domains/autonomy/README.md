# Autonomy Layer

> **Layer:** Meta / Self-* · **Build:** BOOK 15 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Makes the company self-running: self-optimization/monitoring/healing/documentation/testing/learning, automatic cost + resource scaling, agent evaluation, prompt/workflow/campaign improvement, and automatic executive/monthly/quarterly reviews. Operates without human intervention except final approvals.

## Sub-modules
- Self Optimization
- Self Monitoring
- Self Healing
- Self Documentation
- Self Testing
- Self Learning
- Automatic Cost Optimization
- Automatic Resource Scaling
- Automatic Agent Evaluation
- Automatic Prompt Improvement
- Automatic Workflow Improvement
- Automatic Campaign Optimization
- Automatic Executive Reporting
- Automatic Monthly / Quarterly Reviews

## Published events
- `autonomy.optimization.applied.v1`
- `autonomy.healing.performed.v1`
- `autonomy.review.completed.v1`
- `autonomy.approval.requested.v1`

## Consumed events
- `analytics.*`
- `agent.*`
- `workflow.*`
- `campaign.*`
- `exec.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
