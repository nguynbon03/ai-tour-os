# AI Tour Operating System

Autonomous Tour Operating System — AI Agent bán tour 24/7 trên Zalo.

## Architecture

```
VPS (4vCPU / 8GB RAM / 160GB SSD)
├── Docker Compose
│   ├── PostgreSQL 16 (DB chính)
│   ├── Redis 7 (Cache + Session)
│   ├── Qdrant (Vector DB — AI Memory)
│   ├── Backend API (Node.js/Express)
│   └── Frontend Dashboard (Next.js)
├── Nginx / Traefik (Reverse Proxy + SSL)
└── Coolify (Deploy Management)
```

## Quick Start

```bash
# 1. Setup infrastructure
docker-compose up -d postgres redis qdrant

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema
npm run db:push

# 5. Seed data
npm run db:seed

# 6. Start dev
npm run dev
```

## Deploy

Via Coolify:
1. GitHub repo → Coolify Source
2. Coolify auto-detects docker-compose.yml
3. Domain: tour-ai.overpowers.agency
4. SSL: Auto Let's Encrypt

## License

Private — © 2026 Overpowers Agency
