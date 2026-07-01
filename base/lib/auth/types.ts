export interface AuthSession {
  data: { user: { email: string; name?: string; image?: string | null } } | null
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

export interface UpdateProfileInput {
  name?: string
  image?: string
}

export interface ChangeEmailInput {
  newEmail: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
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
  updateProfile(input: UpdateProfileInput): Promise<void>
  changeEmail(input: ChangeEmailInput): Promise<void>
  changePassword(input: ChangePasswordInput): Promise<void>
  deleteAccount(): Promise<void>
}
