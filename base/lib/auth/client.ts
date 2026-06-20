"use client"
// @prise:auth-client start
export function useSession() {
  return { data: null as null | { user: { email: string } }, isPending: false }
}
export function signIn() {
  throw new Error("Aucun module d'authentification installé")
}
export function signOut() {}
// @prise:auth-client end
