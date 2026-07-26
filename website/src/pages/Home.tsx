import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Button, Card, Container, Section, SectionHeader } from '../components/ui';
import { Hero, CtaBand, Faq } from '../components/blocks';
import { PerimeterDiagram, PipelineDiagram } from '../components/Diagrams';
import { ShieldIcon, LockIcon, ServerIcon, NodesIcon, GlobeOffIcon } from '../components/icons';

export function Home() {
  const t = useT();
  useMeta(t.meta.home.title, t.meta.home.description);
  const h = t.home;
  const cardIcons = [<ShieldIcon key="s" />, <LockIcon key="l" />, <ServerIcon key="v" />];
  const useIcons = [<ShieldIcon key="s" />, <NodesIcon key="n" />, <ServerIcon key="v" />];

  return (
    <>
      <Hero
        eyebrow={h.eyebrow}
        title={h.headline}
        subhero={h.subhero}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/product', label: t.cta.howItWorks }}
        visual={<PerimeterDiagram caption={h.sovCaption} />}
      />

      <div className="trust-strip">
        <Container wide>
          <p className="trust-strip__line">{h.trustStrip}</p>
          <p className="trust-strip__logos">
            <span className="muted">{h.localBody ? h.logoLabel : ''}</span>
            {t.local.engines.map((e) => (
              <span className="logo-pill" key={e}>{e}</span>
            ))}
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="split reveal">
            <div>
              <SectionHeader title={h.problemTitle} />
              <p className="lead">{h.problemBody}</p>
            </div>
            <div aria-hidden="true" className="glyph-block"><GlobeOffIcon /></div>
          </div>
        </Container>
      </Section>

      <Section tint id="how">
        <Container>
          <SectionHeader eyebrow={t.nav.product} title={h.pipelineTitle} intro={h.pipelineBody} centered />
          <div className="reveal">
            <PipelineDiagram steps={h.pipelineSteps} approvalNote={h.approvalNote} />
          </div>
        </Container>
      </Section>

      <Section id="sovereignty">
        <Container>
          <div className="split reveal">
            <div>
              <SectionHeader title={h.sovTitle} />
              <p className="lead">{h.sovBody}</p>
            </div>
            <PerimeterDiagram caption={h.sovCaption} />
          </div>
        </Container>
      </Section>

      <Section tint>
        <Container>
          <SectionHeader title={h.secTitle} centered />
          <div className="feature-grid">
            {h.secCards.map((c, i) => (
              <div className="reveal" key={c}>
                <Card icon={cardIcons[i]}>{c}</Card>
              </div>
            ))}
          </div>
          <div className="center">
            <Button variant="secondary" to="/security">{t.cta.exploreSecurity}</Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="split reveal">
            <div>
              <SectionHeader eyebrow={t.nav.localAi} title={h.localTitle} />
              <p className="lead">{h.localBody}</p>
              <Button variant="secondary" to="/solutions/local-ai">{t.nav.localAi}</Button>
            </div>
            <div className="logo-wall" aria-label={h.logoLabel}>
              {t.local.engines.map((e) => (
                <span className="logo-pill logo-pill--lg" key={e}>{e}</span>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section tint>
        <Container>
          <SectionHeader title={h.useTitle} centered />
          <div className="feature-grid">
            {h.useCards.map((c, i) => (
              <div className="reveal" key={c.title}>
                <Card title={c.title} icon={useIcons[i]}>{c.body}</Card>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <p className="bilingual-note reveal">{h.bilingual}</p>
        </Container>
      </Section>

      <Faq title={t.faq.title} items={t.faq.items} />

      <CtaBand
        title={h.ctaTitle}
        body={h.ctaBody}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/pricing', label: t.cta.talkToSales }}
      />
    </>
  );
}
