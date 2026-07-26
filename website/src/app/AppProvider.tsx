import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppContext, type AppState, type Theme } from './context';
import type { Locale } from '../i18n/content';

const LOCALE_KEY = 'ados-locale';
const THEME_KEY = 'ados-theme';

function initialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored === 'en' || stored === 'tr') return stored;
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

function initialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);
  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleLocale = useCallback(() => setLocaleState((prev) => (prev === 'en' ? 'tr' : 'en')), []);
  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo<AppState>(
    () => ({ locale, theme, setLocale, setTheme, toggleLocale, toggleTheme }),
    [locale, theme, setLocale, setTheme, toggleLocale, toggleTheme],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
