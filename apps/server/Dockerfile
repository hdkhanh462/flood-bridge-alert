# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate
WORKDIR /app

# ---- build: install deps for the whole workspace, then build the server ----
FROM base AS build
COPY . .
# `pnpm install` triggers packages/db's postinstall (`prisma generate`), whose
# prisma.config.ts requires DATABASE_URL to be set just to load — this dummy
# value only needs to be well-formed, `generate` never connects to it, and it
# doesn't persist into the production stage below (ENV is per-stage).
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=server

# ---- production: tsdown (see tsdown.config.ts `deps.alwaysBundle`) bundles
# the server plus every workspace/npm dependency it uses straight into
# dist/*.mjs, so the runtime needs nothing else from the monorepo — no
# node_modules, no source, no other app's dependency tree.
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/server/dist ./dist
EXPOSE 8000
CMD ["node", "dist/index.mjs"]
