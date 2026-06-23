export interface AuthSession {
  data: { user: { email: string } } | null
  isPending: boolean
}

export type SocialProvider = "google" | "linkedin"

export interface Credentials {
  email: string
  password: string
}

export interface SignUpInput extends Credentials {
  name: string
}

/**
 * Contrat de la prise auth côté navigateur.
 * Le bouchon (client-stub) et chaque adaptateur de fournisseur (client-adapter)
 * doivent le respecter, pour que l'application voie toujours la même forme.
 */
export interface AuthClient {
  useSession(): AuthSession
  signInSocial(provider: SocialProvider): Promise<unknown>
  signInEmail(input: Credentials): Promise<unknown>
  signUpEmail(input: SignUpInput): Promise<unknown>
  signOut(): void | Promise<unknown>
}
