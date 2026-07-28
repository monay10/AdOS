import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { MarketingInsight } from '@ados/contracts';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { SqliteDatabase } from '@ados/persistence';
import { PersistentCompanyBrain, SqlBrainStore, isRestorableBrain } from './brain-persistence.js';

const insight = (over: Partial<MarketingInsight> = {}): MarketingInsight => ({
  vertical: 'dental',
  ctr: 5,
  cpa: 20,
  roas: 3,
  bestHook: 'hook',
  bestHeadline: 'headline',
  bestOffer: 'offer',
  bestFunnel: 'funnel',
  sampleSize: 10,
  ...over,
});

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ados-brain-'));
  file = join(dir, 'brain.sqlite');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('PersistentCompanyBrain', () => {
  it('is restorable; a plain InMemoryCompanyBrain is not', () => {
    const durable = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(':memory:')));
    expect(isRestorableBrain(durable)).toBe(true);
    expect(isRestorableBrain(new InMemoryCompanyBrain())).toBe(false);
  });

  it('delegates reads through to the inner brain', async () => {
    const inner = new InMemoryCompanyBrain();
    const store = new SqlBrainStore(new SqliteDatabase(':memory:'));
    await store.init();
    const brain = new PersistentCompanyBrain(inner, store);
    await brain.enrich({ kind: 'creative', insight: { format: 'video', sampleSize: 3, bestColor: 'red', bestFont: 'sans', bestCta: 'Buy' } });
    // The write landed in the inner brain, read back through the decorator.
    expect(await brain.creative('video')).toMatchObject({ format: 'video', bestColor: 'red' });
    // Sub-brains route through persistent decorators over the SAME inner instances,
    // so a write on the decorator is visible on the inner store.
    await brain.graph.upsertNode({ id: 'n1', type: 'Node', props: {} });
    expect(await inner.graph.query({ type: 'Node' })).toHaveLength(1);
  });

  it('survives a restart: marketing memory persists across brain instances on the same file', async () => {
    // First process: enrich, which writes through to SQLite.
    const store1 = new SqlBrainStore(new SqliteDatabase(file));
    await store1.init();
    const brain1 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), store1);
    await brain1.enrich({ kind: 'marketing', insight: insight({ vertical: 'dental', roas: 3, sampleSize: 10 }) });

    // Second process: a fresh brain + store on the SAME file, restored at startup.
    const brain2 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    expect(await brain2.marketing('dental')).toBeNull(); // not loaded yet
    await brain2.restore();
    const restored = await brain2.marketing('dental');
    expect(restored).toMatchObject({ vertical: 'dental', roas: 3, sampleSize: 10 });
  });

  it('persists and restores every scalar sub-brain: creative, sop, sales, dna, brand', async () => {
    const brain1 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain1.restore(); // create schema
    await brain1.enrich({ kind: 'creative', insight: { format: 'video', sampleSize: 5, bestColor: 'red', bestFont: 'sans', bestCta: 'Buy' } });
    await brain1.enrich({ kind: 'sop', perf: { sopKey: 'launch', version: 1, successRate: 0.8, sampleSize: 10 } });
    await brain1.enrich({ kind: 'sales', insight: { conversionRate: 0.12, objections: ['price'], bestResponses: ['roi'] } });
    await brain1.setDna({ tenantId: 't', brandId: 'b1', mission: 'm', vision: 'v', culture: 'c', values: [], tone: 'warm', brandRules: [], writingStyle: 'w', approvalRules: [], qualityStandards: [], namingStandards: [], designLanguage: 'd', riskAppetite: 'low', decisionStyle: 's' });
    await brain1.setBrand({ brandId: 'b1', name: 'Brand', toneOfVoice: 'warm', forbiddenWords: [], targetAudience: 'a', colors: [], products: [], campaignHistoryRefs: [], approvedCreativeRefs: [] });

    // Fresh instance on the same file → restore rehydrates all of it.
    const brain2 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain2.restore();
    expect(await brain2.creative('video')).toMatchObject({ format: 'video', bestCta: 'Buy' });
    expect(await brain2.sop('launch')).toMatchObject({ sopKey: 'launch', version: 1, successRate: 0.8 });
    expect(await brain2.sales()).toMatchObject({ conversionRate: 0.12 });
    expect(await brain2.dna('b1')).toMatchObject({ brandId: 'b1', mission: 'm' });
    expect(await brain2.brand('b1')).toMatchObject({ brandId: 'b1', name: 'Brand' });
  });

  it('persists the MERGED sop success rate across same-version samples', async () => {
    const store = new SqlBrainStore(new SqliteDatabase(file));
    await store.init();
    const brain = new PersistentCompanyBrain(new InMemoryCompanyBrain(), store);
    await brain.enrich({ kind: 'sop', perf: { sopKey: 'launch', version: 1, successRate: 0.6, sampleSize: 10 } });
    await brain.enrich({ kind: 'sop', perf: { sopKey: 'launch', version: 1, successRate: 1.0, sampleSize: 10 } });
    const persisted = await store.loadSop();
    expect(persisted).toHaveLength(1);
    expect(persisted[0]!.sampleSize).toBe(20);
    expect(persisted[0]!.successRate).toBeCloseTo(0.8); // (0.6*10 + 1.0*10)/20
  });

  it('persists and restores the three port-backed sub-brains: experience, patterns, graph', async () => {
    const brain1 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain1.restore(); // create schema
    await brain1.experience.record({ tenantId: 't', vertical: 'dental', context: { format: 'video' }, action: 'ran', result: { ctr: 6 }, reason: 'r', learned: 'l', at: '2026-01-01T00:00:00.000Z' });
    const patternId = await brain1.patterns.capture({ domain: 'dental', name: 'P', structure: ['15s'], evidence: { sampleSize: 50, metric: 'ctr', value: 6 } });
    await brain1.patterns.markReused(patternId);
    await brain1.graph.upsertNode({ id: 'm1', type: 'Mission', props: { objective: 'grow' } });
    await brain1.graph.upsertNode({ id: 'c1', type: 'Campaign', props: { name: 'C' } });
    await brain1.graph.relate({ from: 'm1', to: 'c1', relation: 'ran' });

    // Fresh instance on the same file → restore rehydrates all three sub-brains.
    const brain2 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain2.restore();
    const exps = await brain2.experience.findSimilar({ vertical: 'dental', context: { format: 'video' }, k: 5 });
    expect(exps).toHaveLength(1);
    expect(exps[0]).toMatchObject({ action: 'ran', learned: 'l' });
    const restoredPattern = await brain2.patterns.get(patternId);
    expect(restoredPattern).toMatchObject({ name: 'P', reuseCount: 1 }); // markReused survived
    const neighbors = await brain2.graph.neighbors('m1', 'ran');
    expect(neighbors).toHaveLength(1);
    expect(neighbors[0]).toMatchObject({ id: 'c1', type: 'Campaign' });
  });

  it('persists the MERGED long-run average, not the last raw sample', async () => {
    const store = new SqlBrainStore(new SqliteDatabase(file));
    await store.init();
    const brain = new PersistentCompanyBrain(new InMemoryCompanyBrain(), store);
    // Two samples of the same vertical → sample-weighted merge in the inner brain.
    await brain.enrich({ kind: 'marketing', insight: insight({ roas: 2, sampleSize: 10 }) });
    await brain.enrich({ kind: 'marketing', insight: insight({ roas: 4, sampleSize: 10 }) });

    const persisted = await store.loadMarketing();
    expect(persisted).toHaveLength(1);
    expect(persisted[0]!.sampleSize).toBe(20); // accumulated, not overwritten
    expect(persisted[0]!.roas).toBe(3); // (2*10 + 4*10) / 20

    // Restoring must NOT re-merge — the restored value equals the persisted average.
    const fresh = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await fresh.restore();
    expect(await fresh.marketing('dental')).toMatchObject({ sampleSize: 20, roas: 3 });
  });
});
