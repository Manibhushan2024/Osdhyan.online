# Portal (Next.js) image. Build from the REPO ROOT, because the npm lock file
# lives there (npm workspace):
#   docker build -f apps/portal/Dockerfile .
FROM node:22-alpine AS base

# ─── Stage 1: Install dependencies (portal workspace only) ───────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/portal/package.json apps/portal/
# The repo root lists a Windows-only laptop tool (@expo/ngrok-bin-win32-x64)
# that npm refuses on Linux. The portal does not use it: drop the root's own
# dependencies from both files so `npm ci` stays strict for everything else.
RUN node -e " \
  const fs = require('fs'); \
  const p = JSON.parse(fs.readFileSync('package.json')); delete p.dependencies; \
  fs.writeFileSync('package.json', JSON.stringify(p, null, 2)); \
  const l = JSON.parse(fs.readFileSync('package-lock.json')); delete l.packages[''].dependencies; \
  delete l.packages['node_modules/@expo/ngrok-bin-win32-x64']; \
  fs.writeFileSync('package-lock.json', JSON.stringify(l, null, 2));"
RUN npm ci --workspace apps/portal --include-workspace-root=false --no-audit --no-fund

# ─── Stage 2: Build ──────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/portal ./apps/portal
# npm keeps some portal packages in apps/portal/node_modules (version clashes
# with hoisted ones), so both folders are needed.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/portal/node_modules ./apps/portal/node_modules

ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values and the proxy target are fixed at build time.
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_STORAGE_URL=
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_JITSI_DOMAIN=
ARG BACKEND_ORIGIN=http://backend:10000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_STORAGE_URL=$NEXT_PUBLIC_STORAGE_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_JITSI_DOMAIN=$NEXT_PUBLIC_JITSI_DOMAIN \
    BACKEND_ORIGIN=$BACKEND_ORIGIN

RUN npm run build --workspace apps/portal

# ─── Stage 3: Production runtime ─────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Standalone output keeps the workspace layout: server.js is in apps/portal/.
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/.next/static ./apps/portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal/public ./apps/portal/public

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
    CMD wget -q -O /dev/null "http://127.0.0.1:3000/" || exit 1
CMD ["node", "apps/portal/server.js"]
