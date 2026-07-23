# Campaign Engine

> **Layer:** Domain · **Build:** BOOK 10 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Event-driven campaign lifecycle: creation, publishing, scheduling, budget, targeting, A/B testing, creative rotation, keyword/bid optimization, performance monitoring, auto scale/pause/restart, learning, cloning and templates. Every state change is a domain event.

## Sub-modules
- Campaign Creation
- Campaign Publishing
- Campaign Scheduling
- Budget Management
- Audience Targeting
- A/B Testing
- Creative Rotation
- Keyword Optimization
- Bid Optimization
- Performance Monitoring
- Auto Scaling
- Auto Pausing
- Auto Restart
- Campaign Learning
- Campaign Cloning
- Campaign Templates

## Published events
- `campaign.created.v1`
- `campaign.publish.requested.v1`
- `campaign.launched.v1`
- `campaign.paused.v1`
- `campaign.scaled.v1`
- `campaign.creative.requested.v1`

## Consumed events
- `analytics.*`
- `intel.plan.proposed.v1`
- `creative.published.v1`
- `connector.synced.v1`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
