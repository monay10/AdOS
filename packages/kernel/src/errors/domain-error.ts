/**
 * Structured, typed error hierarchy for the whole platform.
 *
 * Every error carries a stable `code` (for i18n / client handling), a `category`
 * (drives HTTP mapping and retry policy), and optional `details`/`cause`.
 */

export type ErrorCategory =
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'unavailable'
  | 'timeout'
  | 'internal';

export interface SerializedError {
  name: string;
  code: string;
  category: ErrorCategory;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly category: ErrorCategory;
  readonly retryable: boolean;
  readonly details: Record<string, unknown> | undefined;

  constructor(
    message: string,
    options: { retryable?: boolean; details?: Record<string, unknown>; cause?: unknown } = {},
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.retryable = options.retryable ?? false;
    this.details = options.details;
    Error.captureStackTrace?.(this, new.target);
  }

  toJSON(): SerializedError {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      retryable: this.retryable,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'validation' as const;
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly category = 'not_found' as const;
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
  readonly category = 'conflict' as const;
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  readonly category = 'unauthorized' as const;
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';
  readonly category = 'forbidden' as const;
}

export class RateLimitedError extends AppError {
  readonly code = 'RATE_LIMITED';
  readonly category = 'rate_limited' as const;
  constructor(message: string, options: { retryAfterMs?: number } = {}) {
    super(message, { retryable: true, details: { retryAfterMs: options.retryAfterMs } });
  }
}

export class UnavailableError extends AppError {
  readonly code = 'UNAVAILABLE';
  readonly category = 'unavailable' as const;
  constructor(message: string, options: { details?: Record<string, unknown>; cause?: unknown } = {}) {
    super(message, { retryable: true, ...options });
  }
}

export class TimeoutError extends AppError {
  readonly code = 'TIMEOUT';
  readonly category = 'timeout' as const;
  constructor(message: string, options: { details?: Record<string, unknown> } = {}) {
    super(message, { retryable: true, ...options });
  }
}

/** Business-rule violation raised by aggregates/invariants. */
export class BusinessRuleError extends AppError {
  readonly code: string;
  readonly category = 'conflict' as const;
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message, details ? { details } : {});
    this.code = code;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
