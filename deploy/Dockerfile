# AdOS production image — multi-stage, offline-capable, non-root.
# One image serves both roles (web + workers); the compose `command` selects.
FROM node:26-alpine AS build
WORKDIR /app
RUN corepack enable
# Install dependencies against the lockfile (cached layer).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY domains ./domains
COPY apps ./apps
RUN pnpm install --frozen-lockfile --offline || pnpm install --frozen-lockfile
RUN pnpm build

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && addgroup -S ados && adduser -S ados -G ados
COPY --from=build /app ./
COPY deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && chown -R ados:ados /app
USER ados
# wget (busybox) is used by the compose healthchecks.
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "apps/web/dist/main.js"]
