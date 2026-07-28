import { describe, expect, it } from 'vitest';
import { approvalFunnel, InMemoryGovernanceDecisionLog, type GateDecision } from './governance-decisions.js';

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
