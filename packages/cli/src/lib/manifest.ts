import { readFileSync } from "node:fs"
import { join } from "node:path"

export interface Branchement {
  fichier: string
  marqueur: string
  type: "remplacement" | "ligne"
  import?: string
  valeurInstallee: string
  valeurParDefaut?: string
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
  remplitLesPrises: string[]
  besoinDesPrises: string[]
  deps: string[]
  devDeps?: string[]
  env: string[]
  files: string[]
  branchements: Branchement[]
  /** Optional event-bus listener hooks to wire into base/lib/bootstrap.ts */
  listeners?: Listener[]
}

export function readManifest(moduleDir: string): ModuleManifest {
  const raw = readFileSync(join(moduleDir, "module.json"), "utf8")
  const m = JSON.parse(raw) as ModuleManifest
  if (!m.name || !Array.isArray(m.remplitLesPrises)) {
    throw new Error(`Fiche invalide dans ${moduleDir}`)
  }
  for (const b of m.branchements ?? []) {
    if (b.valeurInstallee === undefined || b.valeurInstallee === null) {
      throw new Error(`Fiche invalide dans ${moduleDir}: branchement "${b.marqueur}" manque valeurInstallee`)
    }
    if (b.type === "remplacement" && b.valeurParDefaut === undefined) {
      throw new Error(`Fiche invalide dans ${moduleDir}: branchement "${b.marqueur}" de type remplacement manque valeurParDefaut`)
    }
  }
  return m
}
