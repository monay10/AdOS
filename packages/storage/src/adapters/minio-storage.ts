import { createHash } from 'node:crypto';
import { Transform, type Readable } from 'node:stream';
import { StorageError } from '../object.js';
import type { PutOptions, StoragePort, StoragePutResult } from '../storage.port.js';

/** Connection settings for a MinIO / S3-compatible endpoint. */
export interface MinioStorageOptions {
  /** Full endpoint URL, e.g. "https://minio.internal:9000" (from AppConfig.storage.endpoint). */
  readonly endpoint: string;
  readonly accessKey: string;
  readonly secretKey: string;
  readonly bucket: string;
  readonly region?: string;
}

/**
 * The subset of the `minio` client we depend on. Declaring it structurally lets
 * this adapter compile with no `minio` types installed; the real client is
 * loaded lazily at runtime (see {@link MinioFileStorage.client}).
 */
interface MinioClientLike {
  bucketExists(bucket: string): Promise<boolean>;
  makeBucket(bucket: string, region?: string): Promise<void>;
  putObject(bucket: string, name: string, stream: Readable): Promise<unknown>;
  getObject(bucket: string, name: string): Promise<Readable>;
  statObject(bucket: string, name: string): Promise<{ size: number }>;
  removeObject(bucket: string, name: string): Promise<void>;
  copyObject(bucket: string, name: string, source: string): Promise<unknown>;
  listObjectsV2(bucket: string, prefix: string, recursive: boolean): NodeJS.ReadableStream;
}

/**
 * MinIO / S3-compatible StoragePort — the production adapter.
 *
 * The `minio` client is imported lazily so this package builds and type-checks
 * with no object-store dependency installed and no live server (there is none in
 * CI); the shared {@link StoragePort} contract is what the service and tests
 * exercise against the local adapter. Streams end to end and never buffers an
 * object — SHA-256 and size are computed by a meter in the upload pipeline.
 */
export class MinioFileStorage implements StoragePort {
  private clientPromise: Promise<MinioClientLike> | undefined;
  private bucketReady: Promise<void> | undefined;

  constructor(private readonly options: MinioStorageOptions) {}

  private async client(): Promise<MinioClientLike> {
    if (!this.clientPromise) {
      // Hidden from the compiler/bundler so `minio` is only required at runtime.
      const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<{ Client: new (o: unknown) => MinioClientLike }>;
      const url = new URL(this.options.endpoint);
      const useSSL = url.protocol === 'https:';
      this.clientPromise = dynamicImport('minio').then(
        (mod) =>
          new mod.Client({
            endPoint: url.hostname,
            port: url.port ? Number(url.port) : useSSL ? 443 : 80,
            useSSL,
            accessKey: this.options.accessKey,
            secretKey: this.options.secretKey,
            ...(this.options.region ? { region: this.options.region } : {}),
          }),
      );
    }
    return this.clientPromise;
  }

  /** Create the bucket on first use (automatic "directory" creation). */
  private async ensureBucket(client: MinioClientLike): Promise<void> {
    if (!this.bucketReady) {
      this.bucketReady = (async () => {
        if (!(await client.bucketExists(this.options.bucket))) {
          await client.makeBucket(this.options.bucket, this.options.region ?? 'us-east-1');
        }
      })();
    }
    return this.bucketReady;
  }

  async put(key: string, body: Readable, opts?: PutOptions): Promise<StoragePutResult> {
    const client = await this.client();
    await this.ensureBucket(client);
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
    body.on('error', (e) => meter.destroy(e));
    body.pipe(meter);
    await client.putObject(this.options.bucket, key, meter);
    return { size, sha256: hash.digest('hex') };
  }

  async get(key: string): Promise<Readable> {
    const client = await this.client();
    try {
      return await client.getObject(this.options.bucket, key);
    } catch {
      throw new StorageError('not_found', `Object "${key}" was not found.`);
    }
  }

  async exists(key: string): Promise<boolean> {
    const client = await this.client();
    try {
      await client.statObject(this.options.bucket, key);
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    const client = await this.client();
    await client.removeObject(this.options.bucket, key);
  }

  async copy(fromKey: string, toKey: string): Promise<void> {
    const client = await this.client();
    await this.ensureBucket(client);
    await client.copyObject(this.options.bucket, toKey, `/${this.options.bucket}/${fromKey}`);
  }

  async list(prefix: string): Promise<string[]> {
    const client = await this.client();
    const stream = client.listObjectsV2(this.options.bucket, prefix, true);
    return new Promise<string[]>((resolvePromise, reject) => {
      const keys: string[] = [];
      stream.on('data', (item: { name?: string }) => {
        if (item.name) keys.push(item.name);
      });
      stream.on('end', () => resolvePromise(keys.sort()));
      stream.on('error', reject);
    });
  }

  async ping(): Promise<void> {
    const client = await this.client();
    await client.bucketExists(this.options.bucket);
  }
}
