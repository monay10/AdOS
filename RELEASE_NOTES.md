# AdOS 1.0.0-rc1 — Release Notes

**Release candidate 1 · 2026-07-26**

AdOS is an offline-first, multi-tenant AI advertising platform. A user states a
business objective as a *Mission*; the AI company plans and runs it end to end —
marketing brief → creative → campaign → analytics → executive dashboard →
compounding learning — with a human approval gate at every stage.

## Highlights in this candidate

- **Runs entirely on your own hardware.** The AI Manager talks only to a local
  inference engine (Ollama/vLLM/LM Studio/llama.cpp/SGLang). No cloud calls, no
  API keys. Ships with a deterministic offline manager so it also runs with no
  model server at all.
- **Turkish & English out of the box.** UI and generated content auto-detect the
  browser/OS language. Nothing to configure.
- **Production-hardened.** Durable storage, workers, encrypted backups, config
  profiles, Docker, monitoring, security headers + brute-force protection, and a
  measured disaster-recovery path — each added without touching business logic.

## Quality

- Web app: **111/111 tests**. Full monorepo: **70/70 build + test tasks** green.
- Five end-to-end acceptance workflows + cross-cutting guarantees, all
  CI-enforced (see `ACCEPTANCE_REPORT.md`).

## Getting started

See `INSTALLATION_GUIDE.md`. TL;DR for local dev:

```bash
pnpm install
pnpm turbo run build --filter=@ados/web
PORT=4000 AUTH_SECURE_COOKIES=false node apps/web/dist/main.js
# → http://localhost:4000  (log in with any email + a company name)
```

To use a real local model instead of the offline stub:

```bash
# with Ollama running and a model pulled (e.g. `ollama pull qwen2.5:7b`)
AI_ENGINE=ollama AI_MODEL=qwen2.5:7b node apps/web/dist/main.js
```

## Known limitations

See `KNOWN_LIMITATIONS.md`. In short: local 7B models are slow on CPU and can mix
languages in long free-form fields; Postgres/MinIO adapters are contract- and
type-verified rather than exercised against live servers in CI.

## Upgrade

This is the first tagged release. Future upgrades: see `UPGRADE_GUIDE.md`.
