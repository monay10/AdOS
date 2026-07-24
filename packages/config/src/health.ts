import type { Profile } from './profiles.js';
import { ConfigurationError, type SubsystemName } from './validator.js';
import type { LoadedConfiguration } from './loader.js';

export interface ConfigurationHealthReport {
  readonly healthy: boolean;
  readonly profile: Profile;
  readonly subsystems: { name: SubsystemName; ok: boolean; configured: boolean; required: boolean }[];
  readonly errors: string[];
  readonly checkedAt: string;
}

/**
 * ConfigurationHealthCheck — a liveness view of the current configuration,
 * suitable for a /health endpoint. It never throws: an invalid configuration is
 * reported as unhealthy with the offending subsystems, so the check itself can
 * always answer.
 */
export class ConfigurationHealthCheck {
  constructor(private readonly load: () => LoadedConfiguration) {}

  check(): ConfigurationHealthReport {
    const checkedAt = new Date().toISOString();
    try {
      const loaded = this.load();
      return {
        healthy: loaded.report.status === 'valid',
        profile: loaded.profile,
        subsystems: loaded.report.subsystems.map((s) => ({ name: s.name, ok: s.ok, configured: s.configured, required: s.required })),
        errors: loaded.report.errors,
        checkedAt,
      };
    } catch (e) {
      if (e instanceof ConfigurationError) {
        return {
          healthy: false,
          profile: e.report.profile,
          subsystems: e.report.subsystems.map((s) => ({ name: s.name, ok: s.ok, configured: s.configured, required: s.required })),
          errors: e.report.errors,
          checkedAt,
        };
      }
      throw e;
    }
  }
}
