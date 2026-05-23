import { prisma } from "../lib/prisma";
import type { Request } from "express";

export async function logAction(opts: {
  req?: Request;
  userId?: string | null;
  bookingId?: string | null;
  entity: string;
  entityId: string;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
}): Promise<void> {
  try {
    await prisma.actionLog.create({
      data: {
        userId: opts.userId ?? opts.req?.user?.id ?? null,
        bookingId: opts.bookingId ?? null,
        entity: opts.entity,
        entityId: opts.entityId,
        action: opts.action,
        oldValue: opts.oldValue != null ? JSON.stringify(opts.oldValue) : null,
        newValue: opts.newValue != null ? JSON.stringify(opts.newValue) : null,
        ip: opts.req?.ip ?? null,
        userAgent: opts.req?.get("user-agent") ?? null,
      },
    });
  } catch (err) {
    console.error("ActionLog failed:", err);
  }
}
