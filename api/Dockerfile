FROM node:24.14.0-bookworm-slim AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY --from=contracts . /shared
COPY package.json package-lock.json ./
RUN npm_config_build_from_source=true npm ci

FROM node:24.14.0-bookworm-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=contracts . /shared
COPY . .
RUN npm run build

FROM node:24.14.0-bookworm-slim AS production-dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY --from=contracts . /shared
COPY package.json package-lock.json ./
RUN npm_config_build_from_source=true npm ci --omit=dev && npm cache clean --force

FROM node:24.14.0-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=4000 HOSTNAME=0.0.0.0 DATABASE_STORAGE=/app/data/content-hub.sqlite
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs && mkdir -p /app/data && chown nextjs:nodejs /app/data
COPY --from=production-dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
