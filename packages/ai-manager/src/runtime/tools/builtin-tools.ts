import { readFile } from 'node:fs/promises';
import type { ToolDefinition } from '@ados/contracts';

/**
 * Built-in offline tools. Each is a real ToolDefinition registered in the Tool
 * Registry and orchestrated by capabilities — never called directly by agents.
 * These are the tools that work with zero external services; network/OCR tools
 * (browser, crawler, Tesseract) are added as adapters when those services are
 * provisioned, behind this same ToolDefinition contract.
 */

export const filesystemReadTool: ToolDefinition = {
  id: 'fs.read',
  title: 'Filesystem Read',
  description: 'Read a UTF-8 text file from disk.',
  argsSchema: { type: 'object', required: ['path'], properties: { path: { type: 'string' } } },
  sideEffects: 'read',
  handler: async (args) => {
    const path = String(args['path']);
    return { path, content: await readFile(path, 'utf8') };
  },
};

export const markdownStripTool: ToolDefinition = {
  id: 'markdown.strip',
  title: 'Markdown → Text',
  description: 'Strip Markdown formatting to plain text.',
  argsSchema: { type: 'object', required: ['markdown'], properties: { markdown: { type: 'string' } } },
  sideEffects: 'none',
  handler: async (args) => ({ text: stripMarkdown(String(args['markdown'])) }),
};

export const csvParseTool: ToolDefinition = {
  id: 'csv.parse',
  title: 'CSV Parse',
  description: 'Parse CSV text into an array of row objects using the header row.',
  argsSchema: { type: 'object', required: ['csv'], properties: { csv: { type: 'string' }, delimiter: { type: 'string' } } },
  sideEffects: 'none',
  handler: async (args) => ({ rows: parseCsv(String(args['csv']), String(args['delimiter'] ?? ',')) }),
};

export const jsonParseTool: ToolDefinition = {
  id: 'json.parse',
  title: 'JSON Parse',
  description: 'Parse a JSON string into a value.',
  argsSchema: { type: 'object', required: ['json'], properties: { json: { type: 'string' } } },
  sideEffects: 'none',
  handler: async (args) => ({ value: JSON.parse(String(args['json'])) }),
};

/** The offline tool set registered by default. */
export const BUILTIN_TOOLS: ToolDefinition[] = [filesystemReadTool, markdownStripTool, csvParseTool, jsonParseTool];

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '') // code fences
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/^\s*[-*+]\s+/gm, '') // list items
    .replace(/[*_>#]/g, '') // residual emphasis / blockquote / hash markers
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parseCsv(csv: string, delimiter = ','): Array<Record<string, string>> {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = splitRow(lines[0]!, delimiter);
  return lines.slice(1).map((line) => {
    const cells = splitRow(line, delimiter);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  });
}

/** Split a CSV row honoring double-quoted fields (RFC-4180 subset). */
function splitRow(row: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i]!;
    if (inQuotes) {
      if (ch === '"' && row[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}
