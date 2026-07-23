import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { MarketingBrief, type MarketingBriefId, type MarketingBriefProps } from './marketing-brief.js';

/** Marketing Brief repository port. Adds tenant-scoped, mission-filtered listing. */
export interface MarketingBriefRepository extends Repository<MarketingBrief, MarketingBriefId> {
  list(missionId?: string): Promise<MarketingBrief[]>;
}

interface Row {
  id: string;
  props: MarketingBriefProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryMarketingBriefRepository implements MarketingBriefRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: MarketingBriefId): Promise<Result<MarketingBrief | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(MarketingBrief.restore(row.id, row.props));
  }

  async save(aggregate: MarketingBrief): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: MarketingBriefId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: MarketingBriefId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(missionId?: string): Promise<MarketingBrief[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (missionId === undefined || r.props.missionId === missionId))
      .map((r) => MarketingBrief.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
