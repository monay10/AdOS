import { useState, type FormEvent } from 'react';
import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section } from '../components/ui';

export function Demo() {
  const t = useT();
  useMeta(t.meta.demo.title, t.meta.demo.description);
  const d = t.demo;
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
            <h1>{d.h1}</h1>
            <p className="lead">{d.subhero}</p>
          </header>

          {sent ? (
            <div className="form-success" role="status">
              <h2>{d.successTitle}</h2>
              <p>{d.successBody}</p>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit} noValidate>
              <label className="field">
                <span>{d.fields.email}</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <label className="field">
                <span>{d.fields.name}</span>
                <input name="name" type="text" required autoComplete="name" />
              </label>
              <label className="field">
                <span>{d.fields.company}</span>
                <input name="company" type="text" required autoComplete="organization" />
              </label>
              <label className="field">
                <span>{d.fields.role}</span>
                <input name="role" type="text" autoComplete="organization-title" />
              </label>
              <label className="field">
                <span>{d.fields.size}</span>
                <input name="size" type="text" />
              </label>
              <label className="field">
                <span>{d.fields.country}</span>
                <input name="country" type="text" autoComplete="country-name" />
              </label>
              <label className="field field--full">
                <span>{d.fields.goal}</span>
                <textarea name="goal" rows={3} />
              </label>
              <label className="field field--full checkbox">
                <input name="consent" type="checkbox" required />
                <span>{d.fields.consent}</span>
              </label>
              <button className="btn btn--primary" type="submit">{d.submit}</button>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}
