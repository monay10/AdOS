import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { TenantContext } from '@ados/tenancy';
import { StorageError, type StoredObject } from './object.js';
import type { PdfPreviewPort, StoragePort, ThumbnailGeneratorPort, VirusScannerPort } from './storage.port.js';
import type { StorageRepository } from './storage-repository.js';
import { StorageEvents } from './storage-events.js';
import {
  loggerStorageAudit,
  StorageHealthCheck,
  StorageMetrics,
  StorageTracing,
  type StorageAudit,
  type StorageHealthReport,
} from './storage-observability.js';
import { DEFAULT_VALIDATION_POLICY, extensionFor, validateMimeType, type ValidationPolicy } from './validation.js';

export interface StorageHooks {
  readonly scanner?: VirusScannerPort;
  readonly thumbnailer?: ThumbnailGeneratorPort;
  readonly pdf?: PdfPreviewPort;
}

export interface StorageServiceDeps {
  readonly adapter: StoragePort;
  readonly repository: StorageRepository;
  readonly events?: StorageEvents;
  readonly audit?: StorageAudit;
  readonly metrics?: StorageMetrics;
  readonly tracing?: StorageTracing;
  readonly policy?: ValidationPolicy;
  readonly hooks?: StorageHooks;
}

export interface UploadInput {
  readonly workspaceId: string;
  readonly originalName: string;
  readonly mimeType: string;
  readonly body: Readable;
  readonly createdBy?: string;
}

export interface DownloadResult {
  readonly object: StoredObject;
  readonly stream: Readable;
}

/**
 * StorageApplicationService — the single boundary business modules use for files.
 *
 * Nothing outside this service ever touches the blob adapter or a filesystem.
 * It validates (MIME + size), streams bytes through the adapter (computing size
 * + SHA-256), persists tenant-scoped metadata with full versioning, quarantines
 * anything a virus-scan hook flags, and emits events + audit + metrics + traces
 * for every operation. Move and rename are metadata-only; copy duplicates bytes.
 */
export class StorageApplicationService {
  private readonly adapter: StoragePort;
  private readonly repository: StorageRepository;
  private readonly events: StorageEvents;
  private readonly audit: StorageAudit;
  private readonly metrics: StorageMetrics;
  private readonly tracing: StorageTracing;
  private readonly policy: ValidationPolicy;
  private readonly hooks: StorageHooks;

  constructor(deps: StorageServiceDeps) {
    this.adapter = deps.adapter;
    this.repository = deps.repository;
    this.events = deps.events ?? new StorageEvents();
    this.audit = deps.audit ?? loggerStorageAudit();
    this.metrics = deps.metrics ?? new StorageMetrics();
    this.tracing = deps.tracing ?? new StorageTracing();
    this.policy = deps.policy ?? DEFAULT_VALIDATION_POLICY;
    this.hooks = deps.hooks ?? {};
  }

  private tenant(): string {
    return TenantContext.current()?.tenantId ?? 'public';
  }

  private actor(explicit?: string): string {
    return explicit ?? TenantContext.current()?.actor ?? 'system';
  }

  /** Physical key: tenant-namespaced, per-object, per-version. */
  private keyOf(object: Pick<StoredObject, 'tenantId' | 'objectId' | 'version' | 'storedName'>): string {
    return `${object.tenantId}/${object.objectId}/v${object.version}/${object.storedName}`;
  }

  /** Stream `body` to the adapter, enforcing the size ceiling mid-stream. The
   * adapter's single write pipeline owns error handling and partial cleanup. */
  private async write(key: string, body: Readable): Promise<{ size: number; sha256: string }> {
    return this.adapter.put(key, body, { maxBytes: this.policy.maxSizeBytes });
  }

  async upload(input: UploadInput): Promise<StoredObject> {
    return this.run('upload', 'upload', async () => {
      validateMimeType(input.mimeType, this.policy);
      const tenantId = this.tenant();
      const objectId = randomUUID();
      const extension = extensionFor(input.originalName, input.mimeType);
      const storedName = `${objectId}.${extension}`;
      const version = 1;
      const key = this.keyOf({ tenantId, objectId, version, storedName });

      const { size, sha256 } = await this.write(key, input.body);
      const object: StoredObject = {
        tenantId,
        workspaceId: input.workspaceId,
        objectId,
        originalName: input.originalName,
        storedName,
        mimeType: input.mimeType,
        extension,
        size,
        sha256,
        createdAt: new Date().toISOString(),
        createdBy: this.actor(input.createdBy),
        version,
        deletedAt: null,
      };

      await this.quarantineIfInfected(key, object);
      await this.repository.save(object);
      await this.events.uploaded(object);
      this.audit.record('upload', { tenantId, workspaceId: object.workspaceId, objectId, actor: object.createdBy, size, version });
      this.metrics.uploaded(size);
      return object;
    });
  }

  /** Add a new immutable version of an existing object (history is preserved). */
  async addVersion(objectId: string, input: Omit<UploadInput, 'workspaceId'> & { workspaceId?: string }): Promise<StoredObject> {
    return this.run('version', 'addVersion', async () => {
      const latest = await this.requireLatest(objectId);
      validateMimeType(input.mimeType, this.policy);
      const version = latest.version + 1;
      const extension = extensionFor(input.originalName, input.mimeType);
      const storedName = `${objectId}.v${version}.${extension}`;
      const key = this.keyOf({ tenantId: latest.tenantId, objectId, version, storedName });

      const { size, sha256 } = await this.write(key, input.body);
      const object: StoredObject = {
        ...latest,
        workspaceId: input.workspaceId ?? latest.workspaceId,
        originalName: input.originalName,
        storedName,
        mimeType: input.mimeType,
        extension,
        size,
        sha256,
        createdAt: new Date().toISOString(),
        createdBy: this.actor(input.createdBy),
        version,
        deletedAt: null,
      };
      await this.quarantineIfInfected(key, object);
      await this.repository.save(object);
      await this.events.versionAdded(object);
      this.audit.record('version', { tenantId: object.tenantId, objectId, actor: object.createdBy, size, version });
      this.metrics.action('version');
      return object;
    });
  }

  async download(objectId: string, version?: number): Promise<DownloadResult> {
    return this.run('download', 'download', async () => {
      const object = version === undefined ? await this.requireLatest(objectId) : await this.requireVersion(objectId, version);
      if (object.deletedAt) throw new StorageError('not_found', `Object "${objectId}" has been deleted.`);
      const stream = await this.adapter.get(this.keyOf(object));
      await this.events.downloaded(object);
      this.audit.record('download', { tenantId: object.tenantId, objectId, actor: this.actor(), version: object.version });
      this.metrics.downloaded(object.size);
      return { object, stream };
    });
  }

  async getMetadata(objectId: string, version?: number): Promise<StoredObject> {
    return version === undefined ? this.requireLatest(objectId) : this.requireVersion(objectId, version);
  }

  listVersions(objectId: string): Promise<StoredObject[]> {
    return this.repository.listVersions(objectId);
  }

  listByWorkspace(workspaceId: string): Promise<StoredObject[]> {
    return this.repository.listByWorkspace(workspaceId);
  }

  /** Duplicate an object's latest bytes into a brand-new object (server-side copy). */
  async copy(objectId: string, opts: { toWorkspaceId?: string; createdBy?: string } = {}): Promise<StoredObject> {
    return this.run('copy', 'copy', async () => {
      const source = await this.requireLatest(objectId);
      const newObjectId = randomUUID();
      const storedName = `${newObjectId}.${source.extension}`;
      const copy: StoredObject = {
        ...source,
        objectId: newObjectId,
        workspaceId: opts.toWorkspaceId ?? source.workspaceId,
        storedName,
        version: 1,
        createdAt: new Date().toISOString(),
        createdBy: this.actor(opts.createdBy),
        deletedAt: null,
      };
      await this.adapter.copy(this.keyOf(source), this.keyOf(copy));
      await this.repository.save(copy);
      await this.events.copied(source, copy);
      this.audit.record('copy', { tenantId: copy.tenantId, workspaceId: copy.workspaceId, objectId: newObjectId, actor: copy.createdBy });
      this.metrics.action('copy');
      return copy;
    });
  }

  /** Logical move between workspaces within the tenant (metadata-only). */
  async move(objectId: string, toWorkspaceId: string): Promise<StoredObject> {
    return this.run('move', 'move', async () => {
      const object = await this.requireLatest(objectId);
      await this.repository.setWorkspace(objectId, toWorkspaceId);
      const moved = await this.requireLatest(objectId);
      await this.events.moved(moved, object.workspaceId);
      this.audit.record('move', { tenantId: moved.tenantId, workspaceId: toWorkspaceId, objectId, actor: this.actor() });
      this.metrics.action('move');
      return moved;
    });
  }

  async rename(objectId: string, newName: string): Promise<StoredObject> {
    return this.run('rename', 'rename', async () => {
      const object = await this.requireLatest(objectId);
      await this.repository.setOriginalName(objectId, newName);
      const renamed = await this.requireLatest(objectId);
      await this.events.renamed(renamed, object.originalName);
      this.audit.record('rename', { tenantId: renamed.tenantId, objectId, actor: this.actor() });
      this.metrics.action('rename');
      return renamed;
    });
  }

  /** Soft delete — tombstone the metadata; bytes are retained for recovery. */
  async softDelete(objectId: string): Promise<void> {
    return this.run('soft_delete', 'softDelete', async () => {
      const object = await this.requireLatest(objectId);
      await this.repository.softDelete(objectId, new Date().toISOString());
      await this.events.softDeleted(object);
      this.audit.record('soft_delete', { tenantId: object.tenantId, objectId, actor: this.actor() });
      this.metrics.action('soft_delete');
    });
  }

  /** Permanent delete — remove every version's bytes and metadata. Irreversible. */
  async purge(objectId: string): Promise<void> {
    return this.run('purge', 'purge', async () => {
      const versions = await this.repository.listVersions(objectId);
      if (versions.length === 0) throw new StorageError('not_found', `Object "${objectId}" was not found.`);
      for (const v of versions) await this.adapter.delete(this.keyOf(v));
      await this.repository.hardDelete(objectId);
      await this.events.purged(versions[versions.length - 1]!);
      this.audit.record('purge', { tenantId: versions[0]!.tenantId, objectId, actor: this.actor() });
      this.metrics.action('purge');
    });
  }

  /** Garbage-collect objects soft-deleted longer ago than `olderThanMs`. */
  async cleanup(olderThanMs: number): Promise<number> {
    return this.run('cleanup', 'cleanup', async () => {
      const cutoff = new Date(Date.now() - olderThanMs).toISOString();
      const stale = await this.repository.findSoftDeletedBefore(cutoff);
      for (const object of stale) {
        for (const v of await this.repository.listVersions(object.objectId)) await this.adapter.delete(this.keyOf(v));
        await this.repository.hardDelete(object.objectId);
      }
      if (stale.length > 0) {
        this.audit.record('cleanup', { tenantId: this.tenant(), reason: `purged ${stale.length} soft-deleted objects` });
        this.metrics.action('cleanup');
      }
      return stale.length;
    });
  }

  /**
   * Generate derived previews using the injected hooks (thumbnail for images,
   * first-page render for PDFs). No generator ships in this package — these are
   * ports only; the method is a no-op unless a hook is wired. Returns the keys
   * of any derivatives written.
   */
  async generatePreviews(objectId: string): Promise<string[]> {
    const object = await this.requireLatest(objectId);
    const derived: string[] = [];
    const source = (): Promise<Readable> => this.adapter.get(this.keyOf(object));

    if (this.hooks.thumbnailer && object.mimeType.startsWith('image/')) {
      const thumb = await this.hooks.thumbnailer.generate(await source(), object.mimeType);
      if (thumb) derived.push(await this.writeDerivative(object, 'thumb.png', thumb));
    }
    if (this.hooks.pdf && object.mimeType === 'application/pdf') {
      const preview = await this.hooks.pdf.render(await source());
      if (preview) derived.push(await this.writeDerivative(object, 'preview.png', preview));
    }
    return derived;
  }

  health(): Promise<StorageHealthReport> {
    return new StorageHealthCheck(this.adapter, this.repository).check();
  }

  // --- internals ---------------------------------------------------------

  private async writeDerivative(object: StoredObject, name: string, body: Readable): Promise<string> {
    const key = `${object.tenantId}/${object.objectId}/derived/${name}`;
    await this.write(key, body);
    return key;
  }

  private async quarantineIfInfected(key: string, object: StoredObject): Promise<void> {
    if (!this.hooks.scanner) return;
    const result = await this.hooks.scanner.scan(key, await this.adapter.get(key));
    if (!result.clean) {
      await this.adapter.delete(key);
      await this.events.scanFlagged(object, result.signature);
      this.audit.record('scan_flagged', { tenantId: object.tenantId, objectId: object.objectId, reason: result.signature ?? 'infected' });
      this.metrics.flagged();
      throw new StorageError('infected', `Object "${object.objectId}" was rejected by the virus scanner.`);
    }
  }

  private async requireLatest(objectId: string): Promise<StoredObject> {
    const object = await this.repository.findLatest(objectId);
    if (!object) throw new StorageError('not_found', `Object "${objectId}" was not found.`);
    return object;
  }

  private async requireVersion(objectId: string, version: number): Promise<StoredObject> {
    const object = await this.repository.findVersion(objectId, version);
    if (!object) throw new StorageError('not_found', `Object "${objectId}" v${version} was not found.`);
    return object;
  }

  private async run<T>(metric: string, span: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await this.tracing.span(span, fn);
    } catch (e) {
      this.metrics.error(metric);
      throw e;
    }
  }
}
