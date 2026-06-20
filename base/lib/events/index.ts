import { memoryBus } from "@/lib/events/memory-bus"
import type { EventBusAdapter } from "@/lib/events/types"

// @adapter:eventbus start
export const eventBus: EventBusAdapter = memoryBus
// @adapter:eventbus end
