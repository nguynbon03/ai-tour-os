import { PrismaClient } from "../../../packages/prisma/node_modules/.prisma/client";

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

export const prisma: PrismaClient = globalForPrisma.__prisma ?? new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
