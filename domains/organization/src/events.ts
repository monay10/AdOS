/**
 * Organization Layer (Digital Company) — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const ORGANIZATION_EVENTS = {
  ORG_DEPARTMENT_SPAWNED_V1: 'org.department.spawned.v1',
  ORG_KPI_ASSIGNED_V1: 'org.kpi.assigned.v1',
  ORG_PROCEDURE_UPDATED_V1: 'org.procedure.updated.v1',
} as const;

/** Event patterns this context subscribes to. */
export const ORGANIZATION_SUBSCRIPTIONS = [
  'exec.*',
  'analytics.*',
] as const;
