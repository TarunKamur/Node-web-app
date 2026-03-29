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

COPY --from=builder /app ./

RUN npm ci --only=production && npm cache clean --force

EXPOSE 8081

CMD ["npm", "start"]
