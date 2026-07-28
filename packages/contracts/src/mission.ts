import type { Money } from './common.js';

/**
 * Mission — the PRIMARY product surface.
 *
 * Users do not think in agents or channels. They state a business objective in
 * natural language ("acquire patients for a new dental clinic, 80.000 TRY/month")
 * and submit it as a Mission. The AI Company then runs autonomously — the CEO
 * Office approves it, the PMO plans it, departments execute — and the user only
 * sees results and the few steps that require a human approval gate.
 *
 * Everything below the Mission (agents, workflows, model routing) is an
 * implementation detail the user never has to see.
 */
export interface Mission {
  id: string;
  tenantId: string;
  /** The raw business objective, in the user's own words. */
  brief: string;
  /** Optional structured constraints extracted or supplied. */
  budget?: Money & { period: 'daily' | 'weekly' | 'monthly' | 'total' };
  targetMetric?: { name: string; target: number; unit: string };
  deadline?: string;
  /** Which steps require human sign-off before the company proceeds. */
  approvalGates: MissionApprovalGate[];
  status: MissionStatus;
  createdBy: string;
  createdAt: string;
}

export type MissionStatus =
  | 'submitted'
  | 'planning'
  | 'awaiting_approval'
  | 'executing'
  | 'paused'
  | 'completed'
  | 'failed';

export type MissionApprovalGate =
  | 'strategy_and_budget'
  | 'creative_assets'
  | 'campaign_launch'
  | 'major_budget_change'
  | 'contract_or_spend';

/** What the user sees back: outcomes and pending approvals, not internal agents. */
export interface MissionUpdate {
  missionId: string;
  status: MissionStatus;
  headline: string;
  /** Human-readable summary of progress produced by the CEO Office. */
  summary: string;
  pendingApproval?: {
    gate: MissionApprovalGate;
    description: string;
    options: string[];
  };
  metrics?: Record<string, number>;
  occurredAt: string;
}

export const MISSION_EVENTS = {
  SUBMITTED: 'mission.submitted.v1',
  PLANNED: 'mission.planned.v1',
  APPROVAL_REQUESTED: 'mission.approval.requested.v1',
  APPROVED: 'mission.approved.v1',
  REVISION_REQUESTED: 'mission.revision.requested.v1',
  EXECUTING: 'mission.executing.v1',
  UPDATED: 'mission.updated.v1',
  COMPLETED: 'mission.completed.v1',
  FAILED: 'mission.failed.v1',
} as const;
