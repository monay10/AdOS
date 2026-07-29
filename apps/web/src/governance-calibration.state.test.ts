import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import { InMemoryGovernanceDecisionLog, type GateDecision } from './governance-decisions.js';
import {
  GovernanceCalibration,
  InMemoryCalibrationStore,
  SqlCalibrationStore,
  type CalibrationConfig,
} from './governance-calibration.js';

const GATE = 'strategy_and_budget';
const NOW = Date.parse('2026-03-01T00:00:00.000Z');
const CFG: CalibrationConfig = {
  window: 100,
  minSamples: 6,
  maxOverridePct: 1,
  minStableDays: 10,
  maxFalsePositivePct: 5,
  maxReviewIncreasePct: 50,
  demoteOverridePct: 2,
};

const day = (n: number): string => new Date(Date.parse('2026-01-01T00:00:00.000Z') + n * 86_400_000).toISOString();
const dec = (over: Partial<GateDecision> = {}): GateDecision => ({
  gate: GATE,
  flagged: false,
  acknowledged: false,
  at: day(0),
  ...over,
});

/** 8 decisions over 20 days, some flagged but never overridden → eligible. */
function seedEligible(log: InMemoryGovernanceDecisionLog): void {
  const decisions = [
    dec({ at: day(0) }),
    dec({ at: day(3), flagged: true }),
    dec({ at: day(6) }),
    dec({ at: day(9), flagged: true }),
    dec({ at: day(12) }),
    dec({ at: day(15), flagged: true }),
    dec({ at: day(18) }),
    dec({ at: day(20), flagged: true }),
  ];
  for (const d of decisions) log.record('acme', d); // oldest→newest so newest ends up first
}

describe('GovernanceCalibration state machine', () => {
  it('auto-advances Observe → Candidate when a gate becomes eligible (but does NOT enforce)', async () => {
    const log = new InMemoryGovernanceDecisionLog();
    seedEligible(log);
    const cal = new GovernanceCalibration(log, new InMemoryCalibrationStore(), CFG);
    await cal.restore();
    const view = (await cal.recompute(NOW)).find((g) => g.gate === GATE)!;
    expect(view.state).toBe('candidate');
    expect(view.eligible).toBe(true);
    expect(cal.isEnforced(GATE)).toBe(false); // candidate is not enforcement
  });

  it('promotes Candidate → Enforced ONLY by operator, and only when eligible', async () => {
    const log = new InMemoryGovernanceDecisionLog();
    const cal = new GovernanceCalibration(log, new InMemoryCalibrationStore(), CFG);
    await cal.restore();

    // Empty gate stays Observe → promote refuses (nothing to tighten).
    await cal.recompute(NOW);
    expect(await cal.promote(GATE, NOW)).toBe(false);
    expect(cal.isEnforced(GATE)).toBe(false);

    // Now make it eligible → Candidate → operator promotes → Enforced.
    seedEligible(log);
    await cal.recompute(NOW);
    expect(await cal.promote(GATE, NOW)).toBe(true);
    expect(cal.isEnforced(GATE)).toBe(true);
  });

  it('auto-relaxes Enforced → Observe when the override rate climbs back up', async () => {
    const log = new InMemoryGovernanceDecisionLog();
    seedEligible(log);
    const cal = new GovernanceCalibration(log, new InMemoryCalibrationStore(), CFG);
    await cal.restore();
    await cal.recompute(NOW);
    await cal.promote(GATE, NOW);
    expect(cal.isEnforced(GATE)).toBe(true);

    // Operators start overriding again → override rate rises past demote threshold.
    for (let i = 0; i < 30; i++) log.record('acme', dec({ at: day(21), flagged: true, acknowledged: true }));
    const view = (await cal.recompute(NOW)).find((g) => g.gate === GATE)!;
    expect(view.state).toBe('observe'); // auto-relaxed
    expect(cal.isEnforced(GATE)).toBe(false);
    expect(view.lastReason).toContain('auto-relax');
  });

  it('demotes Candidate → Observe automatically when it is no longer eligible', async () => {
    const log = new InMemoryGovernanceDecisionLog();
    seedEligible(log);
    const cal = new GovernanceCalibration(log, new InMemoryCalibrationStore(), CFG);
    await cal.restore();
    expect((await cal.recompute(NOW)).find((g) => g.gate === GATE)!.state).toBe('candidate');

    for (let i = 0; i < 30; i++) log.record('acme', dec({ at: day(21), flagged: true, acknowledged: true }));
    expect((await cal.recompute(NOW)).find((g) => g.gate === GATE)!.state).toBe('observe');
  });

  it('persists calibration state across instances (durable store survives a restart)', async () => {
    const db = new SqliteDatabase(':memory:');
    const store = new SqlCalibrationStore(db);
    const log = new InMemoryGovernanceDecisionLog();
    seedEligible(log);

    const cal1 = new GovernanceCalibration(log, store, CFG);
    await cal1.restore();
    await cal1.recompute(NOW);
    expect(await cal1.promote(GATE, NOW)).toBe(true);

    // A brand-new calibration over the SAME durable store restores Enforced.
    const cal2 = new GovernanceCalibration(new InMemoryGovernanceDecisionLog(), store, CFG);
    await cal2.restore();
    expect(cal2.isEnforced(GATE)).toBe(true);
  });
});
