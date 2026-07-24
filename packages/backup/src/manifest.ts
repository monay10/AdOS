/** The on-disk format version of an AdOS backup archive. */
export const BACKUP_FORMAT_VERSION = 1;

export type BackupKind = 'full' | 'incremental';

/** One backed-up source inside an archive. */
export interface ManifestEntry {
  /** Logical source name, e.g. "postgres", "minio", "company_brain". */
  readonly name: string;
  /** SHA-256 of the raw (pre-compression) bytes — the integrity anchor. */
  readonly sha256: string;
  readonly rawSize: number;
  readonly storedSize: number;
  readonly compressed: boolean;
  readonly encrypted: boolean;
  /** AES-GCM iv/tag (hex) when this entry is encrypted. */
  readonly iv?: string;
  readonly authTag?: string;
  /** Set when an incremental backup inherits an unchanged entry from an ancestor
   * (no bytes stored here — restore resolves it up the parent chain). */
  readonly inheritedFrom?: string;
}

/** Everything needed to identify, verify and restore a backup. */
export interface BackupManifest {
  readonly formatVersion: number;
  readonly backupId: string;
  readonly kind: BackupKind;
  readonly parentId: string | null;
  /** Tenant scope: a specific tenant id, or "platform" for a whole-system backup. */
  readonly tenant: { readonly id: string; readonly scope: 'tenant' | 'platform' };
  readonly systemVersion: string;
  readonly createdAt: string; // ISO-8601 — also the point-in-time marker
  readonly entries: ManifestEntry[];
  /** scrypt salt (hex), present when any entry is encrypted. */
  readonly salt?: string;
}

/** The persisted record of a backup (metadata, not the bytes). */
export interface BackupRecord {
  readonly id: string;
  readonly tenantId: string; // the manifest tenant id ("platform" for system-wide)
  readonly kind: BackupKind;
  readonly parentId: string | null;
  readonly systemVersion: string;
  readonly createdAt: string;
  /** SHA-256 of the full archive bytes — verified on restore for integrity. */
  readonly checksum: string;
  readonly sizeBytes: number;
  readonly encrypted: boolean;
  readonly manifest: BackupManifest;
  /** Filled by the automatic post-backup restore validation. */
  readonly restoreValidated: boolean;
  readonly validationSummary: string | null;
}

export type RestoreCheck = 'integrity' | 'compatibility' | 'checksums' | 'missing_files' | 'db_consistency';

export interface RestoreReport {
  readonly backupId: string;
  readonly dryRun: boolean;
  readonly ok: boolean;
  readonly checks: Record<RestoreCheck, boolean>;
  readonly restored: string[];
  readonly errors: string[];
  readonly generatedAt: string;
}
