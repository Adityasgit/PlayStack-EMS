FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/

RUN npm ci -w apps/frontend

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/apps/frontend/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
