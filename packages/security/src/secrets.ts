import { NotFoundError } from '@ados/kernel';

/**
 * Secrets Management port. Business code reads secrets through this interface,
 * never from process.env directly, so the backing store (env for local dev,
 * encrypted file, or Vault in production) is swappable and auditable.
 */
export interface SecretsProvider {
  get(key: string): Promise<string>;
  getOptional(key: string): Promise<string | undefined>;
}

/** Default offline-friendly provider backed by environment variables. */
export class EnvSecretsProvider implements SecretsProvider {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  async get(key: string): Promise<string> {
    const value = this.env[key];
    if (value === undefined) {
      throw new NotFoundError(`Secret "${key}" is not configured`, { details: { key } });
    }
    return value;
  }

  async getOptional(key: string): Promise<string | undefined> {
    return this.env[key];
  }
}
