import { describe, expect, it } from 'vitest';
import type { MarketingInsight } from '@ados/contracts';
import { planMission } from './mission-planner.js';

const insight = (over: Partial<MarketingInsight> = {}): MarketingInsight => ({
  vertical: 'dental',
  ctr: 5.2,
  cpa: 20,
  roas: 3.4,
  bestHook: 'first 3s smile',
  bestHeadline: 'Book your whitening',
  bestOffer: '2-for-1',
  bestFunnel: 'reservation',
  sampleSize: 12,
  ...over,
});

const base = { objective: 'Acquire dental patients', vertical: 'dental', budgetAmount: 5000, currency: 'TRY' };

describe('planMission', () => {
  it('produces the ordered plan stages', () => {
    const plan = planMission({ ...base, insight: null });
    expect(plan.steps.map((s) => s.stage)).toEqual(['strategy', 'creative', 'campaign', 'measure', 'learn']);
  });

  it('is a cold start with no expectations when the brain has no history', () => {
    const plan = planMission({ ...base, insight: null });
    expect(plan.grounded).toBe(false);
    expect(plan.expected).toBeUndefined();
    expect(plan.steps.every((s) => !s.grounded)).toBe(true);
    expect(plan.steps[0]!.rationale).toContain('First dental campaign');
  });

  it('grounds the plan and carries expected performance when the brain has history', () => {
    const plan = planMission({ ...base, insight: insight() });
    expect(plan.grounded).toBe(true);
    expect(plan.expected).toEqual({ roas: 3.4, ctr: 5.2, basisSampleSize: 12 });
    // Recommendations reference the real winning signals.
    expect(plan.steps[0]!.rationale).toContain('first 3s smile'); // bestHook
    expect(plan.steps[1]!.rationale).toContain('Book your whitening'); // bestHeadline
    expect(plan.steps[2]!.rationale).toContain('reservation'); // bestFunnel
    expect(plan.steps.every((s) => s.grounded)).toBe(true);
  });

  it('treats a zero-sample insight as cold start (not grounded)', () => {
    const plan = planMission({ ...base, insight: insight({ sampleSize: 0 }) });
    expect(plan.grounded).toBe(false);
    expect(plan.expected).toBeUndefined();
  });
});
