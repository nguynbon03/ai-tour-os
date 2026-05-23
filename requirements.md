# AI Tour Operating System — Infrastructure Requirements
## Generated: 2026-05-23

## 1. TẠI SAO LẠI CẦN CLOUDFLARE? GIẢI THÍCH CHO NGƯỜI KHÔNG BIẾT CODE

### Cloudflare là gì?
Cloudflare không phải là "mây" trừu tượng. Nó là một công ty cung cấp hạ tầng internet với các sản phẩm cụ thể:

| Sản phẩm | Mô tả đơn giản | Vai trò trong dự án của bạn |
|----------|---------------|----------------------------|
| **Cloudflare Workers** | Chạy code backend mà không cần server riêng | API Gateway — xử lý auth, webhook Zalo, gọi AI |
| **Cloudflare D1** | Database SQL nhẹ, serverless | Lưu booking, khách hàng, lịch sử chat |
| **Cloudflare KV** | Bộ nhớ tạm siêu nhanh | Cache giá tour, session khách, FAQ hot |
| **Cloudflare R2** | Lưu trữ file (như S3 của Amazon) | Lưu ảnh tour, file booking, hóa đơn |
| **Cloudflare Pages** | Hosting website | Chạy dashboard admin |

### Tóm tắt: Cloudflare = "Thuê server không cần quản lý server"
- Không cần cài đặt Linux, không cần cấu hình nginx, không lo server crash
- Bạn chỉ viết code → upload lên → chạy ngay
- Chi phí: **Miễn phí hoặc rẻ** (Worker free: 100k request/ngày, D1 free: 5GB)

---

## 2. DEBATE: TẠI SAO KHÔNG DÙNG VPS THUÊ (Ví dụ: DigitalOcean, Linode)?

### Kiến trúc VPS truyền thống (cách "cũ"):
```
Thuê VPS ($5-20/tháng)
→ Cài Ubuntu
→ Cài Nginx
→ Cài Node.js
→ Cài Database (PostgreSQL/MySQL)
→ Cài Redis
→ Cấu hình SSL
→ Cấu hình Firewall
→ Deploy code thủ công
→ Nếu crash: SSH vào fix lỗi
```

### Kiến trúc Cloudflare (cách "mới", phù hợp AI Agent):
```
Viết code JavaScript/TypeScript
→ Upload lên Cloudflare Workers
→ Tự động có SSL
→ Tự động scale
→ Database D1 tích hợp sẵn
→ Cache KV tích hợp sẵn
→ Không cần cài gì cả
```

### So sánh trực tiếp:

| Tiêu chí | VPS truyền thống | Cloudflare |
|----------|-----------------|------------|
| **Thời gian setup** | 2-4 giờ (cài OS, cài soft) | 5 phút (tạo account, deploy code) |
| **Chi phí** | $5-20/tháng | **Free** hoặc $5/tháng |
| **Scale** | Phải nâng cấp VPS thủ công | Tự động |
| **Bảo trì** | Bạn tự update, patch security | Cloudflare lo hết |
| **SSL/HTTPS** | Cài Let's Encrypt, renew 3 tháng/lần | Tự động |
| **Downtime** | Nếu server crash, web die | Không có server để crash |
| **Tốc độ** | Phụ thuộc data center bạn chọn | 300+ data center toàn cầu |
| **Độ phức tạp** | CAO — cần biết sysadmin | THẤP — chỉ cần biết code |
| **Phù hợp AI Agent?** | Không tối ưu | **Rất tối ưu** (Workers chạy ngắn, phản hồi nhanh) |

### VERDICT (Quyết định của tôi):
✅ **Dùng Cloudflare** cho dự án này vì:
1. Bạn là founder, không phải sysadmin — thời gian bạn đáng giá hơn $5/tháng
2. AI Agent cần phản hồi nhanh (1-3 giây) → Workers phù hợp
3. Zalo webhook cần HTTPS public URL → Workers có sẵn
4. Không cần lo server maintenance khi bạn đang focus vào business

⚠️ **Giới hạn của Cloudflare:**
- Worker chạy tối đa 30 giây/request (không phù hợp xử lý file nặng)
- D1 database còn đơn giản (không bằng PostgreSQL phức tạp)
- Không chạy được Docker container

→ **Đối với dự án AI Tour:** Các giới hạn này không ảnh hưởng vì AI Agent xử lý tin nhắn text, không phải xử lý video nặng.

---

## 3. KIẾN TRÚC TỔNG THỂ (Đơn giản hóa)

```
KHÁCH HÀNG (Zalo App)
       │
       ▼
┌─────────────────────┐
│    ZALO OFFICIAL    │  ← Miễn phí, cần đăng ký OA
│    ACCOUNT (OA)     │
└──────────┬──────────┘
           │ Webhook
           ▼
┌─────────────────────┐
│  CLOUDFLARE WORKER  │  ← API Gateway, xử lý tin nhắn
│  (JavaScript/TS)    │     Auth, Rate limit, Routing
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌──────────┐ ┌──────────┐
│   D1     │ │   KV     │  ← Database + Cache
│ (SQL)    │ │ (Cache)  │
└────┬─────┘ └──────────┘
     │
     ▼
┌─────────────────────┐
│  QDRANT (RAG)       │  ← Memory AI, dữ liệu tour
│  (Vector Database)  │     Có thể dùng Qdrant Cloud miễn phí
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌──────────┐ ┌──────────┐
│  OpenAI  │ │  Claude  │  ← AI Brain (chọn 1 hoặc cả 2)
│  (GPT-4o)│ │ (Sonnet) │
└──────────┘ └──────────┘
           │
           ▼
┌─────────────────────┐
│   ADMIN DASHBOARD   │  ← Web app quản lý
│ (Next.js + Vercel)  │     Xem booking, sửa giá, analytics
└─────────────────────┘
```

---

## 4. DANH SÁCH NHỮNG GÌ BẠN CẦN CHUẨN BỊ

### 4.1 Tài khoản miễn phí cần tạo (theo thứ tự):

| # | Tài khoản | Mục đích | Chi phí | Link đăng ký |
|---|-----------|----------|---------|--------------|
| 1 | **GitHub** | Lưu code, auto deploy | Miễn phí | github.com |
| 2 | **Cloudflare** | Worker, D1, KV | Miễn phí | dash.cloudflare.com |
| 3 | **Qdrant Cloud** | Vector DB cho AI memory | Miễn phí (1GB) | qdrant.io |
| 4 | **OpenAI** | GPT-4o API | Trả theo usage | platform.openai.com |
| 5 | **Vercel** | Host dashboard | Miễn phí | vercel.com |
| 6 | **Zalo Official Account** | Kênh chat khách hàng | Miễn phí | oa.zalo.me |

### 4.2 API Keys cần lấy (sau khi đăng ký):

- OpenAI API Key
- Qdrant API Key + Cluster URL
- Zalo OA App ID + Secret Key
- Cloudflare API Token

### 4.3 Tools cần cài trên máy tính:

```bash
# 1. Node.js (chạy JavaScript)
# Tải từ: https://nodejs.org (LTS version)

# 2. Wrangler (CLI của Cloudflare)
npm install -g wrangler

# 3. Git (nếu chưa có)
# Tải từ: https://git-scm.com
```

### 4.4 Kiến thức cần có (hoặc tôi sẽ làm hộ):

- **Không bắt buộc** biết code sâu vì tôi sẽ viết code cho bạn
- Cần hiểu concept: webhook là gì, API là gì, database là gì (tôi sẽ giải thích)
- Cần biết sử dụng terminal cơ bản

---

## 5. DEBATE: TẠI SAO KHÔNG DÙNG GOOGLE SHEET NHƯ TRONG BÀI POST GỐC?

### Nguyên bản trong post:
```
Google Sheet → Sync → Cloudflare D1/KV → Qdrant → AI
```

### Vấn đề với Google Sheet làm nguồn chính:
1. **Không real-time:** Sheet không thể trigger AI Agent ngay khi có tin nhắn
2. **Không scale:** 1000 khách hàng nhắn cùng lúc → Sheet không xử lý nổi
3. **Race condition:** 2 nhân viên sửa cùng một ô → mất dữ liệu
4. **Không có webhook:** Zalo không thể gửi tin nhắn vào Google Sheet
5. **Khó phân quyền:** Không thể set "A sửa được giá, B không sửa được"

### Kết luận:
❌ **Bỏ hoàn toàn Google Sheet làm nguồn chính**
✅ **Dùng Dashboard làm nguồn chính** (đúng như bạn nói: "Tôi không dùng sheet đâu dùng dashboard luôn")

Google Sheet chỉ dùng để:
- Export báo cáo cuối tháng (backup)
- Import dữ liệu lần đầu (bulk upload)
- Không dùng làm nguồn production

---

## 6. ESTIMATE THỜI GIAN & CHI PHÍ

### Chi phí hàng tháng (ước tính):

| Hạng mục | Chi phí |
|----------|---------|
| Cloudflare Workers | **$0** (miễn phí 100k request/ngày) |
| Cloudflare D1 | **$0** (miễn phí 5GB) |
| Cloudflare KV | **$0** (miễn phí) |
| Qdrant Cloud | **$0** (miễn phí 1GB) |
| Vercel | **$0** (miễn phí) |
| Zalo OA | **$0** (miễn phí) |
| OpenAI API | **$20-100/tháng** (tùy lượng chat) |
| **TỔNG** | **$0-100/tháng** |

### Thời gian build (estimate):

| Phase | Thời gian | Nội dung |
|-------|-----------|----------|
| Setup accounts | 1-2 giờ | Tạo tất cả tài khoản trên |
| Core API (Cloudflare Worker) | 1-2 ngày | Zalo webhook, auth, routing |
| AI Agent (Orchestrator) | 2-3 ngày | Intent detection, RAG, response |
| Dashboard (Next.js) | 2-3 ngày | UI quản lý booking, tour |
| Integration & Test | 1-2 ngày | Kết nối tất cả, test end-to-end |
| **TỔNG** | **1-2 tuần** | Full system |

---

## 7. CÂU HỎI CHO BẠN TRƯỚC KHI BẮT ĐẦU

1. Bạn có sẵn sàng tạo các tài khoản trên không, hay tôi hướng dẫn từng bước?
2. Bạn muốn dùng AI nào? OpenAI GPT-4o, Claude (Anthropic), hay cả hai?
3. Bạn đã có Zalo Official Account chưa, hay cần tôi hướng dẫn đăng ký?
4. Dữ liệu tour của bạn hiện ở đâu? Excel, Facebook, trong đầu, hay chưa có?
5. Bạn muốn tôi bắt đầu bằng phần nào trước? (API backend / Dashboard UI / Zalo Integration)
