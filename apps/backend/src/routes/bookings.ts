import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { verifyToken } from "../middleware/auth";
import { logAction } from "../utils/actionLog";

const router = Router();

const createSchema = z.object({
  code: z.string().min(1),
  customerId: z.string().min(1),
  scheduleId: z.string().min(1),
  tourId: z.string().min(1),
  adults: z.coerce.number().int().min(1).default(1),
  children: z.coerce.number().int().min(0).default(0),
  totalPrice: z.coerce.number().min(0),
  deposit: z.coerce.number().optional(),
  specialRequest: z.string().optional(),
  passportInfo: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "DEPOSIT_PAID", "FULLY_PAID", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]).optional(),
  adults: z.coerce.number().int().min(1).optional(),
  children: z.coerce.number().int().min(0).optional(),
  totalPrice: z.coerce.number().min(0).optional(),
  deposit: z.coerce.number().optional(),
  paid: z.coerce.number().min(0).optional(),
  specialRequest: z.string().optional(),
  passportInfo: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z.coerce.number().min(0),
  method: z.enum(["BANK", "CASH", "MOMO", "ZALOPAY", "VNPAY", "CARD"]).default("BANK"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const { status, customerId, page = "1", limit = "20", from, to } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { id: true, name: true, phone: true } }, tour: { select: { id: true, name: true } }, schedule: true, payments: true },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { customer: true, tour: true, schedule: true, payments: true, actionLogs: true },
    });
    if (!booking) throw new AppError("Booking not found", 404);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const schedule = await prisma.tourSchedule.findUnique({ where: { id: body.scheduleId } });
    if (!schedule) throw new AppError("Schedule not found", 400);

    const booking = await prisma.booking.create({ data: body });
    await logAction({ req, bookingId: booking.id, entity: "booking", entityId: booking.id, action: "create", newValue: booking });
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", verifyToken, async (req, res, next) => {
  try {
    const body = updateSchema.parse(req.body);
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Booking not found", 404);

    const booking = await prisma.booking.update({ where: { id: req.params.id }, data: body });
    await logAction({ req, bookingId: booking.id, entity: "booking", entityId: booking.id, action: "update", oldValue: existing, newValue: booking });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Booking not found", 404);

    await prisma.booking.delete({ where: { id: req.params.id } });
    await logAction({ req, entity: "booking", entityId: req.params.id, action: "delete", oldValue: existing });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/payments", verifyToken, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) throw new AppError("Booking not found", 404);

    const body = paymentSchema.parse(req.body);
    const payment = await prisma.payment.create({
      data: { ...body, amount: body.amount, bookingId: req.params.id },
    });

    await logAction({ req, bookingId: booking.id, entity: "payment", entityId: payment.id, action: "create", newValue: payment });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
});

export default router;
