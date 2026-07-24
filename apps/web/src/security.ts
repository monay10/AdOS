import type { ServerResponse } from 'node:http';

/**
 * Content-Security-Policy. The app is server-rendered with a single inline
 * <style> block and NO inline scripts, so scripts are locked to 'self' while
 * styles allow 'unsafe-inline'. `frame-ancestors 'none'` blocks clickjacking;
 * `object-src 'none'` and `base-uri 'self'` close common injection vectors.
 * `img-src` permits data: and https: for the asset-library previews.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export interface SecurityHeaderOptions {
  /** Emit HSTS (only meaningful — and only sent — over HTTPS). */
  readonly secure?: boolean;
}

/**
 * Apply defence-in-depth security headers to every response. Called once per
 * request before routing, so it covers application pages, auth, and ops
 * endpoints alike. Additive — it never changes response bodies or status codes.
 */
export function applySecurityHeaders(raw: ServerResponse, opts: SecurityHeaderOptions = {}): void {
  raw.setHeader('X-Content-Type-Options', 'nosniff'); // no MIME sniffing
  raw.setHeader('X-Frame-Options', 'DENY'); // legacy clickjacking guard
  raw.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  raw.setHeader('Referrer-Policy', 'no-referrer');
  raw.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  raw.setHeader('X-XSS-Protection', '0'); // modern guidance: rely on CSP, disable the legacy auditor
  raw.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  raw.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  if (opts.secure) raw.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}
