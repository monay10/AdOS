/**
 * The complete, tenant-scoped metadata record for one stored object version.
 *
 * This is the ONLY place object metadata lives — the blob store holds bytes,
 * this record (persisted via {@link StorageRepository}) holds the facts about
 * them. Business data never goes into the storage layer; only these descriptors.
 */
export interface StoredObject {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly objectId: string;
  readonly originalName: string;
  readonly storedName: string;
  readonly mimeType: string;
  readonly extension: string;
  readonly size: number;
  readonly sha256: string;
  readonly createdAt: string; // ISO-8601
  readonly createdBy: string;
  readonly version: number;
  /** Soft-delete tombstone; null while the object is live. */
  readonly deletedAt: string | null;
}

export type StorageErrorCode =
  | 'not_found'
  | 'unsupported_mime'
  | 'too_large'
  | 'infected'
  | 'invalid_key'
  | 'adapter_unavailable'
  | 'conflict';

/** A typed failure at the storage boundary. */
export class StorageError extends Error {
  constructor(
    readonly code: StorageErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
