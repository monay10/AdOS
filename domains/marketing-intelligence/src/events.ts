/**
 * Marketing Intelligence Engine — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const MARKETING_INTELLIGENCE_EVENTS = {
  INTEL_PERSONA_BUILT_V1: 'intel.persona.built.v1',
  INTEL_OPPORTUNITY_DETECTED_V1: 'intel.opportunity.detected.v1',
  INTEL_PLAN_PROPOSED_V1: 'intel.plan.proposed.v1',
  INTEL_BRIEF_GENERATED_V1: 'intel.brief.generated.v1',
} as const;

/** Event patterns this context subscribes to. */
export const MARKETING_INTELLIGENCE_SUBSCRIPTIONS = [
  'knowledge.*',
  'connector.metric.ingested.v1',
  'analytics.*',
] as const;
