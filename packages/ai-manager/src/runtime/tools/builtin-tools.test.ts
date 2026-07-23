import { describe, expect, it } from 'vitest';
import { InMemoryToolRegistry } from '../../tool-registry.js';
import { BUILTIN_TOOLS, parseCsv, stripMarkdown } from './builtin-tools.js';

describe('builtin tools', () => {
  it('registers and invokes markdown + csv + json via the Tool Registry', async () => {
    const tools = new InMemoryToolRegistry(BUILTIN_TOOLS);
    expect(tools.list().map((t) => t.id).sort()).toEqual(['csv.parse', 'fs.read', 'json.parse', 'markdown.strip']);

    const md = await tools.invoke({ tool: 'markdown.strip', args: { markdown: '# Hi\n**bold** [link](http://x)' }, invokedBy: 'seo' });
    expect(md.ok && (md.output as { text: string }).text).toBe('Hi\nbold link');

    const csv = await tools.invoke({ tool: 'csv.parse', args: { csv: 'a,b\n1,2\n3,4' }, invokedBy: 'analytics' });
    expect(csv.ok && (csv.output as { rows: unknown[] }).rows).toEqual([{ a: '1', b: '2' }, { a: '3', b: '4' }]);

    const json = await tools.invoke({ tool: 'json.parse', args: { json: '{"x":1}' }, invokedBy: 'agent' });
    expect(json.ok && (json.output as { value: unknown }).value).toEqual({ x: 1 });
  });

  it('parses quoted CSV fields containing the delimiter', () => {
    expect(parseCsv('name,note\n"Doe, John","a ""quote"""')).toEqual([{ name: 'Doe, John', note: 'a "quote"' }]);
  });

  it('strips markdown structures', () => {
    expect(stripMarkdown('## Title\n- item `code`')).toBe('Title\nitem code');
  });
});
