# syntax=docker/dockerfile:1

# Dependances Node. Le lockfile est genere par `npm install` puis commite ;
# le repli `npm install` ne sert qu'au tout premier bootstrap du projet.
FROM node:24-alpine AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY web/package.json web/package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build de production : la sortie standalone est generee ici.
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY web/ ./

# NEXT_PUBLIC_SITE_URL est necessaire au build (canonical, Open Graph, sitemap).
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

RUN npm run build

# Image d'execution minimale, non-root.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Cache ISR inscriptible par l'utilisateur non-root.
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# Cible de developpement : `next dev` avec HMR, source montee par Compose.
FROM node:24-alpine AS dev
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY web/ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
