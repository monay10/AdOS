# Prompt Registry

> **Layer:** Cross-cutting bounded context (used by the AI Manager) · **Build:** BOOK 2 support · **Status:** ✅ in-memory adapter built (+ tests)

Prompts are **never hardcoded**. They live here as versioned, scored templates so
that versions can be A/B tested and the winner is chosen from real outcomes.

```
creative.image  v14  score 91   ◄── active (A/B winner)
creative.image  v27  score 20
```

## Port
Implements `PromptRegistryPort` from `@ados/contracts`:
- `publish` a new version · `list` all versions · `get` (active = highest score, else latest)
- `render(key, variables)` → `AIMessage[]` with `{{var}}` interpolation
- `score(key, version, reward)` → EMA-updated score that drives the active selection

## Published events
`prompt.published.v1` · `prompt.activated.v1` · `prompt.scored.v1`

## Consumed events
`analytics.*` (performance outcomes feed scoring) · `creative.reviewed.v1`

## Why a separate context
Prompt A/B testing, versioning and scoring are a first-class concern with their
own lifecycle — decoupling them from the AI Manager lets prompts evolve (and be
governed by the COS) without touching inference code.
