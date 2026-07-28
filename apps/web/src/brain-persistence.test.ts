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

  it('delegates reads and non-marketing writes to the inner brain unchanged', async () => {
    const inner = new InMemoryCompanyBrain();
    const brain = new PersistentCompanyBrain(inner, new SqlBrainStore(new SqliteDatabase(':memory:')));
    await brain.enrich({ kind: 'creative', insight: { format: 'video', sampleSize: 3, bestColor: 'red', bestFont: 'sans', bestCta: 'Buy' } });
    // The write landed in the inner brain, read back through the decorator.
    expect(await brain.creative('video')).toMatchObject({ format: 'video', bestColor: 'red' });
    expect(brain.graph).toBe(inner.graph); // sub-brains are the same instances
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
