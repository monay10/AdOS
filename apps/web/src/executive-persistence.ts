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

/** Decision Journal that writes through every `record`/`attachOutcome` and restores. */
export class PersistentDecisionJournal implements DecisionJournalPort, Restorable {
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
}
