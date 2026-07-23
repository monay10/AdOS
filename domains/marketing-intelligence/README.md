# Marketing Intelligence Engine

> **Layer:** Domain · **Build:** BOOK 8 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Produces structured, agent-consumable outputs: competitor/SEO/keyword/audience analysis, persona and trend detection, offer/funnel/campaign/budget planning, creative briefs, performance prediction and opportunity detection. All reasoning goes through the Cognitive Core + AI Manager.

## Sub-modules
- Competitor Analysis
- SEO Analysis
- Keyword Discovery
- Audience Discovery
- Persona Builder
- Trend Detection
- Offer Builder
- Funnel Builder
- Campaign Planner
- Budget Planner
- Creative Brief Generator
- Performance Prediction
- Opportunity Detection

## Published events
- `intel.persona.built.v1`
- `intel.opportunity.detected.v1`
- `intel.plan.proposed.v1`
- `intel.brief.generated.v1`

## Consumed events
- `knowledge.*`
- `connector.metric.ingested.v1`
- `analytics.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
