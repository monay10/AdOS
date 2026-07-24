import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Project, type ProjectId, type ProjectProps } from './project.js';

/**
 * Project repository port. Adds tenant-scoped listing, optionally filtered by
 * client, to the kernel Repository contract.
 */
export interface ProjectRepository extends Repository<Project, ProjectId> {
  /** Non-archived projects for the current tenant, optionally scoped to a client. */
  list(clientId?: string): Promise<Project[]>;
}

interface Row {
  id: string;
  props: ProjectProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryProjectRepository implements ProjectRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: ProjectId): Promise<Result<Project | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Project.restore(row.id, row.props));
  }

  async save(aggregate: Project): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: ProjectId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: ProjectId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(clientId?: string): Promise<Project[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter(
        (r) =>
          r.props.tenantId === tenant &&
          r.props.status !== 'archived' &&
          (clientId === undefined || r.props.clientId === clientId),
      )
      .map((r) => Project.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
