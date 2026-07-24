import { Readable } from 'node:stream';
import type { QueryExecutor } from '@ados/persistence';
import type { StoragePort } from '@ados/storage';

export interface BackupContext {
  readonly tenantId: string;
  readonly scope: 'tenant' | 'platform';
}

/**
 * BackupSource — one thing that can be backed up and restored. The backup
 * service asks each source to export a raw snapshot and, on restore, to import
 * one back. Sources own their own format; the archive layer handles compression,
 * encryption and checksums uniformly.
 */
export interface BackupSource {
  readonly name: string;
  export(ctx: BackupContext): Promise<Buffer>;
  import(ctx: BackupContext, bytes: Buffer): Promise<void>;
  /** Optional deeper consistency check on restore, beyond the archive checksum. */
  verify?(bytes: Buffer): Promise<boolean>;
}

/**
 * A logical JSON snapshot of any store, via an injected provider. This is how
 * the app backs up its logical stores (configuration, secrets, prompt registry,
 * company brain, executive memory, knowledge graph, decision journal) without
 * this package importing a single business module.
 */
export interface SnapshotProvider<T> {
  snapshot(ctx: BackupContext): Promise<T> | T;
  load(ctx: BackupContext, data: T): Promise<void> | void;
}

export class JsonSnapshotSource<T> implements BackupSource {
  constructor(
    readonly name: string,
    private readonly provider: SnapshotProvider<T>,
  ) {}

  async export(ctx: BackupContext): Promise<Buffer> {
    return Buffer.from(JSON.stringify(await this.provider.snapshot(ctx)), 'utf8');
  }

  async import(ctx: BackupContext, bytes: Buffer): Promise<void> {
    await this.provider.load(ctx, JSON.parse(bytes.toString('utf8')) as T);
  }

  async verify(bytes: Buffer): Promise<boolean> {
    try {
      JSON.parse(bytes.toString('utf8'));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Logical database backup over the shared QueryExecutor — a JSON dump of the
 * given tables. Portable across Postgres and SQLite. (For very large databases,
 * an operator would additionally run a physical pg_dump; this captures the
 * platform's own tables consistently and restorably.)
 */
export class DatabaseBackupSource implements BackupSource {
  constructor(
    readonly name: string,
    private readonly exec: QueryExecutor,
    private readonly tables: string[],
  ) {}

  async export(): Promise<Buffer> {
    const dump: Record<string, Record<string, unknown>[]> = {};
    for (const table of this.tables) {
      dump[table] = await this.exec.query<Record<string, unknown>>(`SELECT * FROM ${table}`);
    }
    return Buffer.from(JSON.stringify(dump), 'utf8');
  }

  async import(_ctx: BackupContext, bytes: Buffer): Promise<void> {
    const dump = JSON.parse(bytes.toString('utf8')) as Record<string, Record<string, unknown>[]>;
    for (const table of this.tables) {
      const rows = dump[table] ?? [];
      await this.exec.execute(`DELETE FROM ${table}`);
      for (const row of rows) {
        const columns = Object.keys(row);
        if (columns.length === 0) continue;
        const placeholders = columns.map((_c, i) => `$${i + 1}`).join(', ');
        await this.exec.execute(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
          columns.map((c) => row[c]),
        );
      }
    }
  }

  async verify(bytes: Buffer): Promise<boolean> {
    try {
      const dump = JSON.parse(bytes.toString('utf8')) as Record<string, unknown[]>;
      return this.tables.every((t) => Array.isArray(dump[t]));
    } catch {
      return false;
    }
  }
}

/**
 * Object-store backup over the StoragePort (covers MinIO in production and the
 * local filesystem in dev). Captures every object under a prefix.
 */
export class StorageBackupSource implements BackupSource {
  constructor(
    readonly name: string,
    private readonly adapter: StoragePort,
    private readonly prefix = '',
  ) {}

  async export(): Promise<Buffer> {
    const objects: Record<string, string> = {};
    for (const key of await this.adapter.list(this.prefix)) {
      objects[key] = (await collect(await this.adapter.get(key))).toString('base64');
    }
    return Buffer.from(JSON.stringify(objects), 'utf8');
  }

  async import(_ctx: BackupContext, bytes: Buffer): Promise<void> {
    const objects = JSON.parse(bytes.toString('utf8')) as Record<string, string>;
    for (const [key, b64] of Object.entries(objects)) {
      await this.adapter.put(key, Readable.from(Buffer.from(b64, 'base64')));
    }
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

async function collect(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}
