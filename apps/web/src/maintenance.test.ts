import { describe, expect, it } from 'vitest';
import { SqliteDatabase } from '@ados/persistence';
import type { DecisionJournalEntry } from '@ados/contracts';
import { InMemoryDecisionJournal } from '@ados/executive-memory';
import { PersistentDecisionJournal, SqlExecutiveStore } from './executive-persistence.js';
import { MaintenanceService } from './maintenance.js';

const entry = (over: Partial<Omit<DecisionJournalEntry, 'id'>> = {}): Omit<DecisionJournalEntry, 'id'> => ({
  tenantId: 'acme',
  role: 'cmo',
  subjectId: 's',
  decision: 'ship it',
  evidence: [],
  alternatives: [],
  chosen: 'a',
  rejected: [],
  confidence: { score: 80, reason: 'strong', basis: { sampleSize: 5 } },
  at: '2026-01-01T00:00:00.000Z',
  ...over,
});

async function fresh(): Promise<{
  db: SqliteDatabase;
  journal: PersistentDecisionJournal;
  maint: MaintenanceService;
}> {
  const db = new SqliteDatabase(':memory:');
  const store = new SqlExecutiveStore(db);
  const journal = new PersistentDecisionJournal(new InMemoryDecisionJournal(), store);
  await journal.restore(); // creates tables (incl. the archive)
  const maint = new MaintenanceService(db, journal, () => Date.parse('2026-07-29T10:00:00.000Z'));
  await maint.init();
  return { db, journal, maint };
}

describe('MaintenanceService.stats', () => {
  it('reports whole-database storage + per-table sizes + journal counts', async () => {
    const { journal, maint } = await fresh();
    for (let i = 0; i < 5; i++) await journal.record(entry({ at: `2026-01-0${i + 1}T00:00:00.000Z` }));

    const stats = await maint.stats();
    expect(stats.dialect).toBe('sqlite');
    expect(stats.pageSize).toBeGreaterThan(0);
    expect(stats.totalBytes).toBe(stats.pageSize * stats.pageCount);
    expect(stats.reclaimableBytes).toBe(stats.pageSize * stats.freelistPages);
    expect(stats.journal.active).toBe(5);
    expect(stats.journal.archived).toBe(0);
    // The decision_journal blob table is reported with real bytes; the log table is hidden.
    expect(stats.tables.find((t) => t.name === 'decision_journal')?.bytes).toBeGreaterThan(0);
    expect(stats.tables.some((t) => t.name === 'maintenance_log')).toBe(false);
  });
});

describe('MaintenanceService.vacuum', () => {
  it('reclaims freelist pages and reports the bytes freed', async () => {
    const { db, maint } = await fresh();
    // Create real bloat: a large blob spanning many pages, then delete it so the
    // pages land on the freelist (what repeated blob rewrites leave behind).
    await db.execute('CREATE TABLE bloat (id INTEGER PRIMARY KEY, data TEXT)');
    await db.execute('INSERT INTO bloat (id, data) VALUES ($1, $2)', [1, 'x'.repeat(500_000)]);
    await db.execute('DELETE FROM bloat');

    const before = await maint.stats();
    expect(before.reclaimableBytes).toBeGreaterThan(0);

    const result = await maint.vacuum();
    expect(result.reclaimedBytes).toBeGreaterThan(0);
    expect(result.afterBytes).toBeLessThan(result.beforeBytes);

    const after = await maint.stats();
    expect(after.reclaimableBytes).toBe(0); // freelist drained
    expect(after.recent[0]?.kind).toBe('vacuum'); // logged
    expect(after.lastMaintenanceAt).toBe(after.recent[0]?.at);
  });
});

describe('MaintenanceService.compactJournal', () => {
  it('freezes older entries into the immutable archive, keeping the most recent hot', async () => {
    const { journal, maint } = await fresh();
    // 6 acme + 2 other, distinct timestamps so "most recent" is well-defined.
    for (let i = 1; i <= 6; i++) await journal.record(entry({ tenantId: 'acme', at: `2026-02-0${i}T00:00:00.000Z` }));
    await journal.record(entry({ tenantId: 'other', at: '2026-03-01T00:00:00.000Z' }));
    await journal.record(entry({ tenantId: 'other', at: '2026-03-02T00:00:00.000Z' }));

    const result = await maint.compactJournal(2); // keep 2 per tenant
    expect(result.retained).toBe(4); // 2 acme + 2 other
    expect(result.archived).toBe(4); // 4 acme frozen

    const stats = await maint.stats();
    expect(stats.journal.active).toBe(4);
    expect(stats.journal.archived).toBe(4);

    // The hot set is the NEWEST per tenant — nothing older leaks back in.
    const active = await journal.history({ tenantId: 'acme', k: 100 });
    expect(active.map((e) => e.at)).toEqual(['2026-02-06T00:00:00.000Z', '2026-02-05T00:00:00.000Z']);

    // History is preserved in full: the frozen archive holds the older entries.
    const archived = await journal.archive({ tenantId: 'acme' });
    expect(archived).toHaveLength(4);
    expect(stats.recent[0]?.kind).toBe('compact');
  });

  it('is idempotent and crash-safe: re-compacting archives nothing new and never duplicates', async () => {
    const { journal, maint } = await fresh();
    for (let i = 1; i <= 5; i++) await journal.record(entry({ at: `2026-04-0${i}T00:00:00.000Z` }));

    const first = await maint.compactJournal(2);
    expect(first).toEqual({ archived: 3, retained: 2 });
    const second = await maint.compactJournal(2); // already compacted
    expect(second).toEqual({ archived: 0, retained: 2 });

    const archived = await journal.archive();
    expect(archived).toHaveLength(3); // no duplicates from the second pass
  });

  it('no-ops honestly when the journal is not a durable compactable one', async () => {
    const db = new SqliteDatabase(':memory:');
    const maint = new MaintenanceService(db, undefined, () => 0);
    await maint.init();
    expect(await maint.compactJournal(10)).toEqual({ archived: 0, retained: 0 });
  });
});
