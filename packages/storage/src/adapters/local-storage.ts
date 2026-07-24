import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { StorageError } from '../object.js';
import type { PutOptions, StoragePort, StoragePutResult } from '../storage.port.js';

/**
 * Local filesystem StoragePort. The default adapter for development, tests and
 * single-node deployments. Streams end to end (constant memory), writes atomically
 * via a temp file + rename, and creates parent directories on demand.
 *
 * All access is confined to `rootDir`; a key that would escape it (via `..` or
 * an absolute path) is rejected — this is the physical backstop behind tenant
 * isolation, which the service enforces by prefixing every key with the tenant.
 */
export class LocalFileStorage implements StoragePort {
  constructor(private readonly rootDir: string) {}

  private resolveKey(key: string): string {
    const target = resolve(this.rootDir, key);
    const root = resolve(this.rootDir);
    if (target !== root && !target.startsWith(root + sep)) {
      throw new StorageError('invalid_key', `Key "${key}" escapes the storage root.`);
    }
    return target;
  }

  async put(key: string, body: Readable, opts?: PutOptions): Promise<StoragePutResult> {
    const target = this.resolveKey(key);
    await mkdir(dirname(target), { recursive: true });
    const tmp = `${target}.tmp-${randomUUID()}`;

    const hash = createHash('sha256');
    const maxBytes = opts?.maxBytes;
    let size = 0;
    const meter = new Transform({
      transform(chunk: Buffer, _enc, cb) {
        size += chunk.length;
        if (maxBytes !== undefined && size > maxBytes) {
          cb(new StorageError('too_large', `Object exceeds the ${maxBytes}-byte limit.`));
          return;
        }
        hash.update(chunk);
        cb(null, chunk);
      },
    });

    try {
      await pipeline(body, meter, createWriteStream(tmp));
      await rename(tmp, target);
    } catch (e) {
      await rm(tmp, { force: true });
      throw e;
    }
    return { size, sha256: hash.digest('hex') };
  }

  async get(key: string): Promise<Readable> {
    const target = this.resolveKey(key);
    if (!(await this.pathExists(target))) {
      throw new StorageError('not_found', `Object "${key}" was not found.`);
    }
    return createReadStream(target);
  }

  async exists(key: string): Promise<boolean> {
    return this.pathExists(this.resolveKey(key));
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true });
  }

  async copy(fromKey: string, toKey: string): Promise<void> {
    const to = this.resolveKey(toKey);
    await mkdir(dirname(to), { recursive: true });
    // Streamed copy — never loads the object into memory.
    await pipeline(await this.get(fromKey), createWriteStream(to));
  }

  async list(prefix: string): Promise<string[]> {
    const root = resolve(this.rootDir);
    const start = this.resolveKey(prefix);
    const out: string[] = [];
    const walk = async (dir: string): Promise<void> => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        return; // prefix has no directory yet
      }
      for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (!entry.name.includes('.tmp-')) out.push(relative(root, full).split(sep).join('/'));
      }
    };
    if (await this.pathExists(start)) {
      const s = await stat(start);
      if (s.isDirectory()) await walk(start);
      else out.push(relative(root, start).split(sep).join('/'));
    }
    return out.sort();
  }

  async ping(): Promise<void> {
    await mkdir(this.rootDir, { recursive: true });
    await access(this.rootDir);
  }

  private async pathExists(target: string): Promise<boolean> {
    try {
      await access(target);
      return true;
    } catch {
      return false;
    }
  }
}
