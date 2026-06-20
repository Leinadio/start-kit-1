import type { EmailAdapter } from "@/lib/adapters/types"

export const emailStub: EmailAdapter = {
  async send() {},
}
