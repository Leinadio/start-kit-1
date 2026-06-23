export interface AuthSession {
  data: { user: { email: string } } | null
  isPending: boolean
}

/**
 * Contrat de la prise auth côté navigateur.
 * Le bouchon (client-stub) et chaque adaptateur de fournisseur (client-adapter)
 * doivent le respecter, pour que l'application voie toujours la même forme.
 */
export interface AuthClient {
  useSession(): AuthSession
  signIn(): void | Promise<unknown>
  signOut(): void | Promise<unknown>
}
