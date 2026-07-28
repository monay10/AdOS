import { describe, expect, it } from 'vitest';
import type { MarketingInsight } from '@ados/contracts';
import { recommend, type VerticalStat } from './recommendation-engine.js';

const insight = (over: Partial<MarketingInsight> = {}): MarketingInsight => ({
  vertical: 'dental',
  ctr: 5,
  cpa: 20,
  roas: 3,
  bestHook: 'first 3s smile',
  bestHeadline: 'h',
  bestOffer: 'o',
  bestFunnel: 'reservation',
  sampleSize: 5,
  ...over,
});

describe('recommend', () => {
  it('recommends scaling a proven, high-ROAS vertical', () => {
    const recs = recommend([{ vertical: 'dental', insight: insight({ roas: 4, sampleSize: 6 }), missions: 6, completed: 6, revisions: 0 }]);
    const scale = recs.find((r) => r.kind === 'scale');
    expect(scale).toBeDefined();
    expect(scale!.grounded).toBe(true);
    expect(scale!.detail).toContain('4× ROAS');
    expect(scale!.detail).toContain('first 3s smile');
  });

  it('recommends revising an underperforming vertical', () => {
    const recs = recommend([{ vertical: 'legal', insight: insight({ vertical: 'legal', roas: 1.2, sampleSize: 4 }), missions: 4, completed: 4, revisions: 0 }]);
    const improve = recs.find((r) => r.kind === 'improve');
    expect(improve).toBeDefined();
    expect(improve!.detail).toContain('1.2× ROAS');
  });

  it('flags a brief-churn hotspot from a high revision rate', () => {
    const recs = recommend([{ vertical: 'retail', insight: null, missions: 4, completed: 2, revisions: 5 }]);
    expect(recs.some((r) => r.kind === 'revision')).toBe(true);
  });

  it('suggests exploring a vertical with clients but no campaigns', () => {
    const recs = recommend([{ vertical: 'fitness', insight: null, missions: 0, completed: 0, revisions: 0 }]);
    expect(recs).toHaveLength(1);
    expect(recs[0]!.kind).toBe('explore');
    expect(recs[0]!.grounded).toBe(false);
  });

  it('ranks scale above improve above explore', () => {
    const recs = recommend([
      { vertical: 'fitness', insight: null, missions: 0, completed: 0, revisions: 0 }, // explore
      { vertical: 'dental', insight: insight({ roas: 4, sampleSize: 6 }), missions: 6, completed: 6, revisions: 0 }, // scale
      { vertical: 'legal', insight: insight({ vertical: 'legal', roas: 1, sampleSize: 5 }), missions: 5, completed: 5, revisions: 0 }, // improve
    ]);
    expect(recs.map((r) => r.kind)).toEqual(['scale', 'improve', 'explore']);
  });

  it('returns nothing for an empty world', () => {
    expect(recommend([])).toEqual([]);
  });
});
