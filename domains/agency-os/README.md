# Agency Operating System

> **Layer:** Business · **Build:** BOOK 14 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

The client-facing business layer: CRM, client portal, proposal/contract generation, billing/subscription, customer support/ticketing, knowledge base, project/task management, meeting scheduling, client communication and the executive dashboard. Everything communicates through events.

## Sub-modules
- CRM
- Client Portal
- Proposal Generator
- Contract Generator
- Billing
- Subscription
- Customer Support
- Ticketing
- Knowledge Base
- Project Management
- Task Assignment
- Meeting Scheduler
- Client Communication
- Executive Dashboard

## Published events
- `agency.client.onboarded.v1`
- `agency.proposal.sent.v1`
- `agency.invoice.issued.v1`
- `agency.ticket.opened.v1`

## Consumed events
- `exec.*`
- `analytics.report.generated.v1`
- `campaign.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
