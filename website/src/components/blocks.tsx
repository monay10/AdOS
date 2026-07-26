import type { ReactNode } from 'react';
import { Button, Container, Section, Eyebrow } from './ui';
import type { FaqItem, Feature } from '../i18n/content';

export function Hero({
  eyebrow,
  title,
  subhero,
  primary,
  secondary,
  visual,
}: {
  eyebrow: string;
  title: string;
  subhero: string;
  primary: { to: string; label: string };
  secondary?: { to: string; label: string };
  visual?: ReactNode;
}) {
  return (
    <section className="hero" aria-label={title}>
      <Container wide>
        <div className={visual ? 'hero__grid' : 'hero__grid hero__grid--single'}>
          <div className="hero__text">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1>{title}</h1>
            <p className="lead">{subhero}</p>
            <div className="hero__cta">
              <Button variant="primary" to={primary.to}>{primary.label}</Button>
              {secondary ? <Button variant="secondary" to={secondary.to}>{secondary.label}</Button> : null}
            </div>
          </div>
          {visual ? <div className="hero__visual">{visual}</div> : null}
        </div>
      </Container>
    </section>
  );
}

export function CtaBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { to: string; label: string };
  secondary?: { to: string; label: string };
}) {
  return (
    <Section tint ariaLabel={title}>
      <Container>
        <div className="cta-band reveal">
          <div>
            <h2>{title}</h2>
            <p className="lead">{body}</p>
          </div>
          <div className="cta-band__actions">
            <Button variant="primary" to={primary.to}>{primary.label}</Button>
            {secondary ? <Button variant="secondary" to={secondary.to}>{secondary.label}</Button> : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <div className="feature-grid">
      {items.map((f) => (
        <article className="card reveal" key={f.title}>
          <h3>{f.title}</h3>
          <p>{f.body}</p>
        </article>
      ))}
    </div>
  );
}

export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <Section id="faq" ariaLabel={title}>
      <Container>
        <h2 className="section-header">{title}</h2>
        <div className="faq">
          {items.map((item) => (
            <details className="faq__item reveal" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
