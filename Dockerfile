# syntax=docker/dockerfile:1

# ── Builder: install deps, produce the static production bundle ────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

COPY . .
# No VITE_API_URL build arg here on purpose — src/api/client.ts falls back to
# the production API (https://shiftsync.civic-nexus.com) when it's unset, so
# a plain `docker build` always bakes in the real backend, never localhost.
RUN npm run build

# ── Runtime: nginx serving the static bundle, SPA-aware ─────────────────────
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
