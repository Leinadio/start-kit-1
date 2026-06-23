import { readFileSync } from "node:fs"
import { join } from "node:path"
import { readManifest } from "./manifest"

export function installedModuleNames(projectDir: string): string[] {
  const content = readFileSync(join(projectDir, "lib/installed-modules.ts"), "utf8")
  const matches = content.match(/"([^"]+)"/g) ?? []
  return matches.map((m) => m.replace(/"/g, ""))
}

export function filledPrises(projectDir: string, modulesRoot: string): string[] {
  const names = installedModuleNames(projectDir)
  return names.flatMap((n) => readManifest(join(modulesRoot, n)).provides)
}
