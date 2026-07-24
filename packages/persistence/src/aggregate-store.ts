import { TenantContext } from '@ados/tenancy';
import type { QueryExecutor } from './database.js';

/**
 * A tenant-scoped filter on a top-level field of an aggregate's JSON snapshot,
 * e.g. `{ key: 'status', op: '<>', value: 'archived' }`.
 */
export interface AggregateCondition {
  key: string;
  op: '=' | '<>';
  value: string;
}

export interface AggregateRow {
  id: string;
  data: Record<string, unknown>;
}

const TABLE = 'aggregates';
/** Filter keys are hard-coded by the repository adapters, never user input; this
 * whitelist pattern is a defence-in-depth guard because keys are interpolated. */
const SAFE_KEY = /^[a-zA-Z][a-zA-Z0-9_]*$/;

/**
 * A generic, tenant-scoped aggregate store backing the SQL repository adapters.
 *
 * Every aggregate is persisted as one row: `(kind, id, tenant_id, data jsonb)`.
 * This mirrors the in-memory repositories exactly — a `{ id, props }` record
 * scoped to the ambient tenant — so the SQL adapters are behaviour-compatible
 * drop-ins. Reads and existence checks are tenant-scoped via the ambient
 * TenantContext, identical to the in-memory adapters.
 */
export class SqlAggregateStore {
  constructor(private readonly exec: QueryExecutor) {}

  private tenant(): string {
    return TenantContext.current()?.tenantId ?? 'public';
  }

  async findById(kind: string, id: string): Promise<AggregateRow | null> {
    const rows = await this.exec.query<{ id: string; data: unknown }>(
      `SELECT id, data FROM ${TABLE} WHERE kind = $1 AND id = $2 AND tenant_id = $3`,
      [kind, id, this.tenant()],
    );
    const row = rows[0];
    return row ? { id: row.id, data: parseData(row.data) } : null;
  }

  async upsert(kind: string, id: string, tenantId: string, data: unknown): Promise<void> {
    await this.exec.execute(
      `INSERT INTO ${TABLE} (kind, id, tenant_id, data, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (kind, id) DO UPDATE
         SET data = excluded.data, tenant_id = excluded.tenant_id, updated_at = excluded.updated_at`,
      [kind, id, tenantId, data, new Date().toISOString()],
    );
  }

  async delete(kind: string, id: string): Promise<void> {
    await this.exec.execute(`DELETE FROM ${TABLE} WHERE kind = $1 AND id = $2`, [kind, id]);
  }

  async exists(kind: string, id: string): Promise<boolean> {
    const rows = await this.exec.query(
      `SELECT 1 AS present FROM ${TABLE} WHERE kind = $1 AND id = $2 AND tenant_id = $3`,
      [kind, id, this.tenant()],
    );
    return rows.length > 0;
  }

  /** List a kind for the current tenant, applying the given JSON-field filters,
   * in insertion order (mirroring the in-memory Map iteration order). */
  async list(kind: string, conditions: AggregateCondition[] = []): Promise<AggregateRow[]> {
    const params: unknown[] = [kind, this.tenant()];
    let sql = `SELECT id, data FROM ${TABLE} WHERE kind = $1 AND tenant_id = $2`;
    for (const c of conditions) {
      if (!SAFE_KEY.test(c.key)) throw new Error(`unsafe aggregate filter key: ${c.key}`);
      params.push(c.value);
      sql += ` AND data ->> '${c.key}' ${c.op} $${params.length}`;
    }
    sql += ` ORDER BY seq ASC`;
    const rows = await this.exec.query<{ id: string; data: unknown }>(sql, params);
    return rows.map((r) => ({ id: r.id, data: parseData(r.data) }));
  }
}

/** Postgres returns jsonb as a parsed object; SQLite returns text — normalise both. */
function parseData(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') return JSON.parse(value) as Record<string, unknown>;
  return (value ?? {}) as Record<string, unknown>;
}
