# ---------- Stage 1 ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build:dishtv:prod


# ---------- Stage 2 ----------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy EVERYTHING except node_modules rebuild
COPY --from=builder /app ./

EXPOSE 8081

CMD ["npm", "start"]

