import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { MarketingInsight } from '@ados/contracts';
import { InMemoryCompanyBrain } from '@ados/company-brain';
import { SqliteDatabase } from '@ados/persistence';
import { App } from './app.js';
import { PersistentCompanyBrain, SqlBrainStore } from './brain-persistence.js';

const insight: MarketingInsight = {
  vertical: 'restaurant',
  ctr: 6,
  cpa: 15,
  roas: 4,
  bestHook: 'first 3s food',
  bestHeadline: 'Book a table',
  bestOffer: '2-for-1',
  bestFunnel: 'reservation',
  sampleSize: 25,
};

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ados-brain-app-'));
  file = join(dir, 'brain.sqlite');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('App with a durable Company Brain (Sprint 6)', () => {
  it('restores learned marketing memory on start() — grounding survives a restart', async () => {
    // ── First "process": learn something, which writes through to SQLite. ──
    const store1 = new SqlBrainStore(new SqliteDatabase(file));
    const app1 = new App(undefined, undefined, undefined, new PersistentCompanyBrain(new InMemoryCompanyBrain(), store1));
    await app1.start(); // creates the schema via restore()
    await app1.brain.enrich({ kind: 'marketing', insight });
    expect(await app1.brain.marketing('restaurant')).toMatchObject({ roas: 4, sampleSize: 25 });

    // ── Second "process": a brand-new App + brain on the SAME file. ──
    const app2 = new App(undefined, undefined, undefined, new PersistentCompanyBrain(new InMemoryCompanyBrain(), new SqlBrainStore(new SqliteDatabase(file))));
    await app2.start(); // restore() rehydrates the marketing store
    // The knowledge learned in app1 is available in app2 without re-learning.
    expect(await app2.brain.marketing('restaurant')).toMatchObject({ vertical: 'restaurant', roas: 4, sampleSize: 25 });
  });

  it('a default App has an in-memory brain that does NOT persist (unchanged behaviour)', async () => {
    const app = new App();
    await app.start();
    await app.brain.enrich({ kind: 'marketing', insight });
    // Nothing was written to any file; a fresh default App starts empty.
    const fresh = new App();
    await fresh.start();
    expect(await fresh.brain.marketing('restaurant')).toBeNull();
  });
});
