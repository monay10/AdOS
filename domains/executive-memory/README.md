# Executive Memory System (EMS)

> **Layer:** Executive cognition (between Company Brain and Cognitive Core) · **Build:** BOOK 2.7 · **Status:** ✅ real in-memory adapters built (+ tests)

The layer that separates AdOS from AutoGPT / CrewAI / LangGraph. Company Brain
holds what the **company** knows; EMS holds what each **executive** knows — and
enforces that no AI output becomes an action without evidence, confidence, and
constitutional compliance.

## Components (all real, tested)
- **Executive Memory** — private per-role memory (CEO, CMO, COO, Creative/Sales/Finance/Legal Directors, PMO). The CMO's winning campaigns are never visible to the CEO's risk log. Recall ranks by importance + relevance.
- **Decision Journal** — every executive decision with evidence, alternatives, chosen/rejected, confidence, and outcome. Feeds the Learning Engine; makes the company auditable.
- **Evidence Engine** — grounds every claim in the Company Brain (marketing insight, proven patterns, similar experiences). No decision is ever "the LLM said so".
- **Confidence Engine** — never "I think": always `94% — based on 382 campaigns, ROAS 5.8, success rate 91%`.
- **AI Constitution Checker** — the mandatory gate before any action: checks evidence present, confidence ≥ threshold, Company DNA + brand forbidden-words, risk appetite, and approval gates. Fails → the task is rejected.
- **Executive Context Builder** — assembles context in the mandated order: `Prompt → Mission → Company Brain → Executive Memory → Decision Memory → Experience Engine → Prompt Registry → AI Manager`.
- **Board Meeting Engine** — automated weekly board meeting → consolidated minutes + owned action items (a corporate meeting, not agent chat).

## The Reflection Loop
```
Campaign completed → Analytics → Decision → Executive Reflection
  → CMO Memory updated → CEO Dashboard updated → CompanyBrain.enrich()
```

## Published / consumed events
Publishes `exec.memory.updated.v1` · `exec.decision.journaled.v1` ·
`exec.constitution.rejected.v1` · `exec.board.minutes.v1`.
Consumes `campaign.*` · `analytics.*` · `cos.decision.logged.v1` · `mission.*`.
