import type { Readable } from 'node:stream';

/** Result of streaming an object into the blob store. */
export interface StoragePutResult {
  readonly size: number;
  readonly sha256: string;
}

/**
 * StoragePort — the blob adapter boundary (hexagonal port).
 *
 * Business modules NEVER touch the filesystem or an object-store client
 * directly; they go through the {@link StorageApplicationService}, which drives
 * exactly one of these adapters (local filesystem for dev, MinIO for
 * production). Everything is streaming: no adapter ever buffers a whole object
 * in memory, so a multi-GB upload costs a constant, small amount of RAM.
 */
export interface PutOptions {
  /** Abort the transfer (with a too_large error) once this many bytes stream past. */
  readonly maxBytes?: number;
}

export interface StoragePort {
  /**
   * Stream `body` to `key`, computing its size and SHA-256 in-flight. Parent
   * directories/buckets are created automatically. The write is atomic — a
   * failed transfer never leaves a partial object at `key`. When `maxBytes` is
   * given, an oversize object is rejected mid-stream and never fully persisted.
   */
  put(key: string, body: Readable, opts?: PutOptions): Promise<StoragePutResult>;
  /** Open `key` as a readable stream. Rejects with a not_found error if absent. */
  get(key: string): Promise<Readable>;
  exists(key: string): Promise<boolean>;
  /** Remove `key`. Idempotent — deleting an absent key is not an error. */
  delete(key: string): Promise<void>;
  /** Server-side copy of the bytes at `fromKey` to `toKey`. */
  copy(fromKey: string, toKey: string): Promise<void>;
  /** Physical keys under `prefix` (for cleanup and health probes). */
  list(prefix: string): Promise<string[]>;
  /** Cheap liveness round-trip; rejects if the backend is unreachable. */
  ping(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Extension hooks — PORTS ONLY. No implementation ships here; operators plug in
// their own (e.g. ClamAV, a thumbnailer service, a PDF rasteriser). The service
// invokes them only when one is injected.
// ---------------------------------------------------------------------------

export interface VirusScanResult {
  readonly clean: boolean;
  readonly signature?: string;
}

/** Hook: scan a stored object's bytes for malware before it is made available. */
export interface VirusScannerPort {
  scan(key: string, body: Readable): Promise<VirusScanResult>;
}

/** Hook: derive a raster thumbnail from an image stream (null if unsupported). */
export interface ThumbnailGeneratorPort {
  generate(source: Readable, mimeType: string): Promise<Readable | null>;
}

/** Hook: render a preview image for the first page of a PDF (null if unsupported). */
export interface PdfPreviewPort {
  render(source: Readable): Promise<Readable | null>;
}
