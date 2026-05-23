import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import * as zaloOA from "../services/zaloOA";

const router = Router();

const webhookSchema = z.object({
  sender: z.object({ id: z.string() }).passthrough(),
  message: z.object({ text: z.string() }).passthrough(),
  timestamp: z.coerce.number().optional(),
});

const sendMessageSchema = z.object({
  userId: z.string().min(1),
  text: z.string().min(1),
  customerId: z.string().optional(),
});

export async function upsertCustomerByZalo(zaloId: string, name = "Zalo User") {
  const existing = await prisma.customer.findUnique({ where: { zaloId } });
  if (existing) return existing;
  return prisma.customer.create({
    data: { zaloId, name, source: "ZALO" },
  });
}

// POST /api/zalo/webhook — nhận tin nhắn từ Zalo OA webhook
router.post("/webhook", async (req, res, next) => {
  try {
    const body = webhookSchema.parse(req.body);
    const zaloId = body.sender.id;
    const content = body.message.text;

    const customer = await upsertCustomerByZalo(zaloId);

    const message = await prisma.message.create({
      data: {
        customerId: customer.id,
        platform: "zalo",
        direction: "INBOUND",
        content,
        rawPayload: JSON.stringify(req.body),
      },
    });

    // TODO: trigger AI response here

    res.status(201).json({ success: true, data: { message, customer } });
  } catch (err) {
    next(err);
  }
});

// POST /api/zalo/send — gửi tin nhắn từ admin qua Zalo OA
router.post("/send", async (req, res, next) => {
  try {
    const { userId, text, customerId } = sendMessageSchema.parse(req.body);
    const result = await zaloOA.sendTextMessage(userId, text);

    if (customerId) {
      await prisma.message.create({
        data: {
          customerId,
          platform: "zalo",
          direction: "OUTBOUND",
          content: text,
          rawPayload: JSON.stringify(result),
        },
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/zalo/followers — lấy danh sách followers
router.get("/followers", async (_req, res, next) => {
  try {
    const data = await zaloOA.getFollowers();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/zalo/oa-info — lấy thông tin OA
router.get("/oa-info", async (_req, res, next) => {
  try {
    const data = await zaloOA.getOAInfo();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/zalo/user-profile?userId=xxx — lấy profile user
router.get("/user-profile", async (req, res, next) => {
  try {
    const userId = z.string().min(1).parse(req.query.userId);
    const data = await zaloOA.getUserProfile(userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/zalo/config — kiểm tra cấu hình
router.get("/config", (_req, res) => {
  const tokenExists = !!process.env.ZALO_OA_ACCESS_TOKEN;
  res.json({ success: true, data: { configured: tokenExists } });
});

export default router;
