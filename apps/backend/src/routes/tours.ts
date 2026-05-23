import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { verifyToken } from "../middleware/auth";
import { logAction } from "../utils/actionLog";

const router = Router();

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  destination: z.string().min(1),
  duration: z.string().min(1),
  description: z.string().min(1),
  highlights: z.array(z.string()).default([]),
  itinerary: z.string().optional(),
  priceAdult: z.coerce.number().min(0),
  priceChild: z.coerce.number().optional(),
  currency: z.string().default("VND"),
  maxGroup: z.coerce.number().int().default(30),
  images: z.array(z.string()).default([]),
  isActive: z.coerce.boolean().default(true),
  category: z.string().default("international"),
  tags: z.array(z.string()).default([]),
});

const updateSchema = createSchema.partial();

router.get("/", async (req, res, next) => {
  try {
    const { destination, category, isActive, search, page = "1", limit = "20" } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (destination) where.destination = destination;
    if (category) where.category = category;
    if (isActive != null) where.isActive = isActive === "true";
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: { schedules: { orderBy: { startDate: "asc" } } },
      }),
      prisma.tour.count({ where }),
    ]);

    res.json({ success: true, data, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: req.params.id },
      include: { schedules: { orderBy: { startDate: "asc" } }, bookings: true },
    });
    if (!tour) throw new AppError("Tour not found", 404);
    res.json({ success: true, data: tour });
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const tour = await prisma.tour.create({ data: body });
    await logAction({ req, entity: "tour", entityId: tour.id, action: "create", newValue: tour });
    res.status(201).json({ success: true, data: tour });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", verifyToken, async (req, res, next) => {
  try {
    const body = updateSchema.parse(req.body);
    const existing = await prisma.tour.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Tour not found", 404);

    const tour = await prisma.tour.update({ where: { id: req.params.id }, data: body });
    await logAction({ req, entity: "tour", entityId: tour.id, action: "update", oldValue: existing, newValue: tour });
    res.json({ success: true, data: tour });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const existing = await prisma.tour.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError("Tour not found", 404);

    await prisma.tour.delete({ where: { id: req.params.id } });
    await logAction({ req, entity: "tour", entityId: req.params.id, action: "delete", oldValue: existing });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
