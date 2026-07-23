/**
 * Executive AI — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const EXECUTIVE_AI_EVENTS = {
  EXEC_GOAL_CREATED_V1: 'exec.goal.created.v1',
  EXEC_WORK_DELEGATED_V1: 'exec.work.delegated.v1',
  EXEC_APPROVAL_GRANTED_V1: 'exec.approval.granted.v1',
  EXEC_BUDGET_ALLOCATED_V1: 'exec.budget.allocated.v1',
  EXEC_REPORT_REQUESTED_V1: 'exec.report.requested.v1',
  EXEC_DASHBOARD_GENERATED_V1: 'exec.dashboard.generated.v1',
} as const;

/** Event patterns this context subscribes to. */
export const EXECUTIVE_AI_SUBSCRIPTIONS = [
  'analytics.*',
  'agent.*',
  'workflow.approval.requested.v1',
  'campaign.*',
] as const;
