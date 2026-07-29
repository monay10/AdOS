import type { QueryExecutor } from '@ados/persistence';
import { isCompactable, type CompactionResult } from './executive-persistence.js';

/**
 * Storage lifecycle / maintenance (data-lifecycle sprint).
 *
 * The execution side of AdOS matured (durable brain, journal, queue, worker),
 * but the *data* side had no lifecycle: the Decision-Journal blob grows on every
 * write, repeated blob rewrites leave freelist pages behind, and nothing ever
 * measured or reclaimed that growth — so on a long-running install the SQLite
 * file bloats and restore times climb. This service closes that gap for the
 * 100% local SQLite store: it MEASURES storage, COMPACTS the journal (folding
 * old entries into an immutable Frozen archive), and RECLAIMS page bloat
 * (VACUUM / ANALYZE / PRAGMA optimize) — reporting exactly how much it freed.
 *
 * It is a platform-operator function over the shared local file: metrics are
 * whole-database (not tenant-scoped), which is honest for a single-operator,
 * on-machine deployment. No server, no API — plain SQLite PRAGMAs.
 */

export interface TableStat {
  name: string;
  rows: number;
  /** Bytes held in a `data` text column, when the table has one (0 otherwise). */
  bytes: number;
}

export interface StorageStats {
  dialect: string;
  pageSize: number;
  pageCount: number;
  /** Logical database size: pageCount × pageSize. */
  totalBytes: number;
  freelistPages: number;
  /** Space a VACUUM would reclaim: freelistPages × pageSize. */
  reclaimableBytes: number;
  tables: TableStat[];
  journal: { active: number; archived: number };
  lastMaintenanceAt?: string;
  recent: MaintenanceRun[];
}

export interface MaintenanceRun {
  at: string;
  kind: 'vacuum' | 'compact';
  reclaimedBytes: number;
  detail: string;
}

export interface VacuumResult {
  beforeBytes: number;
  afterBytes: number;
  reclaimedBytes: number;
  at: string;
}

/** A durable journal that can be compacted (the persistent decorator). */
type Journal = { compact?: (o: { retainPerTenant: number }) => Promise<CompactionResult> };

export class MaintenanceService {
  constructor(
    private readonly db: QueryExecutor & { dialect?: string },
    private readonly journal?: Journal,
    private readonly clock: () => number = () => Date.now(),
  ) {}

  /** SQLite only — the durable local store. Postgres maintenance is a separate path. */
  get supported(): boolean {
    return (this.db.dialect ?? 'sqlite') !== 'postgres';
  }

  async init(): Promise<void> {
    await this.db.execute(
      'CREATE TABLE IF NOT EXISTS maintenance_log (at TEXT NOT NULL, kind TEXT NOT NULL, reclaimed_bytes INTEGER NOT NULL DEFAULT 0, detail TEXT)',
    );
  }

  private nowIso(): string {
    return new Date(this.clock()).toISOString();
  }

  private async pragmaInt(name: string): Promise<number> {
    const rows = await this.db.query<Record<string, number>>(`PRAGMA ${name}`);
    const row = rows[0];
    return row ? Number(Object.values(row)[0] ?? 0) : 0;
  }

  private async userTables(): Promise<string[]> {
    const rows = await this.db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    return rows.map((r) => r.name);
  }

  private async hasDataColumn(table: string): Promise<boolean> {
    const cols = await this.db.query<{ name: string }>(`PRAGMA table_info("${table}")`);
    return cols.some((c) => c.name === 'data');
  }

  async stats(): Promise<StorageStats> {
    const [pageSize, pageCount, freelistPages] = await Promise.all([
      this.pragmaInt('page_size'),
      this.pragmaInt('page_count'),
      this.pragmaInt('freelist_count'),
    ]);

    const names = await this.userTables();
    const tables: TableStat[] = [];
    for (const name of names) {
      if (name === 'maintenance_log') continue; // don't report the bookkeeping table
      const countRows = await this.db.query<{ n: number }>(`SELECT COUNT(*) AS n FROM "${name}"`);
      const rows = Number(countRows[0]?.n ?? 0);
      let bytes = 0;
      if (await this.hasDataColumn(name)) {
        const byteRows = await this.db.query<{ b: number }>(`SELECT COALESCE(SUM(LENGTH(data)), 0) AS b FROM "${name}"`);
        bytes = Number(byteRows[0]?.b ?? 0);
      }
      tables.push({ name, rows, bytes });
    }

    const journal = await this.journalCounts(names);
    const recent = await this.recentRuns();

    return {
      dialect: this.db.dialect ?? 'sqlite',
      pageSize,
      pageCount,
      totalBytes: pageSize * pageCount,
      freelistPages,
      reclaimableBytes: pageSize * freelistPages,
      tables,
      journal,
      ...(recent[0] ? { lastMaintenanceAt: recent[0].at } : {}),
      recent,
    };
  }

  /** The applied schema version (latest migration id) + how many are applied. */
  async schemaVersion(): Promise<{ version: string | null; applied: number }> {
    const names = await this.userTables();
    if (!names.includes('schema_migrations')) return { version: null, applied: 0 };
    const rows = await this.db.query<{ id: string }>('SELECT id FROM schema_migrations ORDER BY id');
    return { version: rows.length ? rows[rows.length - 1]!.id : null, applied: rows.length };
  }

  /** Active = entries still in the hot blob; Archived = frozen entries. */
  private async journalCounts(names: string[]): Promise<{ active: number; archived: number }> {
    let active = 0;
    let archived = 0;
    if (names.includes('decision_journal')) {
      const rows = await this.db.query<{ data: string }>('SELECT data FROM decision_journal');
      const raw = rows[0]?.data;
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) active = parsed.length;
      }
    }
    if (names.includes('decision_journal_archive')) {
      const rows = await this.db.query<{ n: number }>('SELECT COUNT(*) AS n FROM decision_journal_archive');
      archived = Number(rows[0]?.n ?? 0);
    }
    return { active, archived };
  }

  private async recentRuns(limit = 5): Promise<MaintenanceRun[]> {
    const names = await this.userTables();
    if (!names.includes('maintenance_log')) return [];
    const rows = await this.db.query<{ at: string; kind: string; reclaimed_bytes: number; detail: string }>(
      'SELECT at, kind, reclaimed_bytes, detail FROM maintenance_log ORDER BY at DESC LIMIT $1',
      [limit],
    );
    return rows.map((r) => ({
      at: r.at,
      kind: r.kind as MaintenanceRun['kind'],
      reclaimedBytes: Number(r.reclaimed_bytes ?? 0),
      detail: r.detail ?? '',
    }));
  }

  private async log(kind: MaintenanceRun['kind'], reclaimedBytes: number, detail: string): Promise<void> {
    await this.db.execute(
      'INSERT INTO maintenance_log (at, kind, reclaimed_bytes, detail) VALUES ($1, $2, $3, $4)',
      [this.nowIso(), kind, reclaimedBytes, detail],
    );
  }

  /**
   * Reclaim page bloat: VACUUM rebuilds the file without freelist pages, ANALYZE
   * refreshes the planner's statistics, and PRAGMA optimize applies any cheap
   * pending optimizations. Returns bytes freed (measured, before − after).
   */
  async vacuum(): Promise<VacuumResult> {
    await this.init();
    const before = await this.pragmaInt('page_size').then(async (ps) => ps * (await this.pragmaInt('page_count')));
    await this.db.execute('VACUUM');
    await this.db.execute('ANALYZE');
    await this.db.execute('PRAGMA optimize');
    const after = await this.pragmaInt('page_size').then(async (ps) => ps * (await this.pragmaInt('page_count')));
    const reclaimedBytes = Math.max(0, before - after);
    const at = this.nowIso();
    await this.log('vacuum', reclaimedBytes, `${before} → ${after} bytes`);
    return { beforeBytes: before, afterBytes: after, reclaimedBytes, at };
  }

  /**
   * Compact the Decision Journal: keep the most recent `retainPerTenant` entries
   * hot, freeze the rest into the immutable archive. No-op (and honest about it)
   * when the wired journal isn't a durable, compactable one.
   */
  async compactJournal(retainPerTenant: number): Promise<CompactionResult> {
    await this.init();
    if (!isCompactable(this.journal)) return { archived: 0, retained: 0 };
    const result = await this.journal.compact({ retainPerTenant });
    await this.log('compact', 0, `archived ${result.archived}, retained ${result.retained}`);
    return result;
  }
}
