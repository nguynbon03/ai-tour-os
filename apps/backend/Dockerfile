FROM node:20-alpine AS base
RUN apk add --no-cache curl
WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/prisma/schema.prisma ./packages/prisma/
RUN npm install -w apps/backend --include-workspace-root

COPY apps/backend/ ./apps/backend/
COPY packages/prisma/ ./packages/prisma/

RUN cd packages/prisma && npx prisma generate && cd /app
RUN npm run build -w apps/backend

WORKDIR /app/apps/backend
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD curl -f http://localhost:4000/api/health || exit 1
CMD ["node", "dist/index.js"]
