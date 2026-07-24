import { NotFoundError, type AppError, type Result, err, ok } from '@ados/kernel';
import type { DomainEvent } from '@ados/kernel';
import type { EventBus } from '@ados/event-bus';
import { telemetry, type Telemetry } from '@ados/observability';
import { PerformanceReport, type PerformanceReportId, type ReportMetric } from './report.js';
import type { PerformanceReportRepository } from './repository.js';

export interface GenerateReportInput {
  tenantId: string;
  clientId: string;
  projectId?: string;
  title: string;
  period: string;
  metrics: ReportMetric[];
  summary: string;
  generatedBy: string;
  generatedAt: string;
}

/**
 * Performance Report Application Service — persists a client performance report
 * snapshot and publishes its generation event. The metrics are assembled by the
 * caller (which reads across missions/campaigns/analytics); this service only
 * validates, saves and announces. Traced, logged and metered.
 */
export class PerformanceReportService {
  private readonly tele: Telemetry = telemetry('agency-os.performance-report');

  constructor(private readonly repo: PerformanceReportRepository, private readonly bus: EventBus) {}

  async generate(input: GenerateReportInput): Promise<Result<PerformanceReport, AppError>> {
    return this.tele.span('generate', async () => {
      const created = PerformanceReport.generate(input);
      if (created.isErr) return created;
      const saved = await this.repo.save(created.value);
      if (saved.isErr) return err(saved.error);
      await this.publish(created.value);
      this.tele.count('generated');
      this.tele.logger.info(
        { reportId: created.value.id.toString(), clientId: input.clientId },
        'performance report generated',
      );
      return ok(created.value);
    });
  }

  async list(clientId?: string): Promise<PerformanceReport[]> {
    return this.tele.span('list', async () => this.repo.list(clientId));
  }

  async get(id: PerformanceReportId): Promise<Result<PerformanceReport, AppError>> {
    const found = await this.repo.findById(id);
    if (found.isErr) return err(found.error);
    if (!found.value) {
      return err(new NotFoundError(`Performance report "${id.toString()}" not found`, { details: { id: id.toString() } }));
    }
    return ok(found.value);
  }

  private async publish(report: PerformanceReport): Promise<void> {
    const events: DomainEvent[] = report.pullDomainEvents();
    if (events.length > 0) await this.bus.publish(events.map((e) => e.toEnvelope()));
  }
}
