import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { MarketingInsight } from '@ados/contracts';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { TenantContext, type RequestContext } from '@ados/tenancy';
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

const asTenant = <T>(tenantId: string, fn: () => Promise<T>): Promise<T> =>
  TenantContext.run({ tenantId, correlationId: 'c', actor: 'a', roles: [] } as RequestContext, fn);

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

  it('survives a restart: marketing memory persists across brain instances on the same file', async () => {
    const brain1 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain1.restore(); // create schema
    await brain1.enrich({ kind: 'marketing', insight: insight({ roas: 3, sampleSize: 10 }) });

    const brain2 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    expect(await brain2.marketing('dental')).toBeNull(); // not loaded yet
    await brain2.restore();
    expect(await brain2.marketing('dental')).toMatchObject({ vertical: 'dental', roas: 3, sampleSize: 10 });
  });

  it('persists and restores every scalar store and every sub-brain', async () => {
    const brain1 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain1.restore();
    await brain1.enrich({ kind: 'creative', insight: { format: 'video', sampleSize: 5, bestColor: 'red', bestFont: 'sans', bestCta: 'Buy' } });
    await brain1.enrich({ kind: 'sop', perf: { sopKey: 'launch', version: 1, successRate: 0.8, sampleSize: 10 } });
    await brain1.enrich({ kind: 'sales', insight: { conversionRate: 0.12, objections: ['price'], bestResponses: ['roi'] } });
    await brain1.setDna({ tenantId: 't', brandId: 'b1', mission: 'm', vision: 'v', culture: 'c', values: [], tone: 'warm', brandRules: [], writingStyle: 'w', approvalRules: [], qualityStandards: [], namingStandards: [], designLanguage: 'd', riskAppetite: 'low', decisionStyle: 's' });
    await brain1.setBrand({ brandId: 'b1', name: 'Brand', toneOfVoice: 'warm', forbiddenWords: [], targetAudience: 'a', colors: [], products: [], campaignHistoryRefs: [], approvedCreativeRefs: [] });
    await brain1.experience.record({ tenantId: 't', vertical: 'dental', context: { format: 'video' }, action: 'ran', result: { ctr: 6 }, reason: 'r', learned: 'l', at: '2026-01-01T00:00:00.000Z' });
    const patternId = await brain1.patterns.capture({ domain: 'dental', name: 'P', structure: ['15s'], evidence: { sampleSize: 50, metric: 'ctr', value: 6 } });
    await brain1.patterns.markReused(patternId);
    await brain1.graph.upsertNode({ id: 'm1', type: 'Mission', props: {} });
    await brain1.graph.upsertNode({ id: 'c1', type: 'Campaign', props: {} });
    await brain1.graph.relate({ from: 'm1', to: 'c1', relation: 'ran' });

    const brain2 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain2.restore();
    expect(await brain2.creative('video')).toMatchObject({ bestCta: 'Buy' });
    expect(await brain2.sop('launch')).toMatchObject({ successRate: 0.8 });
    expect(await brain2.sales()).toMatchObject({ conversionRate: 0.12 });
    expect(await brain2.dna('b1')).toMatchObject({ mission: 'm' });
    expect(await brain2.brand('b1')).toMatchObject({ name: 'Brand' });
    expect(await brain2.experience.findSimilar({ vertical: 'dental', context: { format: 'video' }, k: 5 })).toHaveLength(1);
    expect(await brain2.patterns.get(patternId)).toMatchObject({ reuseCount: 1 });
    expect(await brain2.graph.neighbors('m1', 'ran')).toHaveLength(1);
  });

  it('persists the MERGED long-run average, not the last raw sample', async () => {
    const store = new SqlBrainStore(new SqliteDatabase(file));
    const brain = new PersistentCompanyBrain(new InMemoryCompanyBrain(), store);
    await brain.restore();
    await brain.enrich({ kind: 'marketing', insight: insight({ roas: 2, sampleSize: 10 }) });
    await brain.enrich({ kind: 'marketing', insight: insight({ roas: 4, sampleSize: 10 }) });

    const fresh = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await fresh.restore();
    expect(await fresh.marketing('dental')).toMatchObject({ sampleSize: 20, roas: 3 }); // (2*10+4*10)/20
  });

  it('keeps tenants isolated through persistence — one tenant never sees another’s memory', async () => {
    const brain1 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain1.restore();
    await asTenant('acme', () => brain1.enrich({ kind: 'marketing', insight: insight({ vertical: 'dental', roas: 5 }) }));
    await asTenant('globex', () => brain1.enrich({ kind: 'marketing', insight: insight({ vertical: 'dental', roas: 1 }) }));

    // Restored into a fresh brain, each tenant still sees only its own dental ROAS.
    const brain2 = new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file)));
    await brain2.restore();
    expect(await asTenant('acme', () => brain2.marketing('dental'))).toMatchObject({ roas: 5 });
    expect(await asTenant('globex', () => brain2.marketing('dental'))).toMatchObject({ roas: 1 });
    // A third tenant sees nothing.
    expect(await asTenant('initech', () => brain2.marketing('dental'))).toBeNull();
  });
});
