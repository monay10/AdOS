# AdOS — Installation Guide

## Requirements

- **Node.js ≥ 20** (developed on 26.x; uses the built-in `node:sqlite`).
- **pnpm 9** (`corepack enable && corepack prepare pnpm@9.12.0 --activate`).
- Optional: **Docker** (production stack), **Ollama** or another local inference
  engine (real AI), **PostgreSQL** (durable persistence).

## 1. Install & build

```bash
pnpm install
pnpm turbo run build          # builds all 35 workspaces
pnpm turbo run test           # optional: full suite
```

## 2. Run (local dev, offline AI, in-memory data)

```bash
PORT=4000 AUTH_SECURE_COOKIES=false node apps/web/dist/main.js
# → http://localhost:4000
```

Log in with any work email + a company name (dev passwordless login). Your
company name becomes an isolated tenant.

## 3. Enable a real local model (optional)

100% local — no cloud, no API key.

```bash
ollama pull qwen2.5:7b        # or any chat model
AI_ENGINE=ollama AI_MODEL=qwen2.5:7b node apps/web/dist/main.js
```

Other local engines: `AI_ENGINE=vllm|lmstudio|llamacpp|sglang` with
`AI_BASE_URL` (default `http://localhost:8000`).

## 4. Enable durable persistence (optional)

```bash
DATABASE_URL=postgres://user:pass@host:5432/ados \
DATABASE_MAX_CONNECTIONS=20 \
node apps/web/dist/main.js     # migrations run at startup
```

## 5. Production hardening

```bash
AUTH_MODE=password \           # Argon2id email/password auth
SESSION_SECRET=$(openssl rand -hex 32) \
DATABASE_URL=... \
node apps/web/dist/main.js
```

For the full container stack (web + workers + Postgres + observability), see
`DEPLOYMENT_REPORT.md` and `docker compose up -d`.

## Environment variables

| Var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | HTTP listen port |
| `SESSION_SECRET` | random | Session cookie HMAC (set in prod) |
| `DATABASE_URL` | — | Postgres DSN; unset ⇒ in-memory (dev only) |
| `DATABASE_MAX_CONNECTIONS` | `20` | Postgres pool size |
| `AUTH_MODE` | dev | `password` for production auth |
| `AUTH_SECURE_COOKIES` | `true` | `false` for local HTTP |
| `AI_ENGINE` | `offline` | `ollama\|vllm\|lmstudio\|llamacpp\|sglang` |
| `AI_BASE_URL` | per engine | Local engine URL |
| `AI_MODEL` | `qwen2.5:7b` | Default local model |
| `AI_TEMPERATURE` | `0.2` | Sampling temperature |
| `LOG_LEVEL` / `LOG_PRETTY` | `info` / `false` | Logging |
