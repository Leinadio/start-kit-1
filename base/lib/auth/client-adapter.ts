"use client"
import { createAuthClient } from "better-auth/react"
import type { AuthClient } from "@/lib/auth/types"

const authClient = createAuthClient()

// Adapter : on traduit NOTRE contrat vers la forme de better-auth, et on
// normalise les erreurs en exceptions pour que l'UI ait un seul chemin d'erreur.
export const useSession: AuthClient["useSession"] = () => {
  const session = authClient.useSession()
  return {
    data: session.data ? { user: { email: session.data.user.email } } : null,
    isPending: session.isPending,
  }
}

export const signInSocial: AuthClient["signInSocial"] = async (provider) => {
  const { error } = await authClient.signIn.social({ provider, callbackURL: "/" })
  if (error) throw new Error(error.message ?? "Échec de la connexion")
}

export const signInEmail: AuthClient["signInEmail"] = async ({ email, password }) => {
  const { error } = await authClient.signIn.email({ email, password })
  if (error) throw new Error(error.message ?? "Identifiants invalides")
}

export const signUpEmail: AuthClient["signUpEmail"] = async ({ email, password, name }) => {
  const { error } = await authClient.signUp.email({ email, password, name })
  if (error) throw new Error(error.message ?? "Inscription impossible")
}

export const signOut: AuthClient["signOut"] = () => {
  return authClient.signOut()
}
