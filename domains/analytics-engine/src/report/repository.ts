import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { CampaignReport, type CampaignReportId, type CampaignReportProps } from './campaign-report.js';

/** Campaign Report repository port. Adds tenant-scoped, mission-filtered listing. */
export interface CampaignReportRepository extends Repository<CampaignReport, CampaignReportId> {
  list(missionId?: string): Promise<CampaignReport[]>;
}

interface Row {
  id: string;
  props: CampaignReportProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryCampaignReportRepository implements CampaignReportRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: CampaignReportId): Promise<Result<CampaignReport | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(CampaignReport.restore(row.id, row.props));
  }

  async save(aggregate: CampaignReport): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: CampaignReportId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: CampaignReportId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(missionId?: string): Promise<CampaignReport[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (missionId === undefined || r.props.missionId === missionId))
      .map((r) => CampaignReport.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
