import { describe, expect, it } from 'vitest';
import type { ExecutionTrace } from '@ados/ai-manager';
import { governanceMetrics } from './governance-metrics.js';

/** Build a minimal sealed-shaped trace for metrics tests. */
function trace(over: {
  capability?: string;
  evidenceCount?: number;
  confidence?: number;
  passed?: boolean;
  violations?: string[];
  latencyMs?: number;
  governance?: boolean; // whether a constitution step exists
}): ExecutionTrace {
  const steps: ExecutionTrace['steps'] = [{ name: 'inference', at: 't' }];
  if (over.governance !== false) {
    steps.push({
      name: 'constitution',
      at: 't',
      detail: { passed: over.passed ?? false, ...(over.violations ? { violations: over.violations } : {}) },
    });
  }
  return {
    jobId: 'j',
    tools: [],
    contextRefs: [],
    evidence: Array.from({ length: over.evidenceCount ?? 0 }, (_, i) => ({ source: 'marketing_brain', ref: `r${i}`, detail: 'd', weight: 0.5 })),
    eventsProduced: [],
    knowledgeEnriched: [],
    steps,
    startedAt: 't',
    ...(over.capability ? { capability: over.capability } : {}),
    ...(over.confidence !== undefined ? { confidence: { score: over.confidence, reason: 'r' } } : {}),
    ...(over.latencyMs !== undefined ? { latencyMs: over.latencyMs } : {}),
  } as ExecutionTrace;
}

describe('governanceMetrics', () => {
  it('returns zeros for an empty set', () => {
    const m = governanceMetrics([]);
    expect(m.total).toBe(0);
    expect(m.evidenceCoveragePct).toBe(0);
    expect(m.confidenceAvg).toBe(0);
  });

  it('only counts traces that carry a governance verdict', () => {
    const m = governanceMetrics([
      trace({ capability: 'reasoning', confidence: 15, violations: ['no_evidence', 'insufficient_confidence'] }),
      trace({ governance: false }), // no constitution step → excluded
    ]);
    expect(m.total).toBe(1);
  });

  it('computes evidence coverage, no-evidence rate, pass rate and confidence stats', () => {
    const m = governanceMetrics([
      // ungrounded, flagged
      trace({ capability: 'reasoning', evidenceCount: 0, confidence: 15, passed: false, violations: ['no_evidence', 'insufficient_confidence'], latencyMs: 10 }),
      // grounded, higher confidence, still not passing
      trace({ capability: 'reasoning', evidenceCount: 2, confidence: 55, passed: false, violations: ['insufficient_confidence'], latencyMs: 30 }),
      // grounded + passing
      trace({ capability: 'chat', evidenceCount: 3, confidence: 90, passed: true, violations: [], latencyMs: 20 }),
    ]);
    expect(m.total).toBe(3);
    expect(m.evidenceCoveragePct).toBe(66.7); // 2 of 3
    expect(m.noEvidenceRatePct).toBe(33.3); // 1 of 3
    expect(m.constitutionPassRatePct).toBe(33.3); // 1 of 3
    expect(m.confidenceAvg).toBe(53); // (15+55+90)/3 = 53.3 → 53
    expect(m.avgLatencyMs).toBe(20); // (10+30+20)/3
  });

  it('buckets confidence into 20-point bands', () => {
    const m = governanceMetrics([
      trace({ confidence: 15, violations: [] }),
      trace({ confidence: 55, violations: [] }),
      trace({ confidence: 90, violations: [] }),
      trace({ confidence: 100, violations: [] }), // top band is inclusive
    ]);
    const byLabel = Object.fromEntries(m.confidenceBuckets.map((b) => [b.label, b.count]));
    expect(byLabel['0–20']).toBe(1);
    expect(byLabel['40–60']).toBe(1);
    expect(byLabel['80–100']).toBe(2);
  });

  it('ranks capabilities by warning count', () => {
    const m = governanceMetrics([
      trace({ capability: 'reasoning', violations: ['no_evidence'] }),
      trace({ capability: 'reasoning', violations: ['no_evidence'] }),
      trace({ capability: 'chat', violations: [] }),
    ]);
    expect(m.byCapability[0]).toMatchObject({ capability: 'reasoning', count: 2, warnings: 2 });
    expect(m.byCapability[1]).toMatchObject({ capability: 'chat', count: 1, warnings: 0 });
  });
});
