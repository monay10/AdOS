import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

/**
 * Ambient, request-scoped tenant + tracing context.
 *
 * Multi-tenancy is enforced by propagating this context through every async
 * boundary via AsyncLocalStorage. Repositories, the event bus, the AI Manager
 * and the logger all read the current tenant from here — so tenant isolation is
 * never a parameter a developer can forget to pass.
 */
export interface RequestContext {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly actor: string | undefined; // user or agent id
  readonly roles: readonly string[];
}

const storage = new AsyncLocalStorage<RequestContext>();

export const TenantContext = {
  /** Run `fn` with the given context bound for its entire async lifetime. */
  run<T>(context: RequestContext, fn: () => T): T {
    return storage.run(context, fn);
  },

  /** Current context, or undefined outside any bound scope (e.g. bootstrap). */
  current(): RequestContext | undefined {
    return storage.getStore();
  },

  /** Current context or throw — use where a tenant is mandatory. */
  require(): RequestContext {
    const ctx = storage.getStore();
    if (!ctx) {
      throw new Error('No tenant context bound. Wrap this call in TenantContext.run().');
    }
    return ctx;
  },

  tenantId(): string {
    return TenantContext.require().tenantId;
  },

  /** Derive a child context (e.g. for a spawned agent) preserving correlation. */
  fork(overrides: Partial<RequestContext>): RequestContext {
    const base = storage.getStore();
    return {
      tenantId: overrides.tenantId ?? base?.tenantId ?? 'public',
      correlationId: overrides.correlationId ?? base?.correlationId ?? randomUUID(),
      actor: overrides.actor ?? base?.actor,
      roles: overrides.roles ?? base?.roles ?? [],
    };
  },
};
