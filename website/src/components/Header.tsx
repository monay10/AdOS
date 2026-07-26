import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../app/context';
import { useT } from '../i18n/useT';
import { APP_URL, DOCS_URL } from '../config';

export function Header() {
  const { locale, theme, toggleLocale, toggleTheme } = useApp();
  const t = useT();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/product', label: t.nav.product },
    { to: '/solutions/local-ai', label: t.nav.localAi },
    { to: '/solutions/on-prem-offline', label: t.nav.onPrem },
    { to: '/security', label: t.nav.security },
    { to: '/pricing', label: t.nav.pricing },
    { to: '/company/about', label: t.nav.company },
  ];

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="site-header__inner">
        <Link className="logo" to="/" aria-label="AdOS — home">
          <span className="logo__mark" aria-hidden="true">▲</span>
          <span className="logo__word">AdOS</span>
        </Link>

        <nav className={open ? 'nav nav--open' : 'nav'} aria-label="Primary">
          <ul className="nav__list">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li>
              <a className="nav__link" href={DOCS_URL} target="_blank" rel="noopener noreferrer">
                {t.nav.docs} ↗
              </a>
            </li>
          </ul>

          <div className="nav__actions">
            <button className="chip" type="button" onClick={toggleLocale} aria-label="Switch language">
              {locale === 'en' ? 'TR' : 'EN'}
            </button>
            <button
              className="chip"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <a className="nav__link nav__signin" href={APP_URL} target="_blank" rel="noopener noreferrer">
              {t.nav.signIn}
            </a>
            <Link className="btn btn--primary" to="/demo">{t.nav.bookDemo}</Link>
          </div>
        </nav>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        </button>
      </div>
    </header>
  );
}
