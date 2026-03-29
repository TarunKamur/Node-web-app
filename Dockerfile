# ---------- Stage 1: Builder ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build app
RUN npm run build:dishtv:prod


# ---------- Stage 2: Production ----------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files only (NOT entire app)
COPY --from=builder /app/dist ./dist

# If app needs other files (uncomment if needed)
# COPY --from=builder /app/public ./public

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8081

CMD ["node", "dist/index.js"]
