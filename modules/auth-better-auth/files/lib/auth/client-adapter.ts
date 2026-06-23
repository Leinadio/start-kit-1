"use client"
import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient()

// Adapter : on traduit la forme de better-auth vers NOTRE forme standard.
export function useSession() {
  const session = authClient.useSession()
  return {
    data: session.data ? { user: { email: session.data.user.email } } : null,
    isPending: session.isPending,
  }
}
export function signIn() {
  return authClient.signIn.social({ provider: "github" })
}
export function signOut() {
  return authClient.signOut()
}
