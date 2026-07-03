# Production Dockerfile for shahname (Next.js, standalone output).
# Designed for Coolify's "Dockerfile" build pack. No secrets are baked in —
# all values below are supplied by Coolify's build/runtime environment.

# ---- deps: install dependencies reproducibly -------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: typecheck + build --------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined at build time — Coolify must provide these
# as build-time variables. DATABASE_URL is also read at build time by pages
# that import the DB client at module scope, and by db:migrate below — it
# must be a real, reachable connection string at build time (Coolify's
# Docker build must be able to reach the database over the network).
ARG NEXT_PUBLIC_SITE_URL
ARG DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production

RUN npx tsc --noEmit
RUN npm run db:migrate
RUN npm run build

# ---- runner: minimal production image --------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

# ARG scope does not cross FROM boundaries, so NEXT_PUBLIC_SITE_URL from the
# builder stage above is NOT automatically available here. The app reads
# process.env.NEXT_PUBLIC_SITE_URL at RUNTIME too (see lib/auth-core.ts —
# getPublicOrigin() and the admin session cookie's `secure` flag), so it
# must also be set as a runtime env var in this final stage. Coolify must
# supply NEXT_PUBLIC_SITE_URL as BOTH a build-time variable (for the
# builder stage above) AND a runtime environment variable (consumed here) —
# these are two separate settings in Coolify's UI; missing the runtime one
# silently falls back to (less reliable) proxy-header detection.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3002

# Real secrets (DATABASE_URL, ADMIN_PASSWORD, JWT_SECRET, ARVAN_S3_*) must be
# provided as runtime environment variables in Coolify — never baked into
# this image. JWT_SECRET has no fallback: admin login will fail loudly
# until it is set. The schema is applied during the builder stage (above,
# via db:migrate); no seed command runs here.
CMD ["node", "server.js"]
