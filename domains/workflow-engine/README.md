# Workflow Engine

> **Layer:** Orchestration · **Build:** BOOK 6 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Own DAG-based workflow engine: conditional nodes, loops, timers, triggers, webhook/approval/human-in-the-loop nodes, retry/rollback/compensation (saga), versioning, execution history, debugger, reusable templates and parallel execution over the queue.

## Sub-modules
- Workflow Definition + Versioning
- Conditional Nodes
- Loops
- Triggers
- Timers
- Webhook Nodes
- Approval Nodes
- Human-In-The-Loop
- Retry Nodes
- Rollback
- Compensation (Saga)
- Parallel Execution
- Queue Integration
- Execution History
- Workflow Monitoring
- Workflow Debugger
- Reusable Templates

## Published events
- `workflow.started.v1`
- `workflow.step.completed.v1`
- `workflow.completed.v1`
- `workflow.failed.v1`
- `workflow.approval.requested.v1`

## Consumed events
- `agent.*`
- `goal.*`
- `campaign.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
