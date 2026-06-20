export type AppEvents = {
  "payment.succeeded": { userId: string; amount: number }
  "auth.signedOut": { userId: string }
}

export interface EventBusAdapter {
  emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): void
  on<K extends keyof AppEvents>(event: K, handler: (payload: AppEvents[K]) => void): void
}
