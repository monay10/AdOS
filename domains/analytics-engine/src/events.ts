/**
 * Analytics Engine — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const ANALYTICS_ENGINE_EVENTS = {
  ANALYTICS_KPI_UPDATED_V1: 'analytics.kpi.updated.v1',
  ANALYTICS_ANOMALY_DETECTED_V1: 'analytics.anomaly.detected.v1',
  ANALYTICS_REPORT_GENERATED_V1: 'analytics.report.generated.v1',
  ANALYTICS_RECOMMENDATION_MADE_V1: 'analytics.recommendation.made.v1',
} as const;

/** Event patterns this context subscribes to. */
export const ANALYTICS_ENGINE_SUBSCRIPTIONS = [
  'connector.metric.ingested.v1',
  'campaign.*',
  'creative.*',
] as const;
