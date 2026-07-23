import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Product, type ProductId, type ProductProps } from './product.js';

/**
 * Product repository port. Adds tenant-scoped, client-filtered listing to the
 * kernel Repository contract.
 */
export interface ProductRepository extends Repository<Product, ProductId> {
  /** Active products for the current tenant, optionally scoped to a client. */
  list(clientId?: string): Promise<Product[]>;
}

interface Row {
  id: string;
  props: ProductProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryProductRepository implements ProductRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: ProductId): Promise<Result<Product | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Product.restore(row.id, row.props));
  }

  async save(aggregate: Product): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: ProductId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: ProductId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(clientId?: string): Promise<Product[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter(
        (r) =>
          r.props.tenantId === tenant &&
          r.props.status === 'active' &&
          (clientId === undefined || r.props.clientId === clientId),
      )
      .map((r) => Product.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
