FROM node:20.19.5-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20.19.5-bookworm-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ARG GIT_COMMIT_SHA=unavailable
ARG GIT_BRANCH=docker-build
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA GIT_BRANCH=$GIT_BRANCH
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20.19.5-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
