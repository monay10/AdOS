import { randomUUID } from 'node:crypto';
import type { DomainEventEnvelope } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import type { BackupRecord, RestoreReport } from './manifest.js';

export const BackupEventName = {
  Created: 'backup.created.v1',
  RestoreValidated: 'backup.restore_validated.v1',
  Restored: 'backup.restored.v1',
  Failed: 'backup.failed.v1',
} as const;

export type BackupEventName = (typeof BackupEventName)[keyof typeof BackupEventName];

function envelope(eventName: string, tenantId: string, aggregateId: string, payload: Record<string, unknown>): DomainEventEnvelope {
  return {
    eventName,
    aggregateId,
    payload,
    metadata: {
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      tenantId,
      correlationId: randomUUID(),
      causationId: undefined,
      actor: undefined,
    },
  };
}

/** Publishes backup/restore events onto the existing EventBus. No-op without a bus. */
export class BackupEvents {
  constructor(private readonly bus?: EventBus) {}

  created(record: BackupRecord): Promise<void> {
    if (!this.bus) return Promise.resolve();
    return this.bus.publish(
      envelope(BackupEventName.Created, record.tenantId, record.id, {
        backupId: record.id, kind: record.kind, checksum: record.checksum, sizeBytes: record.sizeBytes, encrypted: record.encrypted,
      }),
    );
  }
  restoreValidated(record: BackupRecord, report: RestoreReport): Promise<void> {
    if (!this.bus) return Promise.resolve();
    return this.bus.publish(
      envelope(BackupEventName.RestoreValidated, record.tenantId, record.id, { backupId: record.id, ok: report.ok, checks: report.checks }),
    );
  }
  restored(record: BackupRecord, report: RestoreReport): Promise<void> {
    if (!this.bus) return Promise.resolve();
    return this.bus.publish(
      envelope(BackupEventName.Restored, record.tenantId, record.id, { backupId: record.id, ok: report.ok, restored: report.restored }),
    );
  }
  failed(tenantId: string, backupId: string, reason: string): Promise<void> {
    if (!this.bus) return Promise.resolve();
    return this.bus.publish(envelope(BackupEventName.Failed, tenantId, backupId, { backupId, reason }));
  }
}
