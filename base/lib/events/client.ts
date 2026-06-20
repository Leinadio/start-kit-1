"use client"
import type { AppEvents, EventBusAdapter } from "@/lib/events/types"

type Handler = (payload: unknown) => void
const handlers = new Map<string, Set<Handler>>()

export const clientBus: EventBusAdapter = {
  emit(event, payload) {
    handlers.get(event)?.forEach((h) => h(payload))
  },
  on(event, handler) {
    if (!handlers.has(event)) handlers.set(event, new Set())
    handlers.get(event)!.add(handler as Handler)
  },
}
