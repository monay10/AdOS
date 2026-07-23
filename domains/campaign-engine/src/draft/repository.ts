import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { CampaignDraft, type CampaignDraftId, type CampaignDraftProps } from './campaign-draft.js';

/** Campaign Draft repository port. Adds tenant-scoped, mission-filtered listing. */
export interface CampaignDraftRepository extends Repository<CampaignDraft, CampaignDraftId> {
  list(missionId?: string): Promise<CampaignDraft[]>;
}

interface Row {
  id: string;
  props: CampaignDraftProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryCampaignDraftRepository implements CampaignDraftRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: CampaignDraftId): Promise<Result<CampaignDraft | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(CampaignDraft.restore(row.id, row.props));
  }

  async save(aggregate: CampaignDraft): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: CampaignDraftId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: CampaignDraftId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(missionId?: string): Promise<CampaignDraft[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (missionId === undefined || r.props.missionId === missionId))
      .map((r) => CampaignDraft.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
