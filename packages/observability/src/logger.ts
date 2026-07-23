import pino, { type Logger } from 'pino';
import { TenantContext } from '@ados/tenancy';

/**
 * Structured logger. Every log line is automatically enriched with the ambient
 * tenant + correlation id, so logs are traceable per-tenant and per-request
 * without any manual plumbing at the call site.
 */
export type AppLogger = Logger;

let root: Logger | null = null;

export function initLogger(options: { level: string; service: string; pretty?: boolean }): Logger {
  root = pino({
    level: options.level,
    base: { service: options.service },
    formatters: { level: (label) => ({ level: label }) },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(options.pretty
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : {}),
  });
  return root;
}

/**
 * Returns a child logger bound to the current tenant context. Falls back to a
 * lazily-initialized root logger if called before initLogger (e.g. bootstrap).
 */
export function getLogger(component?: string): Logger {
  if (!root) root = pino({ level: process.env.LOG_LEVEL ?? 'info' });
  const ctx = TenantContext.current();
  return root.child({
    ...(component ? { component } : {}),
    ...(ctx ? { tenantId: ctx.tenantId, correlationId: ctx.correlationId } : {}),
  });
}
