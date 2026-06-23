import { PrismaClient } from "@prisma/client"
import type { DatabaseAdapter } from "@/lib/adapters/types"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const prismaDatabaseAdapter: DatabaseAdapter = {
  isReady() {
    return true
  },
}
