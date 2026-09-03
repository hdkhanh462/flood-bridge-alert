# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate
WORKDIR /app

# ---- build: install deps, build the static SPA bundle ----
FROM base AS build
COPY . .
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN pnpm install --frozen-lockfile
ARG VITE_SERVER_URL
ARG VITE_VAPID_PUBLIC_KEY
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
RUN pnpm turbo run build --filter=web

# ---- production: static files served by nginx ----
FROM nginx:alpine AS production
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
