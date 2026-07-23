import { createServer, type Server } from 'node:http';
import { telemetry } from '@ados/observability';
import { App } from './app.js';
import { makeRes, parseRequest } from './http.js';
import { handle } from './routes.js';

export interface ServerOptions {
  /** HMAC secret for signing session cookies. */
  sessionSecret: string;
  /** Pre-built App (compose your own bus in tests); a fresh one otherwise. */
  app?: App;
}

/**
 * Build the AdOS web server. Returns the App (for assertions in tests) and an
 * unstarted http.Server. Call app.start() to attach the activity feed before
 * listening.
 */
export function buildServer(options: ServerOptions): { app: App; server: Server } {
  const app = options.app ?? new App();
  const tele = telemetry('web.server');

  const server = createServer((rawReq, rawRes) => {
    const res = makeRes(rawRes);
    void (async () => {
      try {
        const req = await parseRequest(rawReq);
        await handle(app, options.sessionSecret, req, res);
      } catch (err) {
        // Last-resort handler: never leak a stack trace to the client.
        tele.logger.error({ err }, 'unhandled request error');
        if (!rawRes.headersSent) {
          res.html('<h1>500 — Something went wrong</h1><p>The error was logged.</p>', 500);
        } else {
          rawRes.end();
        }
      }
    })();
  });

  return { app, server };
}
