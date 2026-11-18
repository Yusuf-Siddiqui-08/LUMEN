# syntax=docker/dockerfile:1
#
# LUMEN fallback image for Railway.
# Railpack (no Dockerfile) is the primary builder. This file lives at deploy/Dockerfile,
# NOT at the repo root, because Railway always switches to the Dockerfile builder when it
# finds a root Dockerfile. To use it, set the service variable
#   RAILWAY_DOCKERFILE_PATH=deploy/Dockerfile
# (or Settings > Build > Dockerfile path). Build context is the repo root:
#   docker build -f deploy/Dockerfile -t lumen .
#
# The server listens on $PORT (Railway injects it; 8080 if unset) on 0.0.0.0,
# so no EXPOSE is needed.

ARG NODE_VERSION=22

# ---------- Shared: manifests plus compilers for better-sqlite3 ----------
FROM node:${NODE_VERSION}-slim AS toolchain
WORKDIR /app
# python3, make and g++ are only used if better-sqlite3 has no prebuilt binary for this
# Node version. They stay in the build stages and never reach the runtime image.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY web/package.json web/package.json

# ---------- Build: all dependencies, then web/dist and server/dist ----------
FROM toolchain AS build
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---------- Runtime dependencies of the server workspace only ----------
FROM toolchain AS prod-deps
RUN npm ci --omit=dev --workspace=server --no-audit --no-fund

# ---------- Runtime ----------
FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
# Manifests stay so that "npm start" also works if Railway's start command is set.
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY web/package.json web/package.json
COPY server/config server/config
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/web/dist web/dist
# server/data holds the SQLite history and gate baselines. Without a Railway volume it is
# wiped on every redeploy. With a volume, see DEPLOY.md (RAILWAY_RUN_UID=0 or DB_PATH).
RUN mkdir -p server/data && chown node:node server/data
USER node
# node as PID 1 receives Railway's SIGTERM directly and shuts down cleanly.
CMD ["node", "server/dist/index.js"]
