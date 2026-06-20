import type { Adapters } from "@/lib/adapters/types"
import { authStub } from "@/lib/adapters/stubs/auth-stub"
import { databaseStub } from "@/lib/adapters/stubs/database-stub"
import { paymentStub } from "@/lib/adapters/stubs/payment-stub"
import { emailStub } from "@/lib/adapters/stubs/email-stub"
import { analyticsStub } from "@/lib/adapters/stubs/analytics-stub"

export const adapters: Adapters = {
  // @adapter:auth start
  auth: authStub,
  // @adapter:auth end
  // @adapter:database start
  database: databaseStub,
  // @adapter:database end
  // @adapter:payment start
  payment: null,
  // @adapter:payment end
  // @adapter:email start
  email: emailStub,
  // @adapter:email end
  // @adapter:analytics start
  analytics: analyticsStub,
  // @adapter:analytics end
}
