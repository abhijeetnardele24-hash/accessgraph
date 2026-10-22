# Multi-stage reproducible Dockerfile for RouteWitness (AccessGraph)
# Target: Google Cloud Run (Path B Hackathon Submission)

# ---------------------------------------------------------------------------
# Stage 1: Build static web assets
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for cache efficiency
COPY package*.json ./
RUN npm ci

# Copy application source and build
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Minimal non-root production runtime
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./server.cjs
COPY --from=builder /app/package.json ./package.json

# Copy artifacts directory for /evidence endpoint if present
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/policy ./policy

# Use non-root user for container security
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/healthz', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.cjs"]
