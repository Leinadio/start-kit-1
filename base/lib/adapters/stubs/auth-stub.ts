import type { AuthAdapter } from "@/lib/adapters/types"

export const authStub: AuthAdapter = {
  async getSession() {
    return null
  },
  async signOut() {},
}
