# AdOS — Known Limitations (1.0.0-rc1)

Honest, documented constraints. None block production use; each has a stated
mitigation or path.

## AI

- **Local model latency.** A 7B model (e.g. `qwen2.5:7b`) on CPU takes ~40–50 s
  for a full brief→creative→campaign chain (first load + one self-repair round).
  *Mitigation:* use a GPU, a smaller/quantized model, or the default offline
  deterministic manager (sub-millisecond). All share one `AIManagerPort`.
- **Language consistency in free-form fields.** Small local models occasionally
  mix Turkish/English in long prose. Structured JSON and ad copy render
  correctly. *Mitigation:* larger or Turkish-tuned local models; the system
  prompt already instructs the target language.
- **No streaming in the web UI.** `LiveAIManager.stream()` exists but the web app
  uses `submit()`; responses appear when complete.

## Persistence & storage

- **Postgres / MinIO not exercised live in CI.** The shared SQL and storage
  ports are verified against embedded SQLite (`node:sqlite`) and local file
  storage, plus port contracts and strict type-checking. Live Postgres/MinIO are
  covered by the adapters' contracts, not an integration run. *Mitigation:* run
  the Docker compose stack in staging (see `DEPLOYMENT_REPORT.md`).

## Auth & multi-tenancy

- **Dev passwordless login is the default.** Production requires
  `AUTH_MODE=password` (Argon2id). Do not run the open login in production.
- **Tenant = company name (slugified).** Two companies that slugify identically
  would share a tenant. *Mitigation:* enforce unique company names at signup.

## Scope

- **English is the i18n default** for anything without a Turkish string and for
  requests with no `Accept-Language`. Only TR and EN are shipped.
- **Numeric/format placeholders** (currency `TRY`, timezone `Europe/Istanbul`)
  are intentionally not localized.

## Operational

- **In-memory persistence when `DATABASE_URL` is unset** — data is not durable
  across restarts. Set `DATABASE_URL` for durability.
