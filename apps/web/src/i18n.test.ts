import { describe, expect, it } from 'vitest';
import { currentLocale, languageName, resolveLocale, t, withLocale } from './i18n.js';

describe('i18n', () => {
  it('resolves Turkish when it is the top browser preference', () => {
    expect(resolveLocale('tr-TR,tr;q=0.9,en;q=0.8')).toBe('tr');
    expect(resolveLocale('tr')).toBe('tr');
  });

  it('resolves English for non-Turkish or missing headers', () => {
    expect(resolveLocale('en-US,en;q=0.9')).toBe('en');
    expect(resolveLocale('de-DE,de;q=0.9')).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
    expect(resolveLocale('')).toBe('en');
  });

  it('honours q-weights, not header order', () => {
    // English listed first but Turkish has the higher weight.
    expect(resolveLocale('en;q=0.5,tr;q=0.9')).toBe('tr');
  });

  it('defaults to English outside a request scope', () => {
    expect(currentLocale()).toBe('en');
    expect(t('nav.dashboard')).toBe('Dashboard');
  });

  it('translates within a locale scope and interpolates vars', () => {
    withLocale('tr', () => {
      expect(currentLocale()).toBe('tr');
      expect(t('nav.dashboard')).toBe('Panel');
      expect(t('dash.welcome', { name: 'Mehmet' })).toBe('Hoş geldiniz, Mehmet.');
    });
    withLocale('en', () => {
      expect(t('nav.dashboard')).toBe('Dashboard');
      expect(t('dash.welcome', { name: 'Mehmet' })).toBe('Welcome, Mehmet.');
    });
  });

  it('falls back to the key for unknown strings', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('maps locale to the AI language name', () => {
    expect(languageName('tr')).toBe('Turkish');
    expect(languageName('en')).toBe('English');
  });
});
