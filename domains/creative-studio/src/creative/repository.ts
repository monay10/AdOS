import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { CreativeSet, type CreativeSetId, type CreativeSetProps } from './creative-set.js';

/** Creative Set repository port. Adds tenant-scoped, mission-filtered listing. */
export interface CreativeSetRepository extends Repository<CreativeSet, CreativeSetId> {
  list(missionId?: string): Promise<CreativeSet[]>;
}

interface Row {
  id: string;
  props: CreativeSetProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryCreativeSetRepository implements CreativeSetRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: CreativeSetId): Promise<Result<CreativeSet | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(CreativeSet.restore(row.id, row.props));
  }

  async save(aggregate: CreativeSet): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: CreativeSetId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: CreativeSetId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(missionId?: string): Promise<CreativeSet[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (missionId === undefined || r.props.missionId === missionId))
      .map((r) => CreativeSet.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
