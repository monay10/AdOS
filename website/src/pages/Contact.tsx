import { useState, type FormEvent } from 'react';
import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section } from '../components/ui';

export function Contact() {
  const t = useT();
  useMeta(t.meta.contact.title, t.meta.contact.description);
  const c = t.contact;
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    // Static site: no backend. Acknowledge locally.
    setSent(true);
  }

  return (
    <Section>
      <Container>
        <div className="form-page">
          <header className="section-header">
            <h1>{c.h1}</h1>
            <p className="lead">{c.subhero}</p>
            <p className="muted">{c.response}</p>
          </header>

          {sent ? (
            <div className="form-success" role="status">
              <h2>{t.demo.successTitle}</h2>
              <p>{c.response}</p>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit} noValidate>
              <label className="field">
                <span>{c.fields.name}</span>
                <input name="name" type="text" required autoComplete="name" />
              </label>
              <label className="field">
                <span>{c.fields.email}</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label className="field">
                <span>{c.fields.company}</span>
                <input name="company" type="text" required autoComplete="organization" />
              </label>
              <label className="field">
                <span>{c.fields.message}</span>
                <textarea name="message" rows={4} required />
              </label>
              <button className="btn btn--primary" type="submit">{c.submit}</button>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
