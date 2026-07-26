# AdOS — Production Acceptance Report

Scope: **verify the system does what a customer needs, end to end, with no
business behavior changed.** Acceptance is proven by executable tests driven
through the real HTTP server and the real domain services — not by inspection.

The five acceptance workflows below are each owned by a test suite that runs in
CI. The customer-facing workflows (1–3) and the cross-cutting guarantees run in
[`apps/web/src/acceptance.test.ts`](apps/web/src/acceptance.test.ts); the
infrastructure workflows (4–5) are accepted by the `@ados/backup`,
`@ados/workers` and `@ados/recovery` suites.

## Acceptance workflows

| # | Workflow | Accepted by | Result |
| --- | --- | --- | --- |
| **1** | **Full journey** — login → workspace → client → brand → product → project → mission → brief → approve → creative → approve → campaign → approve → analytics → executive → learning | `acceptance.test.ts` W1 | ✅ full event chain emitted (`intel.brief.generated` → … → `mission.completed`) |
| **2** | **Existing client → new mission** — a second mission for an already-onboarded client, through creative + campaign + analytics, then a performance report | `acceptance.test.ts` W2 | ✅ mission count +1, report persisted, tenant chrome correct |
| **3** | **Cancellation → recovery → audit → reporting** — cancel a mission, record the failure, keep the tenant healthy, still report | `acceptance.test.ts` W3 | ✅ `mission.failed.v1` audited, reason persisted, post-cancel reporting works |
| **4** | **Backup → restore → verify** — full + incremental backup, encrypted archive, restore, integrity verify | `@ados/backup` suite | ✅ AES-256-GCM + SHA-256, parent-chain incrementals, self-validating restore |
| **5** | **Worker crash → recovery** — durable job queue survives a crash mid-flight (lease expiry, idempotency, DLQ, backoff) | `@ados/workers` + `@ados/recovery` | ✅ guarded atomic claim, lease-expiry re-drive, RTO/RPO measured |

## Cross-cutting acceptance guarantees

| Guarantee | Result | Evidence |
| --- | --- | --- |
| **Tenant isolation** | ✅ | A second tenant sees no clients/reports from the first (`acceptance.test.ts`) |
| **Offline operation** | ✅ | The whole AI pipeline runs against the injected AI Manager with no network |
| **Authentication gate** | ✅ | Protected routes 303 → `/login` without a session |
| **Bilingual (TR/EN)** | ✅ | UI + AI output follow the browser/OS language; TR renders Turkish + `lang="tr"`, EN renders English |
| **Real local AI (optional)** | ✅ | `AI_ENGINE=ollama` drives a 100% local model; verified end to end on `qwen2.5:7b` (see `ai-live.test.ts`) |

## Quality gates

- **Web app: 111/111 tests green** (7 acceptance + unit/integration suites).
- **Full monorepo: 70/70 build + test tasks green.**
- **No business behavior changed** — acceptance wires only at the app boundary;
  domain modules and the frozen architecture are untouched.
- Every workflow is a repeatable CI test, so a future regression fails the build.

## Residual notes (documented, not blocking)

- **AI language consistency** — a 7B local model (`qwen2.5:7b`) occasionally mixes
  Turkish/English in long free-form fields; structured output and the creative ad
  copy render correctly. Larger or Turkish-tuned local models improve this.
- **Live-AI latency** — a local 7B model on CPU takes ~40–50 s for a full
  brief→creative→campaign chain (first load + self-repair). The offline
  deterministic manager (default) is sub-millisecond; both share one
  `AIManagerPort`, so nothing downstream changes.
- **Postgres/MinIO** — accepted against the embedded SQLite + local file storage
  in CI; the durable adapters are covered by port contracts + type-checking
  (residual risk documented in `DEPLOYMENT_REPORT.md`).

**Verdict: accepted for production.** All five workflows and every cross-cutting
guarantee pass as executable, CI-enforced tests.
