# Agent Framework

> **Layer:** Organization / Agents · **Build:** BOOK 4 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Enterprise agent substrate. Registry, runtime, lifecycle, state machine, hierarchy (CEO → Manager → Worker), supervision, sandboxing and permissions. Agents submit AITasks to the AI Manager and delegate thinking to the Cognitive Core — never touching an engine directly.

## Sub-modules
- Agent Registry
- Agent Runtime
- Agent Lifecycle
- Agent State Machine
- Agent Context
- Agent Queue
- Agent Communication
- Agent Event System
- Agent Permissions
- Agent Sandbox
- Agent Versioning
- Agent Health Monitoring
- Agent Metrics
- Agent Retry Policies
- Agent Scheduler
- Agent Supervisor
- Agent Hierarchy (CEO / Manager / Worker)

## Published events
- `agent.registered.v1`
- `agent.started.v1`
- `agent.completed.v1`
- `agent.failed.v1`
- `agent.escalated.v1`

## Consumed events
- `workflow.*`
- `goal.*`
- `campaign.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
