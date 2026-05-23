import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { verifyToken } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  customerId: z.string().min(1),
  platform: z.string().default("zalo"),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  content: z.string().min(1),
  rawPayload: z.string().optional(),
  aiHandled: z.coerce.boolean().default(false),
  aiContext: z.string().optional(),
});

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const { customerId, platform, page = "1", limit = "50" } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (platform) where.platform = platform;

    const [data, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { id: true, name: true } } },
      }),
      prisma.message.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
});

router.get("/customers/:id", verifyToken, async (req, res, next) => {
  try {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const [data, total] = await Promise.all([
      prisma.message.findMany({
        where: { customerId: req.params.id },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "asc" },
      }),
      prisma.message.count({ where: { customerId: req.params.id } }),
    ]);
    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
    if (!customer) throw new AppError("Customer not found", 400);

    const message = await prisma.message.create({ data: body });
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

export default router;
