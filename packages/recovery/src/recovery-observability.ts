import { telemetry, type Telemetry } from '@ados/observability';

export type RecoveryAuditEvent = 'recovery.started' | 'recovery.step' | 'recovery.completed' | 'recovery.failed';

export interface RecoveryAuditDetail {
  readonly step?: string;
  readonly ok?: boolean;
  readonly rtoMs?: number;
  readonly rpoMs?: number | null;
  readonly reason?: string;
}

export interface RecoveryAudit {
  record(event: RecoveryAuditEvent, detail: RecoveryAuditDetail): void;
}

export function loggerRecoveryAudit(tele: Telemetry = telemetry('recovery')): RecoveryAudit {
  return {
    record(event, detail) {
      tele.logger.info({ recoveryEvent: event, ...detail }, 'recovery audit');
    },
  };
}

export class RecoveryMetrics {
  constructor(private readonly tele: Telemetry = telemetry('recovery')) {}
  step(ok: boolean): void {
    this.tele.count(ok ? 'step_ok' : 'step_failed');
  }
  completed(recovered: boolean, rtoMs: number): void {
    this.tele.count(recovered ? 'recovered' : 'recovery_failed');
    this.tele.observe('rto_ms', rtoMs);
  }
  rpo(rpoMs: number): void {
    this.tele.observe('rpo_ms', rpoMs);
  }
}

export class RecoveryTracing {
  constructor(private readonly tele: Telemetry = telemetry('recovery')) {}
  span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return this.tele.span(name, () => fn());
  }
}
