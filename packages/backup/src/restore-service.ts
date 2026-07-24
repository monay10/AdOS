import { parseArchive, readEntry, sha256 } from './archive.js';
import { BACKUP_FORMAT_VERSION, type BackupManifest, type BackupRecord, type ManifestEntry, type RestoreCheck, type RestoreReport } from './manifest.js';
import type { BackupSource, BackupContext } from './backup-source.js';
import type { BackupRepository } from './backup-repository.js';
import type { BackupArchiveStore } from './backup-archive-store.js';
import { loggerBackupAudit, type BackupAudit, type BackupMetrics, type BackupTracing } from './backup-observability.js';
import type { BackupEvents } from './backup-events.js';

export interface RestoreServiceDeps {
  readonly sources: BackupSource[];
  readonly repository: BackupRepository;
  readonly archives: BackupArchiveStore;
  readonly systemVersion?: string;
  readonly events?: BackupEvents;
  readonly audit?: BackupAudit;
  readonly metrics?: BackupMetrics;
  readonly tracing?: BackupTracing;
}

export interface RestoreRequest {
  readonly backupId: string;
  /** Verify only, apply nothing (also used for post-backup auto-validation). */
  readonly dryRun?: boolean;
  readonly passphrase?: string;
  /** Restrict restore to these source names (default: all). */
  readonly only?: string[];
}

/**
 * RestoreService — verifies and (optionally) applies a backup. Verification is
 * exhaustive: archive integrity, format/system compatibility, per-entry
 * checksums, no missing files, and per-source consistency. Incremental backups
 * are resolved up the parent chain. A dry run returns the full report without
 * touching any store — the same report backs the automatic post-backup validation.
 */
export class RestoreService {
  private readonly systemVersion: string;
  private readonly audit: BackupAudit;

  constructor(private readonly deps: RestoreServiceDeps) {
    this.systemVersion = deps.systemVersion ?? '0.1.0';
    this.audit = deps.audit ?? loggerBackupAudit();
  }

  /** Post-backup validation: a dry-run restore whose report is stored on the record. */
  validate(record: BackupRecord, passphrase?: string): Promise<RestoreReport> {
    return this.restore({ backupId: record.id, dryRun: true, ...(passphrase !== undefined ? { passphrase } : {}) });
  }

  async restore(req: RestoreRequest): Promise<RestoreReport> {
    const run = (): Promise<RestoreReport> => this.execute(req);
    return this.deps.tracing ? this.deps.tracing.span('restore', run) : run();
  }

  private async execute(req: RestoreRequest): Promise<RestoreReport> {
    const generatedAt = new Date().toISOString();
    const checks: Record<RestoreCheck, boolean> = { integrity: false, compatibility: false, checksums: true, missing_files: true, db_consistency: true };
    const errors: string[] = [];
    const restored: string[] = [];

    const record = await this.deps.repository.findById(req.backupId);
    if (!record) {
      errors.push(`Backup "${req.backupId}" not found.`);
      return { backupId: req.backupId, dryRun: req.dryRun ?? false, ok: false, checks, restored, errors, generatedAt };
    }

    const archiveBytes = await this.deps.archives.get(record.id);
    checks.integrity = sha256(archiveBytes) === record.checksum;
    if (!checks.integrity) errors.push('Archive checksum does not match the catalogue (integrity failure).');

    const { manifest, data } = parseArchive(archiveBytes);
    checks.compatibility = manifest.formatVersion <= BACKUP_FORMAT_VERSION && sameMajor(manifest.systemVersion, this.systemVersion);
    if (!checks.compatibility) errors.push(`Incompatible backup (format v${manifest.formatVersion}, system ${manifest.systemVersion}).`);

    const ctx: BackupContext = { tenantId: record.tenantId, scope: manifest.tenant.scope };
    const resolved: { entry: ManifestEntry; bytes: Buffer; source: BackupSource | undefined }[] = [];

    for (const entry of manifest.entries) {
      try {
        const bytes = await this.resolveBytes(entry.name, manifest, data, req.passphrase);
        const source = this.deps.sources.find((s) => s.name === entry.name);
        if (source?.verify && !(await source.verify(bytes))) {
          checks.db_consistency = false;
          errors.push(`Consistency check failed for "${entry.name}".`);
        }
        resolved.push({ entry, bytes, source });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/missing|not found|inherited/i.test(msg)) checks.missing_files = false;
        else checks.checksums = false;
        errors.push(`${entry.name}: ${msg}`);
      }
    }

    const ok = checks.integrity && checks.compatibility && checks.checksums && checks.missing_files && checks.db_consistency;

    if (!req.dryRun && ok) {
      this.audit.record('restore.started', { backupId: record.id, tenantId: record.tenantId });
      for (const { entry, bytes, source } of resolved) {
        if (req.only && !req.only.includes(entry.name)) continue;
        if (!source) {
          errors.push(`No source registered to restore "${entry.name}"; skipped.`);
          continue;
        }
        await source.import(ctx, bytes);
        restored.push(entry.name);
      }
    }

    const report: RestoreReport = { backupId: record.id, dryRun: req.dryRun ?? false, ok, checks, restored, errors, generatedAt };
    if (req.dryRun) {
      this.audit.record('restore.validated', { backupId: record.id, tenantId: record.tenantId, dryRun: true, reason: ok ? 'ok' : errors[0] ?? 'unknown' });
      this.deps.metrics?.restoreValidated(ok);
      await this.deps.events?.restoreValidated(record, report);
    } else if (ok) {
      this.audit.record('restore.completed', { backupId: record.id, tenantId: record.tenantId });
      this.deps.metrics?.restoreCompleted();
      await this.deps.events?.restored(record, report);
    } else {
      this.audit.record('restore.failed', { backupId: record.id, tenantId: record.tenantId, reason: errors[0] ?? 'unknown' });
      this.deps.metrics?.restoreFailed();
    }
    return report;
  }

  /** Recover an entry's bytes, walking the parent chain for inherited entries. */
  private async resolveBytes(name: string, startManifest: BackupManifest, startData: Record<string, string>, passphrase?: string): Promise<Buffer> {
    let manifest = startManifest;
    let data = startData;
    for (let hop = 0; hop < 64; hop++) {
      const entry = manifest.entries.find((e) => e.name === name);
      if (!entry) throw new Error(`Missing entry "${name}" in the archive chain.`);
      if (!entry.inheritedFrom) return readEntry(entry, data, manifest, passphrase);
      const ancestor = await this.deps.archives.get(entry.inheritedFrom);
      ({ manifest, data } = parseArchive(ancestor));
    }
    throw new Error(`Parent chain too deep resolving "${name}".`);
  }
}

/** Compatible if the major version matches (breaking changes bump the major). */
function sameMajor(a: string, b: string): boolean {
  return (a.split('.')[0] ?? '') === (b.split('.')[0] ?? '');
}
