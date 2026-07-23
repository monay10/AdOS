import { describe, expect, it } from 'vitest';
import { InMemoryPromptRegistry, interpolate, selectActive } from './in-memory-prompt-registry.js';

const clock = () => '2026-01-01T00:00:00.000Z';

describe('interpolate', () => {
  it('replaces known vars and leaves unknown placeholders intact', () => {
    expect(interpolate('Hi {{name}}, budget {{amt}}', { name: 'Ada' })).toBe('Hi Ada, budget {{amt}}');
  });
});

describe('selectActive', () => {
  it('prefers the highest score, falling back to the latest version', () => {
    const base = { key: 'k', content: '', active: true, createdAt: 'x' };
    const chosen = selectActive([
      { ...base, version: 1, score: 40 },
      { ...base, version: 2, score: 91 },
      { ...base, version: 3 },
    ]);
    expect(chosen.version).toBe(2);
  });
});

describe('InMemoryPromptRegistry', () => {
  it('versions prompts and returns the A/B winner as active', async () => {
    const reg = new InMemoryPromptRegistry(clock);
    await reg.publish({ key: 'creative.image', version: 14, content: 'v14 {{brand}}' });
    await reg.publish({ key: 'creative.image', version: 27, content: 'v27 {{brand}}' });

    await reg.score('creative.image', 14, 95);
    await reg.score('creative.image', 27, 20);

    const active = await reg.get('creative.image');
    expect(active.version).toBe(14); // higher score wins the A/B

    const rendered = await reg.render('creative.image', { brand: 'Acme' });
    expect(rendered[0]!.content).toBe('v14 Acme');
  });

  it('throws for an unknown prompt', async () => {
    const reg = new InMemoryPromptRegistry(clock);
    await expect(reg.get('missing')).rejects.toThrow();
  });
});
