import { type AppError, ok, type Repository, type Result } from '@ados/kernel';
import { TenantContext } from '@ados/tenancy';
import { Mission, type MissionId, type MissionProps } from './mission.js';

/**
 * Mission repository port. Adds tenant-scoped, client-filtered listing to the
 * kernel Repository contract.
 */
export interface MissionRepository extends Repository<Mission, MissionId> {
  /** Missions for the current tenant, optionally scoped to a client. */
  list(clientId?: string): Promise<Mission[]>;
}

interface Row {
  id: string;
  props: MissionProps;
}

/** In-memory adapter for tests and single-node development. */
export class InMemoryMissionRepository implements MissionRepository {
  private readonly rows = new Map<string, Row>();

  async findById(id: MissionId): Promise<Result<Mission | null, AppError>> {
    const row = this.rows.get(id.toString());
    if (!row || row.props.tenantId !== currentTenant()) return ok(null);
    return ok(Mission.restore(row.id, row.props));
  }

  async save(aggregate: Mission): Promise<Result<void, AppError>> {
    this.rows.set(aggregate.id.toString(), { id: aggregate.id.toString(), props: aggregate.snapshot() });
    return ok(undefined);
  }

  async delete(id: MissionId): Promise<Result<void, AppError>> {
    this.rows.delete(id.toString());
    return ok(undefined);
  }

  async exists(id: MissionId): Promise<boolean> {
    const row = this.rows.get(id.toString());
    return Boolean(row && row.props.tenantId === currentTenant());
  }

  async list(clientId?: string): Promise<Mission[]> {
    const tenant = currentTenant();
    return [...this.rows.values()]
      .filter((r) => r.props.tenantId === tenant && (clientId === undefined || r.props.clientId === clientId))
      .map((r) => Mission.restore(r.id, r.props));
  }
}

function currentTenant(): string {
  return TenantContext.current()?.tenantId ?? 'public';
}
