import { betterAuthAdapter } from "@/lib/auth/server"
import { prismaDatabaseAdapter } from "@/lib/database/client"
import type { Adapters } from "@/lib/adapters/types"
import { authStub } from "@/lib/auth/stub"
import { databaseStub } from "@/lib/database/stub"
import { paymentStub } from "@/lib/payment/stub"
import { emailStub } from "@/lib/email/stub"
import { analyticsStub } from "@/lib/analytics/stub"

export const adapters: Adapters = {
  // @adapter:auth start
  auth: betterAuthAdapter,
  // @adapter:auth end
  // @adapter:database start
  database: prismaDatabaseAdapter,
  // @adapter:database end
  // @adapter:payment start
  payment: paymentStub,
  // @adapter:payment end
  // @adapter:email start
  email: emailStub,
  // @adapter:email end
  // @adapter:analytics start
  analytics: analyticsStub,
  // @adapter:analytics end
}
