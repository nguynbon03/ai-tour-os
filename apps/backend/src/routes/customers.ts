import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { verifyToken } from "../middleware/auth";
import { logAction } from "../utils/actionLog";

const router = Router();

const createSchema = z.object({
  zaloId: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.enum(["ZALO", "FACEBOOK", "WEBSITE", "REFERRAL", "WALKIN"]).default("ZALO"),
  status: z.enum(["LEAD", "INTERESTED", "QUOTED", "BOOKED", "COMPLETED", "CANCELLED"]).default("LEAD"),
  budget: z.string().optional(),
  preferences: z.string().optional(),
  birthday: z.coerce.date().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const {
      search,
      status,
      source,
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const orderBy = { [sortBy]: order };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          _count: { select: { bookings: true, messages: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { bookings: true, messages: { orderBy: { createdAt: "desc" }, take: 20 }, followUps: true },
    });
    if (!customer) throw new AppError("Customer not found", 404);
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const customer = await prisma.customer.create({ data: body });

    await logAction({ req, entity: "customer", entityId: customer.id, action: "create", newValue: customer });
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", verifyToken, async (req, res, next) => {
  try {
    const body = updateSchema.parse(req.body);
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Customer not found", 404);

    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: body });

    await logAction({ req, entity: "customer", entityId: customer.id, action: "update", oldValue: existing, newValue: customer });
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Customer not found", 404);

    await prisma.customer.delete({ where: { id: req.params.id } });
    await logAction({ req, entity: "customer", entityId: req.params.id, action: "delete", oldValue: existing });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
