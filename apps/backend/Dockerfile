FROM node:20-slim AS base
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/prisma/schema.prisma ./packages/prisma/
RUN npm install -w apps/backend --include-workspace-root

COPY apps/backend/ ./apps/backend/
COPY packages/prisma/ ./packages/prisma/

RUN ./node_modules/.bin/prisma generate --schema=packages/prisma/schema.prisma && cp -r /app/packages/node_modules/.prisma/client /app/node_modules/.prisma/
RUN npm run build -w apps/backend

WORKDIR /app/apps/backend
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD curl -f http://localhost:4000/api/health || exit 1
CMD ["node", "dist/index.js"]
