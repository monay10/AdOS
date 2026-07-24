import { Algorithm, hash, verify } from '@node-rs/argon2';

/**
 * Argon2id password hashing (the preferred algorithm). Parameters follow the
 * OWASP baseline: 19 MiB memory, 2 iterations, 1 lane. The produced string is
 * self-describing (it embeds the salt and parameters), so verification needs no
 * separate stored salt and future re-tuning stays backward compatible.
 */
const OPTIONS = { algorithm: Algorithm.Argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

/** Constant-time verification. Any malformed/unknown hash verifies as false. */
export async function verifyPassword(storedHash: string, plain: string): Promise<boolean> {
  try {
    return await verify(storedHash, plain, OPTIONS);
  } catch {
    return false;
  }
}
