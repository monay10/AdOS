import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Brand, type BrandId, type BrandProps } from './brand.js';

/**
 * Brand repository port. Adds tenant-scoped, client-filtered listing to the
 * kernel Repository contract.
 */
export interface BrandRepository extends Repository<Brand, BrandId> {
  /** Active brands for the current tenant, optionally scoped to a client. */
  list(clientId?: string): Promise<Brand[]>;
}

interface Row {
  id: string;
  props: BrandProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryBrandRepository implements BrandRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: BrandId): Promise<Result<Brand | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Brand.restore(row.id, row.props));
  }

  async save(aggregate: Brand): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: BrandId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: BrandId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(clientId?: string): Promise<Brand[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter(
        (r) =>
          r.props.tenantId === tenant &&
          r.props.status === 'active' &&
          (clientId === undefined || r.props.clientId === clientId),
      )
      .map((r) => Brand.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
