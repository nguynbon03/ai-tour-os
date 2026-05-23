import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

const webhookSchema = z.object({
  sender: z.object({ id: z.string() }).passthrough(),
  message: z.object({ text: z.string() }).passthrough(),
  timestamp: z.coerce.number().optional(),
});

export async function upsertCustomerByZalo(zaloId: string, name = "Zalo User") {
  const existing = await prisma.customer.findUnique({ where: { zaloId } });
  if (existing) return existing;

  return prisma.customer.create({
    data: { zaloId, name, source: "ZALO" },
  });
}

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

    res.status(201).json({ success: true, data: { message, customer } });
  } catch (err) {
    next(err);
  }
});

export default router;
