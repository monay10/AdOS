import { SpanStatusCode, trace, type Span } from '@opentelemetry/api';
import type { Logger } from 'pino';
import { getLogger } from './logger.js';
import { counter, histogram } from './metrics.js';

/**
 * Telemetry — one helper that bundles the three observability concerns every
 * bounded context must include: structured logging, distributed tracing, and
 * metrics. Reused across all books so instrumentation is consistent and never
 * duplicated. Tracing is a no-op until the OTel SDK is initialized (offline),
 * so it is always safe to call.
 */
export interface Telemetry {
  readonly logger: Logger;
  /** Run `fn` inside a span named `${component}.${name}`; records errors. */
  span<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T>;
  /** Increment a counter (e.g. tasks handled). */
  count(name: string, by?: number): void;
  /** Observe a value in a histogram (e.g. latency ms). */
  observe(name: string, value: number): void;
}

export function telemetry(component: string): Telemetry {
  const tracer = trace.getTracer(component);
  const logger = getLogger(component);
  const metric = (suffix: string): string => `${component.replace(/[^a-z0-9]+/gi, '_')}_${suffix}`;

  return {
    logger,
    async span<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
      return tracer.startActiveSpan(`${component}.${name}`, async (span) => {
        try {
          const result = await fn(span);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (e) {
          span.recordException(e as Error);
          span.setStatus({ code: SpanStatusCode.ERROR, message: e instanceof Error ? e.message : String(e) });
          throw e;
        } finally {
          span.end();
        }
      });
    },
    count(name: string, by = 1): void {
      counter(metric(`${name}_total`), `${component} ${name} total`).inc(by);
    },
    observe(name: string, value: number): void {
      histogram(metric(`${name}`), `${component} ${name}`).observe(value);
    },
  };
}
