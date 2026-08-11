import * as Prisma from "@prisma/client";

// Handle environments where the module shape may differ (CommonJS vs ESM)
const PrismaClientCtor = (Prisma as any).PrismaClient ?? (Prisma as any).default ?? Prisma;

const globalForPrisma =
  globalThis as unknown as {
    prisma: any | undefined;
  };

export const prisma = globalForPrisma.prisma ?? new PrismaClientCtor();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}