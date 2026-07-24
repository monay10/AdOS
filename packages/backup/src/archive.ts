import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { BACKUP_FORMAT_VERSION, type BackupManifest, type ManifestEntry } from './manifest.js';

/** A raw source payload to be written into an archive. */
export interface RawEntry {
  readonly name: string;
  readonly bytes: Buffer;
}

/** The serialized archive envelope (this is what gets stored as the backup file). */
interface Envelope {
  manifest: BackupManifest;
  /** name -> base64 of processed (gzip [+ aes-gcm]) bytes. Absent for inherited entries. */
  data: Record<string, string>;
}

export function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

function deriveKey(passphrase: string, saltHex: string): Buffer {
  return scryptSync(passphrase, Buffer.from(saltHex, 'hex'), 32);
}

export interface BuildArchiveOptions {
  readonly manifestBase: Omit<BackupManifest, 'formatVersion' | 'entries' | 'salt'>;
  readonly entries: RawEntry[];
  /** When set, every stored entry is AES-256-GCM encrypted (key derived via scrypt). */
  readonly passphrase?: string;
  /** For incremental backups: the parent manifest to diff against. */
  readonly parentManifest?: BackupManifest;
}

export interface BuiltArchive {
  readonly bytes: Buffer;
  readonly manifest: BackupManifest;
  readonly checksum: string;
}

/** Build an archive: compress (+ optionally encrypt) each entry, diff against a
 * parent for incrementals, and produce the manifest + final bytes + checksum. */
export function buildArchive(opts: BuildArchiveOptions): BuiltArchive {
  const encrypt = opts.passphrase !== undefined;
  const salt = encrypt ? randomBytes(16).toString('hex') : undefined;
  const key = encrypt ? deriveKey(opts.passphrase as string, salt as string) : undefined;
  const parentByName = new Map((opts.parentManifest?.entries ?? []).map((e) => [e.name, e]));

  const manifestEntries: ManifestEntry[] = [];
  const data: Record<string, string> = {};

  for (const entry of opts.entries) {
    const rawSha = sha256(entry.bytes);
    const parent = parentByName.get(entry.name);
    if (opts.parentManifest && parent && parent.sha256 === rawSha) {
      // Unchanged — inherit from the ancestor, store no bytes.
      manifestEntries.push({
        name: entry.name,
        sha256: rawSha,
        rawSize: entry.bytes.length,
        storedSize: 0,
        compressed: false,
        encrypted: false,
        inheritedFrom: parent.inheritedFrom ?? opts.parentManifest.backupId,
      });
      continue;
    }
    const compressed = gzipSync(entry.bytes);
    let stored = compressed;
    let iv: string | undefined;
    let authTag: string | undefined;
    if (encrypt) {
      const ivBuf = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key as Buffer, ivBuf);
      stored = Buffer.concat([cipher.update(compressed), cipher.final()]);
      iv = ivBuf.toString('hex');
      authTag = cipher.getAuthTag().toString('hex');
    }
    data[entry.name] = stored.toString('base64');
    manifestEntries.push({
      name: entry.name,
      sha256: rawSha,
      rawSize: entry.bytes.length,
      storedSize: stored.length,
      compressed: true,
      encrypted: encrypt,
      ...(iv ? { iv } : {}),
      ...(authTag ? { authTag } : {}),
    });
  }

  const manifest: BackupManifest = {
    ...opts.manifestBase,
    formatVersion: BACKUP_FORMAT_VERSION,
    entries: manifestEntries,
    ...(salt ? { salt } : {}),
  };
  const bytes = Buffer.from(JSON.stringify({ manifest, data } satisfies Envelope), 'utf8');
  return { bytes, manifest, checksum: sha256(bytes) };
}

export function parseArchive(bytes: Buffer): { manifest: BackupManifest; data: Record<string, string> } {
  const env = JSON.parse(bytes.toString('utf8')) as Envelope;
  return { manifest: env.manifest, data: env.data };
}

/**
 * Recover one entry's raw bytes: decrypt, decompress, and verify the checksum.
 * Throws if the entry's bytes are absent (inherited — resolve via the parent
 * chain) or if the recovered checksum does not match the manifest.
 */
export function readEntry(
  entry: ManifestEntry,
  data: Record<string, string>,
  manifest: BackupManifest,
  passphrase?: string,
): Buffer {
  if (entry.inheritedFrom) throw new Error(`Entry "${entry.name}" is inherited from ${entry.inheritedFrom}; resolve via the parent chain.`);
  const encoded = data[entry.name];
  if (encoded === undefined) throw new Error(`Missing bytes for entry "${entry.name}".`);
  let buf = Buffer.from(encoded, 'base64');
  if (entry.encrypted) {
    if (!manifest.salt || !entry.iv || !entry.authTag) throw new Error(`Entry "${entry.name}" is encrypted but crypto params are missing.`);
    if (passphrase === undefined) throw new Error(`Entry "${entry.name}" is encrypted; a passphrase is required to restore.`);
    const key = deriveKey(passphrase, manifest.salt);
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(entry.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(entry.authTag, 'hex'));
    buf = Buffer.concat([decipher.update(buf), decipher.final()]);
  }
  if (entry.compressed) buf = gunzipSync(buf);
  const actual = sha256(buf);
  if (actual !== entry.sha256) throw new Error(`Checksum mismatch for entry "${entry.name}".`);
  return buf;
}
