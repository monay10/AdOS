import { describe, expect, it } from 'vitest';
import { approvalFunnel, reviewStats, InMemoryGovernanceDecisionLog, type GateDecision } from './governance-decisions.js';

const d = (over: Partial<GateDecision> = {}): GateDecision => ({
  gate: 'strategy_and_budget',
  flagged: false,
  acknowledged: false,
  at: 't',
  ...over,
});

describe('approvalFunnel', () => {
  it('returns zeros for no decisions', () => {
    expect(approvalFunnel([])).toEqual({ approvals: 0, flagged: 0, overrides: 0, overrideRatePct: 0 });
  });

  it('counts flagged approvals and override rate', () => {
    const f = approvalFunnel([
      d({ flagged: true, acknowledged: true }), // override
      d({ flagged: true, acknowledged: true }), // override
      d({ flagged: true, acknowledged: false }), // flagged but not acknowledged (shouldn't normally reach approve, but counted honestly)
      d({ flagged: false, acknowledged: false }), // clean approval
    ]);
    expect(f.approvals).toBe(4);
    expect(f.flagged).toBe(3);
    expect(f.overrides).toBe(2);
    expect(f.overrideRatePct).toBe(66.7); // 2 of 3 flagged were overridden
  });

  it('override rate is 0 when nothing was flagged', () => {
    const f = approvalFunnel([d({ flagged: false }), d({ flagged: false })]);
    expect(f.flagged).toBe(0);
    expect(f.overrideRatePct).toBe(0);
  });
});

describe('reviewStats', () => {
  it('returns zeros when no decision carries a review latency', () => {
    expect(reviewStats([d(), d()])).toEqual({ count: 0, meanMs: 0, p50Ms: 0, p95Ms: 0, byCapability: [] });
  });

  it('computes mean, P50, P95 over timed reviews only', () => {
    const decisions = [
      d({ reviewMs: 100, capability: 'reasoning' }),
      d({ reviewMs: 200, capability: 'reasoning' }),
      d({ reviewMs: 300, capability: 'vision' }),
      d({ reviewMs: 400, capability: 'vision' }),
      d(), // untimed — excluded, not counted as zero
    ];
    const r = reviewStats(decisions);
    expect(r.count).toBe(4);
    expect(r.meanMs).toBe(250); // (100+200+300+400)/4
    expect(r.p50Ms).toBe(200); // nearest-rank of [100,200,300,400]
    expect(r.p95Ms).toBe(400);
  });

  it('breaks review latency down per capability, busiest first', () => {
    const r = reviewStats([
      d({ reviewMs: 100, capability: 'reasoning' }),
      d({ reviewMs: 300, capability: 'reasoning' }),
      d({ reviewMs: 50, capability: 'vision' }),
    ]);
    expect(r.byCapability).toEqual([
      { capability: 'reasoning', count: 2, meanMs: 200 },
      { capability: 'vision', count: 1, meanMs: 50 },
    ]);
  });

  it('labels timed reviews without a capability as unknown', () => {
    const r = reviewStats([d({ reviewMs: 100 })]);
    expect(r.byCapability).toEqual([{ capability: 'unknown', count: 1, meanMs: 100 }]);
  });
});

describe('InMemoryGovernanceDecisionLog', () => {
  it('records per tenant, newest first, bounded', () => {
    const log = new InMemoryGovernanceDecisionLog(2);
    log.record('a', d({ gate: 'g1' }));
    log.record('a', d({ gate: 'g2' }));
    log.record('a', d({ gate: 'g3' }));
    log.record('b', d({ gate: 'other' }));
    const a = log.list('a');
    expect(a).toHaveLength(2); // bounded at 2
    expect(a[0]!.gate).toBe('g3'); // newest first
    expect(log.list('b')).toHaveLength(1);
    expect(log.list('c')).toEqual([]);
  });
});
