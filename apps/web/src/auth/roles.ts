import type { Role, RoleStore } from '@ados/security';

/**
 * Default role catalogue, resolved through the existing `@ados/security` RBAC
 * (`Role` / `RoleStore` / `AccessControl`). Permissions are `resource:action`
 * grants with `*` wildcards. Role RESOLUTION is wired here; the web app's
 * existing authorization (tenant-scoped access) is unchanged — no new
 * permission gate is added to any route, so behaviour is preserved.
 */
export const DEFAULT_ROLES: Record<string, Role> = {
  owner: { name: 'owner', permissions: ['*:*'] },
  admin: { name: 'admin', permissions: ['*:*'] },
  member: { name: 'member', permissions: ['*:read'] },
};

export class DefaultRoleStore implements RoleStore {
  constructor(private readonly roles: Record<string, Role> = DEFAULT_ROLES) {}
  async getRole(name: string): Promise<Role | null> {
    return this.roles[name] ?? null;
  }
}
