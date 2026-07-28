import type { ExecutionTrace } from '@ados/ai-manager';

/**
 * Governance analytics (Sprint 5, slice 1) — aggregate, honest metrics computed
 * over the live ExecutionTraces the Stage Engine already produces. This is
 * measurement BEFORE enforcement: it answers "how often is output ungrounded?
 * what is the confidence distribution? which capability draws the most
 * warnings?" — exactly the numbers the later evidence/confidence enforcement
 * thresholds must be set from, instead of guessed.
 *
 * Pure function of the traces: no new state, no model calls, deterministic.
 */

export interface ConfidenceBucket {
  label: string;
  count: number;
}

export interface CapabilityGovernanceStat {
  capability: string;
  count: number;
  warnings: number; // traces with ≥1 constitution violation
}

export interface GovernanceMetrics {
  /** Traces that carry a governance (constitution) verdict. */
  total: number;
  /** % of tasks whose output gathered ≥1 evidence source. */
  evidenceCoveragePct: number;
  /** % of tasks flagged `no_evidence` by the constitution. */
  noEvidenceRatePct: number;
  /** % of tasks whose constitution verdict passed. */
  constitutionPassRatePct: number;
  /** Mean confidence score (0–100) across tasks that carry one. */
  confidenceAvg: number;
  /** Confidence histogram in fixed 20-point bands. */
  confidenceBuckets: ConfidenceBucket[];
  /** Mean end-to-end task latency in ms. */
  avgLatencyMs: number;
  /** Per-capability task counts + warning counts, most-warned first. */
  byCapability: CapabilityGovernanceStat[];
}

const BANDS: Array<[string, number, number]> = [
  ['0–20', 0, 20],
  ['20–40', 20, 40],
  ['40–60', 40, 60],
  ['60–80', 60, 80],
  ['80–100', 80, 101],
];

function pct(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 1000) / 10; // 1 decimal
}

function constitutionDetail(trace: ExecutionTrace): Record<string, unknown> | undefined {
  return trace.steps.find((s) => s.name === 'constitution')?.detail;
}

/** Compute governance metrics over a set of sealed traces. */
export function governanceMetrics(traces: readonly ExecutionTrace[]): GovernanceMetrics {
  // Only traces that actually carry a governance verdict count toward governance metrics.
  const governed = traces.filter((t) => constitutionDetail(t) !== undefined);
  const total = governed.length;

  let withEvidence = 0;
  let noEvidence = 0;
  let passed = 0;
  let latencySum = 0;
  const confidences: number[] = [];
  const buckets: ConfidenceBucket[] = BANDS.map(([label]) => ({ label, count: 0 }));
  const capMap = new Map<string, CapabilityGovernanceStat>();

  for (const trace of governed) {
    const detail = constitutionDetail(trace)!;
    const violations = Array.isArray(detail['violations']) ? (detail['violations'] as string[]) : [];

    if (trace.evidence.length > 0) withEvidence += 1;
    if (violations.includes('no_evidence')) noEvidence += 1;
    if (detail['passed'] === true) passed += 1;
    if (trace.latencyMs !== undefined) latencySum += trace.latencyMs;

    const score = trace.confidence?.score;
    if (typeof score === 'number') {
      confidences.push(score);
      const idx = BANDS.findIndex(([, lo, hi]) => score >= lo && score < hi);
      if (idx >= 0) buckets[idx]!.count += 1;
    }

    const capability = trace.capability ?? 'unknown';
    const stat = capMap.get(capability) ?? { capability, count: 0, warnings: 0 };
    stat.count += 1;
    if (violations.length > 0) stat.warnings += 1;
    capMap.set(capability, stat);
  }

  const confidenceAvg =
    confidences.length === 0 ? 0 : Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length);
  const avgLatencyMs = total === 0 ? 0 : Math.round(latencySum / total);
  const byCapability = [...capMap.values()].sort((a, b) => b.warnings - a.warnings || b.count - a.count);

  return {
    total,
    evidenceCoveragePct: pct(withEvidence, total),
    noEvidenceRatePct: pct(noEvidence, total),
    constitutionPassRatePct: pct(passed, total),
    confidenceAvg,
    confidenceBuckets: buckets,
    avgLatencyMs,
    byCapability,
  };
}
