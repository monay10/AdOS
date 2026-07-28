/**
 * Mission Queue (Recommendation → Apply).
 *
 * When an operator applies a recommendation, the system creates a mission from
 * it and an agent runs the mechanical generation (the brief) — then STOPS at the
 * human approval gate (Book F Law 5: the human gate is a first-class stage, never
 * skipped). This queue records those agent-driven missions and their status, so
 * the operator can see what the recommendation turned into and pick up the human
 * decision. Tenant-scoped and bounded, like the trace + decision logs.
 */

export type QueuedStatus = 'generating' | 'awaiting_approval' | 'failed';

export interface QueuedMission {
  missionId: string;
  /** The recommendation that spawned it. */
  vertical: string;
  kind: string;
  objective: string;
  status: QueuedStatus;
  at: string;
}

export class InMemoryMissionQueue {
  private readonly byTenant = new Map<string, QueuedMission[]>();
  private readonly max: number;

  constructor(max = 100) {
    this.max = max;
  }

  enqueue(tenantId: string, item: QueuedMission): void {
    const list = this.byTenant.get(tenantId) ?? [];
    list.unshift(item);
    if (list.length > this.max) list.length = this.max;
    this.byTenant.set(tenantId, list);
  }

  updateStatus(tenantId: string, missionId: string, status: QueuedStatus): void {
    const item = this.byTenant.get(tenantId)?.find((q) => q.missionId === missionId);
    if (item) item.status = status;
  }

  list(tenantId: string): QueuedMission[] {
    return this.byTenant.get(tenantId) ?? [];
  }
}
