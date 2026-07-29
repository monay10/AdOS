import {
  BackupService,
  type BackupArchiveStore,
  type BackupRecord,
  type BackupRepository,
  type BackupSource,
  type RestoreReport,
} from '@ados/backup';

/**
 * App-integrated backup & restore (Series 3 · Deployment · Sprint 1).
 *
 * Series 2 shipped durable learned state on a single local SQLite file
 * (`BRAIN_DB`), but "backup" meant *the operator manually copies the file*. This
 * makes it a first-class in-app capability over the tested `@ados/backup`
 * framework: a checksummed, self-describing, dry-run-VALIDATED snapshot of the
 * durable store, a metadata catalogue, and a safe restore that rehydrates the
 * running app's in-memory state afterwards. 100% local — the archives are files
 * on the same machine, no server, no API.
 */

const SYSTEM_VERSION = '2.0.0';
const SOURCE_NAME = 'learned_state';
/** The backup catalogue itself is never inside a backup (it would overwrite the
 * live, newer catalogue on restore). */
const CATALOGUE_TABLE = 'backups';

/** The subset of a `SqliteDatabase` this module needs (`run` = a transaction). */
export interface SqliteLike {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>;
  run?<T>(work: (ctx: unknown) => Promise<T>): Promise<T>;
}

/**
 * A backup source over the whole durable SQLite store. It discovers its tables
 * at snapshot time (`sqlite_master`), so new durable stores are captured
 * automatically, and restores them **transactionally on the live connection**
 * (`ATTACH`-free: same file, `DELETE`+re-`INSERT` inside one transaction), which
 * is safe while the app holds the connection open. Tables present in the backup
 * but absent from the current schema are skipped (that is migration territory).
 */
class SqliteStoreBackupSource implements BackupSource {
  readonly name = SOURCE_NAME;
  constructor(
    private readonly db: SqliteLike,
    private readonly exclude: ReadonlySet<string>,
  ) {}

  private async tables(): Promise<string[]> {
    const rows = await this.db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    return rows.map((r) => r.name).filter((n) => !this.exclude.has(n));
  }

  async export(): Promise<Buffer> {
    const dump: Record<string, Record<string, unknown>[]> = {};
    for (const table of await this.tables()) {
      dump[table] = await this.db.query<Record<string, unknown>>(`SELECT * FROM "${table}"`);
    }
    return Buffer.from(JSON.stringify(dump), 'utf8');
  }

  async import(_ctx: unknown, bytes: Buffer): Promise<void> {
    const dump = JSON.parse(bytes.toString('utf8')) as Record<string, Record<string, unknown>[]>;
    const present = new Set(await this.tables());
    const apply = async (): Promise<void> => {
      for (const [table, rows] of Object.entries(dump)) {
        if (!present.has(table)) continue; // table gone in this schema — skip (Sprint 2: migration)
        await this.db.execute(`DELETE FROM "${table}"`);
        for (const row of rows) {
          const cols = Object.keys(row);
          if (cols.length === 0) continue;
          const placeholders = cols.map((_c, i) => `$${i + 1}`).join(', ');
          await this.db.execute(
            `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders})`,
            cols.map((c) => row[c]),
          );
        }
      }
    };
    // One transaction: a crash mid-restore rolls back, never a half-restored store.
    if (this.db.run) await this.db.run(apply);
    else await apply();
  }

  async verify(bytes: Buffer): Promise<boolean> {
    try {
      const parsed = JSON.parse(bytes.toString('utf8')) as unknown;
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }
}

export class BackupManager {
  private readonly service: BackupService;
  private onRestore?: () => Promise<void>;

  constructor(
    private readonly db: SqliteLike,
    private readonly repository: BackupRepository,
    archives: BackupArchiveStore,
  ) {
    this.service = new BackupService({
      sources: [new SqliteStoreBackupSource(db, new Set([CATALOGUE_TABLE]))],
      repository,
      archives,
      systemVersion: SYSTEM_VERSION,
    });
  }

  /** Called after a real restore to reload the app's in-memory state from disk. */
  setOnRestore(cb: () => Promise<void>): void {
    this.onRestore = cb;
  }

  /** Create the catalogue table (idempotent). Safe on any SQLite connection. */
  async init(): Promise<void> {
    await this.db.execute(
      `CREATE TABLE IF NOT EXISTS ${CATALOGUE_TABLE} (
        id TEXT PRIMARY KEY, tenant_id TEXT, kind TEXT, parent_id TEXT, system_version TEXT,
        created_at TEXT, checksum TEXT, size_bytes INTEGER, encrypted INTEGER,
        manifest TEXT, restore_validated INTEGER, validation_summary TEXT
      )`,
    );
  }

  /** Create a platform-wide backup and auto-validate it (dry-run restore). */
  createBackup(): Promise<BackupRecord> {
    return this.service.backup({});
  }

  listBackups(): Promise<BackupRecord[]> {
    return this.repository.list();
  }

  getBackup(id: string): Promise<BackupRecord | null> {
    return this.repository.findById(id);
  }

  /** Dry-run: verify integrity/compatibility/consistency without touching the store. */
  verify(id: string): Promise<RestoreReport> {
    return this.service.restore.restore({ backupId: id, dryRun: true });
  }

  /** Apply a restore, then rehydrate the running app's in-memory state. */
  async restore(id: string): Promise<RestoreReport> {
    const report = await this.service.restore.restore({ backupId: id, dryRun: false });
    if (report.ok && this.onRestore) await this.onRestore();
    return report;
  }
}
