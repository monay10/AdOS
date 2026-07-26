import { Link } from 'react-router-dom';
import { useT } from '../i18n/useT';
import { DOCS_URL } from '../config';

export function Footer() {
  const t = useT();
  const year = 2026;

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link className="logo" to="/" aria-label="AdOS — home">
            <span className="logo__mark" aria-hidden="true">▲</span>
            <span className="logo__word">AdOS</span>
          </Link>
          <p className="muted">{t.footer.positioning}</p>
        </div>

        <nav className="site-footer__col" aria-label={t.footer.cols.product}>
          <h4>{t.footer.cols.product}</h4>
          <Link to="/product">{t.nav.product}</Link>
          <Link to="/security">{t.nav.security}</Link>
          <Link to="/pricing">{t.nav.pricing}</Link>
        </nav>

        <nav className="site-footer__col" aria-label={t.footer.cols.solutions}>
          <h4>{t.footer.cols.solutions}</h4>
          <Link to="/solutions/local-ai">{t.nav.localAi}</Link>
          <Link to="/solutions/on-prem-offline">{t.nav.onPrem}</Link>
          <Link to="/solutions/offline">{t.nav.offline}</Link>
        </nav>

        <nav className="site-footer__col" aria-label={t.footer.cols.company}>
          <h4>{t.footer.cols.company}</h4>
          <Link to="/company/about">{t.nav.about}</Link>
          <Link to="/company/contact">{t.nav.contact}</Link>
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">{t.nav.docs} ↗</a>
        </nav>

        <nav className="site-footer__col" aria-label={t.footer.cols.legal}>
          <h4>{t.footer.cols.legal}</h4>
          <Link to="/legal/privacy">{t.legal.privacy.h1}</Link>
          <Link to="/legal/cookies">{t.legal.cookies.h1}</Link>
          <Link to="/legal/terms">{t.legal.terms.h1}</Link>
        </nav>
      </div>

      <div className="container site-footer__bar">
        <span className="muted">© {year} {t.footer.entity} {t.footer.copyright}</span>
        <span className="muted">{t.footer.security}</span>
      </div>
    </footer>
  );
}
