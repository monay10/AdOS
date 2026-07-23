import { ForbiddenError } from '@ados/kernel';
import type { Result } from '@ados/kernel';
import { err, ok } from '@ados/kernel';

/**
 * Authentication, Authorization & RBAC ports.
 *
 * Authentication verifies WHO the principal is; Authorization + RBAC decide
 * WHAT they may do. Permissions are expressed as `resource:action` strings and
 * granted through roles. Everything is tenant-scoped.
 */

export interface Principal {
  id: string;
  tenantId: string;
  kind: 'user' | 'agent' | 'service';
  roles: string[];
}

/** Verifies a bearer credential and resolves it to a Principal. */
export interface Authenticator {
  authenticate(credential: string): Promise<Result<Principal, Error>>;
}

/** `resource:action`, e.g. "campaign:launch", "budget:allocate". Wildcards allowed. */
export type Permission = string;

export interface Role {
  name: string;
  permissions: Permission[];
}

export interface RoleStore {
  getRole(name: string): Promise<Role | null>;
}

/** Pure permission-matching supporting `*` wildcards on either segment. */
export function permits(granted: Permission[], required: Permission): boolean {
  const [rRes, rAct] = required.split(':');
  return granted.some((g) => {
    const [gRes, gAct] = g.split(':');
    const resOk = gRes === '*' || gRes === rRes;
    const actOk = gAct === '*' || gAct === rAct || gAct === undefined;
    return resOk && actOk;
  });
}

export class AccessControl {
  constructor(private readonly roles: RoleStore) {}

  async can(principal: Principal, required: Permission): Promise<boolean> {
    const grants: Permission[] = [];
    for (const roleName of principal.roles) {
      const role = await this.roles.getRole(roleName);
      if (role) grants.push(...role.permissions);
    }
    return permits(grants, required);
  }

  async authorize(principal: Principal, required: Permission): Promise<Result<void, ForbiddenError>> {
    return (await this.can(principal, required))
      ? ok(undefined)
      : err(
          new ForbiddenError(`Principal lacks permission "${required}"`, {
            details: { principal: principal.id, required },
          }),
        );
  }
}
