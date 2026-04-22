FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx reset
RUN npx nx build rag-service --skip-nx-cache

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist/apps/rag-service ./dist
CMD ["node", "dist/main.js"]