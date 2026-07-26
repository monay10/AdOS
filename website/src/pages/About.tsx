import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Container, Section, SectionHeader } from '../components/ui';
import { Hero, CtaBand } from '../components/blocks';
import { CheckIcon } from '../components/icons';

export function About() {
  const t = useT();
  useMeta(t.meta.about.title, t.meta.about.description);
  const a = t.about;

  return (
    <>
      <Hero
        eyebrow={t.nav.about}
        title={a.h1}
        subhero={a.subhero}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/company/contact', label: t.nav.contact }}
      />

      <Section>
        <Container>
          <p className="lead reveal">{a.mission}</p>
        </Container>
      </Section>

      <Section tint>
        <Container>
          <SectionHeader title={a.principlesTitle} />
          <ul className="principle-list">
            {a.principles.map((pr) => (
              <li className="principle reveal" key={pr}>
                <span className="principle__icon" aria-hidden="true"><CheckIcon /></span>
                <span>{pr}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        title={t.home.ctaTitle}
        body={t.home.ctaBody}
        primary={{ to: '/demo', label: t.cta.bookDemo }}
        secondary={{ to: '/company/contact', label: t.nav.contact }}
      />
    </>
  );
}
