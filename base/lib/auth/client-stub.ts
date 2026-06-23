"use client"
import type { AuthClient } from "@/lib/auth/types"

const notInstalled = () => {
  throw new Error("Aucun module d'authentification installé")
}

export const useSession: AuthClient["useSession"] = () => {
  return { data: null, isPending: false }
}
export const signInSocial: AuthClient["signInSocial"] = async () => notInstalled()
export const signInEmail: AuthClient["signInEmail"] = async () => notInstalled()
export const signUpEmail: AuthClient["signUpEmail"] = async () => notInstalled()
export const signOut: AuthClient["signOut"] = () => {}
