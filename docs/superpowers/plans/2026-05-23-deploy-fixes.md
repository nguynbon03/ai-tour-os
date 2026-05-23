# AI-Tour-OS Deploy Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Fix frontend healthcheck, push Prisma schema to DB, verify domains, commit all changes.

**Architecture:** Docker Compose trên VPS với Coolify-managed DB/Redis. Backend node:20-slim, Frontend node:20-alpine Next.js standalone.

**Tech Stack:** Docker, Docker Compose, Next.js 14, Node.js 20, Prisma, PostgreSQL, Redis, Traefik

---

## File Structure Map

| File | Role |
|------|------|
| `docker-compose.deploy.yml` | Orchestrates backend + frontend containers, uses external `coolify` network |
| `.env` | Shared env vars — **bug: `PORT=4000` overrides frontend's `PORT=3000`** |
| `apps/backend/Dockerfile` | Debian slim build, Prisma generate, tsc compile |
| `apps/frontend/Dockerfile` | Alpine multi-stage, Next.js standalone output |
| `apps/frontend/next.config.js` | Standalone output, API rewrites to backend |
| `apps/backend/src/index.ts` | Express app with `/health` and `/api/health` routes |
| `apps/frontend/src/app/api/health/route.ts` | Next.js health route |

---

### Task 1: Fix Frontend Healthcheck (PORT Override Bug)

**Root cause:** `.env` có `PORT=4000`, frontend container dùng `env_file: .env` nên Next.js standalone khởi động trên port 4000 thay vì 3000. Healthcheck gọi `localhost:3000/api/health` → fail.

**Files:**
- Modify: `docker-compose.deploy.yml`
- Test: `ssh root@VPS "docker ps --filter name=ai-tour-frontend --format {{.Status}}"` → expect `healthy`

- [ ] **Step 1: Add PORT override cho frontend trong compose**

```yaml
# docker-compose.deploy.yml frontend service
  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    container_name: ai-tour-frontend
    restart: unless-stopped
    env_file: .env
    environment:
      - PORT=3000
      - HOSTNAME=0.0.0.0
```

- [ ] **Step 2: Rebuild và restart frontend trên VPS**

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'cd /opt/ai-tour-os && docker compose -f docker-compose.deploy.yml build frontend && docker compose -f docker-compose.deploy.yml up -d frontend'
```

Expected: Build thành công, container start.

- [ ] **Step 3: Verify healthcheck pass**

```bash
sleep 15
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'docker ps --filter name=ai-tour-frontend --format "{{.Names}}\t{{.Status}}"'
```

Expected: `ai-tour-frontend   Up X seconds (healthy)`

- [ ] **Step 4: Commit**

```bash
git add docker-compose.deploy.yml
git commit -m "fix: frontend PORT=3000 override in compose to fix healthcheck"
git push origin master
```

---

### Task 2: Push Prisma Schema to Database

**Files:**
- Modify: `apps/backend/Dockerfile` (optional: thêm startup script)
- Test: `ssh root@VPS "docker exec ai-tour-backend npx prisma db ping"` hoặc check `/api/health` response có DB connected

- [ ] **Step 1: Chạy Prisma db push trong backend container**

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'docker exec ai-tour-backend npx prisma db push --accept-data-loss --schema=../../packages/prisma/schema.prisma'
```

Expected: `Your database is now in sync with your Prisma schema.`

Nếu lệnh trên fail vì Prisma CLI không có sẵn trong container, thì chạy qua docker run:

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'cd /opt/ai-tour-os && docker compose -f docker-compose.deploy.yml exec backend npx prisma db push --schema=../../packages/prisma/schema.prisma --accept-data-loss'
```

- [ ] **Step 2: Verify DB schema created**

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'docker exec ai-tour-backend node -e "const {prisma} = require(\"./dist/lib/prisma\"); prisma.$queryRawUnsafe(\"SELECT tablename FROM pg_tables WHERE schemaname=\\\"public\\\";\").then(console.log).catch(console.error)"'
```

Expected: Danh sách tables từ schema (Customer, Tour, Booking, v.v.)

- [ ] **Step 3: Commit nếu cần thay đổi startup script**

Nếu thêm entrypoint script để auto-run `prisma db push` trước `node dist/index.js`:

```bash
# Tạo apps/backend/scripts/start.sh nếu cần
git add apps/backend/scripts/start.sh apps/backend/Dockerfile
git commit -m "feat: auto-run prisma db push on container startup"
git push origin master
```

---

### Task 3: Verify Domains via Traefik

**Files:**
- Test: `curl` từ local và VPS

- [ ] **Step 1: Verify backend domain từ VPS**

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'curl -s -o /dev/null -w "%{http_code}" -H "Host: api-tour-ai.overpowers.agency" http://localhost:80/api/health'
```

Expected: `200`

- [ ] **Step 2: Verify frontend domain từ VPS**

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'curl -s -o /dev/null -w "%{http_code}" -H "Host: tour-ai.overpowers.agency" http://localhost:80/'
```

Expected: `200`

- [ ] **Step 3: Check SSL certificate status**

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'curl -I -s -o /dev/null -w "%{http_code}" https://api-tour-ai.overpowers.agency/api/health && curl -I -s -o /dev/null -w "%{http_code}" https://tour-ai.overpowers.agency/'
```

Expected: Cả 2 đều `200` hoặc `302/307` (redirect). Nếu đang `404` hoặc timeout, kiểm tra Traefik labels trong compose.

- [ ] **Step 4: Kiểm tra Traefik có detect containers không**

```bash
ssh -i ~/.ssh/tour-ai-openssh.key -o StrictHostKeyChecking=no root@178.128.113.1 \
  'docker exec coolify-proxy traefik http routers list 2>/dev/null || docker logs coolify-proxy --tail 20 | grep -i "ai-tour"'
```

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Frontend container healthy | Task 1 |
| DB schema initialized | Task 2 |
| Domains accessible | Task 3 |

## Placeholder Scan

- No TBD/TODO found in plan.
- All commands are exact with expected output.
- All file paths are absolute.

## Execution Handoff

**Plan saved to:** `docs/superpowers/plans/2026-05-23-deploy-fixes.md`

**Execution options:**

1. **Subagent-Driven (recommended)** - Spawn subagents per task, review between tasks
2. **Inline Execution** - Execute in this session

**Subagent types for this plan:**
- Task 1: General fix agent (docker-compose + Docker rebuild)
- Task 2: DB migration agent (Prisma CLI via Docker exec)
- Task 3: Network verification agent (curl + Traefik checks)

Ready to dispatch?