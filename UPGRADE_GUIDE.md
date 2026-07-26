# AdOS — Upgrade Guide

## Principles

- **Semantic versioning.** Breaking changes only on a major bump.
- **Migrations are forward-only and idempotent**, applied automatically at
  startup when `DATABASE_URL` is set (`runMigrations`). Each migration records
  itself; re-running is a no-op.
- **Config-gated infrastructure.** New capabilities ship behind environment
  flags and default to previous behavior, so an upgrade is safe before you opt in.

## Standard upgrade procedure

```bash
git fetch --tags && git checkout <new-tag>
pnpm install
pnpm turbo run build
pnpm turbo run test                    # verify green before deploying
# Back up first (see BACKUP_GUIDE.md / RUNBOOK.md), then restart:
node apps/web/dist/main.js             # migrations run automatically
```

Zero-downtime: deploy the new version alongside the old (both run migrations
idempotently), shift traffic, then retire the old instance.

## Rollback

1. Restore the pre-upgrade backup if a migration changed data
   (`RestoreService`, see `DISASTER_RECOVERY.md`).
2. `git checkout <previous-tag>`, rebuild, restart.
3. Migrations are forward-only; a rollback that must undo schema changes requires
   a restore, not a down-migration.

## From 0.1.0 → 1.0.0-rc1

- No manual steps. New features are opt-in via env:
  - `AI_ENGINE` — off by default (offline manager); no change unless set.
  - Bilingual UI — automatic from `Accept-Language`; English default preserves
    prior output.
- No schema changes to existing tables; the optional auth-credentials migration
  runs only under `AUTH_MODE=password`.

## Version support

- `1.0.0-rc1` is a **release candidate** — pin it explicitly; expect a `1.0.0`
  final with only doc/polish deltas.
