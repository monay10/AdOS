import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section } from '../components/ui';
import { Hero, CtaBand, FeatureGrid } from '../components/blocks';
import { PerimeterDiagram } from '../components/Diagrams';

export function LocalAI() {
  const t = useT();
  useMeta(t.meta.local.title, t.meta.local.description);
  const l = t.local;

  return (
    <>
      <Hero
        eyebrow={t.nav.localAi}
        title={l.h1}
        subhero={l.subhero}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/security', label: t.cta.exploreSecurity }}
        visual={<PerimeterDiagram caption={t.home.sovCaption} />}
      />

      <Section>
        <Container>
          <div className="logo-wall reveal" aria-label={t.home.logoLabel}>
            {l.engines.map((e) => (
              <span className="logo-pill logo-pill--lg" key={e}>{e}</span>
            ))}
          </div>
        </Container>
      </Section>

      <Section tint>
        <Container>
          <FeatureGrid items={l.features} />
          <p className="note reveal">{l.note}</p>
        </Container>
      </Section>

      <CtaBand
        title={t.home.ctaTitle}
        body={t.home.ctaBody}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/solutions/on-prem-offline', label: t.nav.onPrem }}
      />
    </>
  );
}
