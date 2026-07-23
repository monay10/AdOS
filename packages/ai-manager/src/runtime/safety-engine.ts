import type { AITaskRequest, CompanyBrainPort } from '@ados/contracts';
import type { SafetyEnginePort, SafetyVerdict } from '../ports.js';

type Issue = SafetyVerdict['issues'][number];

const PATTERNS = {
  email: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,
  phone: /(?:\+?\d[\s-]?){9,15}/g,
  creditCard: /\b(?:\d[ -]?){13,16}\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g,
  secret: /\b(?:sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._-]{20,})\b/g,
  passwordAssign: /\b(?:password|passwd|api[_-]?key|secret)\s*[:=]\s*\S+/gi,
};

const INJECTION_PHRASES = [
  'ignore previous instructions',
  'ignore all previous',
  'disregard the above',
  'disregard previous',
  'reveal your system prompt',
  'you are now',
  'act as if',
  'developer mode',
];

/**
 * Safety Engine — baseline, offline, deterministic checks run before an AI task
 * executes (input) and after it returns (output). Detects prompt injection and
 * leaked secrets on input; PII, secrets and brand-forbidden words on output.
 * A brand check uses the Company Brain when a brandId is supplied.
 */
export class RegexSafetyEngine implements SafetyEnginePort {
  constructor(private readonly brain?: CompanyBrainPort) {}

  async inspectInput(request: AITaskRequest): Promise<SafetyVerdict> {
    const text = collectText(request);
    const issues: Issue[] = [];
    for (const phrase of INJECTION_PHRASES) {
      if (text.toLowerCase().includes(phrase)) {
        issues.push({ kind: 'prompt_injection', detail: `matched phrase: "${phrase}"` });
      }
    }
    scan(text, 'secret', PATTERNS.secret, issues);
    scan(text, 'secret', PATTERNS.passwordAssign, issues);
    return verdict(issues);
  }

  async inspectOutput(output: unknown, request: AITaskRequest): Promise<SafetyVerdict> {
    const text = typeof output === 'string' ? output : JSON.stringify(output ?? '');
    const issues: Issue[] = [];
    scan(text, 'pii', PATTERNS.email, issues);
    scan(text, 'pii', PATTERNS.phone, issues);
    scan(text, 'pii', PATTERNS.creditCard, issues);
    scan(text, 'pii', PATTERNS.iban, issues);
    scan(text, 'secret', PATTERNS.secret, issues);

    const brandId = (request.input?.['brandId'] ?? request.variables?.['brandId']) as string | undefined;
    if (this.brain && brandId) {
      const brand = await this.brain.brand(brandId);
      const lower = text.toLowerCase();
      for (const word of brand?.forbiddenWords ?? []) {
        if (lower.includes(word.toLowerCase())) issues.push({ kind: 'permission', detail: `brand-forbidden word: "${word}"` });
      }
    }
    return verdict(issues);
  }
}

function collectText(request: AITaskRequest): string {
  const parts: string[] = [];
  for (const m of request.messages ?? []) parts.push(m.content);
  if (request.variables) parts.push(JSON.stringify(request.variables));
  if (request.input) parts.push(JSON.stringify(request.input));
  return parts.join('\n');
}

function scan(text: string, kind: Issue['kind'], pattern: RegExp, issues: Issue[]): void {
  const matches = text.match(pattern);
  if (matches) {
    for (const m of matches.slice(0, 5)) issues.push({ kind, detail: redact(m) });
  }
}

/** Show only enough to identify the hit; never echo the full secret/PII back. */
function redact(s: string): string {
  const t = s.trim();
  return t.length <= 6 ? '***' : `${t.slice(0, 3)}***${t.slice(-2)}`;
}

function verdict(issues: Issue[]): SafetyVerdict {
  return { safe: issues.length === 0, issues };
}
