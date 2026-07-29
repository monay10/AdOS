import type {
  DecisionJournalEntry,
  DecisionJournalPort,
  ExecutiveMemoryEntry,
  ExecutiveMemoryPort,
} from '@ados/contracts';
import type { InMemoryDecisionJournal, InMemoryExecutiveMemory } from '@ados/executive-memory';
import type { QueryExecutor } from '@ados/persistence';

/**
 * Executive-memory persistence (Sprint 6, slice 4 — durable learned state).
 *
 * The Company Brain became durable in slices 1–3, but two other stores hold
 * genuine learned state and still evaporated on restart: the **Executive Memory**
 * (each executive's private strategic memory) and the **Decision Journal** (why
 * each decision was made — evidence, alternatives, confidence, outcome; the audit
 * trail the Learning Engine reads). Both are written and read in the real app flow
 * (`recordLearning` → `execMemory.remember` + `journal.record`; mission detail →
 * `journal.history`), so losing them on restart loses real history.
 *
 * Same shape as the sub-brains: each store is persisted as one JSON blob rewritten
 * on every mutation, restored at startup. Uses the same local SQLite file as the
 * brain (`BRAIN_DB`) — 100% local, no server, no API.
 */
export interface ExecutiveStore {
  init(): Promise<void>;
  saveMemory(entries: readonly ExecutiveMemoryEntry[]): Promise<void>;
  loadMemory(): Promise<ExecutiveMemoryEntry[]>;
  saveJournal(entries: readonly DecisionJournalEntry[]): Promise<void>;
  loadJournal(): Promise<DecisionJournalEntry[]>;
  /**
   * Move journal entries into the immutable **archive** (the Frozen tier of the
   * Decision Journal lifecycle: Active → Archived/Frozen). Append-only and
   * idempotent on entry id — re-archiving the same entry is a no-op, and an
   * archived row is never rewritten. History is preserved in full, but out of
   * the hot Active blob so the blob (and restore time) stays bounded.
   */
  archiveJournal(entries: readonly DecisionJournalEntry[]): Promise<void>;
  /** How many entries live in the immutable archive. */
  archivedCount(): Promise<number>;
  /** Read archived (frozen) entries, newest first — for audit/export. */
  loadArchive(query?: { tenantId?: string; limit?: number }): Promise<DecisionJournalEntry[]>;
}

const BLOB_KEY = '__all__';
const TABLES = ['exec_memory', 'decision_journal'] as const;

/** {@link ExecutiveStore} over the SQLite/Postgres {@link QueryExecutor} port. */
export class SqlExecutiveStore implements ExecutiveStore {
  constructor(private readonly db: QueryExecutor) {}

  async init(): Promise<void> {
    for (const table of TABLES) {
      await this.db.execute(`CREATE TABLE IF NOT EXISTS ${table} (k TEXT PRIMARY KEY, data TEXT NOT NULL)`);
    }
    // The Frozen tier: a row-per-entry, append-only archive of compacted journal
    // entries. `id` PK makes archiving idempotent; the `data` blob preserves the
    // full entry so nothing is lost when it leaves the hot Active blob.
    await this.db.execute(
      'CREATE TABLE IF NOT EXISTS decision_journal_archive (id TEXT PRIMARY KEY, tenant_id TEXT, at TEXT, data TEXT NOT NULL)',
    );
  }

  saveMemory(entries: readonly ExecutiveMemoryEntry[]): Promise<void> {
    return this.upsert('exec_memory', entries);
  }
  async loadMemory(): Promise<ExecutiveMemoryEntry[]> {
    return (await this.loadBlob<ExecutiveMemoryEntry[]>('exec_memory')) ?? [];
  }
  saveJournal(entries: readonly DecisionJournalEntry[]): Promise<void> {
    return this.upsert('decision_journal', entries);
  }
  async loadJournal(): Promise<DecisionJournalEntry[]> {
    return (await this.loadBlob<DecisionJournalEntry[]>('decision_journal')) ?? [];
  }

  async archiveJournal(entries: readonly DecisionJournalEntry[]): Promise<void> {
    for (const e of entries) {
      // Append-only + immutable: DO NOTHING on a known id, so a re-run never
      // duplicates and never mutates a frozen row.
      await this.db.execute(
        'INSERT INTO decision_journal_archive (id, tenant_id, at, data) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [e.id, e.tenantId, e.at, e],
      );
    }
  }

  async archivedCount(): Promise<number> {
    const rows = await this.db.query<{ n: number }>('SELECT COUNT(*) AS n FROM decision_journal_archive');
    return Number(rows[0]?.n ?? 0);
  }

  async loadArchive(query: { tenantId?: string; limit?: number } = {}): Promise<DecisionJournalEntry[]> {
    const limit = query.limit ?? 100;
    const rows = query.tenantId
      ? await this.db.query<{ data: string }>(
          'SELECT data FROM decision_journal_archive WHERE tenant_id = $1 ORDER BY at DESC LIMIT $2',
          [query.tenantId, limit],
        )
      : await this.db.query<{ data: string }>(
          'SELECT data FROM decision_journal_archive ORDER BY at DESC LIMIT $1',
          [limit],
        );
    return rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data) as DecisionJournalEntry);
  }

  private upsert(table: string, value: unknown): Promise<void> {
    return this.db
      .execute(
        `INSERT INTO ${table} (k, data) VALUES ($1, $2) ON CONFLICT (k) DO UPDATE SET data = excluded.data`,
        [BLOB_KEY, value],
      )
      .then(() => undefined);
  }

  private async loadBlob<T>(table: string): Promise<T | null> {
    const rows = await this.db.query<{ data: string }>(`SELECT data FROM ${table}`);
    const row = rows[0];
    if (!row) return null;
    return (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as T;
  }
}

/** A store that can rehydrate itself from durable storage at startup. */
export interface Restorable {
  restore(): Promise<void>;
}

export function isRestorable(x: unknown): x is Restorable {
  return typeof (x as Partial<Restorable> | null)?.restore === 'function';
}

/** Executive Memory that writes through every `remember` and restores at startup. */
export class PersistentExecutiveMemory implements ExecutiveMemoryPort, Restorable {
  constructor(
    private readonly inner: InMemoryExecutiveMemory,
    private readonly store: ExecutiveStore,
  ) {}

  async remember(entry: Parameters<ExecutiveMemoryPort['remember']>[0]): Promise<void> {
    await this.inner.remember(entry);
    await this.store.saveMemory(this.inner.snapshot());
  }
  recall(query: Parameters<ExecutiveMemoryPort['recall']>[0]): Promise<ExecutiveMemoryEntry[]> {
    return this.inner.recall(query);
  }
  async restore(): Promise<void> {
    await this.store.init();
    this.inner.hydrate(await this.store.loadMemory());
  }
}

/** Outcome of a Decision-Journal compaction pass. */
export interface CompactionResult {
  /** Entries moved to the immutable (Frozen) archive. */
  archived: number;
  /** Entries kept in the hot (Active) blob. */
  retained: number;
}

/**
 * A journal whose Active blob can be compacted — old entries folded into the
 * immutable Frozen archive, keeping the hot blob (and restore time) bounded
 * WITHOUT losing history. A capability the maintenance service duck-types for.
 */
export interface CompactableJournal {
  compact(opts: { retainPerTenant: number }): Promise<CompactionResult>;
  /** Read frozen (archived) entries for audit/export. */
  archive(query?: { tenantId?: string; limit?: number }): Promise<DecisionJournalEntry[]>;
}

export function isCompactable(x: unknown): x is CompactableJournal {
  return typeof (x as Partial<CompactableJournal> | null)?.compact === 'function';
}

/** Decision Journal that writes through every `record`/`attachOutcome` and restores. */
export class PersistentDecisionJournal implements DecisionJournalPort, Restorable, CompactableJournal {
  constructor(
    private readonly inner: InMemoryDecisionJournal,
    private readonly store: ExecutiveStore,
  ) {}

  async record(entry: Parameters<DecisionJournalPort['record']>[0]): Promise<string> {
    const id = await this.inner.record(entry);
    await this.store.saveJournal(this.inner.snapshot());
    return id;
  }
  history(query: Parameters<DecisionJournalPort['history']>[0]): Promise<DecisionJournalEntry[]> {
    return this.inner.history(query);
  }
  async attachOutcome(id: string, outcome: Record<string, unknown>): Promise<void> {
    await this.inner.attachOutcome(id, outcome);
    await this.store.saveJournal(this.inner.snapshot());
  }
  async restore(): Promise<void> {
    await this.store.init();
    this.inner.hydrate(await this.store.loadJournal());
  }

  /**
   * Compact the Active blob: keep the most recent `retainPerTenant` entries per
   * tenant hot; move everything older into the immutable Frozen archive.
   *
   * Archive-before-prune ordering makes this crash-safe: if it dies after
   * archiving but before shrinking the Active blob, the entries live in BOTH
   * tiers and a re-run simply re-archives (a no-op on id) and re-prunes — no
   * entry is ever lost. Single-process assumption (same as the queue): no other
   * writer mutates the journal concurrently.
   */
  async compact({ retainPerTenant }: { retainPerTenant: number }): Promise<CompactionResult> {
    const keep = Math.max(0, retainPerTenant);
    const all = this.inner.snapshot();
    const byTenant = new Map<string, DecisionJournalEntry[]>();
    for (const e of all) {
      const list = byTenant.get(e.tenantId) ?? [];
      list.push(e);
      byTenant.set(e.tenantId, list);
    }
    const toKeep: DecisionJournalEntry[] = [];
    const toArchive: DecisionJournalEntry[] = [];
    for (const list of byTenant.values()) {
      const sorted = [...list].sort((a, b) => b.at.localeCompare(a.at)); // newest first
      toKeep.push(...sorted.slice(0, keep));
      toArchive.push(...sorted.slice(keep));
    }
    if (toArchive.length === 0) return { archived: 0, retained: toKeep.length };

    await this.store.archiveJournal(toArchive); // Frozen tier first (crash-safe)
    this.inner.hydrate(toKeep); // Active tier shrinks
    await this.store.saveJournal(toKeep);
    return { archived: toArchive.length, retained: toKeep.length };
  }

  archive(query?: { tenantId?: string; limit?: number }): Promise<DecisionJournalEntry[]> {
    return this.store.loadArchive(query);
  }
}
