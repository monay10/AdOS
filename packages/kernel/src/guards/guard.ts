import { err, ok, type Result } from '../result/result.js';
import { ValidationError } from '../errors/domain-error.js';

/**
 * Guard — composable precondition checks that return Result instead of throwing.
 * Used inside value objects and aggregate factories to enforce invariants.
 */
export const Guard = {
  againstNullOrUndefined(value: unknown, field: string): Result<void, ValidationError> {
    return value === null || value === undefined
      ? err(new ValidationError(`${field} is required`, { details: { field } }))
      : ok(undefined);
  },

  againstEmptyString(value: string, field: string): Result<void, ValidationError> {
    return value.trim().length === 0
      ? err(new ValidationError(`${field} must not be empty`, { details: { field } }))
      : ok(undefined);
  },

  inRange(value: number, min: number, max: number, field: string): Result<void, ValidationError> {
    return value < min || value > max
      ? err(
          new ValidationError(`${field} must be between ${min} and ${max}`, {
            details: { field, value, min, max },
          }),
        )
      : ok(undefined);
  },

  minLength(value: string, min: number, field: string): Result<void, ValidationError> {
    return value.length < min
      ? err(
          new ValidationError(`${field} must be at least ${min} characters`, {
            details: { field, min },
          }),
        )
      : ok(undefined);
  },

  oneOf<T>(value: T, allowed: readonly T[], field: string): Result<void, ValidationError> {
    return allowed.includes(value)
      ? ok(undefined)
      : err(
          new ValidationError(`${field} must be one of: ${allowed.join(', ')}`, {
            details: { field, value },
          }),
        );
  },

  /** Fail-fast composition of multiple guard checks. */
  all(...checks: Result<void, ValidationError>[]): Result<void, ValidationError> {
    for (const check of checks) {
      if (check.isErr) return check;
    }
    return ok(undefined);
  },
};
