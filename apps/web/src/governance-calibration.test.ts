import { describe, expect, it } from 'vitest';
import type { GateDecision } from './governance-decisions.js';
import { calibrateGate, type CalibrationConfig } from './governance-calibration.js';

const CFG: CalibrationConfig = {
  window: 100,
  minSamples: 6,
  maxOverridePct: 1,
  minStableDays: 10,
  maxFalsePositivePct: 5,
  maxReviewIncreasePct: 50,
  demoteOverridePct: 2,
};

// day 0..n as ISO; the engine reads `at` for span + recent/older trend.
const day = (n: number): string => new Date(Date.parse('2026-01-01T00:00:00.000Z') + n * 86_400_000).toISOString();
const dec = (over: Partial<GateDecision> = {}): GateDecision => ({
  gate: 'strategy_and_budget',
  flagged: false,
  acknowledged: false,
  at: day(0),
  ...over,
});

const sig = (a: ReturnType<typeof calibrateGate>, s: string) => a.reasons.find((r) => r.signal === s)!;

describe('calibrateGate', () => {
  it('is eligible when every signal passes, with a high confidence', () => {
    // 8 decisions over 20 days; some flagged but NEVER overridden → 0% override.
    const decisions: GateDecision[] = [
      dec({ at: day(20), flagged: true }),
      dec({ at: day(18) }),
      dec({ at: day(15), flagged: true }),
      dec({ at: day(12) }),
      dec({ at: day(9), flagged: true }),
      dec({ at: day(6) }),
      dec({ at: day(3), flagged: true }),
      dec({ at: day(0) }),
    ];
    const a = calibrateGate(decisions, CFG);
    expect(a.eligible).toBe(true);
    expect(a.metrics.overrideRatePct).toBe(0);
    expect(a.reasons.every((r) => r.ok)).toBe(true);
    expect(a.confidence).toBeGreaterThan(80);
  });

  it('fails the override signal when flagged outputs are approved anyway', () => {
    const decisions: GateDecision[] = [
      dec({ at: day(20), flagged: true, acknowledged: true }),
      dec({ at: day(15), flagged: true, acknowledged: true }),
      dec({ at: day(10), flagged: true }),
      dec({ at: day(5), flagged: true }),
      dec({ at: day(3) }),
      dec({ at: day(0) }),
    ];
    const a = calibrateGate(decisions, CFG);
    expect(a.metrics.overrideRatePct).toBeGreaterThan(1); // 2/4 flagged overridden = 50%
    expect(sig(a, 'override').ok).toBe(false);
    expect(a.eligible).toBe(false);
    expect(a.confidence).toBeLessThan(80);
  });

  it('fails the samples signal below minSamples', () => {
    const a = calibrateGate([dec({ at: day(12) }), dec({ at: day(0) })], CFG);
    expect(sig(a, 'samples').ok).toBe(false);
    expect(a.eligible).toBe(false);
  });

  it('fails the stability signal when history is too short', () => {
    // 8 samples but only a 3-day span (< minStableDays 10).
    const decisions = Array.from({ length: 8 }, (_, i) => dec({ at: day(i % 4) }));
    const a = calibrateGate(decisions, CFG);
    expect(sig(a, 'samples').ok).toBe(true);
    expect(sig(a, 'stability').ok).toBe(false);
    expect(a.eligible).toBe(false);
  });

  it('reports an empty gate honestly (no data → not eligible, zero confidence)', () => {
    const a = calibrateGate([], CFG);
    expect(a.metrics.samples).toBe(0);
    expect(a.eligible).toBe(false);
    expect(a.confidence).toBe(0);
  });
});
