import { extname } from 'node:path';
import { StorageError } from './object.js';

/**
 * MIME allowlist + size ceiling. Nothing about business behaviour is encoded
 * here — these are operational guardrails an operator tunes. The defaults are
 * deliberately permissive for common creative/document assets.
 */
export interface ValidationPolicy {
  readonly allowedMimeTypes: ReadonlySet<string>;
  readonly maxSizeBytes: number;
}

export const DEFAULT_ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/html',
  'application/json',
  'application/zip',
  'application/octet-stream',
]);

export const DEFAULT_MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MiB

export const DEFAULT_VALIDATION_POLICY: ValidationPolicy = {
  allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
  maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
};

/** Canonical extension for a stored object, from its name or (fallback) MIME. */
const MIME_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'text/markdown': 'md',
  'text/html': 'html',
  'application/json': 'json',
  'application/zip': 'zip',
};

export function validateMimeType(mimeType: string, policy: ValidationPolicy): void {
  if (!policy.allowedMimeTypes.has(mimeType)) {
    throw new StorageError('unsupported_mime', `MIME type "${mimeType}" is not allowed.`);
  }
}

export function extensionFor(originalName: string, mimeType: string): string {
  const fromName = extname(originalName).replace(/^\./, '').toLowerCase();
  if (fromName) return fromName;
  return MIME_EXTENSION[mimeType] ?? 'bin';
}
