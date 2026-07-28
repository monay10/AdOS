/**
 * Governance decision log + approval funnel (Sprint 5, slice 2).
 *
 * At each human approval gate we record whether governance had flagged the
 * artifact and whether the operator explicitly acknowledged (overrode) it. The
 * funnel over these decisions answers the question that gates the Evidence /
 * Confidence hard-enforcement rungs: **how often are governance-flagged outputs
 * approved anyway?** A high override rate means auto-blocking would fight the
 * operators — so it must be measured before any hard block is switched on.
 *
 * Tenant-scoped, bounded, in-memory — the same shape as the trace store.
 */

export interface GateDecision {
  gate: string;
  /** Governance flagged this artifact (constitution verdict did not pass). */
  flagged: boolean;
  /** The operator explicitly acknowledged the governance flags to proceed. */
  acknowledged: boolean;
  at: string;
}

export interface ApprovalFunnel {
  /** Total gate approvals recorded. */
  approvals: number;
  /** Approvals where governance had flagged the artifact. */
  flagged: number;
  /** Flagged approvals the operator overrode (acknowledged and proceeded). */
  overrides: number;
  /** overrides / flagged, as a percentage (0 when nothing was flagged). */
  overrideRatePct: number;
}

export class InMemoryGovernanceDecisionLog {
  private readonly byTenant = new Map<string, GateDecision[]>();
  private readonly max: number;

  constructor(max = 200) {
    this.max = max;
  }

  record(tenantId: string, decision: GateDecision): void {
    const list = this.byTenant.get(tenantId) ?? [];
    list.unshift(decision);
    if (list.length > this.max) list.length = this.max;
    this.byTenant.set(tenantId, list);
  }

  list(tenantId: string): GateDecision[] {
    return this.byTenant.get(tenantId) ?? [];
  }
}

/** Aggregate a set of gate decisions into an approval/override funnel. */
export function approvalFunnel(decisions: readonly GateDecision[]): ApprovalFunnel {
  const approvals = decisions.length;
  const flagged = decisions.filter((d) => d.flagged).length;
  const overrides = decisions.filter((d) => d.flagged && d.acknowledged).length;
  const overrideRatePct = flagged === 0 ? 0 : Math.round((overrides / flagged) * 1000) / 10;
  return { approvals, flagged, overrides, overrideRatePct };
}
