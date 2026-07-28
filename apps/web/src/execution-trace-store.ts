import type { ExecutionTrace } from '@ados/ai-manager';

/**
 * A bounded, tenant-scoped store of sealed ExecutionTraces.
 *
 * Sprint 4.1 (Governed Pipeline Unification, slice 1): every live AI task now
 * leaves an auditable ExecutionTrace. This store keeps the most recent traces
 * per tenant so the operator can watch AdOS's AI work as it happens. It holds
 * only what actually ran — it never fabricates governance stages that are not
 * yet wired (those arrive in slices 4.2/4.3).
 */
export class InMemoryExecutionTraceStore {
  private readonly byTenant = new Map<string, ExecutionTrace[]>();
  private readonly max: number;

  constructor(max = 100) {
    this.max = max;
  }

  /** Record a sealed trace under its tenant, newest first, bounded. */
  record(tenantId: string, trace: ExecutionTrace): void {
    const list = this.byTenant.get(tenantId) ?? [];
    list.unshift(trace);
    if (list.length > this.max) list.length = this.max;
    this.byTenant.set(tenantId, list);
  }

  /** Most recent traces for a tenant, newest first. */
  list(tenantId: string, limit = 25): ExecutionTrace[] {
    return (this.byTenant.get(tenantId) ?? []).slice(0, limit);
  }

  /** Total traces held for a tenant (for a small "N tasks traced" summary). */
  count(tenantId: string): number {
    return this.byTenant.get(tenantId)?.length ?? 0;
  }
}
