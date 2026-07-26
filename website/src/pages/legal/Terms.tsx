import { useMeta } from '../../hooks/useMeta';
import { useT } from '../../i18n/useT';
import { Section } from '../../components/ui';

export function Terms() {
  const t = useT();
  useMeta(t.meta.terms.title, t.meta.terms.description);
  const tm = t.legal.terms;

  return (
    <Section>
      <div className="container container--prose prose">
        <h1>{tm.h1}</h1>
        <p className="lead">{tm.summary}</p>
        {tm.sections.map((s) => (
          <div key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
        <p className="muted">{tm.updated}</p>
      </div>
    </Section>
  );
}
