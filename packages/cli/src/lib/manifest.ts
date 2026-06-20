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

export interface ModuleManifest {
  name: string
  remplitLesPrises: string[]
  besoinDesPrises: string[]
  deps: string[]
  devDeps?: string[]
  env: string[]
  files: string[]
  branchements: Branchement[]
}

export function readManifest(moduleDir: string): ModuleManifest {
  const raw = readFileSync(join(moduleDir, "module.json"), "utf8")
  const m = JSON.parse(raw) as ModuleManifest
  if (!m.name || !Array.isArray(m.remplitLesPrises)) {
    throw new Error(`Fiche invalide dans ${moduleDir}`)
  }
  return m
}
