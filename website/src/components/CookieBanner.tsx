import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../app/context';
import { useT } from '../i18n/useT';

const CONSENT_KEY = 'ados-consent';

export function CookieBanner() {
  const { locale } = useApp();
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(CONSENT_KEY) === null);
  }, []);

  function decide(choice: 'all' | 'necessary'): void {
    localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
  }

  if (!visible) return null;

  const copy = locale === 'tr'
    ? { title: 'Seçimlerinize saygı duyarız.', body: 'Siz daha fazlasına izin vermedikçe yalnızca gerekli çerezleri kullanırız.', accept: 'Tümünü kabul et', reject: 'Gerekli olmayanları reddet' }
    : { title: 'We respect your choices.', body: 'We use only necessary cookies unless you allow more.', accept: 'Accept all', reject: 'Reject non-essential' };

  return (
    <div className="cookie" role="dialog" aria-label={copy.title}>
      <div className="cookie__text">
        <strong>{copy.title}</strong>
        <span className="muted"> {copy.body} </span>
        <Link to="/legal/cookies">{t.footer.cookiePrefs}</Link>
      </div>
      <div className="cookie__actions">
        <button className="btn btn--secondary" type="button" onClick={() => decide('necessary')}>{copy.reject}</button>
        <button className="btn btn--primary" type="button" onClick={() => decide('all')}>{copy.accept}</button>
      </div>
    </div>
  );
}
