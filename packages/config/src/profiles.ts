/**
 * Deployment profiles. The profile decides which subsystems are *required* to be
 * configured: development and test run offline with sensible defaults, while
 * staging and production demand real infrastructure and fail fast without it.
 */
export type Profile = 'development' | 'test' | 'staging' | 'production';

export const PROFILES: readonly Profile[] = ['development', 'test', 'staging', 'production'];

/** Resolve the active profile from the environment (read only inside Config). */
export function resolveProfile(env: Record<string, string | undefined> = process.env): Profile {
  const raw = (env['ADOS_PROFILE'] ?? env['NODE_ENV'] ?? 'development').toLowerCase();
  if (raw === 'production' || raw === 'prod') return 'production';
  if (raw === 'staging' || raw === 'stage') return 'staging';
  if (raw === 'test') return 'test';
  return 'development';
}

/** Staging and production hold infrastructure to a hard standard. */
export function isProductionLike(profile: Profile): boolean {
  return profile === 'production' || profile === 'staging';
}
