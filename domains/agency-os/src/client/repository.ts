import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Client, type ClientId, type ClientProps } from './client.js';

/**
 * Client repository port. Adds tenant-scoped, workspace-filtered listing to the
 * kernel Repository contract. Adapters keep tenant isolation; the in-memory
 * adapter below does so via the ambient TenantContext.
 */
export interface ClientRepository extends Repository<Client, ClientId> {
  /** Active clients for the current tenant, optionally scoped to a workspace. */
  list(workspaceId?: string): Promise<Client[]>;
}

interface Row {
  id: string;
  props: ClientProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryClientRepository implements ClientRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: ClientId): Promise<Result<Client | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Client.restore(row.id, row.props));
  }

  async save(aggregate: Client): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: ClientId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: ClientId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(workspaceId?: string): Promise<Client[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter(
        (r) =>
          r.props.tenantId === tenant &&
          r.props.status === 'active' &&
          (workspaceId === undefined || r.props.workspaceId === workspaceId),
      )
      .map((r) => Client.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
