/**
 * Agent Framework — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const AGENT_FRAMEWORK_EVENTS = {
  AGENT_REGISTERED_V1: 'agent.registered.v1',
  AGENT_STARTED_V1: 'agent.started.v1',
  AGENT_COMPLETED_V1: 'agent.completed.v1',
  AGENT_FAILED_V1: 'agent.failed.v1',
  AGENT_ESCALATED_V1: 'agent.escalated.v1',
} as const;

/** Event patterns this context subscribes to. */
export const AGENT_FRAMEWORK_SUBSCRIPTIONS = [
  'workflow.*',
  'goal.*',
  'campaign.*',
] as const;
