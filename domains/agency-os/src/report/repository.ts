import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { PerformanceReport, type PerformanceReportId, type PerformanceReportProps } from './report.js';

/**
 * Performance Report repository port. Adds tenant-scoped listing, optionally
 * filtered by client, to the kernel Repository contract.
 */
export interface PerformanceReportRepository extends Repository<PerformanceReport, PerformanceReportId> {
  list(clientId?: string): Promise<PerformanceReport[]>;
}

interface Row {
  id: string;
  props: PerformanceReportProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryPerformanceReportRepository implements PerformanceReportRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: PerformanceReportId): Promise<Result<PerformanceReport | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(PerformanceReport.restore(row.id, row.props));
  }

  async save(aggregate: PerformanceReport): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: PerformanceReportId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: PerformanceReportId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(clientId?: string): Promise<PerformanceReport[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (clientId === undefined || r.props.clientId === clientId))
      .map((r) => PerformanceReport.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
