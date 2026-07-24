import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Asset, type AssetId, type AssetProps } from './asset.js';

/** Filters for a tenant-scoped asset listing. */
export interface AssetFilter {
  clientId?: string;
  brandId?: string;
  projectId?: string;
}

/**
 * Asset repository port. Adds a tenant-scoped listing, optionally narrowed by
 * client / brand / project, to the kernel Repository contract.
 */
export interface AssetRepository extends Repository<Asset, AssetId> {
  list(filter?: AssetFilter): Promise<Asset[]>;
}

interface Row {
  id: string;
  props: AssetProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryAssetRepository implements AssetRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: AssetId): Promise<Result<Asset | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Asset.restore(row.id, row.props));
  }

  async save(aggregate: Asset): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: AssetId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: AssetId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(filter: AssetFilter = {}): Promise<Asset[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter(
        (r) =>
          r.props.tenantId === tenant &&
          (filter.clientId === undefined || r.props.clientId === filter.clientId) &&
          (filter.brandId === undefined || r.props.brandId === filter.brandId) &&
          (filter.projectId === undefined || r.props.projectId === filter.projectId),
      )
      .map((r) => Asset.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
