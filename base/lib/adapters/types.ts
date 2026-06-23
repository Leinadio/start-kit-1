export interface Session {
  userId: string
  email: string
}

export interface AuthAdapter {
  getSession(): Promise<Session | null>
  signOut(): Promise<void>
}

export interface DatabaseAdapter {
  isReady(): boolean
}

export interface PaymentAdapter {
  handleWebhook(req: Request): Promise<void>
}

export interface EmailAdapter {
  send(to: string, message: string): Promise<void>
}

export interface AnalyticsAdapter {
  track(userId: string, event: string, props?: Record<string, unknown>): void
}

export interface Adapters {
  auth: AuthAdapter
  database: DatabaseAdapter
  payment: PaymentAdapter
  email: EmailAdapter
  analytics: AnalyticsAdapter
}
