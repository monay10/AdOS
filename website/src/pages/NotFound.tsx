import { useMeta } from '../hooks/useMeta';
import { useT } from '../i18n/useT';
import { Button, Container, Section } from '../components/ui';

export function NotFound() {
  const t = useT();
  useMeta(t.meta.notFound.title, t.meta.notFound.description);

  return (
    <Section>
      <Container>
        <div className="notfound">
          <p className="eyebrow">404</p>
          <h1>{t.notFound.title}</h1>
          <p className="lead">{t.notFound.body}</p>
          <div className="hero__cta">
            <Button variant="primary" to="/">{t.cta.backHome}</Button>
            <Button variant="secondary" to="/demo">{t.cta.bookDemo}</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
