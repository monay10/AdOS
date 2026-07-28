import { describe, expect, it } from 'vitest';
import type { CreativeContent } from '@ados/creative-studio';
import { RegexCreativeSafetyGate } from './safety.js';

const CLEAN: CreativeContent = {
  headline: 'Whitening: brighter smiles',
  adCopy: 'A warm choice you can rely on — made for you.',
  cta: 'Get started',
  socialPost: '✨ Brighter smiles are here.',
  landingPage: { headline: 'Whitening, done right', body: 'Our team delivers real results.', cta: 'Book your spot' },
  email: { subject: 'Meet Whitening', body: 'Reply to get started today.' },
};

const gate = new RegexCreativeSafetyGate();

describe('RegexCreativeSafetyGate', () => {
  it('passes clean copy with no banned words', async () => {
    const verdict = await gate.inspect(CLEAN, { bannedWords: ['cheap', 'guaranteed'] });
    expect(verdict.safe).toBe(true);
    expect(verdict.issues).toHaveLength(0);
  });

  it('blocks copy containing a brand banned word (case-insensitive)', async () => {
    const dirty: CreativeContent = { ...CLEAN, adCopy: 'A GUARANTEED miracle result.' };
    const verdict = await gate.inspect(dirty, { bannedWords: ['guaranteed', 'miracle'] });
    expect(verdict.safe).toBe(false);
    expect(verdict.issues.some((i) => i.includes('guaranteed'))).toBe(true);
    expect(verdict.issues.some((i) => i.includes('miracle'))).toBe(true);
  });

  it('blocks copy that leaks PII (email address) via the reused safety engine', async () => {
    const dirty: CreativeContent = { ...CLEAN, email: { subject: 'Hi', body: 'Contact jane.doe@example.com now.' } };
    const verdict = await gate.inspect(dirty, {});
    expect(verdict.safe).toBe(false);
    expect(verdict.issues.some((i) => i.startsWith('pii'))).toBe(true);
  });

  it('ignores empty/whitespace banned words', async () => {
    const verdict = await gate.inspect(CLEAN, { bannedWords: ['', '   '] });
    expect(verdict.safe).toBe(true);
  });
});
