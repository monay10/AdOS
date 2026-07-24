import { telemetry, type Telemetry } from '@ados/observability';

export type BackupAuditEvent =
  | 'backup.started'
  | 'backup.completed'
  | 'backup.failed'
  | 'restore.validated'
  | 'restore.started'
  | 'restore.completed'
  | 'restore.failed';

export interface BackupAuditDetail {
  readonly backupId?: string;
  readonly tenantId?: string;
  readonly kind?: string;
  readonly sizeBytes?: number;
  readonly dryRun?: boolean;
  readonly reason?: string;
}

export interface BackupAudit {
  record(event: BackupAuditEvent, detail: BackupAuditDetail): void;
}

export function loggerBackupAudit(tele: Telemetry = telemetry('backup')): BackupAudit {
  return {
    record(event, detail) {
      tele.logger.info({ backupEvent: event, ...detail }, 'backup audit');
    },
  };
}

/** Named counters + histograms for backup/restore (Prometheus-safe names). */
export class BackupMetrics {
  constructor(private readonly tele: Telemetry = telemetry('backup')) {}
  completed(sizeBytes: number): void {
    this.tele.count('backup_completed');
    this.tele.observe('backup_size_bytes', sizeBytes);
  }
  failed(): void {
    this.tele.count('backup_failed');
  }
  restoreValidated(ok: boolean): void {
    this.tele.count(ok ? 'restore_validated_ok' : 'restore_validated_fail');
  }
  restoreCompleted(): void {
    this.tele.count('restore_completed');
  }
  restoreFailed(): void {
    this.tele.count('restore_failed');
  }
}

export class BackupTracing {
  constructor(private readonly tele: Telemetry = telemetry('backup')) {}
  span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return this.tele.span(name, () => fn());
  }
}
