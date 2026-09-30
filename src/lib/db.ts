import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      // pg waits forever by default, so a query on a dropped connection would leave the page
      // loading indefinitely. Fail fast instead: the broken connection is discarded and the
      // error boundary offers "Try again".
      connectionTimeoutMillis: 5_000,
      query_timeout: 10_000,
      keepAlive: true,
    }),
  });
}

// Reuse one client across hot reloads in development instead of opening a new pool each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
