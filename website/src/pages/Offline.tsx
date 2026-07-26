import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section } from '../components/ui';
import { Hero, CtaBand, FeatureGrid } from '../components/blocks';

export function Offline() {
  const t = useT();
  useMeta(t.meta.offline.title, t.meta.offline.description);
  const o = t.offline;

  return (
    <>
      <Hero
        eyebrow={t.nav.offline}
        title={o.h1}
        subhero={o.subhero}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/solutions/on-prem-offline', label: t.nav.onPrem }}
      />

      <Section>
        <Container>
          <FeatureGrid items={o.features} />
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
