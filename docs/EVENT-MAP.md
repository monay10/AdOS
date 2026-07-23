# AdOS — Event Map

Every cross-context interaction is a domain event on the bus. Contexts never
import each other's code. Event names are versioned: `context.event.vN`.

## Mission lifecycle (the end-to-end autonomous flow)

```
User submits a Mission
        │  mission.submitted.v1
        ▼
Executive AI (CEO Office)  ── reads goal, asks Cognitive Core to plan
        │  mission.planned.v1 · exec.goal.created.v1
        ▼
Corporate OS  ── selects the matching SOP, enforces policy/approval gates
        │  cos.sop.started.v1 · cos.approval.required.v1
        ▼
Organization  ── PMO delegates to departments
        │  exec.work.delegated.v1 · org.kpi.assigned.v1
        ▼
Marketing Intelligence  ── market/competitor/persona/opportunity analysis
        │  intel.persona.built.v1 · intel.plan.proposed.v1 · intel.brief.generated.v1
        ▼
Creative Studio  ── generates + QA-reviews assets (local ComfyUI/Piper)
        │  creative.generated.v1 · creative.reviewed.v1 · creative.published.v1
        ▼
Campaign Engine  ── builds/launches campaigns (event-driven)
        │  campaign.created.v1 · campaign.publish.requested.v1 · campaign.launched.v1
        ▼
Connector Hub  ── pushes to Google/Meta/…; pulls metrics back
        │  connector.synced.v1 · connector.metric.ingested.v1
        ▼
Analytics Engine  ── KPIs, attribution, anomalies, recommendations
        │  analytics.kpi.updated.v1 · analytics.anomaly.detected.v1 · analytics.recommendation.made.v1
        ▼
Corporate OS Policy + Cognitive Core Decision  ── e.g. CTR<2 → regenerate creative; ROAS<3 → pause
        │  campaign.paused.v1 · creative.variant.created.v1 · cos.decision.logged.v1
        ▼
Autonomy Layer  ── continuous self-optimization; monthly/quarterly reviews
        │  autonomy.optimization.applied.v1 · autonomy.review.completed.v1
        ▼
Executive AI  ── CEO summarizes; user sees result + any approval gate
           mission.updated.v1 · mission.completed.v1
```

## Golden-rule reminders (enforced, not aspirational)
- Any box that needs inference calls the **AI Manager** (`AITaskRequest`) — never an engine.
- Any box that needs to *think* calls the **Cognitive Core** — never hand-rolled prompts.
- Any box that *acts* does so under a **COS SOP** with policy/approval/quality gates.
- Every box runs inside a bound **TenantContext**; every event carries `tenantId` + `correlationId`.

See `domains/<name>/src/events.ts` for each context's authoritative published/consumed lists.
