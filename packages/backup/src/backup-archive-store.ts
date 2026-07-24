import { Readable } from 'node:stream';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { StoragePort } from '@ados/storage';

/**
 * Where backup archive bytes live — separate from the metadata repository. Three
 * adapters: in-memory (tests), local filesystem, and any StoragePort (so backups
 * can go to MinIO / a different bucket than the data they protect).
 */
export interface BackupArchiveStore {
  put(id: string, bytes: Buffer): Promise<void>;
  get(id: string): Promise<Buffer>;
  delete(id: string): Promise<void>;
  list(): Promise<string[]>;
}

export class InMemoryBackupArchiveStore implements BackupArchiveStore {
  private readonly archives = new Map<string, Buffer>();
  async put(id: string, bytes: Buffer): Promise<void> {
    this.archives.set(id, Buffer.from(bytes));
  }
  async get(id: string): Promise<Buffer> {
    const bytes = this.archives.get(id);
    if (!bytes) throw new Error(`Backup archive "${id}" not found.`);
    return bytes;
  }
  async delete(id: string): Promise<void> {
    this.archives.delete(id);
  }
  async list(): Promise<string[]> {
    return [...this.archives.keys()].sort();
  }
}

const SUFFIX = '.ados-backup';

export class LocalBackupArchiveStore implements BackupArchiveStore {
  constructor(private readonly dir: string) {}
  async put(id: string, bytes: Buffer): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await writeFile(join(this.dir, id + SUFFIX), bytes);
  }
  async get(id: string): Promise<Buffer> {
    return readFile(join(this.dir, id + SUFFIX));
  }
  async delete(id: string): Promise<void> {
    await rm(join(this.dir, id + SUFFIX), { force: true });
  }
  async list(): Promise<string[]> {
    try {
      return (await readdir(this.dir)).filter((f) => f.endsWith(SUFFIX)).map((f) => f.slice(0, -SUFFIX.length)).sort();
    } catch {
      return [];
    }
  }
}

/** Store archives through any StoragePort (e.g. a dedicated MinIO backup bucket). */
export class StorageBackupArchiveStore implements BackupArchiveStore {
  constructor(
    private readonly adapter: StoragePort,
    private readonly prefix = 'backups',
  ) {}
  private key(id: string): string {
    return `${this.prefix}/${id}${SUFFIX}`;
  }
  async put(id: string, bytes: Buffer): Promise<void> {
    await this.adapter.put(this.key(id), Readable.from(bytes));
  }
  async get(id: string): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const c of await this.adapter.get(this.key(id))) chunks.push(c as Buffer);
    return Buffer.concat(chunks);
  }
  async delete(id: string): Promise<void> {
    await this.adapter.delete(this.key(id));
  }
  async list(): Promise<string[]> {
    return (await this.adapter.list(this.prefix))
      .filter((k) => k.endsWith(SUFFIX))
      .map((k) => k.slice(k.lastIndexOf('/') + 1, -SUFFIX.length))
      .sort();
  }
}
