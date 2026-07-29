import type { GateDecision, GovernanceDecisionLog } from './governance-decisions.js';
import { MISSION_GATES } from './governance-policy.js';

/**
 * Governance Auto-Calibration — a policy engine, not a single threshold.
 *
 * The Enforced tier (Sprint 8) is a per-gate operator opt-in, deliberately, until
 * a gate's measured data supports hard-blocking. This turns that judgement into an
 * explainable, data-driven state machine over the DURABLE gate-decision history:
 *
 *     Observe ──(eligible)──▶ Candidate ──(operator promotes)──▶ Enforced
 *        ▲                        │                                  │
 *        └──(no longer eligible)──┘                                  │
 *        └────────────────(override rises — auto-relax)─────────────┘
 *
 * The safety asymmetry is the whole point: the system may only ever *relax*
 * automatically (Enforced → Observe when the override rate climbs back up).
 * *Tightening* — Candidate → Enforced — is ALWAYS an explicit operator action.
 * A machine can drop a block it can no longer justify; only a human adds one.
 *
 * Eligibility is a conjunction of independent signals (never one metric), and
 * every decision is explainable: each signal is reported with its value and a
 * pass/fail, plus a blended confidence score. 100% local, over the local store.
 */

export type CalibrationState = 'observe' | 'candidate' | 'enforced';

export interface CalibrationConfig {
  /** How many recent decisions per gate to measure. */
  window: number;
  /** Minimum decisions before a gate can be a Candidate. */
  minSamples: number;
  /** Max override rate (overrides/flagged, %) to be eligible. */
  maxOverridePct: number;
  /** Minimum span of decision history (days) — "stable for N days". */
  minStableDays: number;
  /** Max false-positive rate (flagged-but-overridden / all approvals, %). */
  maxFalsePositivePct: number;
  /** Max allowed increase in mean review time, recent vs older half (%). */
  maxReviewIncreasePct: number;
  /** An Enforced gate auto-relaxes to Observe once override exceeds this (%). */
  demoteOverridePct: number;
}

export const DEFAULT_CALIBRATION_CONFIG: CalibrationConfig = {
  window: 500,
  minSamples: 500,
  maxOverridePct: 1,
  minStableDays: 30,
  maxFalsePositivePct: 2,
  maxReviewIncreasePct: 25,
  demoteOverridePct: 2,
};

export interface GateMetrics {
  samples: number;
  approvals: number;
  flagged: number;
  overrides: number;
  /** overrides / flagged (%). */
  overrideRatePct: number;
  /** flagged / approvals (%). */
  flaggedRatePct: number;
  /** flagged-but-overridden / approvals (%) — the false-positive proxy. */
  falsePositiveRatePct: number;
  reviewMeanMs: number;
  reviewP95Ms: number;
  /** Span of the measured history in days (oldest → newest decision). */
  dataSpanDays: number;
  /** Override rate, recent half − older half (pp). Positive = worsening. */
  overrideTrendPp: number;
  /** Mean review time change, recent vs older half (%). Positive = slower. */
  reviewTrendPct: number;
}

export type CalSignal = 'samples' | 'override' | 'stability' | 'falsePositive' | 'review';

export interface CalibrationReason {
  signal: CalSignal;
  /** The measured value this signal reflects (samples / pct / days). */
  value: number;
  ok: boolean;
}

/** The engine's read on a gate, independent of its persisted state. */
export interface GateAssessment {
  metrics: GateMetrics;
  confidence: number; // 0..100
  eligible: boolean;
  reasons: CalibrationReason[];
}

const MS_PER_DAY = 86_400_000;
const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));
const round1 = (n: number): number => Math.round(n * 10) / 10;

function percentile(sortedAsc: readonly number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const rank = Math.ceil((p / 100) * sortedAsc.length);
  return sortedAsc[Math.min(sortedAsc.length - 1, Math.max(0, rank - 1))]!;
}

function overrideRate(decisions: readonly GateDecision[]): number {
  const flagged = decisions.filter((d) => d.flagged).length;
  if (flagged === 0) return 0;
  const overrides = decisions.filter((d) => d.flagged && d.acknowledged).length;
  return (overrides / flagged) * 100;
}

function meanReview(decisions: readonly GateDecision[]): number {
  const timed = decisions.map((d) => d.reviewMs).filter((ms): ms is number => typeof ms === 'number');
  if (timed.length === 0) return 0;
  return timed.reduce((s, ms) => s + ms, 0) / timed.length;
}

/**
 * Measure a gate's decisions against the config and produce an explainable
 * assessment: metrics, a per-signal pass/fail, a blended confidence, and overall
 * eligibility (the AND of every signal). Pure — no state, no clock side effects.
 */
export function calibrateGate(
  decisions: readonly GateDecision[],
  config: CalibrationConfig = DEFAULT_CALIBRATION_CONFIG,
): GateAssessment {
  const window = decisions.slice(0, config.window); // callers pass newest-first
  const approvals = window.length;
  const flagged = window.filter((d) => d.flagged).length;
  const overrides = window.filter((d) => d.flagged && d.acknowledged).length;
  const overrideRatePct = round1(overrideRate(window));
  const flaggedRatePct = approvals === 0 ? 0 : round1((flagged / approvals) * 100);
  const falsePositiveRatePct = approvals === 0 ? 0 : round1((overrides / approvals) * 100);

  const reviewTimes = window
    .map((d) => d.reviewMs)
    .filter((ms): ms is number => typeof ms === 'number')
    .sort((a, b) => a - b);
  const reviewMeanMs = Math.round(meanReview(window));
  const reviewP95Ms = Math.round(percentile(reviewTimes, 95));

  // Time span + recent-vs-older trend, computed over sorted timestamps.
  const times = window.map((d) => Date.parse(d.at)).filter((t) => !Number.isNaN(t));
  const dataSpanDays =
    times.length >= 2 ? round1((Math.max(...times) - Math.min(...times)) / MS_PER_DAY) : 0;
  const mid = Math.floor(window.length / 2);
  const recent = window.slice(0, mid); // newest half
  const older = window.slice(mid); // oldest half
  const overrideTrendPp = round1(overrideRate(recent) - overrideRate(older));
  const olderMean = meanReview(older);
  const reviewTrendPct = olderMean === 0 ? 0 : round1(((meanReview(recent) - olderMean) / olderMean) * 100);

  const metrics: GateMetrics = {
    samples: approvals,
    approvals,
    flagged,
    overrides,
    overrideRatePct,
    flaggedRatePct,
    falsePositiveRatePct,
    reviewMeanMs,
    reviewP95Ms,
    dataSpanDays,
    overrideTrendPp,
    reviewTrendPct,
  };

  // Independent signals — eligibility is the AND of all of them.
  const reasons: CalibrationReason[] = [
    { signal: 'samples', value: approvals, ok: approvals >= config.minSamples },
    { signal: 'override', value: overrideRatePct, ok: overrideRatePct <= config.maxOverridePct },
    { signal: 'stability', value: dataSpanDays, ok: dataSpanDays >= config.minStableDays && overrideTrendPp <= 0.5 },
    { signal: 'falsePositive', value: falsePositiveRatePct, ok: falsePositiveRatePct <= config.maxFalsePositivePct },
    { signal: 'review', value: reviewTrendPct, ok: reviewTrendPct <= config.maxReviewIncreasePct },
  ];
  const eligible = reasons.every((r) => r.ok);

  // Blended, transparent confidence. Data sufficiency (sampleFactor) is a
  // MULTIPLICATIVE gate — with no history there is no confidence, however "clean"
  // the empty metrics look — over a weighted quality of the independent signals.
  const sampleFactor = clamp01(approvals / config.minSamples);
  const overrideFactor = clamp01(1 - overrideRatePct / config.maxOverridePct);
  const fpFactor = clamp01(1 - falsePositiveRatePct / config.maxFalsePositivePct);
  const spanFactor = config.minStableDays <= 0 ? 1 : clamp01(dataSpanDays / config.minStableDays);
  const stabilityFactor = spanFactor * (overrideTrendPp <= 0.5 ? 1 : 0.5);
  const reviewFactor = clamp01(1 - Math.max(0, reviewTrendPct) / config.maxReviewIncreasePct);
  const quality = 0.4 * overrideFactor + 0.2 * fpFactor + 0.25 * stabilityFactor + 0.15 * reviewFactor;
  const confidence = Math.round(100 * sampleFactor * quality);

  return { metrics, confidence, eligible, reasons };
}

// ── Persisted state ───────────────────────────────────────────────────────────

export interface CalibrationRecord {
  gate: string;
  state: CalibrationState;
  /** When the gate entered its current state (ISO). */
  since: string;
  /** Why it last changed state (human-readable code/detail). */
  reason: string;
  updatedAt: string;
}

export interface CalibrationStore {
  init?(): Promise<void> | void;
  load(): Promise<CalibrationRecord[]> | CalibrationRecord[];
  save(record: CalibrationRecord): Promise<void> | void;
}

export class InMemoryCalibrationStore implements CalibrationStore {
  private readonly byGate = new Map<string, CalibrationRecord>();
  load(): CalibrationRecord[] {
    return [...this.byGate.values()];
  }
  save(record: CalibrationRecord): void {
    this.byGate.set(record.gate, record);
  }
}

interface Exec {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>;
}

/** Durable calibration state — one row per gate on the shared local SQLite file. */
export class SqlCalibrationStore implements CalibrationStore {
  constructor(private readonly db: Exec) {}
  async init(): Promise<void> {
    await this.db.execute(
      'CREATE TABLE IF NOT EXISTS governance_calibration (gate TEXT PRIMARY KEY, state TEXT NOT NULL, since TEXT NOT NULL, reason TEXT, updated_at TEXT NOT NULL)',
    );
  }
  async load(): Promise<CalibrationRecord[]> {
    const rows = await this.db.query<{ gate: string; state: string; since: string; reason: string | null; updated_at: string }>(
      'SELECT gate, state, since, reason, updated_at FROM governance_calibration',
    );
    return rows.map((r) => ({
      gate: r.gate,
      state: r.state as CalibrationState,
      since: r.since,
      reason: r.reason ?? '',
      updatedAt: r.updated_at,
    }));
  }
  async save(rec: CalibrationRecord): Promise<void> {
    await this.db.execute(
      'INSERT INTO governance_calibration (gate, state, since, reason, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (gate) DO UPDATE SET state = excluded.state, since = excluded.since, reason = excluded.reason, updated_at = excluded.updated_at',
      [rec.gate, rec.state, rec.since, rec.reason, rec.updatedAt],
    );
  }
}

// ── The state machine ───────────────────────────────────────────────────────

/** A gate's full calibration view: the engine's assessment + its persisted state. */
export interface GateCalibration extends GateAssessment {
  gate: string;
  state: CalibrationState;
  since: string;
  daysInState: number;
  samplesSinceChange: number;
  lastReason: string;
}

export class GovernanceCalibration {
  private readonly states = new Map<string, CalibrationRecord>();
  private readonly enforced = new Set<string>();

  constructor(
    private readonly decisions: GovernanceDecisionLog,
    private readonly store: CalibrationStore = new InMemoryCalibrationStore(),
    private readonly config: CalibrationConfig = DEFAULT_CALIBRATION_CONFIG,
    private readonly clock: () => number = () => Date.now(),
  ) {}

  /** Load persisted state at startup (call once). */
  async restore(): Promise<void> {
    if (this.store.init) await this.store.init();
    if (this.decisions.init) await this.decisions.init();
    for (const rec of await this.store.load()) this.states.set(rec.gate, rec);
    this.refreshEnforced();
  }

  /** Synchronous, hot-path check the approval gate uses (reads the cache). */
  isEnforced(gate: string): boolean {
    return this.enforced.has(gate);
  }

  private refreshEnforced(): void {
    this.enforced.clear();
    for (const rec of this.states.values()) if (rec.state === 'enforced') this.enforced.add(rec.gate);
  }

  private iso(now: number): string {
    return new Date(now).toISOString();
  }

  private recordOf(gate: string, now: number): CalibrationRecord {
    return this.states.get(gate) ?? { gate, state: 'observe', since: this.iso(now), reason: 'init', updatedAt: this.iso(now) };
  }

  private async transition(rec: CalibrationRecord, state: CalibrationState, reason: string, now: number): Promise<CalibrationRecord> {
    const next: CalibrationRecord = { gate: rec.gate, state, since: this.iso(now), reason, updatedAt: this.iso(now) };
    this.states.set(rec.gate, next);
    await this.store.save(next);
    return next;
  }

  private async view(gate: string, now: number): Promise<GateCalibration> {
    const decisions = await this.decisions.recentByGate(gate, this.config.window);
    const assessment = calibrateGate(decisions, this.config);
    const rec = this.recordOf(gate, now);
    const sinceMs = Date.parse(rec.since);
    const daysInState = Number.isNaN(sinceMs) ? 0 : round1((now - sinceMs) / MS_PER_DAY);
    const samplesSinceChange = Number.isNaN(sinceMs)
      ? decisions.length
      : decisions.filter((d) => Date.parse(d.at) >= sinceMs).length;
    return {
      ...assessment,
      gate,
      state: rec.state,
      since: rec.since,
      daysInState,
      samplesSinceChange,
      lastReason: rec.reason,
    };
  }

  /**
   * Recompute every gate and apply the AUTOMATIC transitions only:
   *  - Observe → Candidate when the gate becomes eligible (a suggestion; NOT
   *    enforced — enforcement still needs an operator).
   *  - Candidate → Observe when it is no longer eligible.
   *  - Enforced → Observe (auto-relax) when the override rate climbs past the
   *    demote threshold. This is the only automatic enforcement CHANGE, and it
   *    can only ever REMOVE a block.
   * Returns the full per-gate view for the UI.
   */
  async recompute(now: number = this.clock()): Promise<GateCalibration[]> {
    for (const gate of MISSION_GATES) {
      const decisions = await this.decisions.recentByGate(gate, this.config.window);
      const { eligible, metrics } = calibrateGate(decisions, this.config);
      let rec = this.recordOf(gate, now);
      if (rec.state === 'observe' && eligible) {
        rec = await this.transition(rec, 'candidate', 'eligible', now);
      } else if (rec.state === 'candidate' && !eligible) {
        rec = await this.transition(rec, 'observe', 'no-longer-eligible', now);
      } else if (rec.state === 'enforced' && metrics.overrideRatePct > this.config.demoteOverridePct) {
        rec = await this.transition(rec, 'observe', `auto-relax: override ${metrics.overrideRatePct}%`, now);
      } else if (!this.states.has(gate)) {
        // Seed a persisted Observe record so `since` is anchored.
        this.states.set(gate, rec);
        await this.store.save(rec);
      }
    }
    this.refreshEnforced();
    return Promise.all(MISSION_GATES.map((g) => this.view(g, now)));
  }

  /**
   * Operator promotes a Candidate to Enforced — the ONLY tightening transition,
   * and it is human-only. Refuses unless the gate is currently a Candidate AND
   * still eligible on fresh data. Returns whether it promoted.
   */
  async promote(gate: string, now: number = this.clock()): Promise<boolean> {
    const rec = this.recordOf(gate, now);
    if (rec.state !== 'candidate') return false;
    const decisions = await this.decisions.recentByGate(gate, this.config.window);
    if (!calibrateGate(decisions, this.config).eligible) return false;
    await this.transition(rec, 'enforced', 'operator promoted', now);
    this.refreshEnforced();
    return true;
  }

  /** Operator returns a gate to Observe (manual relax). Always allowed. */
  async demote(gate: string, now: number = this.clock()): Promise<void> {
    await this.transition(this.recordOf(gate, now), 'observe', 'operator returned to observe', now);
    this.refreshEnforced();
  }
}
