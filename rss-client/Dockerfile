FROM node:20.19.5-bookworm-slim AS dependencies
WORKDIR /app
COPY --from=contracts . /shared
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20.19.5-bookworm-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ARG NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED=true
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED=$NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=contracts . /shared
COPY . .
RUN npm run build

FROM node:20.19.5-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=5000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 5000
CMD ["node", "server.js"]
