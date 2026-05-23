# Kiến Trúc VPS-based (Đơn giản hơn Cloudflare)

## Tại sao VPS tốt hơn Cloudflare cho dự án này?

| Tiêu chí | Cloudflare | VPS Ubuntu của bạn |
|----------|-----------|-------------------|
| **Server limit** | 30 giây/request | Không giới hạn |
| **Database** | D1 đơn giản | PostgreSQL/MySQL đầy đủ |
| **File storage** | R2 phức tạp | Local disk vô hạn |
| **AI model** | Chỉ gọi API bên ngoài | Có thể chạy local model (Llama, v.v.) |
| **Cost** | Free nhưng giới hạn | Đã trả rồi, dùng tối đa |
| **Complexity** | Nhiều service rời rạc | Một server, dễ control |

**Verdict:** VPS phù hợp hơn cho production AI Agent system.

---

## Kiến trúc đề xuất mới (Docker Compose)

```
VPS Ubuntu (1 server)
│
├─ Nginx (reverse proxy + SSL)
│   ├─ /api → Backend API
│   ├─ / → Next.js Dashboard
│   └─ /webhook → Zalo webhook
│
├─ Backend API (Node.js/Express hoặc Fastify)
│   ├─ Zalo webhook handler
│   ├─ AI Agent orchestrator
│   ├─ Booking API
│   └─ Auth/Admin API
│
├─ PostgreSQL (database chính)
│   ├─ users
│   ├─ customers
│   ├─ bookings
│   ├─ tours
│   └─ messages
│
├─ Redis (cache + session)
│   ├─ Zalo session
│   ├─ Rate limit
│   └─ Cache pricing
│
├─ Qdrant (vector DB — tùy chọn self-hosted)
│   └─ AI memory / RAG
│
├─ Next.js Dashboard (hoặc chạy riêng trên Vercel)
│   └─ Admin UI
│
└─ PM2 (process manager — giữ API luôn chạy)
```

## Stack kỹ thuật đề xuất

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| **Backend** | Node.js + TypeScript + Express/Fastify | Dễ viết, ecosystem lớn, AI SDK tốt |
| **Database** | PostgreSQL + Prisma ORM | Relational, type-safe, migration dễ |
| **Cache** | Redis | Session, rate limit, cache nhanh |
| **Vector DB** | Qdrant (Docker) hoặc Chroma (nhẹ hơn) | RAG cho AI |
| **Frontend** | Next.js 14 (App Router) + Tailwind | Dashboard nhanh, SSR |
| **AI** | OpenAI API + Claude API | GPT-4o cho chat, Claude cho reasoning |
| **Deploy** | Docker Compose + PM2 | Một lệnh chạy tất cả |
| **SSL** | Let's Encrypt + Certbot | Miễn phí, tự động renew |

## Triết lý giữ nguyên

1. **AI không được hallucinate** → RAG + Qdrant bắt buộc
2. **Frontend chỉ render** → Logic ở backend
3. **Không dùng Google Sheet** → Dashboard là nguồn chính
4. **Action log đầy đủ** → Mọi thao tác có audit trail
5. **Human handoff** → AI tự chuyển nhân viên khi cần

## Những gì tôi cần từ bạn

1. **Domain name** đã có chưa? (Ví dụ: touragent.yourcompany.com)
2. **VPS specs:** RAM bao nhiêu? (Để tôi biết có chạy Qdrant local được không)
3. **Zalo OA:** Đã đăng ký chưa?
4. **Dữ liệu tour:** Có sẵn file Excel/CSV không?
