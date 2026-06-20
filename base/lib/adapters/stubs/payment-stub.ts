import type { PaymentAdapter } from "@/lib/adapters/types"

export const paymentStub: PaymentAdapter = {
  async handleWebhook() {
    throw new Error("Aucun module de paiement installé")
  },
}
