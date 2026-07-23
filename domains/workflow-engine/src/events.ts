/**
 * Workflow Engine — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const WORKFLOW_ENGINE_EVENTS = {
  WORKFLOW_STARTED_V1: 'workflow.started.v1',
  WORKFLOW_STEP_COMPLETED_V1: 'workflow.step.completed.v1',
  WORKFLOW_COMPLETED_V1: 'workflow.completed.v1',
  WORKFLOW_FAILED_V1: 'workflow.failed.v1',
  WORKFLOW_APPROVAL_REQUESTED_V1: 'workflow.approval.requested.v1',
} as const;

/** Event patterns this context subscribes to. */
export const WORKFLOW_ENGINE_SUBSCRIPTIONS = [
  'agent.*',
  'goal.*',
  'campaign.*',
] as const;
