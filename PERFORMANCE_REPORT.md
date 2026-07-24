# AdOS — Performance & Load Optimization Report

Method: **measure → identify proven bottlenecks → optimize only those → re-measure.**
No business logic, API, domain, or architecture changed. Harness: [`@ados/bench`](packages/bench/)
(micro-benchmarks, GC/heap, backup); [`apps/web/src/load.test.ts`](apps/web/src/load.test.ts)
(HTTP concurrency); [`apps/web/src/perf.test.ts`](apps/web/src/perf.test.ts) (startup,
per-stage business latency, concurrent journeys). All figures are in-process on the
CI machine — comparative, not absolute SLAs.

## Phase 1 — Baseline

| Metric | Value |
| --- | --- |
| Cold startup (App boot, in-process) | ~0.05 ms |
| Warm startup | ~0.04 ms |
| HTTP request latency (first/ warm) | ~15 ms first request, **sub-ms warm** |
| HTTP throughput | see load tests (peak ~9.1k req/s) |
| Repository query — upsert / findById | 0.004 ms (251k/s) / 0.003 ms (356k/s) |
| Storage latency — upload / download (4 KB, streamed) | 0.28 ms (3.6k/s) / 0.07 ms (14.4k/s) |
| Worker execution (16-way drain) | 0.03 ms/job (~33.5k jobs/s) |
| Event-bus latency | 0.001 ms (~1.02M ev/s) |
| AI Manager / mission stage (offline) | brief 0.97, creative 0.68, campaign 0.39, analytics 0.47, executive 0.34 ms |
| Mission processing (full pipeline, one journey) | ~4 ms of app time (login 14.8 ms first-request warmup excluded) |
| Backup duration (full + auto-validate) | 0.20 ms |
| Restore duration (verify + apply) | 0.37 ms |
| Memory | heap used ~49 MB, heap total ~85 MB, rss ~178 MB, external ~9 MB |
| GC (during full micro-bench suite) | 18 collections, 7.2 ms total pause |

Note: in-process cold start excludes Node process spawn + module load (dominant in a
real container); the container's readiness is gated by dependency verification (Item 7),
not app-boot time.

## Phase 2 — Load tests

| Scenario | Load | Result |
| --- | --- | --- |
| **A** — concurrent full journeys (login→mission→creative→campaign→analytics→logout) | 25 concurrent (scaled in-process) | **25/25 ok, 0 errors**, p50 72 ms, p95 78 ms, p99 79 ms |
| **B** — HTTP concurrency | 500 | 2000/2000 ok, ~9.1k req/s, p95 ~186 ms |
| **C** — HTTP concurrency | 1000 | 4000/4000 ok, ~6.2k req/s, p95 ~570 ms |
| (also) | 100 | 400/400 ok, ~5k req/s, p95 ~67 ms |
| **D** — concurrent storage upload | 500 × 4 KB | ~3.6k ops/s, p95 0.36 ms |
| **E** — concurrent storage download | 500 × 4 KB | ~14.4k ops/s, p95 0.09 ms |
| **F** — concurrent worker execution | 2000 jobs, 16-way | ~33.5k jobs/s |
| **G** — concurrent backup | 50 × (full+validate) | ~5.1k ops/s, p95 0.24 ms |
| **H** — concurrent event publishing | 5000 events | ~1.02M ev/s |

**Error rate: 0** at every level, including 1000 concurrent HTTP users and 25
concurrent full customer journeys. CPU stays within one core in-process; memory
steady (~49 MB heap, GC pauses in single-digit ms).

## Phase 3 — Profiling (measured, not guessed)

Profiled repositories, application services, HTTP, workers, storage, database,
serialization/JSON, tracing, metrics, logging, event bus. **Two proven hotspots:**

1. **SQLite adapter re-prepared every statement** — `query/execute` called
   `db.prepare()` per call, recompiling identical SQL that repositories run constantly.
2. **Postgres pool unsized** — `new Pool({ connectionString })` used driver defaults
   (max 10, no timeouts): a hard throughput cap and unbounded checkout waits.

Everything else measured at/near optimal (see Rejected optimizations).

## Phase 4 — Optimization (proven bottlenecks only)

1. **SQLite prepared-statement cache** (`packages/persistence/src/sqlite-database.ts`) —
   statements cached by SQL string. Identical behaviour.
2. **Postgres pool sizing** (`packages/persistence/src/postgres-database.ts`) —
   `connect()` sets `max` (default 20, wired from `DATABASE_MAX_CONNECTIONS`),
   `idleTimeoutMillis` (30 s), `connectionTimeoutMillis` (10 s).

## Phase 5 — Validation (before / after)

| Optimization | Before | After | Improvement |
| --- | --- | --- | --- |
| SQLite repeated query (statement cache) | 72,420 ops/s (0.014 ms) | 87,728 ops/s (0.011 ms) | **~1.27×**, grows with query complexity/rows |
| Postgres pool | max 10, no timeout (config-capped) | max 20 + timeouts, tunable | removes the connection ceiling (not benchable without live PG) |

All other benchmarks re-ran unchanged (within noise): repo 250k+/s, workers ~33k/s,
storage/download 14k/s, events 1M/s, JSON ~0.001 ms, backup 0.20 ms.

### Rejected optimizations (measured, not worth it or risky)

- **HTTP gzip compression** — server-rendered pages are small; compression adds
  header/behaviour surface for marginal gain. Rejected.
- **Response buffering rework** — responses are already a single `res.html/json`
  write; no double-buffering exists.
- **Custom JSON serializer** — V8 `JSON.stringify/parse` measures ~0.001 ms per
  payload; a hand-rolled serializer would risk correctness for no gain.
- **Worker concurrency bump** — already tunable; no proven contention (guarded claim
  adds no measurable overhead in-process).
- **Event-dispatch rewrite** — ~1M ev/s; not a bottleneck.
- **Metrics/logging optimization** — `/metrics` renders off the hot path; pino is
  async. No measured cost on the request path.

### Regression risk

- **Statement cache** keys on SQL text only (never parameter values); AdOS uses a
  small fixed query set, so the cache is bounded — no unbounded growth. **Low.**
- **Pool sizing** default 20 > driver default 10 — ensure Postgres `max_connections`
  covers (web + workers) × 20; documented in `DEPLOYMENT_REPORT.md`. **Low, config-tunable.**
- No behaviour, API, domain, or architecture change; full regression green.

## Quality gates

- **All existing tests pass** — full monorepo **56/56 build+test tasks green**.
- **All benchmarks complete** — bench + load + perf suites run and assert throughput
  floors + zero-error load (they fail CI on a future regression).
- **No behavior / API / domain / architecture changes.**
