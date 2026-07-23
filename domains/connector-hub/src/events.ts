/**
 * Connector Hub — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const CONNECTOR_HUB_EVENTS = {
  CONNECTOR_SYNCED_V1: 'connector.synced.v1',
  CONNECTOR_METRIC_INGESTED_V1: 'connector.metric.ingested.v1',
  CONNECTOR_ERROR_V1: 'connector.error.v1',
  CONNECTOR_RATELIMITED_V1: 'connector.ratelimited.v1',
} as const;

/** Event patterns this context subscribes to. */
export const CONNECTOR_HUB_SUBSCRIPTIONS = [
  'campaign.publish.requested.v1',
  'creative.published.v1',
] as const;
