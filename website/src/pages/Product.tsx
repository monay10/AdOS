import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section } from '../components/ui';
import { Hero, CtaBand, FeatureGrid } from '../components/blocks';
import { PipelineDiagram } from '../components/Diagrams';

export function Product() {
  const t = useT();
  useMeta(t.meta.product.title, t.meta.product.description);
  const p = t.product;

  return (
    <>
      <Hero
        eyebrow={t.nav.product}
        title={p.h1}
        subhero={p.subhero}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/security', label: t.cta.exploreSecurity }}
      />

      <Section>
        <Container>
          <FeatureGrid items={p.features} />
        </Container>
      </Section>

      <Section tint>
        <Container>
          <div className="reveal">
            <PipelineDiagram steps={t.home.pipelineSteps} approvalNote={t.home.approvalNote} />
          </div>
        </Container>
      </Section>

      <CtaBand
        title={t.home.ctaTitle}
        body={t.home.ctaBody}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/pricing', label: t.cta.talkToSales }}
      />
    </>
  );
}
