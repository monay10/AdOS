import { randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { counter, histogram, telemetry } from '@ados/observability';
import { App } from './app.js';
import type { AuthGateway } from './auth/routes.js';
import { makeRes, parseRequest } from './http.js';
import { handleOps, type OpsOptions } from './ops.js';
import { applySecurityHeaders } from './security.js';
import { handle } from './routes.js';

export interface ServerOptions {
  /** HMAC secret for signing session cookies. */
  sessionSecret: string;
  /** Pre-built App (compose your own bus in tests); a fresh one otherwise. */
  app?: App;
  /** When present, production email/password authentication; otherwise the
   * open/dev passwordless login. */
  auth?: AuthGateway;
  /** Container ops endpoints (health/readiness/metrics); always exposed. */
  ops?: OpsOptions;
  /** Emit HSTS (behind HTTPS). Defaults to the auth secure-cookie setting. */
  secure?: boolean;
}

/**
 * Build the AdOS web server. Returns the App (for assertions in tests) and an
 * unstarted http.Server. Call app.start() to attach the activity feed before
 * listening.
 */
// Shared HTTP metrics (idempotent registration; safe across many buildServer calls).
const httpRequests = counter('web_http_requests_total', 'HTTP requests handled', ['method', 'status']);
const httpErrors = counter('web_http_errors_total', 'HTTP responses with a 5xx status', ['method']);
const httpDuration = histogram('web_http_request_duration_ms', 'HTTP request duration in ms', ['method'], [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]);

export function buildServer(options: ServerOptions): { app: App; server: Server } {
  const app = options.app ?? new App();
  const tele = telemetry('web.server');

  const secure = options.secure ?? options.auth?.secureCookies ?? false;
  const server = createServer((rawReq, rawRes) => {
    const res = makeRes(rawRes);
    applySecurityHeaders(rawRes, { secure }); // defence-in-depth on every response
    const start = Date.now();
    const requestId = randomUUID();
    const method = (rawReq.method ?? 'GET').toUpperCase();
    // Every request runs inside a span so traces cover the HTTP layer, and the
    // request id is available to correlate logs. The tenant + correlation id are
    // bound deeper (per session) inside handle().
    void tele
      .span('request', async () => {
        try {
          const req = await parseRequest(rawReq);
          if (await handleOps(req, res, options.ops)) return;
          await handle(app, options.sessionSecret, req, res, options.auth);
        } catch (err) {
          // Last-resort handler: never leak a stack trace to the client.
          tele.logger.error({ err, requestId }, 'unhandled request error');
          if (!rawRes.headersSent) {
            res.html('<h1>500 — Something went wrong</h1><p>The error was logged.</p>', 500);
          } else {
            rawRes.end();
          }
        }
      })
      .finally(() => {
        const status = rawRes.statusCode;
        const durationMs = Date.now() - start;
        httpRequests.inc({ method, status: String(status) });
        httpDuration.observe({ method }, durationMs);
        if (status >= 500) httpErrors.inc({ method });
        tele.logger.info({ requestId, method, path: rawReq.url, status, durationMs }, 'http request');
      });
  });

  return { app, server };
}
