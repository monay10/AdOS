import type { Feature } from '../i18n/content';

/** "No data egress" — request → local AI Manager → local model, inside a perimeter. */
export function PerimeterDiagram({ caption }: { caption: string }) {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 420 200" role="img" aria-label={caption} className="diagram__svg">
        <rect x="8" y="8" width="404" height="160" rx="14" className="diagram__perimeter" />
        <text x="20" y="28" className="diagram__perimeter-label">Your network</text>
        <g className="diagram__node">
          <rect x="34" y="72" width="90" height="44" rx="10" />
          <text x="79" y="98">Request</text>
        </g>
        <g className="diagram__node diagram__node--brand">
          <rect x="165" y="72" width="90" height="44" rx="10" />
          <text x="210" y="92">AI Manager</text>
          <text x="210" y="106" className="diagram__sub">local</text>
        </g>
        <g className="diagram__node">
          <rect x="296" y="72" width="90" height="44" rx="10" />
          <text x="341" y="92">Local</text>
          <text x="341" y="106" className="diagram__sub">model</text>
        </g>
        <path d="M124 94 H165" className="diagram__edge" markerEnd="url(#arrow)" />
        <path d="M255 94 H296" className="diagram__edge" markerEnd="url(#arrow)" />
        <line x1="8" y1="184" x2="412" y2="184" className="diagram__cut" />
        <text x="210" y="196" className="diagram__cut-label">Nothing crosses the line</text>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M1 1 L6 4 L1 7" className="diagram__arrow" />
          </marker>
        </defs>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** The mission pipeline: five stages with approval gates between them. */
export function PipelineDiagram({ steps, approvalNote }: { steps: Feature[]; approvalNote: string }) {
  return (
    <figure className="pipeline">
      <ol className="pipeline__list">
        {steps.map((step, i) => (
          <li className="pipeline__step" key={step.title}>
            <span className="pipeline__num" aria-hidden="true">{i + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            {i < steps.length - 1 ? <span className="pipeline__gate" aria-hidden="true">✓</span> : null}
          </li>
        ))}
      </ol>
      <figcaption>{approvalNote}</figcaption>
    </figure>
  );
}
