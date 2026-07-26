import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section, SectionHeader } from '../components/ui';
import { Hero, CtaBand, FeatureGrid } from '../components/blocks';

export function Security() {
  const t = useT();
  useMeta(t.meta.security.title, t.meta.security.description);
  const s = t.security;

  return (
    <>
      <Hero
        eyebrow={t.nav.security}
        title={s.h1}
        subhero={s.subhero}
        primary={{ to: '/demo', label: t.cta.securityBriefing }}
        secondary={{ to: '/solutions/local-ai', label: t.nav.localAi }}
      />

      <Section>
        <Container>
          <FeatureGrid items={s.controls} />
        </Container>
      </Section>

      <Section tint>
        <Container>
          <SectionHeader title={t.footer.cols.legal} />
          <p className="lead reveal">{s.compliance}</p>
        </Container>
      </Section>

      <CtaBand
        title={t.home.ctaTitle}
        body={t.home.ctaBody}
        primary={{ to: '/demo', label: t.cta.securityBriefing }}
        secondary={{ to: '/pricing', label: t.cta.talkToSales }}
      />
    </>
  );
}
