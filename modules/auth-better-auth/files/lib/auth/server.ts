import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/database/client"
import type { AuthAdapter } from "@/lib/adapters/types"
import { headers } from "next/headers"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
})

export const betterAuthAdapter: AuthAdapter = {
  async getSession() {
    const result = await auth.api.getSession({ headers: await headers() })
    if (!result?.session) return null
    return { userId: result.user.id, email: result.user.email }
  },
  async signOut() {},
}
