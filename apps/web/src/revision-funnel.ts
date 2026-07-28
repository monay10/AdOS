/**
 * Revision funnel (Sprint 5, slice 4).
 *
 * The non-destructive revision loop (Sprint 2) advances a mission's history
 * rather than destroying a rejected artifact. This funnel reads how that loop
 * actually plays out across a tenant's missions: how many were created, how many
 * needed at least one revision, the total revisions requested, and how many
 * reached completion. It closes the loop the approval funnel opened —
 * created → revised → completed — from real mission state.
 */

export interface MissionSummary {
  revisionCount: number;
  status: string;
}

export interface RevisionFunnel {
  created: number;
  withRevisions: number;
  totalRevisions: number;
  completed: number;
  /** % of missions that needed ≥1 revision. */
  revisionRatePct: number;
}

export function revisionFunnel(missions: readonly MissionSummary[]): RevisionFunnel {
  const created = missions.length;
  const withRevisions = missions.filter((m) => m.revisionCount > 0).length;
  const totalRevisions = missions.reduce((sum, m) => sum + m.revisionCount, 0);
  const completed = missions.filter((m) => m.status === 'completed').length;
  const revisionRatePct = created === 0 ? 0 : Math.round((withRevisions / created) * 1000) / 10;
  return { created, withRevisions, totalRevisions, completed, revisionRatePct };
}
