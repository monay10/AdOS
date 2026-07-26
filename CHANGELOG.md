# Changelog

All notable changes to AdOS. Format follows [Keep a Changelog](https://keepachangelog.com/);
this project uses semantic versioning.

## [1.0.0-rc1] — 2026-07-26

First release candidate. The offline-first AI advertising platform is
feature-complete and production-hardened; every workflow is covered by
CI-enforced tests.

### Added — product
- **Real local AI Manager.** `LiveAIManager` drives a 100% local inference
  engine (Ollama by default; any OpenAI-compatible local server — vLLM, LM
  Studio, llama.cpp, SGLang) behind the existing `AIManagerPort`. No cloud, no
  API key. Selected by `AI_ENGINE`; the deterministic `OfflineAIManager` remains
  the default so tests and no-server dev are unchanged.
- **Bilingual platform (TR/EN).** The entire UI, generated content, form
  placeholders and AI output follow the visitor's browser/OS language
  (`Accept-Language`) — Turkish or English — via an ambient request locale and a
  keyed i18n dictionary. English remains the default.

### Added — infrastructure (Items 3–12)
- Production file storage (streaming, size-guarded), durable background workers
  (guarded atomic claim, lease-expiry recovery, idempotency, DLQ, backoff),
  encrypted backup/restore (AES-256-GCM + gzip + SHA-256, incremental chains),
  production configuration profiles, Docker deployment, monitoring &
  observability (pino, `/metrics`, tracing), performance & load optimization
  (statement cache, pool sizing), security hardening (CSP/headers, brute-force +
  rate limiting), disaster recovery (RTO/RPO), and production acceptance.

### Changed
- SQLite adapter caches prepared statements (~1.27× on repeated queries);
  Postgres pool is sized/tunable (`DATABASE_MAX_CONNECTIONS`, default 20).

### Notes
- **No business behavior changed** across any infrastructure item — the
  architecture is frozen; all changes wire at the app boundary.

## [0.1.0] — earlier
- Walking skeleton and the full offline agency pipeline (workspace → client →
  brand → product → project → mission → brief → creative → campaign → analytics
  → executive → learning), multi-tenant, event-driven.

[1.0.0-rc1]: #100-rc1--2026-07-26
[0.1.0]: #010--earlier
