/**
 * Campaign Engine — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const CAMPAIGN_ENGINE_EVENTS = {
  CAMPAIGN_CREATED_V1: 'campaign.created.v1',
  CAMPAIGN_PUBLISH_REQUESTED_V1: 'campaign.publish.requested.v1',
  CAMPAIGN_LAUNCHED_V1: 'campaign.launched.v1',
  CAMPAIGN_PAUSED_V1: 'campaign.paused.v1',
  CAMPAIGN_SCALED_V1: 'campaign.scaled.v1',
  CAMPAIGN_CREATIVE_REQUESTED_V1: 'campaign.creative.requested.v1',
} as const;

/** Event patterns this context subscribes to. */
export const CAMPAIGN_ENGINE_SUBSCRIPTIONS = [
  'analytics.*',
  'intel.plan.proposed.v1',
  'creative.published.v1',
  'connector.synced.v1',
] as const;
