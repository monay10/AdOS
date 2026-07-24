import { randomUUID } from 'node:crypto';
import type { DomainEventEnvelope } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { TenantContext } from '@ados/tenancy';
import type { StoredObject } from './object.js';

/** Stable, versioned storage event names. */
export const StorageEventName = {
  Uploaded: 'storage.object.uploaded.v1',
  VersionAdded: 'storage.object.version_added.v1',
  Downloaded: 'storage.object.downloaded.v1',
  Copied: 'storage.object.copied.v1',
  Moved: 'storage.object.moved.v1',
  Renamed: 'storage.object.renamed.v1',
  SoftDeleted: 'storage.object.deleted.v1',
  Purged: 'storage.object.purged.v1',
  ScanFlagged: 'storage.object.scan_flagged.v1',
} as const;

export type StorageEventName = (typeof StorageEventName)[keyof typeof StorageEventName];

/** Build a tenant-scoped, correlated envelope from the ambient request context. */
function envelope(eventName: string, aggregateId: string, payload: Record<string, unknown>): DomainEventEnvelope {
  const ctx = TenantContext.current();
  return {
    eventName,
    aggregateId,
    payload,
    metadata: {
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      tenantId: ctx?.tenantId ?? (typeof payload['tenantId'] === 'string' ? payload['tenantId'] : 'public'),
      correlationId: ctx?.correlationId ?? randomUUID(),
      causationId: undefined,
      actor: ctx?.actor,
    },
  };
}

/**
 * Publishes storage domain events onto the existing EventBus so other contexts
 * (audit, indexing, cleanup) can react. Falls back to a no-op when no bus is
 * wired — events are optional integration signals, not a correctness dependency.
 */
export class StorageEvents {
  constructor(private readonly bus?: EventBus) {}

  private async emit(eventName: string, object: StoredObject, extra: Record<string, unknown> = {}): Promise<void> {
    if (!this.bus) return;
    await this.bus.publish(
      envelope(eventName, object.objectId, {
        objectId: object.objectId,
        tenantId: object.tenantId,
        workspaceId: object.workspaceId,
        version: object.version,
        mimeType: object.mimeType,
        size: object.size,
        sha256: object.sha256,
        ...extra,
      }),
    );
  }

  uploaded(object: StoredObject): Promise<void> {
    return this.emit(StorageEventName.Uploaded, object);
  }
  versionAdded(object: StoredObject): Promise<void> {
    return this.emit(StorageEventName.VersionAdded, object);
  }
  downloaded(object: StoredObject): Promise<void> {
    return this.emit(StorageEventName.Downloaded, object);
  }
  copied(source: StoredObject, copy: StoredObject): Promise<void> {
    return this.emit(StorageEventName.Copied, copy, { sourceObjectId: source.objectId });
  }
  moved(object: StoredObject, fromWorkspaceId: string): Promise<void> {
    return this.emit(StorageEventName.Moved, object, { fromWorkspaceId });
  }
  renamed(object: StoredObject, previousName: string): Promise<void> {
    return this.emit(StorageEventName.Renamed, object, { previousName });
  }
  softDeleted(object: StoredObject): Promise<void> {
    return this.emit(StorageEventName.SoftDeleted, object);
  }
  purged(object: StoredObject): Promise<void> {
    return this.emit(StorageEventName.Purged, object);
  }
  scanFlagged(object: StoredObject, signature: string | undefined): Promise<void> {
    return this.emit(StorageEventName.ScanFlagged, object, { signature: signature ?? 'unknown' });
  }
}
