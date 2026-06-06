import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Singleton PrismaClient for Next.js
// ---------------------------------------------------------------------------
// In development, Next.js hot-reloads modules on every save. Without a
// singleton, each reload creates a NEW PrismaClient, eventually exhausting
// the database connection pool. The globalThis trick ensures a single
// instance is re-used across reloads.
//
// In production, module-level caching handles this automatically.
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
