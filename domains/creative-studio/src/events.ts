/**
 * Creative Studio — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const CREATIVE_STUDIO_EVENTS = {
  CREATIVE_GENERATED_V1: 'creative.generated.v1',
  CREATIVE_REVIEWED_V1: 'creative.reviewed.v1',
  CREATIVE_VARIANT_CREATED_V1: 'creative.variant.created.v1',
  CREATIVE_PUBLISHED_V1: 'creative.published.v1',
} as const;

/** Event patterns this context subscribes to. */
export const CREATIVE_STUDIO_SUBSCRIPTIONS = [
  'intel.brief.generated.v1',
  'campaign.creative.requested.v1',
] as const;
