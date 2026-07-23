import { describe, expect, it } from 'vitest';
import { InMemoryCompanyBrain } from './in-memory-company-brain.js';
import { jaccard } from './experience-engine.js';

const clock = () => '2026-01-01T00:00:00.000Z';

describe('jaccard similarity', () => {
  it('scores overlap of context pairs', () => {
    const a = new Set(['format=video', 'length=15']);
    const b = new Set(['format=video', 'length=30']);
    expect(jaccard(a, b)).toBeCloseTo(1 / 3);
    expect(jaccard(new Set(), a)).toBe(0);
  });
});

describe('InMemoryCompanyBrain — Marketing Brain compounding', () => {
  it('merges insights with sample-weighted averages (knowledge grows, not overwrites)', async () => {
    const brain = new InMemoryCompanyBrain(clock);
    await brain.enrich({
      kind: 'marketing',
      insight: { vertical: 'dental', ctr: 2, cpa: 100, roas: 3, bestHook: 'smile', bestHeadline: 'h1', bestOffer: 'o', bestFunnel: 'f', sampleSize: 100 },
    });
    await brain.enrich({
      kind: 'marketing',
      insight: { vertical: 'dental', ctr: 6, cpa: 60, roas: 5, bestHook: 'confidence', bestHeadline: 'h2', bestOffer: 'o', bestFunnel: 'f', sampleSize: 300 },
    });
    const insight = await brain.marketing('dental');
    expect(insight!.sampleSize).toBe(400);
    // weighted CTR = (2*100 + 6*300)/400 = 5
    expect(insight!.ctr).toBeCloseTo(5);
    // qualitative winner comes from the larger sample
    expect(insight!.bestHook).toBe('confidence');
  });
});

describe('InMemoryCompanyBrain — Experience Engine reuse', () => {
  it('finds the most similar past experience for a context', async () => {
    const brain = new InMemoryCompanyBrain(clock);
    await brain.experience.record({ tenantId: 't', vertical: 'dental', context: { format: 'video', length: 15 }, action: 'short video', result: { ctr: 6 }, reason: 'strong hook', learned: '15s wins', at: '' });
    await brain.experience.record({ tenantId: 't', vertical: 'dental', context: { format: 'image' }, action: 'static', result: { ctr: 2 }, reason: '', learned: '', at: '' });

    const similar = await brain.experience.findSimilar({ vertical: 'dental', context: { format: 'video', length: 15 }, k: 1 });
    expect(similar).toHaveLength(1);
    expect(similar[0]!.learned).toBe('15s wins');
  });
});

describe('InMemoryCompanyBrain — Knowledge Graph', () => {
  it('connects entities and walks relations', async () => {
    const brain = new InMemoryCompanyBrain(clock);
    await brain.graph.upsertNode({ id: 'brand:acme', type: 'Brand', props: { name: 'Acme' } });
    await brain.graph.upsertNode({ id: 'camp:1', type: 'Campaign', props: { name: 'Q3' } });
    await brain.graph.relate({ from: 'brand:acme', to: 'camp:1', relation: 'ran' });

    const ran = await brain.graph.neighbors('brand:acme', 'ran');
    expect(ran.map((n) => n.id)).toEqual(['camp:1']);
  });
});

describe('InMemoryCompanyBrain — Pattern Library', () => {
  it('captures and ranks patterns by evidence and reuse', async () => {
    const brain = new InMemoryCompanyBrain(clock);
    const weak = await brain.patterns.capture({ domain: 'restaurant', name: 'weak', structure: ['x'], evidence: { sampleSize: 10, metric: 'ctr', value: 4 } });
    await brain.patterns.capture({ domain: 'restaurant', name: 'strong', structure: ['15s video', 'first 3s food', 'CTA reservation'], evidence: { sampleSize: 100, metric: 'ctr', value: 6 } });
    await brain.patterns.markReused(weak);

    const best = await brain.patterns.bestFor('restaurant');
    expect(best[0]!.name).toBe('strong');
  });
});
