import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import type { DatabaseAdapter } from "@/lib/adapters/types"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const prismaDatabaseAdapter: DatabaseAdapter = {
  isReady() {
    return true
  },
}
