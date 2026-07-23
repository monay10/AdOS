/**
 * Result<T, E> — explicit success/failure without throwing.
 *
 * Domain and application code returns Result instead of throwing for expected
 * failures (validation, business-rule violations). Exceptions are reserved for
 * truly exceptional, non-recoverable faults.
 */

export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E> {
  readonly isOk = true as const;
  readonly isErr = false as const;
  constructor(readonly value: T) {}

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_fallback: T): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }

  mapErr<F>(_fn: (error: E) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }
}

export class Err<T, E> {
  readonly isOk = false as const;
  readonly isErr = true as const;
  constructor(readonly error: E) {}

  unwrap(): never {
    throw this.error instanceof Error
      ? this.error
      : new Error(`Called unwrap() on an Err: ${String(this.error)}`);
  }

  unwrapOr(fallback: T): T {
    return fallback;
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return new Err(fn(this.error));
  }

  andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }
}

export const ok = <T, E = never>(value: T): Result<T, E> => new Ok(value);
export const err = <E, T = never>(error: E): Result<T, E> => new Err(error);

/** Collect a list of Results into a single Result of the list (fail-fast). */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const r of results) {
    if (r.isErr) return err(r.error);
    values.push(r.value);
  }
  return ok(values);
}
