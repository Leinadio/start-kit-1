"use client"
import { createAuthClient } from "better-auth/react"
import type { AuthClient } from "@/lib/auth/types"

const authClient = createAuthClient()

// Adapter : on traduit la forme de better-auth vers NOTRE forme standard.
export const useSession: AuthClient["useSession"] = () => {
  const session = authClient.useSession()
  return {
    data: session.data ? { user: { email: session.data.user.email } } : null,
    isPending: session.isPending,
  }
}
export const signIn: AuthClient["signIn"] = () => {
  return authClient.signIn.social({ provider: "github" })
}
export const signOut: AuthClient["signOut"] = () => {
  return authClient.signOut()
}
