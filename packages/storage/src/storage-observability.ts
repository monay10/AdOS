import { telemetry, type Telemetry } from '@ados/observability';
import type { StoragePort } from './storage.port.js';
import type { StorageRepository } from './storage-repository.js';

/** An auditable storage action. */
export type StorageAuditAction =
  | 'upload'
  | 'version'
  | 'download'
  | 'copy'
  | 'move'
  | 'rename'
  | 'soft_delete'
  | 'purge'
  | 'scan_flagged'
  | 'cleanup';

export interface StorageAuditDetail {
  readonly tenantId?: string;
  readonly workspaceId?: string;
  readonly objectId?: string;
  readonly actor?: string;
  readonly version?: number;
  readonly size?: number;
  readonly reason?: string;
}

/** Sink for tamper-evident storage audit records. */
export interface StorageAudit {
  record(action: StorageAuditAction, detail: StorageAuditDetail): void;
}

/** Default audit sink — one structured log line per action. */
export function loggerStorageAudit(tele: Telemetry = telemetry('storage')): StorageAudit {
  return {
    record(action, detail) {
      tele.logger.info({ storageAction: action, ...detail }, 'storage audit');
    },
  };
}

/** Named counters + histograms for storage operations (Prometheus-safe names). */
export class StorageMetrics {
  constructor(private readonly tele: Telemetry = telemetry('storage')) {}

  uploaded(bytes: number): void {
    this.tele.count('object_uploaded');
    this.tele.observe('object_bytes', bytes);
  }
  downloaded(bytes: number): void {
    this.tele.count('object_downloaded');
    this.tele.observe('object_download_bytes', bytes);
  }
  action(name: 'copy' | 'move' | 'rename' | 'version' | 'soft_delete' | 'purge' | 'cleanup'): void {
    this.tele.count(`object_${name}`);
  }
  flagged(): void {
    this.tele.count('object_scan_flagged');
  }
  error(operation: string): void {
    this.tele.count(`error_${operation}`);
  }
}

/** Thin wrapper over the shared tracer so every storage op runs inside a span. */
export class StorageTracing {
  constructor(private readonly tele: Telemetry = telemetry('storage')) {}

  span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return this.tele.span(name, () => fn());
  }
}

export interface StorageHealthReport {
  readonly healthy: boolean;
  readonly adapter: 'up' | 'down';
  readonly objects: number;
  readonly checkedAt: string;
  readonly error?: string;
}

/** Liveness probe: round-trips the blob adapter and the metadata repository. */
export class StorageHealthCheck {
  constructor(
    private readonly adapter: StoragePort,
    private readonly repository: StorageRepository,
  ) {}

  async check(): Promise<StorageHealthReport> {
    const checkedAt = new Date().toISOString();
    try {
      await this.adapter.ping();
      const objects = await this.repository.count();
      return { healthy: true, adapter: 'up', objects, checkedAt };
    } catch (e) {
      return { healthy: false, adapter: 'down', objects: 0, checkedAt, error: e instanceof Error ? e.message : String(e) };
    }
  }
}
