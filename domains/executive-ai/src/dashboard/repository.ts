import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { ExecutiveReport, type ExecutiveReportId, type ExecutiveReportProps } from './executive-report.js';

/** Executive Report repository port. Adds tenant-scoped, mission-filtered listing. */
export interface ExecutiveReportRepository extends Repository<ExecutiveReport, ExecutiveReportId> {
  list(missionId?: string): Promise<ExecutiveReport[]>;
}

interface Row {
  id: string;
  props: ExecutiveReportProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryExecutiveReportRepository implements ExecutiveReportRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: ExecutiveReportId): Promise<Result<ExecutiveReport | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(ExecutiveReport.restore(row.id, row.props));
  }

  async save(aggregate: ExecutiveReport): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: ExecutiveReportId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: ExecutiveReportId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(missionId?: string): Promise<ExecutiveReport[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (missionId === undefined || r.props.missionId === missionId))
      .map((r) => ExecutiveReport.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
