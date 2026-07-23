/**
 * @ados/kernel — framework-agnostic DDD + Clean Architecture building blocks.
 * Zero runtime dependencies. Shared by every bounded context and the AI Manager.
 */
export * from './result/result.js';
export * from './errors/domain-error.js';
export * from './guards/guard.js';
export * from './identifiers/identifier.js';
export * from './domain/entity.js';
export * from './domain/aggregate-root.js';
export * from './domain/value-object.js';
export * from './domain/domain-event.js';
export * from './domain/repository.js';
export * from './application/cqrs.js';
