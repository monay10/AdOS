/**
 * Domain topology generator.
 *
 * Emits a real, buildable workspace package per bounded context. Each package
 * declares its published/consumed event contract as typed constants (a genuine
 * artifact, not a placeholder) and a README documenting its sub-modules and
 * current build status. Domain business logic is implemented in the dedicated
 * per-engine passes (see ROADMAP.md); this establishes the seams so nothing is
 * misrepresented as "done".
 *
 * Run: node scripts/scaffold-domains.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @type {Array<{name:string,title:string,layer:string,book:string,summary:string,modules:string[],publishes:string[],consumes:string[],deps:string[]}>} */
const DOMAINS = [
  {
    name: 'agent-framework',
    title: 'Agent Framework',
    layer: 'Organization / Agents',
    book: 'BOOK 4',
    summary:
      'Enterprise agent substrate. Registry, runtime, lifecycle, state machine, hierarchy (CEO → Manager → Worker), supervision, sandboxing and permissions. Agents submit AITasks to the AI Manager and delegate thinking to the Cognitive Core — never touching an engine directly.',
    modules: [
      'Agent Registry', 'Agent Runtime', 'Agent Lifecycle', 'Agent State Machine',
      'Agent Context', 'Agent Queue', 'Agent Communication', 'Agent Event System',
      'Agent Permissions', 'Agent Sandbox', 'Agent Versioning', 'Agent Health Monitoring',
      'Agent Metrics', 'Agent Retry Policies', 'Agent Scheduler', 'Agent Supervisor',
      'Agent Hierarchy (CEO / Manager / Worker)',
    ],
    publishes: ['agent.registered.v1', 'agent.started.v1', 'agent.completed.v1', 'agent.failed.v1', 'agent.escalated.v1'],
    consumes: ['workflow.*', 'goal.*', 'campaign.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'knowledge-engine',
    title: 'Knowledge Engine',
    layer: 'Cognitive support',
    book: 'BOOK 5',
    summary:
      'Reusable memory + retrieval for every agent (via the AI Manager Memory/Context Managers). Vector DB (LanceDB/FAISS), knowledge graph, document ingestion (PDF/OCR/website), embedding pipeline, semantic search and context ranking, and typed brand/campaign/customer/competitor knowledge.',
    modules: [
      'Vector Database (LanceDB/FAISS)', 'Knowledge Graph', 'Document Parser', 'OCR (Tesseract/PaddleOCR)',
      'Website Parser', 'PDF Reader', 'Embedding Pipeline (BGE-M3/Nomic)', 'Semantic Search',
      'Context Ranking', 'Memory Compression', 'Long/Short Term Memory', 'Document Versioning',
      'Brand / Campaign / Customer / Competitor Knowledge', 'Context Builder',
    ],
    publishes: ['knowledge.ingested.v1', 'knowledge.indexed.v1', 'knowledge.updated.v1'],
    consumes: ['connector.*', 'campaign.*', 'creative.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'workflow-engine',
    title: 'Workflow Engine',
    layer: 'Orchestration',
    book: 'BOOK 6',
    summary:
      'Own DAG-based workflow engine: conditional nodes, loops, timers, triggers, webhook/approval/human-in-the-loop nodes, retry/rollback/compensation (saga), versioning, execution history, debugger, reusable templates and parallel execution over the queue.',
    modules: [
      'Workflow Definition + Versioning', 'Conditional Nodes', 'Loops', 'Triggers', 'Timers',
      'Webhook Nodes', 'Approval Nodes', 'Human-In-The-Loop', 'Retry Nodes', 'Rollback',
      'Compensation (Saga)', 'Parallel Execution', 'Queue Integration', 'Execution History',
      'Workflow Monitoring', 'Workflow Debugger', 'Reusable Templates',
    ],
    publishes: ['workflow.started.v1', 'workflow.step.completed.v1', 'workflow.completed.v1', 'workflow.failed.v1', 'workflow.approval.requested.v1'],
    consumes: ['agent.*', 'goal.*', 'campaign.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'connector-hub',
    title: 'Connector Hub',
    layer: 'Integration (anti-corruption)',
    book: 'BOOK 7',
    summary:
      'Every external platform behind a port + adapter with retries, throttling, rate-limit handling and monitoring. No connector touches business logic; they translate external payloads into domain events. Cloud LLM connectors (OpenAI/Anthropic/Gemini/OpenRouter) are OPTIONAL adapters behind the AI Manager and disabled by default (offline-first).',
    modules: [
      'Google Ads', 'Meta / Facebook / Instagram', 'LinkedIn', 'TikTok', 'Google Analytics',
      'Search Console', 'Google Tag Manager', 'Shopify', 'WooCommerce', 'HubSpot', 'Salesforce',
      'Mailchimp', 'Brevo', 'WhatsApp', 'Slack', 'Discord', 'Stripe',
      'OpenAI / Anthropic / Gemini (optional, off by default)', 'MCP', 'Rate Limiter', 'Retry + Circuit Breaker',
    ],
    publishes: ['connector.synced.v1', 'connector.metric.ingested.v1', 'connector.error.v1', 'connector.ratelimited.v1'],
    consumes: ['campaign.publish.requested.v1', 'creative.published.v1'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'marketing-intelligence',
    title: 'Marketing Intelligence Engine',
    layer: 'Domain',
    book: 'BOOK 8',
    summary:
      'Produces structured, agent-consumable outputs: competitor/SEO/keyword/audience analysis, persona and trend detection, offer/funnel/campaign/budget planning, creative briefs, performance prediction and opportunity detection. All reasoning goes through the Cognitive Core + AI Manager.',
    modules: [
      'Competitor Analysis', 'SEO Analysis', 'Keyword Discovery', 'Audience Discovery', 'Persona Builder',
      'Trend Detection', 'Offer Builder', 'Funnel Builder', 'Campaign Planner', 'Budget Planner',
      'Creative Brief Generator', 'Performance Prediction', 'Opportunity Detection',
    ],
    publishes: ['intel.persona.built.v1', 'intel.opportunity.detected.v1', 'intel.plan.proposed.v1', 'intel.brief.generated.v1'],
    consumes: ['knowledge.*', 'connector.metric.ingested.v1', 'analytics.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'creative-studio',
    title: 'Creative Studio',
    layer: 'Domain',
    book: 'BOOK 9',
    summary:
      'Local generative production: images/video/banners/carousels/logos/brand kits (ComfyUI + FLUX/SD), voice/avatar (Piper/XTTS), and copy (headlines/CTA/blog/email/landing/scripts). Every asset is versioned and A/B-testable; a Creative Review agent scores output via the Evaluation Engine.',
    modules: [
      'Image Generation', 'Video Generation', 'Banner / Carousel Generator', 'Logo / Brand Kit Generator',
      'Voice Generator', 'Avatar Generator', 'Copywriting', 'Landing Page Generator', 'Blog Generator',
      'Email Generator', 'Script Generator', 'Headline / CTA Generator', 'Prompt Optimizer',
      'Creative Review Agent', 'Asset Versioning', 'A/B Variant Management',
    ],
    publishes: ['creative.generated.v1', 'creative.reviewed.v1', 'creative.variant.created.v1', 'creative.published.v1'],
    consumes: ['intel.brief.generated.v1', 'campaign.creative.requested.v1'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'campaign-engine',
    title: 'Campaign Engine',
    layer: 'Domain',
    book: 'BOOK 10',
    summary:
      'Event-driven campaign lifecycle: creation, publishing, scheduling, budget, targeting, A/B testing, creative rotation, keyword/bid optimization, performance monitoring, auto scale/pause/restart, learning, cloning and templates. Every state change is a domain event.',
    modules: [
      'Campaign Creation', 'Campaign Publishing', 'Campaign Scheduling', 'Budget Management',
      'Audience Targeting', 'A/B Testing', 'Creative Rotation', 'Keyword Optimization', 'Bid Optimization',
      'Performance Monitoring', 'Auto Scaling', 'Auto Pausing', 'Auto Restart', 'Campaign Learning',
      'Campaign Cloning', 'Campaign Templates',
    ],
    publishes: ['campaign.created.v1', 'campaign.publish.requested.v1', 'campaign.launched.v1', 'campaign.paused.v1', 'campaign.scaled.v1', 'campaign.creative.requested.v1'],
    consumes: ['analytics.*', 'intel.plan.proposed.v1', 'creative.published.v1', 'connector.synced.v1'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'analytics-engine',
    title: 'Analytics Engine',
    layer: 'Domain',
    book: 'BOOK 11',
    summary:
      'Continuously-updated performance intelligence: ROI/ROAS/CTR/CPA/CAC/LTV, attribution, conversion tracking, dashboards, forecasting, anomaly detection, KPI engine, recommendations and scheduled executive/weekly/daily reports plus realtime monitoring.',
    modules: [
      'ROI / ROAS / CTR / CPA / CAC / LTV', 'Attribution', 'Conversion Tracking', 'Dashboard',
      'Forecasting', 'Anomaly Detection', 'KPI Engine', 'Recommendation Engine',
      'Executive / Weekly / Daily Reports', 'Realtime Monitoring',
    ],
    publishes: ['analytics.kpi.updated.v1', 'analytics.anomaly.detected.v1', 'analytics.report.generated.v1', 'analytics.recommendation.made.v1'],
    consumes: ['connector.metric.ingested.v1', 'campaign.*', 'creative.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'executive-ai',
    title: 'Executive AI',
    layer: 'Organization / Executives',
    book: 'BOOK 12',
    summary:
      'C-suite agents (CEO, CMO, Creative/Sales/Finance/Legal/Support Directors). Each can set goals, delegate, review, approve, monitor KPIs, allocate budget, request reports and command lower agents. The CEO agent coordinates the whole company autonomously via the Cognitive Core.',
    modules: [
      'CEO Agent (coordinator)', 'CMO Agent', 'Creative Director', 'Sales Director',
      'Finance Director', 'Legal Director', 'Support Director',
      'Goal Delegation', 'Output Review + Approval', 'KPI Monitoring', 'Budget Allocation', 'Report Requests',
    ],
    publishes: ['exec.goal.created.v1', 'exec.work.delegated.v1', 'exec.approval.granted.v1', 'exec.budget.allocated.v1', 'exec.report.requested.v1'],
    consumes: ['analytics.*', 'agent.*', 'workflow.approval.requested.v1', 'campaign.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'organization',
    title: 'Organization Layer (Digital Company)',
    layer: 'Organization',
    book: 'BOOK 13',
    summary:
      'The corporate structure: CEO/CMO Offices and Creative, Performance Marketing, Sales, Finance, Legal, Customer Success, HR, PMO, QA and R&D departments. Each department owns managers, specialist agents, KPIs, memory and procedures — turning the agent collection into a real operating company.',
    modules: [
      'CEO Office', 'CMO Office', 'Creative Department', 'Performance Marketing Department',
      'Sales Department', 'Finance Department', 'Legal Department', 'Customer Success Department',
      'HR Department', 'PMO', 'QA Office', 'R&D Office',
    ],
    publishes: ['org.department.spawned.v1', 'org.kpi.assigned.v1', 'org.procedure.updated.v1'],
    consumes: ['exec.*', 'analytics.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'agency-os',
    title: 'Agency Operating System',
    layer: 'Business',
    book: 'BOOK 14',
    summary:
      'The client-facing business layer: CRM, client portal, proposal/contract generation, billing/subscription, customer support/ticketing, knowledge base, project/task management, meeting scheduling, client communication and the executive dashboard. Everything communicates through events.',
    modules: [
      'CRM', 'Client Portal', 'Proposal Generator', 'Contract Generator', 'Billing', 'Subscription',
      'Customer Support', 'Ticketing', 'Knowledge Base', 'Project Management', 'Task Assignment',
      'Meeting Scheduler', 'Client Communication', 'Executive Dashboard',
    ],
    publishes: ['agency.client.onboarded.v1', 'agency.proposal.sent.v1', 'agency.invoice.issued.v1', 'agency.ticket.opened.v1'],
    consumes: ['exec.*', 'analytics.report.generated.v1', 'campaign.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
  {
    name: 'autonomy',
    title: 'Autonomy Layer',
    layer: 'Meta / Self-*',
    book: 'BOOK 15',
    summary:
      'Makes the company self-running: self-optimization/monitoring/healing/documentation/testing/learning, automatic cost + resource scaling, agent evaluation, prompt/workflow/campaign improvement, and automatic executive/monthly/quarterly reviews. Operates without human intervention except final approvals.',
    modules: [
      'Self Optimization', 'Self Monitoring', 'Self Healing', 'Self Documentation', 'Self Testing',
      'Self Learning', 'Automatic Cost Optimization', 'Automatic Resource Scaling', 'Automatic Agent Evaluation',
      'Automatic Prompt Improvement', 'Automatic Workflow Improvement', 'Automatic Campaign Optimization',
      'Automatic Executive Reporting', 'Automatic Monthly / Quarterly Reviews',
    ],
    publishes: ['autonomy.optimization.applied.v1', 'autonomy.healing.performed.v1', 'autonomy.review.completed.v1', 'autonomy.approval.requested.v1'],
    consumes: ['analytics.*', 'agent.*', 'workflow.*', 'campaign.*', 'exec.*'],
    deps: ['@ados/kernel', '@ados/contracts', '@ados/event-bus', '@ados/tenancy'],
  },
];

const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
const constName = (evt) => evt.toUpperCase().replace(/[^A-Z0-9]+/g, '_');

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

for (const d of DOMAINS) {
  const base = join(ROOT, 'domains', d.name);

  write(
    join(base, 'package.json'),
    JSON.stringify(
      {
        name: `@ados/${d.name}`,
        version: '0.1.0',
        type: 'module',
        main: './dist/index.js',
        types: './dist/index.d.ts',
        exports: { '.': { types: './dist/index.d.ts', default: './dist/index.js' } },
        scripts: {
          build: 'tsc -p tsconfig.json',
          typecheck: 'tsc -p tsconfig.json --noEmit',
          test: 'vitest run',
          clean: 'rm -rf dist .turbo *.tsbuildinfo',
        },
        dependencies: Object.fromEntries(d.deps.map((p) => [p, 'workspace:*'])),
        devDependencies: { typescript: '^5.6.0', vitest: '^2.1.0' },
      },
      null,
      2,
    ) + '\n',
  );

  write(
    join(base, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: { rootDir: 'src', outDir: 'dist' },
        references: [
          { path: '../../packages/kernel' },
          { path: '../../packages/contracts' },
          { path: '../../packages/event-bus' },
          { path: '../../packages/tenancy' },
        ],
        include: ['src/**/*'],
        exclude: ['dist', 'node_modules', '**/*.test.ts'],
      },
      null,
      2,
    ) + '\n',
  );

  const pub = d.publishes.map((e) => `  ${constName(e)}: '${e}',`).join('\n');
  const con = d.consumes.map((e) => `  '${e}',`).join('\n');
  write(
    join(base, 'src', 'events.ts'),
    `/**
 * ${d.title} — event contract.
 *
 * This context integrates with the rest of AdOS EXCLUSIVELY through these
 * events (event-driven mandate). It never imports another context's code.
 */

/** Events this context publishes to the bus. */
export const ${slug(d.name).replace(/-/g, '_').toUpperCase()}_EVENTS = {
${pub}
} as const;

/** Event patterns this context subscribes to. */
export const ${slug(d.name).replace(/-/g, '_').toUpperCase()}_SUBSCRIPTIONS = [
${con}
] as const;
`,
  );

  write(
    join(base, 'src', 'index.ts'),
    `export * from './events.js';\n`,
  );

  write(
    join(base, 'README.md'),
    `# ${d.title}

> **Layer:** ${d.layer} · **Build:** ${d.book} · **Status:** 🟡 scaffolded (event contract defined, business logic pending — see \`/ROADMAP.md\`)

${d.summary}

## Sub-modules
${d.modules.map((m) => `- ${m}`).join('\n')}

## Published events
${d.publishes.map((e) => `- \`${e}\``).join('\n')}

## Consumed events
${d.consumes.map((e) => `- \`${e}\``).join('\n')}

## Architectural rules
- Hexagonal: business logic depends only on ports; adapters live at the edges.
- No direct inference: all AI work goes through the **AI Manager**; all reasoning through the **Cognitive Core**.
- Multi-tenant: every operation runs inside a bound \`TenantContext\`.
- Event-driven: cross-context integration happens only via the events above.
`,
  );
}

console.log(`Scaffolded ${DOMAINS.length} domain packages under domains/.`);
