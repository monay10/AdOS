import { getLogger } from '@ados/observability';
import type { JobContext, WorkerRegistry } from './worker-registry.js';

/**
 * The platform's standard background job types. Handlers are injected at the
 * application boundary (like the AI Manager) so this package never imports a
 * business module — it only names the work and provides the run harness.
 */
export const BackgroundJobType = {
  Analytics: 'analytics.aggregate',
  ExecutiveReport: 'executive.report.generate',
  CompanyBrainEnrichment: 'company_brain.enrich',
  DecisionMemory: 'decision.memory.record',
  Cleanup: 'maintenance.cleanup',
  Maintenance: 'maintenance.scheduled',
  IndexRebuild: 'index.rebuild',
  CacheRefresh: 'cache.refresh',
  PromptStatistics: 'prompt.statistics',
} as const;

export type BackgroundJobType = (typeof BackgroundJobType)[keyof typeof BackgroundJobType];

export type BackgroundJobHandler = (ctx: JobContext) => Promise<void>;
export type StandardWorkerHandlers = Partial<Record<BackgroundJobType, BackgroundJobHandler>>;

/**
 * Register every standard background job. A type with no injected handler gets a
 * safe logging no-op, so the queue harness is complete and testable even before
 * the app wires real business logic in.
 */
export function registerStandardWorkers(registry: WorkerRegistry, handlers: StandardWorkerHandlers = {}): WorkerRegistry {
  const logger = getLogger('workers');
  for (const type of Object.values(BackgroundJobType)) {
    const handler = handlers[type];
    registry.register({
      type,
      handle:
        handler ??
        (async (ctx: JobContext): Promise<void> => {
          logger.warn({ type, jobId: ctx.job.id }, 'no handler wired for background job — treated as no-op');
        }),
    });
  }
  return registry;
}
