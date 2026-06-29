# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public env vars — inlined into client JS bundles at build time
# Defaults are hardcoded because .env is git-ignored and not available in Cloud Build
ARG NEXT_PUBLIC_API_URL=https://dge-tech-web-cjhe4jg72a-ew.a.run.app
ARG NEXT_PUBLIC_WS_URL=wss://dge-tech-web-cjhe4jg72a-ew.a.run.app

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

# Server-only env vars — needed by next build for server components/actions
ARG AUTH_SECRET
ARG AUTH_URL=https://dgetechs.com
ARG BACKEND_API_KEY
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

ENV AUTH_SECRET=${AUTH_SECRET}
ENV AUTH_URL=${AUTH_URL}
ENV BACKEND_API_KEY=${BACKEND_API_KEY}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV AUTH_GOOGLE_ID=${GOOGLE_CLIENT_ID}
ENV AUTH_GOOGLE_SECRET=${GOOGLE_CLIENT_SECRET}

# Debug: verify env vars are set at build time
RUN echo "=== Build-time env check ===" && \
    echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" && \
    echo "NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}" && \
    echo "AUTH_URL=${AUTH_URL}" && \
    echo "AUTH_SECRET is set: $(test -n \"$AUTH_SECRET\" && echo YES || echo NO)" && \
    echo "BACKEND_API_KEY is set: $(test -n \"$BACKEND_API_KEY\" && echo YES || echo NO)" && \
    echo "GOOGLE_CLIENT_ID is set: $(test -n \"$GOOGLE_CLIENT_ID\" && echo YES || echo NO)" && \
    echo "==========================="

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets and necessary configurations
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js

# Set correct ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Default port for Next.js, Cloud Run will override this environment variable
ENV PORT=3000
EXPOSE 3000

# Start server.js which dynamically respects the PORT environment variable
CMD ["node", "server.js"]
