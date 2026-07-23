/**
 * Autonomy Layer — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const AUTONOMY_EVENTS = {
  AUTONOMY_OPTIMIZATION_APPLIED_V1: 'autonomy.optimization.applied.v1',
  AUTONOMY_HEALING_PERFORMED_V1: 'autonomy.healing.performed.v1',
  AUTONOMY_REVIEW_COMPLETED_V1: 'autonomy.review.completed.v1',
  AUTONOMY_APPROVAL_REQUESTED_V1: 'autonomy.approval.requested.v1',
} as const;

/** Event patterns this context subscribes to. */
export const AUTONOMY_SUBSCRIPTIONS = [
  'analytics.*',
  'agent.*',
  'workflow.*',
  'campaign.*',
  'exec.*',
] as const;
