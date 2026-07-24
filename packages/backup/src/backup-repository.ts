import type { Migration, QueryExecutor } from '@ados/persistence';
import type { BackupKind, BackupManifest, BackupRecord } from './manifest.js';

/**
 * Persistence port for backup metadata (the catalogue) — never the archive
 * bytes, which live in a {@link BackupArchiveStore}. Point-in-time restore reads
 * this catalogue to pick a backup and walk its parent chain by createdAt.
 */
export interface BackupRepository {
  save(record: BackupRecord): Promise<void>;
  findById(id: string): Promise<BackupRecord | null>;
  list(tenantId?: string): Promise<BackupRecord[]>;
  /** Most recent successful backup for a tenant (the incremental parent). */
  latest(tenantId: string): Promise<BackupRecord | null>;
  markValidated(id: string, validated: boolean, summary: string): Promise<void>;
}

export class InMemoryBackupRepository implements BackupRepository {
  private readonly records = new Map<string, BackupRecord>();

  async save(record: BackupRecord): Promise<void> {
    this.records.set(record.id, { ...record });
  }
  async findById(id: string): Promise<BackupRecord | null> {
    const r = this.records.get(id);
    return r ? { ...r } : null;
  }
  async list(tenantId?: string): Promise<BackupRecord[]> {
    return [...this.records.values()]
      .filter((r) => tenantId === undefined || r.tenantId === tenantId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  async latest(tenantId: string): Promise<BackupRecord | null> {
    return (await this.list(tenantId))[0] ?? null;
  }
  async markValidated(id: string, validated: boolean, summary: string): Promise<void> {
    const r = this.records.get(id);
    if (r) this.records.set(id, { ...r, restoreValidated: validated, validationSummary: summary });
  }
}

export function backupsMigration(): Migration {
  return {
    id: '0005_backups',
    up: async (exec) => {
      await exec.execute(
        `CREATE TABLE IF NOT EXISTS backups (
           id text PRIMARY KEY,
           tenant_id text NOT NULL,
           kind text NOT NULL,
           parent_id text,
           system_version text NOT NULL,
           created_at text NOT NULL,
           checksum text NOT NULL,
           size_bytes integer NOT NULL,
           encrypted integer NOT NULL,
           manifest text NOT NULL,
           restore_validated integer NOT NULL,
           validation_summary text
         )`,
      );
      await exec.execute(`CREATE INDEX IF NOT EXISTS ix_backups_tenant ON backups (tenant_id, created_at)`);
    },
  };
}

interface Row {
  id: string;
  tenant_id: string;
  kind: string;
  parent_id: string | null;
  system_version: string;
  created_at: string;
  checksum: string;
  size_bytes: number;
  encrypted: number;
  manifest: string;
  restore_validated: number;
  validation_summary: string | null;
}

function toRecord(row: Row): BackupRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    kind: row.kind as BackupKind,
    parentId: row.parent_id,
    systemVersion: row.system_version,
    createdAt: row.created_at,
    checksum: row.checksum,
    sizeBytes: Number(row.size_bytes),
    encrypted: Number(row.encrypted) === 1,
    manifest: JSON.parse(row.manifest) as BackupManifest,
    restoreValidated: Number(row.restore_validated) === 1,
    validationSummary: row.validation_summary,
  };
}

/** SQL-backed backup catalogue (production), over the shared QueryExecutor. */
export class SqlBackupRepository implements BackupRepository {
  constructor(private readonly exec: QueryExecutor) {}

  async save(record: BackupRecord): Promise<void> {
    await this.exec.execute(
      `INSERT INTO backups (id, tenant_id, kind, parent_id, system_version, created_at, checksum, size_bytes, encrypted, manifest, restore_validated, validation_summary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET restore_validated = excluded.restore_validated, validation_summary = excluded.validation_summary`,
      [
        record.id, record.tenantId, record.kind, record.parentId, record.systemVersion, record.createdAt,
        record.checksum, record.sizeBytes, record.encrypted ? 1 : 0, JSON.stringify(record.manifest),
        record.restoreValidated ? 1 : 0, record.validationSummary,
      ],
    );
  }
  async findById(id: string): Promise<BackupRecord | null> {
    const rows = await this.exec.query<Row>(`SELECT * FROM backups WHERE id = $1`, [id]);
    return rows[0] ? toRecord(rows[0]) : null;
  }
  async list(tenantId?: string): Promise<BackupRecord[]> {
    const rows =
      tenantId === undefined
        ? await this.exec.query<Row>(`SELECT * FROM backups ORDER BY created_at DESC`)
        : await this.exec.query<Row>(`SELECT * FROM backups WHERE tenant_id = $1 ORDER BY created_at DESC`, [tenantId]);
    return rows.map(toRecord);
  }
  async latest(tenantId: string): Promise<BackupRecord | null> {
    const rows = await this.exec.query<Row>(`SELECT * FROM backups WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`, [tenantId]);
    return rows[0] ? toRecord(rows[0]) : null;
  }
  async markValidated(id: string, validated: boolean, summary: string): Promise<void> {
    await this.exec.execute(`UPDATE backups SET restore_validated = $1, validation_summary = $2 WHERE id = $3`, [validated ? 1 : 0, summary, id]);
  }
}
