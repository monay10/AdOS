import { useMeta } from '../../hooks/useMeta';
import { useT } from '../../i18n/useT';
import { Section } from '../../components/ui';

export function Privacy() {
  const t = useT();
  useMeta(t.meta.privacy.title, t.meta.privacy.description);
  const p = t.legal.privacy;

  return (
    <Section>
      <div className="container container--prose prose">
        <h1>{p.h1}</h1>
        <p className="lead">{p.summary}</p>
        {p.sections.map((s) => (
          <div key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
        <p className="muted">{p.updated}</p>
      </div>
    </Section>
  );
}
