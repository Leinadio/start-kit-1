import type { DatabaseAdapter } from "@/lib/adapters/types"

export const databaseStub: DatabaseAdapter = {
  isReady() {
    return false
  },
}
