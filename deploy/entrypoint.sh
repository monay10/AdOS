#!/bin/sh
# AdOS container entrypoint.
#
# Database migrations run automatically inside the application at startup
# (main.ts / worker.ts call runMigrations when DATABASE_URL is set), so the
# entrypoint's job is just to announce the role and exec the process as PID 1
# for correct signal handling → graceful shutdown.
set -e

echo "AdOS starting — role=${ROLE:-web} profile=${ADOS_PROFILE:-development} node=$(node --version)"

# Fail fast if a production role is missing critical configuration. The app also
# validates via @ados/config; this is a fast pre-flight for obvious mistakes.
if [ "${ADOS_PROFILE}" = "production" ]; then
  : "${DATABASE_URL:?DATABASE_URL is required in production}"
  : "${SESSION_SECRET:?SESSION_SECRET is required in production}"
fi

exec "$@"
