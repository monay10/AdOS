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
  /** Capability of the AI task under review (from its trace), when known. */
  capability?: string;
  /**
   * Wall-clock ms from when the reviewed artifact's trace finished (it became
   * ready for human review) to when the operator approved it — the real review
   * latency, when the artifact's trace could be matched.
   */
  reviewMs?: number;
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

/**
 * The gate-decision log as a port (data-calibration sprint). Implementations may
 * be synchronous (in-memory) or asynchronous (durable SQL) — callers `await`
 * either way. `recentByGate` reads across tenants (governance enforcement is a
 * platform-global property), the substrate the Auto-Calibration engine measures.
 */
export interface GovernanceDecisionLog {
  init?(): Promise<void> | void;
  record(tenantId: string, decision: GateDecision): void | Promise<void>;
  list(tenantId: string): GateDecision[] | Promise<GateDecision[]>;
  /** Most recent decisions for a gate across ALL tenants, newest first. */
  recentByGate(gate: string, limit: number): GateDecision[] | Promise<GateDecision[]>;
}

export class InMemoryGovernanceDecisionLog implements GovernanceDecisionLog {
  private readonly byTenant = new Map<string, GateDecision[]>();
  /** Newest-first log across all tenants, for gate-scoped calibration reads. */
  private readonly all: Array<{ tenantId: string; decision: GateDecision }> = [];
  private readonly max: number;

  constructor(max = 200) {
    this.max = max;
  }

  record(tenantId: string, decision: GateDecision): void {
    const list = this.byTenant.get(tenantId) ?? [];
    list.unshift(decision);
    if (list.length > this.max) list.length = this.max;
    this.byTenant.set(tenantId, list);
    this.all.unshift({ tenantId, decision });
  }

  list(tenantId: string): GateDecision[] {
    return this.byTenant.get(tenantId) ?? [];
  }

  recentByGate(gate: string, limit: number): GateDecision[] {
    const out: GateDecision[] = [];
    for (const { decision } of this.all) {
      if (decision.gate === gate) out.push(decision);
      if (out.length >= limit) break;
    }
    return out;
  }
}

/** Query executor shape the durable log needs (SQLite/Postgres). */
interface Exec {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>;
}

/**
 * Durable gate-decision log — one row per decision on the shared local SQLite
 * file. The in-memory log is bounded (200) and wiped on restart, which cannot
 * support the Auto-Calibration engine's "last 500 decisions / 30-day stability"
 * questions; this makes the funnel and the calibration window real across
 * restarts. 100% local, no server/API.
 */
export class SqlGovernanceDecisionLog implements GovernanceDecisionLog {
  constructor(private readonly db: Exec) {}

  async init(): Promise<void> {
    await this.db.execute(
      'CREATE TABLE IF NOT EXISTS governance_decisions (id INTEGER PRIMARY KEY AUTOINCREMENT, tenant_id TEXT, gate TEXT, flagged INTEGER, acknowledged INTEGER, review_ms INTEGER, capability TEXT, at TEXT)',
    );
  }

  async record(tenantId: string, d: GateDecision): Promise<void> {
    await this.db.execute(
      'INSERT INTO governance_decisions (tenant_id, gate, flagged, acknowledged, review_ms, capability, at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [tenantId, d.gate, d.flagged ? 1 : 0, d.acknowledged ? 1 : 0, d.reviewMs ?? null, d.capability ?? null, d.at],
    );
  }

  async list(tenantId: string): Promise<GateDecision[]> {
    const rows = await this.db.query<DecisionRow>(
      'SELECT gate, flagged, acknowledged, review_ms, capability, at FROM governance_decisions WHERE tenant_id = $1 ORDER BY at DESC LIMIT 500',
      [tenantId],
    );
    return rows.map(toDecision);
  }

  async recentByGate(gate: string, limit: number): Promise<GateDecision[]> {
    const rows = await this.db.query<DecisionRow>(
      'SELECT gate, flagged, acknowledged, review_ms, capability, at FROM governance_decisions WHERE gate = $1 ORDER BY at DESC LIMIT $2',
      [gate, limit],
    );
    return rows.map(toDecision);
  }
}

interface DecisionRow {
  gate: string;
  flagged: number;
  acknowledged: number;
  review_ms: number | null;
  capability: string | null;
  at: string;
}

function toDecision(r: DecisionRow): GateDecision {
  return {
    gate: r.gate,
    flagged: !!r.flagged,
    acknowledged: !!r.acknowledged,
    at: r.at,
    ...(r.capability != null ? { capability: r.capability } : {}),
    ...(r.review_ms != null ? { reviewMs: Number(r.review_ms) } : {}),
  };
}

/** Aggregate a set of gate decisions into an approval/override funnel. */
export function approvalFunnel(decisions: readonly GateDecision[]): ApprovalFunnel {
  const approvals = decisions.length;
  const flagged = decisions.filter((d) => d.flagged).length;
  const overrides = decisions.filter((d) => d.flagged && d.acknowledged).length;
  const overrideRatePct = flagged === 0 ? 0 : Math.round((overrides / flagged) * 1000) / 10;
  return { approvals, flagged, overrides, overrideRatePct };
}

export interface ReviewStats {
  /** Decisions that carried a real review latency. */
  count: number;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  /** Mean review latency per capability, for the capabilities that appeared. */
  byCapability: Array<{ capability: string; count: number; meanMs: number }>;
}

/** Percentile (0–100) of an ascending-sorted numeric array (nearest-rank). */
function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0;
  const rank = Math.ceil((p / 100) * sorted.length);
  const idx = Math.min(sorted.length - 1, Math.max(0, rank - 1));
  return sorted[idx]!;
}

/**
 * Review-duration statistics over gate decisions that carried a real review
 * latency (mean, P50, P95, and per-capability mean). Decisions without a
 * matched `reviewMs` are honestly excluded rather than counted as zero.
 */
export function reviewStats(decisions: readonly GateDecision[]): ReviewStats {
  const timed = decisions.filter(
    (d): d is GateDecision & { reviewMs: number } => typeof d.reviewMs === 'number' && d.reviewMs >= 0,
  );
  const count = timed.length;
  if (count === 0) return { count: 0, meanMs: 0, p50Ms: 0, p95Ms: 0, byCapability: [] };

  const sorted = timed.map((d) => d.reviewMs).sort((a, b) => a - b);
  const total = sorted.reduce((sum, ms) => sum + ms, 0);
  const round = (n: number) => Math.round(n * 10) / 10;

  const perCap = new Map<string, { count: number; sum: number }>();
  for (const d of timed) {
    const cap = d.capability ?? 'unknown';
    const agg = perCap.get(cap) ?? { count: 0, sum: 0 };
    agg.count += 1;
    agg.sum += d.reviewMs;
    perCap.set(cap, agg);
  }
  const byCapability = [...perCap.entries()]
    .map(([capability, agg]) => ({ capability, count: agg.count, meanMs: round(agg.sum / agg.count) }))
    .sort((a, b) => b.count - a.count || a.capability.localeCompare(b.capability));

  return {
    count,
    meanMs: round(total / count),
    p50Ms: round(percentile(sorted, 50)),
    p95Ms: round(percentile(sorted, 95)),
    byCapability,
  };
}
