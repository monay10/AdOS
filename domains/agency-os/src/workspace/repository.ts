import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Workspace, type WorkspaceId, type WorkspaceProps } from './workspace.js';

/**
 * Workspace repository port. Adds tenant-scoped listing to the kernel Repository
 * contract. Adapters keep tenant isolation; the in-memory adapter below does so
 * via the ambient TenantContext.
 */
export interface WorkspaceRepository extends Repository<Workspace, WorkspaceId> {
  /** Active workspaces for the current tenant. */
  list(): Promise<Workspace[]>;
}

interface Row {
  id: string;
  props: WorkspaceProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: WorkspaceId): Promise<Result<Workspace | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Workspace.restore(row.id, row.props));
  }

  async save(aggregate: Workspace): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: WorkspaceId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: WorkspaceId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(): Promise<Workspace[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && r.props.status === 'active')
      .map((r) => Workspace.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
