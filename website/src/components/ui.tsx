import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Container({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? 'container container--wide' : 'container'}>{children}</div>;
}

export function Section({
  children,
  tint,
  id,
  ariaLabel,
}: {
  children: ReactNode;
  tint?: boolean;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section className={tint ? 'section section--tint' : 'section'} id={id} aria-label={ariaLabel}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  centered,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  centered?: boolean;
}) {
  return (
    <header className={centered ? 'section-header section-header--center' : 'section-header'}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2>{title}</h2>
      {intro ? <p className="lead">{intro}</p> : null}
    </header>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps {
  variant?: ButtonVariant;
  to?: string;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  children: ReactNode;
  block?: boolean;
}

export function Button({ variant = 'primary', to, href, type = 'button', onClick, children, block }: ButtonProps) {
  const cls = `btn btn--${variant}${block ? ' btn--block' : ''}`;
  if (to) {
    return (
      <Link className={cls} to={to} onClick={onClick}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button className={cls} type={type} onClick={onClick}>
      {children}
    </button>
  );
}

export function Card({
  title,
  children,
  icon,
}: {
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <article className="card">
      {icon ? <div className="card__icon" aria-hidden="true">{icon}</div> : null}
      {title ? <h3>{title}</h3> : null}
      <p>{children}</p>
    </article>
  );
}
