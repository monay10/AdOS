# Analytics Engine

> **Layer:** Domain · **Build:** BOOK 11 · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see `/ROADMAP.md`)

Continuously-updated performance intelligence: ROI/ROAS/CTR/CPA/CAC/LTV, attribution, conversion tracking, dashboards, forecasting, anomaly detection, KPI engine, recommendations and scheduled executive/weekly/daily reports plus realtime monitoring.

## Sub-modules
- ROI / ROAS / CTR / CPA / CAC / LTV
- Attribution
- Conversion Tracking
- Dashboard
- Forecasting
- Anomaly Detection
- KPI Engine
- Recommendation Engine
- Executive / Weekly / Daily Reports
- Realtime Monitoring

## Published events
- `analytics.kpi.updated.v1`
- `analytics.anomaly.detected.v1`
- `analytics.report.generated.v1`
- `analytics.recommendation.made.v1`

## Consumed events
- `connector.metric.ingested.v1`
- `campaign.*`
- `creative.*`

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound `TenantContext`.
- Event-driven: cross-context integration happens only via the events above.
