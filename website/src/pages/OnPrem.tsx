import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section } from '../components/ui';
import { Hero, CtaBand, FeatureGrid } from '../components/blocks';

export function OnPrem() {
  const t = useT();
  useMeta(t.meta.onprem.title, t.meta.onprem.description);
  const o = t.onprem;

  return (
    <>
      <Hero
        eyebrow={t.nav.onPrem}
        title={o.h1}
        subhero={o.subhero}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/pricing', label: t.cta.talkToSales }}
      />

      <Section>
        <Container>
          <FeatureGrid items={o.features} />
          <p className="note reveal">{o.requirements}</p>
        </Container>
      </Section>

      <Section tint>
        <Container>
          <div className="split reveal">
            <div>
              <h2>{t.offline.h1}</h2>
              <p className="lead">{t.offline.subhero}</p>
            </div>
            <FeatureGrid items={t.offline.features} />
          </div>
        </Container>
      </Section>

      <CtaBand
        title={t.home.ctaTitle}
        body={t.home.ctaBody}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/security', label: t.cta.exploreSecurity }}
      />
    </>
  );
}
