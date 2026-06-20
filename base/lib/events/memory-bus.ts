import { EventEmitter } from "node:events"
import type { EventBusAdapter } from "@/lib/events/types"

const emitter = new EventEmitter()
emitter.setMaxListeners(50)

export const memoryBus: EventBusAdapter = {
  emit(event, payload) {
    emitter.emit(event, payload)
  },
  on(event, handler) {
    emitter.on(event, handler as (payload: unknown) => void)
  },
}
