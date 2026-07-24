import type { Migration, QueryExecutor } from '@ados/persistence';
import { TenantContext } from '@ados/tenancy';
import type { StoredObject } from './object.js';

/**
 * Persistence port for object metadata. This is where the descriptors of every
 * stored object live — never the bytes, and never business data. Every read is
 * scoped to the ambient tenant, so one tenant can never see another's objects.
 */
export interface StorageRepository {
  /** Insert (or replace) a specific object version. */
  save(object: StoredObject): Promise<void>;
  /** Highest-numbered version of an object, or null if unknown. */
  findLatest(objectId: string): Promise<StoredObject | null>;
  findVersion(objectId: string, version: number): Promise<StoredObject | null>;
  listVersions(objectId: string): Promise<StoredObject[]>;
  listByWorkspace(workspaceId: string): Promise<StoredObject[]>;
  /** Re-home every version of an object to another workspace (logical move). */
  setWorkspace(objectId: string, workspaceId: string): Promise<void>;
  /** Change the human-facing name across every version (rename). */
  setOriginalName(objectId: string, originalName: string): Promise<void>;
  /** Soft-delete: tombstone every version. Bytes are retained. */
  softDelete(objectId: string, deletedAt: string): Promise<void>;
  /** Permanently remove every version's metadata (bytes purged separately). */
  hardDelete(objectId: string): Promise<void>;
  /** Latest version of each object soft-deleted before `cutoff` (for GC). */
  findSoftDeletedBefore(cutoff: string): Promise<StoredObject[]>;
  /** Distinct object count for the current tenant (health probe). */
  count(): Promise<number>;
}

function tenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}

/** In-memory metadata repository — the default (dev/tests). */
export class InMemoryStorageRepository implements StorageRepository {
  private rows: StoredObject[] = [];

  private mine(): StoredObject[] {
    const t = tenant();
    return this.rows.filter((r) => r.tenantId === t);
  }

  async save(object: StoredObject): Promise<void> {
    this.rows = this.rows.filter((r) => !(r.objectId === object.objectId && r.version === object.version));
    this.rows.push({ ...object });
  }

  async findLatest(objectId: string): Promise<StoredObject | null> {
    const versions = this.mine().filter((r) => r.objectId === objectId);
    if (versions.length === 0) return null;
    return versions.reduce((a, b) => (b.version > a.version ? b : a));
  }

  async findVersion(objectId: string, version: number): Promise<StoredObject | null> {
    return this.mine().find((r) => r.objectId === objectId && r.version === version) ?? null;
  }

  async listVersions(objectId: string): Promise<StoredObject[]> {
    return this.mine()
      .filter((r) => r.objectId === objectId)
      .sort((a, b) => a.version - b.version);
  }

  async listByWorkspace(workspaceId: string): Promise<StoredObject[]> {
    const latest = new Map<string, StoredObject>();
    for (const r of this.mine().filter((r) => r.workspaceId === workspaceId && !r.deletedAt)) {
      const cur = latest.get(r.objectId);
      if (!cur || r.version > cur.version) latest.set(r.objectId, r);
    }
    return [...latest.values()];
  }

  async setWorkspace(objectId: string, workspaceId: string): Promise<void> {
    const t = tenant();
    this.rows = this.rows.map((r) => (r.tenantId === t && r.objectId === objectId ? { ...r, workspaceId } : r));
  }

  async setOriginalName(objectId: string, originalName: string): Promise<void> {
    const t = tenant();
    this.rows = this.rows.map((r) => (r.tenantId === t && r.objectId === objectId ? { ...r, originalName } : r));
  }

  async softDelete(objectId: string, deletedAt: string): Promise<void> {
    const t = tenant();
    this.rows = this.rows.map((r) => (r.tenantId === t && r.objectId === objectId ? { ...r, deletedAt } : r));
  }

  async hardDelete(objectId: string): Promise<void> {
    const t = tenant();
    this.rows = this.rows.filter((r) => !(r.tenantId === t && r.objectId === objectId));
  }

  async findSoftDeletedBefore(cutoff: string): Promise<StoredObject[]> {
    const latest = new Map<string, StoredObject>();
    for (const r of this.mine().filter((r) => r.deletedAt && r.deletedAt <= cutoff)) {
      const cur = latest.get(r.objectId);
      if (!cur || r.version > cur.version) latest.set(r.objectId, r);
    }
    return [...latest.values()];
  }

  async count(): Promise<number> {
    return new Set(this.mine().map((r) => r.objectId)).size;
  }
}

/** Forward-only migration creating the object-metadata table (portable DDL). */
export function storageObjectsMigration(): Migration {
  return {
    id: '0003_storage_objects',
    up: async (exec) => {
      await exec.execute(
        `CREATE TABLE IF NOT EXISTS storage_objects (
           tenant_id text NOT NULL,
           workspace_id text NOT NULL,
           object_id text NOT NULL,
           original_name text NOT NULL,
           stored_name text NOT NULL,
           mime_type text NOT NULL,
           extension text NOT NULL,
           size integer NOT NULL,
           sha256 text NOT NULL,
           created_at text NOT NULL,
           created_by text NOT NULL,
           version integer NOT NULL,
           deleted_at text,
           PRIMARY KEY (object_id, version)
         )`,
      );
      await exec.execute(`CREATE INDEX IF NOT EXISTS ix_storage_objects_tenant ON storage_objects (tenant_id, object_id)`);
    },
  };
}

interface Row {
  tenant_id: string;
  workspace_id: string;
  object_id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  extension: string;
  size: number;
  sha256: string;
  created_at: string;
  created_by: string;
  version: number;
  deleted_at: string | null;
}

function toObject(row: Row): StoredObject {
  return {
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    objectId: row.object_id,
    originalName: row.original_name,
    storedName: row.stored_name,
    mimeType: row.mime_type,
    extension: row.extension,
    size: Number(row.size),
    sha256: row.sha256,
    createdAt: row.created_at,
    createdBy: row.created_by,
    version: Number(row.version),
    deletedAt: row.deleted_at,
  };
}

/** SQL-backed metadata repository (production), over the shared QueryExecutor. */
export class SqlStorageRepository implements StorageRepository {
  constructor(private readonly exec: QueryExecutor) {}

  async save(object: StoredObject): Promise<void> {
    await this.exec.execute(
      `INSERT INTO storage_objects
         (tenant_id, workspace_id, object_id, original_name, stored_name, mime_type, extension, size, sha256, created_at, created_by, version, deleted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (object_id, version) DO UPDATE SET
         workspace_id = excluded.workspace_id, original_name = excluded.original_name,
         stored_name = excluded.stored_name, mime_type = excluded.mime_type, extension = excluded.extension,
         size = excluded.size, sha256 = excluded.sha256, created_by = excluded.created_by, deleted_at = excluded.deleted_at`,
      [
        object.tenantId,
        object.workspaceId,
        object.objectId,
        object.originalName,
        object.storedName,
        object.mimeType,
        object.extension,
        object.size,
        object.sha256,
        object.createdAt,
        object.createdBy,
        object.version,
        object.deletedAt,
      ],
    );
  }

  async findLatest(objectId: string): Promise<StoredObject | null> {
    const rows = await this.exec.query<Row>(
      `SELECT * FROM storage_objects WHERE tenant_id = $1 AND object_id = $2 ORDER BY version DESC LIMIT 1`,
      [tenant(), objectId],
    );
    return rows[0] ? toObject(rows[0]) : null;
  }

  async findVersion(objectId: string, version: number): Promise<StoredObject | null> {
    const rows = await this.exec.query<Row>(
      `SELECT * FROM storage_objects WHERE tenant_id = $1 AND object_id = $2 AND version = $3`,
      [tenant(), objectId, version],
    );
    return rows[0] ? toObject(rows[0]) : null;
  }

  async listVersions(objectId: string): Promise<StoredObject[]> {
    const rows = await this.exec.query<Row>(
      `SELECT * FROM storage_objects WHERE tenant_id = $1 AND object_id = $2 ORDER BY version ASC`,
      [tenant(), objectId],
    );
    return rows.map(toObject);
  }

  async listByWorkspace(workspaceId: string): Promise<StoredObject[]> {
    const rows = await this.exec.query<Row>(
      `SELECT * FROM storage_objects s WHERE s.tenant_id = $1 AND s.workspace_id = $2 AND s.deleted_at IS NULL
         AND s.version = (SELECT MAX(version) FROM storage_objects x WHERE x.object_id = s.object_id)
       ORDER BY s.created_at DESC`,
      [tenant(), workspaceId],
    );
    return rows.map(toObject);
  }

  async setWorkspace(objectId: string, workspaceId: string): Promise<void> {
    await this.exec.execute(`UPDATE storage_objects SET workspace_id = $1 WHERE tenant_id = $2 AND object_id = $3`, [
      workspaceId,
      tenant(),
      objectId,
    ]);
  }

  async setOriginalName(objectId: string, originalName: string): Promise<void> {
    await this.exec.execute(`UPDATE storage_objects SET original_name = $1 WHERE tenant_id = $2 AND object_id = $3`, [
      originalName,
      tenant(),
      objectId,
    ]);
  }

  async softDelete(objectId: string, deletedAt: string): Promise<void> {
    await this.exec.execute(`UPDATE storage_objects SET deleted_at = $1 WHERE tenant_id = $2 AND object_id = $3`, [
      deletedAt,
      tenant(),
      objectId,
    ]);
  }

  async hardDelete(objectId: string): Promise<void> {
    await this.exec.execute(`DELETE FROM storage_objects WHERE tenant_id = $1 AND object_id = $2`, [tenant(), objectId]);
  }

  async findSoftDeletedBefore(cutoff: string): Promise<StoredObject[]> {
    const rows = await this.exec.query<Row>(
      `SELECT * FROM storage_objects s WHERE s.tenant_id = $1 AND s.deleted_at IS NOT NULL AND s.deleted_at <= $2
         AND s.version = (SELECT MAX(version) FROM storage_objects x WHERE x.object_id = s.object_id)`,
      [tenant(), cutoff],
    );
    return rows.map(toObject);
  }

  async count(): Promise<number> {
    const rows = await this.exec.query<{ n: number }>(
      `SELECT COUNT(DISTINCT object_id) AS n FROM storage_objects WHERE tenant_id = $1`,
      [tenant()],
    );
    return Number(rows[0]?.n ?? 0);
  }
}
