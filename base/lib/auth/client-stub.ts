"use client"
import type { AuthClient } from "@/lib/auth/types"

export const useSession: AuthClient["useSession"] = () => {
  return { data: null, isPending: false }
}
export const signIn: AuthClient["signIn"] = () => {
  throw new Error("Aucun module d'authentification installé")
}
export const signOut: AuthClient["signOut"] = () => {}
