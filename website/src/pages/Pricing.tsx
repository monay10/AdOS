import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Button, Container, Section } from '../components/ui';
import { Hero } from '../components/blocks';

export function Pricing() {
  const t = useT();
  useMeta(t.meta.pricing.title, t.meta.pricing.description);
  const p = t.pricing;

  return (
    <>
      <Hero
        eyebrow={t.nav.pricing}
        title={p.h1}
        subhero={p.subhero}
        primary={{ to: '/company/contact', label: t.cta.talkToSales }}
      />

      <Section>
        <Container>
          <div className="pricing-grid">
            {p.tiers.map((tier) => (
              <article className="card pricing-card reveal" key={tier.title}>
                <h3>{tier.title}</h3>
                <p className="pricing-card__price">{p.custom}</p>
                <p>{tier.body}</p>
                <Button variant="secondary" to="/company/contact" block>{t.cta.talkToSales}</Button>
              </article>
            ))}
          </div>
          <p className="note reveal">{p.note}</p>
        </Container>
      </Section>
    </>
  );
}
