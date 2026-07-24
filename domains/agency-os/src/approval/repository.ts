import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Approval, type ApprovalId, type ApprovalProps } from './approval.js';

/**
 * Approval repository port. Adds tenant-scoped listing, optionally filtered by
 * the project the request belongs to, to the kernel Repository contract.
 */
export interface ApprovalRepository extends Repository<Approval, ApprovalId> {
  /** Approvals for the current tenant, optionally scoped to a project. */
  list(projectId?: string): Promise<Approval[]>;
}

interface Row {
  id: string;
  props: ApprovalProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryApprovalRepository implements ApprovalRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: ApprovalId): Promise<Result<Approval | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Approval.restore(row.id, row.props));
  }

  async save(aggregate: Approval): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: ApprovalId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: ApprovalId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(projectId?: string): Promise<Approval[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (projectId === undefined || r.props.projectId === projectId))
      .map((r) => Approval.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
