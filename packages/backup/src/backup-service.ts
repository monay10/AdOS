import { randomUUID } from 'node:crypto';
import { buildArchive, type RawEntry } from './archive.js';
import type { BackupKind, BackupManifest, BackupRecord } from './manifest.js';
import type { BackupSource, BackupContext } from './backup-source.js';
import type { BackupRepository } from './backup-repository.js';
import type { BackupArchiveStore } from './backup-archive-store.js';
import { BackupMetrics, BackupTracing, loggerBackupAudit, type BackupAudit } from './backup-observability.js';
import { BackupEvents } from './backup-events.js';
import { RestoreService } from './restore-service.js';

export interface BackupServiceDeps {
  readonly sources: BackupSource[];
  readonly repository: BackupRepository;
  readonly archives: BackupArchiveStore;
  readonly events?: BackupEvents;
  readonly audit?: BackupAudit;
  readonly metrics?: BackupMetrics;
  readonly tracing?: BackupTracing;
  readonly systemVersion?: string;
}

export interface BackupRequest {
  /** Tenant id, or omit for a platform-wide backup. */
  readonly tenantId?: string;
  readonly kind?: BackupKind;
  /** Encrypt every entry with AES-256-GCM (key derived from this passphrase). */
  readonly passphrase?: string;
  /** Run automatic restore validation after the backup (default true). */
  readonly validate?: boolean;
}

/**
 * BackupService — captures a consistent, checksummed, compressed (optionally
 * encrypted) snapshot of every registered source into a single archive, records
 * it in the catalogue, and then automatically validates it by dry-run restore.
 * A backup that cannot be restored is worse than no backup, so validation is on
 * by default and its result is stored on the record.
 */
export class BackupService {
  private readonly events: BackupEvents;
  private readonly audit: BackupAudit;
  private readonly metrics: BackupMetrics;
  private readonly tracing: BackupTracing;
  private readonly systemVersion: string;
  private readonly restoreService: RestoreService;

  constructor(private readonly deps: BackupServiceDeps) {
    this.events = deps.events ?? new BackupEvents();
    this.audit = deps.audit ?? loggerBackupAudit();
    this.metrics = deps.metrics ?? new BackupMetrics();
    this.tracing = deps.tracing ?? new BackupTracing();
    this.systemVersion = deps.systemVersion ?? '0.1.0';
    this.restoreService = new RestoreService({
      sources: deps.sources,
      repository: deps.repository,
      archives: deps.archives,
      systemVersion: this.systemVersion,
      events: this.events,
      audit: this.audit,
      metrics: this.metrics,
      tracing: this.tracing,
    });
  }

  get restore(): RestoreService {
    return this.restoreService;
  }

  async backup(req: BackupRequest = {}): Promise<BackupRecord> {
    return this.tracing.span('backup', () => this.execute(req));
  }

  private async execute(req: BackupRequest): Promise<BackupRecord> {
    const tenantId = req.tenantId ?? 'platform';
    const scope: 'tenant' | 'platform' = req.tenantId ? 'tenant' : 'platform';
    const backupId = randomUUID();
    const createdAt = new Date().toISOString();
    const ctx: BackupContext = { tenantId, scope };
    this.audit.record('backup.started', { backupId, tenantId, kind: req.kind ?? 'full' });

    try {
      // Incremental needs a parent; without one it degrades to a full backup.
      let kind: BackupKind = req.kind ?? 'full';
      let parentManifest: BackupManifest | undefined;
      let parentId: string | null = null;
      if (kind === 'incremental') {
        const parent = await this.deps.repository.latest(tenantId);
        if (parent) {
          parentManifest = parent.manifest;
          parentId = parent.id;
        } else {
          kind = 'full';
        }
      }

      const entries: RawEntry[] = [];
      for (const source of this.deps.sources) entries.push({ name: source.name, bytes: await source.export(ctx) });

      const built = buildArchive({
        manifestBase: { backupId, kind, parentId, tenant: { id: tenantId, scope }, systemVersion: this.systemVersion, createdAt },
        entries,
        ...(req.passphrase !== undefined ? { passphrase: req.passphrase } : {}),
        ...(parentManifest ? { parentManifest } : {}),
      });

      await this.deps.archives.put(backupId, built.bytes);
      let record: BackupRecord = {
        id: backupId,
        tenantId,
        kind,
        parentId,
        systemVersion: this.systemVersion,
        createdAt,
        checksum: built.checksum,
        sizeBytes: built.bytes.length,
        encrypted: req.passphrase !== undefined,
        manifest: built.manifest,
        restoreValidated: false,
        validationSummary: null,
      };
      await this.deps.repository.save(record);
      await this.events.created(record);
      this.metrics.completed(record.sizeBytes);
      this.audit.record('backup.completed', { backupId, tenantId, kind, sizeBytes: record.sizeBytes });

      if (req.validate !== false) {
        const report = await this.restoreService.validate(record, req.passphrase);
        const summary = report.ok
          ? 'restore validation passed'
          : `restore validation FAILED: ${report.errors.join('; ') || 'unknown'}`;
        await this.deps.repository.markValidated(backupId, report.ok, summary);
        record = { ...record, restoreValidated: report.ok, validationSummary: summary };
      }
      return record;
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      this.metrics.failed();
      this.audit.record('backup.failed', { backupId, tenantId, reason });
      await this.events.failed(tenantId, backupId, reason);
      throw e;
    }
  }
}
