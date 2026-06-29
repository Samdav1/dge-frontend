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
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

# Only set ENV if the build ARG is non-empty, otherwise Next.js reads .env
RUN if [ -n "$NEXT_PUBLIC_API_URL" ]; then \
      echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> /app/.env.production; \
    fi && \
    if [ -n "$NEXT_PUBLIC_WS_URL" ]; then \
      echo "NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL" >> /app/.env.production; \
    fi

# Server-only env vars — needed by next build for server components/actions
ARG AUTH_SECRET
ARG AUTH_URL
ARG BACKEND_API_KEY
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET

# Only set server-side ENV vars if the build ARGs are non-empty
RUN if [ -n "$AUTH_SECRET" ]; then \
      echo "AUTH_SECRET=$AUTH_SECRET" >> /app/.env.production; \
    fi && \
    if [ -n "$AUTH_URL" ]; then \
      echo "AUTH_URL=$AUTH_URL" >> /app/.env.production; \
    fi && \
    if [ -n "$BACKEND_API_KEY" ]; then \
      echo "BACKEND_API_KEY=$BACKEND_API_KEY" >> /app/.env.production; \
    fi && \
    if [ -n "$GOOGLE_CLIENT_ID" ]; then \
      echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> /app/.env.production; \
      echo "AUTH_GOOGLE_ID=$GOOGLE_CLIENT_ID" >> /app/.env.production; \
    fi && \
    if [ -n "$GOOGLE_CLIENT_SECRET" ]; then \
      echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> /app/.env.production; \
      echo "AUTH_GOOGLE_SECRET=$GOOGLE_CLIENT_SECRET" >> /app/.env.production; \
    fi

# Debug: print final .env.production and .env contents for build verification
RUN echo "=== Build-time env check ===" && \
    echo "--- .env.production (from build args) ---" && \
    (cat /app/.env.production 2>/dev/null || echo "(no .env.production)") && \
    echo "--- .env (from repo) ---" && \
    (cat /app/.env 2>/dev/null || echo "(no .env)") && \
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
# Copy env files so runtime server-side code can read them
COPY --from=builder /app/.env* ./

# Set correct ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Default port for Next.js, Cloud Run will override this environment variable
ENV PORT=3000
EXPOSE 3000

# Start server.js which dynamically respects the PORT environment variable
CMD ["node", "server.js"]
