import { Router } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/dashboard", verifyToken, async (req, res, next) => {
  try {
    const { from, to } = req.query as Record<string, string>;
    const dateFilter: Record<string, unknown> = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) (dateFilter.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) (dateFilter.createdAt as Record<string, unknown>).lte = new Date(to);
    }

    const [
      totalCustomers,
      totalBookings,
      totalRevenueAgg,
      pendingBookings,
      newCustomersToday,
      totalTours,
      activeTours,
      todayMessages,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.tour.count(),
      prisma.tour.count({ where: { isActive: true } }),
      prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const revenue = totalRevenueAgg._sum.totalPrice ?? 0;

    const bookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const customersByStatus = await prisma.customer.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalBookings,
        revenue,
        pendingBookings,
        newCustomersToday,
        totalTours,
        activeTours,
        todayMessages,
        bookingsByStatus: bookingsByStatus.map((s) => ({ status: s.status, count: s._count.status })),
        customersByStatus: customersByStatus.map((s) => ({ status: s.status, count: s._count.status })),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
