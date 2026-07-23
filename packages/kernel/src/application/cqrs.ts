import type { Result } from '../result/result.js';
import type { AppError } from '../errors/domain-error.js';

/**
 * CQRS building blocks. Commands mutate state and return no data (only
 * success/failure). Queries read state and never mutate. Handlers are the
 * application-layer entry points wired through the message bus / DI container.
 */

export interface Command {
  readonly __brand?: 'command';
}

export interface Query {
  readonly __brand?: 'query';
}

export interface CommandHandler<TCommand extends Command, TResult = void> {
  execute(command: TCommand): Promise<Result<TResult, AppError>>;
}

export interface QueryHandler<TQuery extends Query, TResult> {
  execute(query: TQuery): Promise<Result<TResult, AppError>>;
}

/** A generic use-case (application service) that returns a Result. */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<Result<TOutput, AppError>>;
}
