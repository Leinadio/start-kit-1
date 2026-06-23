import { readFileSync } from "node:fs"
import { join } from "node:path"

export interface Wiring {
  file: string
  marker: string
  type: "replace" | "line"
  import?: string
  installedValue: string
  defaultValue?: string
}

/**
 * A listener is an event-bus hook that a module registers at bootstrap time.
 * `import` is a full import statement to insert at the top of bootstrap.ts.
 * `call` is the function call line to insert inside the @modules start/end block.
 * Example: { import: 'import { registerNotificationListeners } from "@/lib/notifications"', call: '  registerNotificationListeners()' }
 */
export interface Listener {
  import: string
  call: string
}

export interface ModuleManifest {
  name: string
  provides: string[]
  requires: string[]
  deps: string[]
  devDeps?: string[]
  env: string[]
  files: string[]
  wiring: Wiring[]
  /** Optional event-bus listener hooks to wire into base/lib/bootstrap.ts */
  listeners?: Listener[]
}

export function readManifest(moduleDir: string): ModuleManifest {
  const raw = readFileSync(join(moduleDir, "module.json"), "utf8")
  const m = JSON.parse(raw) as ModuleManifest
  if (!m.name || !Array.isArray(m.provides)) {
    throw new Error(`Fiche invalide dans ${moduleDir}`)
  }
  for (const w of m.wiring ?? []) {
    if (w.installedValue === undefined || w.installedValue === null) {
      throw new Error(`Fiche invalide dans ${moduleDir}: branchement "${w.marker}" manque installedValue`)
    }
    if (w.type === "replace" && w.defaultValue === undefined) {
      throw new Error(`Fiche invalide dans ${moduleDir}: branchement "${w.marker}" de type replace manque defaultValue`)
    }
  }
  return m
}
