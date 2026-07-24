import { consistencyStep, type ConsistencyCheck } from './steps.js';
import type { RecoveryStep } from './recovery.js';

/**
 * RecoveryValidation — accumulates the consistency checks a recovery must pass
 * before the system is declared healthy: tenant isolation intact, knowledge
 * stores present, and any custom data-integrity invariants. Produces the
 * consistency step for the {@link RecoveryManager} and can also be run directly.
 */
export class RecoveryValidation {
  private readonly checks: ConsistencyCheck[] = [];

  add(name: string, check: () => Promise<boolean> | boolean): this {
    this.checks.push({ name, check });
    return this;
  }

  /** Tenant consistency — e.g. no cross-tenant leakage after a restore. */
  tenant(check: () => Promise<boolean> | boolean): this {
    return this.add('tenant-consistency', check);
  }

  /** Knowledge consistency — the company brain / memory stores restored intact. */
  knowledge(check: () => Promise<boolean> | boolean): this {
    return this.add('knowledge-consistency', check);
  }

  build(name = 'consistency'): RecoveryStep {
    return consistencyStep(name, [...this.checks]);
  }

  async run(): Promise<{ ok: boolean; failed: string[] }> {
    const failed: string[] = [];
    for (const c of this.checks) if (!(await c.check())) failed.push(c.name);
    return { ok: failed.length === 0, failed };
  }
}
