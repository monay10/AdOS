import type { AITaskRequest } from '@ados/contracts';
import type { ResponseFormatterPort, ValidationEnginePort } from '../ports.js';

/**
 * Extract a JSON value from raw model text. Models often wrap JSON in prose or
 * ```json fences; this recovers the first balanced object/array so structured
 * outputs survive chatty models. Returns undefined if none is found.
 */
export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? raw;
  const start = candidate.search(/[[{]/);
  if (start < 0) return undefined;
  const open = candidate[start]!;
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i]!;
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(start, i + 1));
        } catch {
          return undefined;
        }
      }
    }
  }
  return undefined;
}

/**
 * Response Formatter — coerces raw model text into the shape the capability
 * declared. With no responseSchema the raw text is the value; with one, the JSON
 * is extracted so downstream code always receives structured data.
 */
export class JsonResponseFormatter implements ResponseFormatterPort {
  format<T>(raw: string, request: AITaskRequest): { ok: true; value: T } | { ok: false; error: string } {
    if (!request.responseSchema) return { ok: true, value: raw as T };
    const json = extractJson(raw);
    if (json === undefined) return { ok: false, error: 'No JSON object found in model output' };
    return { ok: true, value: json as T };
  }
}

/**
 * Validation Engine — validates output against the request's responseSchema
 * (a JSON-Schema subset: type, properties, required, items, enum, min/max,
 * minLength). Drives the pipeline's repair/retry loop when it fails.
 */
export class SchemaValidationEngine implements ValidationEnginePort {
  validate<T>(output: unknown, request: AITaskRequest): { ok: true; value: T } | { ok: false; error: string } {
    if (!request.responseSchema) return { ok: true, value: output as T };
    const errors = validateAgainstSchema(output, request.responseSchema, '$');
    return errors.length === 0 ? { ok: true, value: output as T } : { ok: false, error: errors.join('; ') };
  }
}

/** Build a corrective instruction the runtime can append on a retry. */
export function repairInstruction(error: string, schema: Record<string, unknown>): string {
  return `Your previous response was invalid: ${error}. Respond ONLY with JSON matching this schema: ${JSON.stringify(schema)}`;
}

/** Minimal, dependency-free JSON-Schema validator. Returns human-readable errors. */
export function validateAgainstSchema(value: unknown, schema: Record<string, unknown>, path: string): string[] {
  const errors: string[] = [];
  const type = schema['type'] as string | undefined;

  if (type && !matchesType(value, type)) {
    errors.push(`${path}: expected ${type}, got ${jsType(value)}`);
    return errors; // no point checking further on a type mismatch
  }

  if (schema['enum'] && Array.isArray(schema['enum']) && !schema['enum'].includes(value)) {
    errors.push(`${path}: must be one of ${JSON.stringify(schema['enum'])}`);
  }

  if (type === 'string' && typeof value === 'string') {
    const min = schema['minLength'] as number | undefined;
    if (min !== undefined && value.length < min) errors.push(`${path}: shorter than minLength ${min}`);
  }

  if ((type === 'number' || type === 'integer') && typeof value === 'number') {
    const min = schema['minimum'] as number | undefined;
    const max = schema['maximum'] as number | undefined;
    if (min !== undefined && value < min) errors.push(`${path}: below minimum ${min}`);
    if (max !== undefined && value > max) errors.push(`${path}: above maximum ${max}`);
  }

  if (type === 'object' && isObject(value)) {
    const required = (schema['required'] as string[] | undefined) ?? [];
    for (const key of required) {
      if (!(key in value)) errors.push(`${path}.${key}: required`);
    }
    const props = (schema['properties'] as Record<string, Record<string, unknown>> | undefined) ?? {};
    for (const [key, sub] of Object.entries(props)) {
      if (key in value) errors.push(...validateAgainstSchema(value[key], sub, `${path}.${key}`));
    }
  }

  if (type === 'array' && Array.isArray(value)) {
    const items = schema['items'] as Record<string, unknown> | undefined;
    if (items) value.forEach((v, i) => errors.push(...validateAgainstSchema(v, items, `${path}[${i}]`)));
  }

  return errors;
}

function matchesType(value: unknown, type: string): boolean {
  switch (type) {
    case 'object':
      return isObject(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return true;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function jsType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
