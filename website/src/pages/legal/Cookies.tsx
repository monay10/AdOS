import { useMeta } from '../../hooks/useMeta';
import { useT } from '../../i18n/useT';
import { Section } from '../../components/ui';

export function Cookies() {
  const t = useT();
  useMeta(t.meta.cookies.title, t.meta.cookies.description);
  const c = t.legal.cookies;

  return (
    <Section>
      <div className="container container--prose prose">
        <h1>{c.h1}</h1>
        <p className="lead">{c.summary}</p>
        {c.categories.map((cat) => (
          <div key={cat.title}>
            <h2>{cat.title}</h2>
            <p>{cat.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
