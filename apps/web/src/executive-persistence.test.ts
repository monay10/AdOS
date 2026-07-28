import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InMemoryDecisionJournal, InMemoryExecutiveMemory } from '@ados/executive-memory';
import { SqliteDatabase } from '@ados/persistence';
import {
  PersistentDecisionJournal,
  PersistentExecutiveMemory,
  SqlExecutiveStore,
  isRestorable,
} from './executive-persistence.js';

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ados-exec-'));
  file = join(dir, 'knowledge.sqlite');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('isRestorable', () => {
  it('is true for the persistent stores, false for plain in-memory ones', () => {
    const store = new SqlExecutiveStore(new SqliteDatabase(':memory:'));
    expect(isRestorable(new PersistentExecutiveMemory(new InMemoryExecutiveMemory(), store))).toBe(true);
    expect(isRestorable(new PersistentDecisionJournal(new InMemoryDecisionJournal(), store))).toBe(true);
    expect(isRestorable(new InMemoryExecutiveMemory())).toBe(false);
    expect(isRestorable(new InMemoryDecisionJournal())).toBe(false);
    expect(isRestorable(null)).toBe(false);
  });
});

describe('PersistentExecutiveMemory', () => {
  it('remembers durably: recall survives a restart', async () => {
    const store1 = new SqlExecutiveStore(new SqliteDatabase(file));
    const mem1 = new PersistentExecutiveMemory(new InMemoryExecutiveMemory(), store1);
    await mem1.restore(); // create schema
    await mem1.remember({ tenantId: 't', role: 'ceo', category: 'strategy', content: 'expand into dental', importance: 0.9 });

    const mem2 = new PersistentExecutiveMemory(new InMemoryExecutiveMemory(), new SqlExecutiveStore(new SqliteDatabase(file)));
    await mem2.restore();
    const recalled = await mem2.recall({ tenantId: 't', role: 'ceo', k: 5 });
    expect(recalled).toHaveLength(1);
    expect(recalled[0]).toMatchObject({ content: 'expand into dental', importance: 0.9 });
    // Role isolation is preserved through persistence.
    expect(await mem2.recall({ tenantId: 't', role: 'creative_director', k: 5 })).toHaveLength(0);
  });
});

describe('PersistentDecisionJournal', () => {
  it('records durably and keeps attached outcomes across a restart', async () => {
    const store1 = new SqlExecutiveStore(new SqliteDatabase(file));
    const journal1 = new PersistentDecisionJournal(new InMemoryDecisionJournal(), store1);
    await journal1.restore(); // create schema
    const id = await journal1.record({
      tenantId: 't',
      role: 'ceo',
      subjectId: 'mission-1',
      decision: 'launch',
      chosen: 'plan A',
      alternatives: ['plan B'],
      rejected: ['plan B'],
      evidence: [],
      confidence: { score: 72, reason: 'grounded' },
      at: '2026-01-01T00:00:00.000Z',
    });
    await journal1.attachOutcome(id, { roas: 3, learned: 'hook X wins' });

    const journal2 = new PersistentDecisionJournal(new InMemoryDecisionJournal(), new SqlExecutiveStore(new SqliteDatabase(file)));
    await journal2.restore();
    const history = await journal2.history({ subjectId: 'mission-1', k: 5 });
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ id, decision: 'launch', outcome: { roas: 3, learned: 'hook X wins' } });
  });
});
