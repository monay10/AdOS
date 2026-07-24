import { randomUUID } from 'node:crypto';
import {
  AggregateRoot,
  DomainEvent,
  Guard,
  Identifier,
  type Result,
  ValidationError,
  err,
  ok,
} from '@ados/kernel';

/** Strongly-typed Performance Report identifier. */
export class PerformanceReportId extends Identifier {
  static of(value?: string): PerformanceReportId {
    return new PerformanceReportId(value ?? randomUUID());
  }
}

/** One line of a report snapshot — a pre-formatted label/value pair. */
export interface ReportMetric {
  label: string;
  value: string;
}

export interface PerformanceReportProps {
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

// ── Domain events ─────────────────────────────────────────────────────────────
export class PerformanceReportGenerated extends DomainEvent<{
  clientId: string;
  title: string;
  tenantId: string;
  projectId?: string;
}> {
  readonly eventName = 'performance.report.generated.v1';
}

/**
 * Performance Report — an immutable, timestamped snapshot of how a client's work
 * performed: a set of computed metrics plus a summary, produced by aggregating
 * the client's missions, campaigns and results. It is a saved artifact (the
 * report you would show a client), never mutated after generation. The metrics
 * are assembled by the caller so this aggregate imports no other context.
 */
export class PerformanceReport extends AggregateRoot<PerformanceReportId> {
  private constructor(id: PerformanceReportId, private readonly props: PerformanceReportProps) {
    super(id);
  }

  static generate(input: {
    tenantId: string;
    clientId: string;
    projectId?: string;
    title: string;
    period: string;
    metrics: ReportMetric[];
    summary: string;
    generatedBy: string;
    generatedAt: string;
    id?: string;
  }): Result<PerformanceReport, ValidationError> {
    const check = Guard.all(
      Guard.againstEmptyString(input.tenantId, 'tenantId'),
      Guard.againstEmptyString(input.clientId, 'clientId'),
      Guard.againstEmptyString(input.title, 'title'),
      Guard.againstEmptyString(input.generatedBy, 'generatedBy'),
    );
    if (check.isErr) return err(check.error);

    const report = new PerformanceReport(PerformanceReportId.of(input.id), {
      tenantId: input.tenantId,
      clientId: input.clientId,
      ...(input.projectId ? { projectId: input.projectId } : {}),
      title: input.title.trim(),
      period: input.period.trim() || 'All time',
      metrics: input.metrics.map((m) => ({ ...m })),
      summary: input.summary.trim(),
      generatedBy: input.generatedBy,
      generatedAt: input.generatedAt,
    });
    report.addDomainEvent(
      new PerformanceReportGenerated(
        report.id.toString(),
        {
          clientId: input.clientId,
          title: report.props.title,
          tenantId: input.tenantId,
          ...(input.projectId ? { projectId: input.projectId } : {}),
        },
        { tenantId: input.tenantId },
      ),
    );
    return ok(report);
  }

  /** Rehydrate from persistence without emitting events. */
  static restore(id: string, props: PerformanceReportProps): PerformanceReport {
    return new PerformanceReport(PerformanceReportId.of(id), props);
  }

  get tenantId(): string {
    return this.props.tenantId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get projectId(): string | undefined {
    return this.props.projectId;
  }
  get title(): string {
    return this.props.title;
  }
  get period(): string {
    return this.props.period;
  }
  get metrics(): readonly ReportMetric[] {
    return this.props.metrics;
  }
  get summary(): string {
    return this.props.summary;
  }
  get generatedBy(): string {
    return this.props.generatedBy;
  }
  get generatedAt(): string {
    return this.props.generatedAt;
  }

  snapshot(): PerformanceReportProps {
    return { ...this.props, metrics: this.props.metrics.map((m) => ({ ...m })) };
  }
}
