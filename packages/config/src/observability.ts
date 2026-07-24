import { telemetry, type Telemetry } from '@ados/observability';
import type { StartupReport } from './validator.js';

export type ConfigAuditEvent = 'loaded' | 'invalid' | 'reloaded' | 'reload_rejected';

export interface ConfigAudit {
  record(event: ConfigAuditEvent, detail: { profile?: string; sources?: string[]; errors?: string[] }): void;
}

export function loggerConfigAudit(tele: Telemetry = telemetry('config')): ConfigAudit {
  return {
    record(event, detail) {
      tele.logger.info({ configEvent: event, ...detail }, 'config audit');
    },
  };
}

/** Metrics for configuration load/validation (Prometheus-safe names). */
export class ConfigurationMetrics {
  constructor(private readonly tele: Telemetry = telemetry('config')) {}
  loaded(report: StartupReport): void {
    this.tele.count(report.status === 'valid' ? 'loaded_ok' : 'loaded_invalid');
    this.tele.observe('configured_subsystems', report.subsystems.filter((s) => s.configured).length);
  }
  reloaded(): void {
    this.tele.count('reloaded');
  }
  reloadRejected(): void {
    this.tele.count('reload_rejected');
  }
}

export class ConfigurationTracing {
  constructor(private readonly tele: Telemetry = telemetry('config')) {}
  span<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return this.tele.span(name, () => fn());
  }
}
