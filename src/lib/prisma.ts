import { PrismaClient } from "@/generated/prisma";

// Standardni Next.js singleton obrazac — sprječava da svaki hot-reload u dev modu otvori novu
// konekciju na bazu (Prisma klijent bi se inače instancirao iznova pri svakoj promjeni fajla).
const globalZaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalZaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalZaPrisma.prisma = prisma;
}
