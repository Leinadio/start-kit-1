import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { readManifest } from "../lib/manifest"
import {
  replaceBetweenMarkers,
  removeLineBetweenMarkers,
  removeImport,
} from "../lib/markers"
import { removeEnvVars } from "../lib/env"
import { removeModuleFiles } from "../lib/fs-ops"
import { removeDeps } from "../lib/deps"
import { installedModuleNames } from "../lib/project"

export function removeModule(
  name: string,
  projectDir: string,
  modulesRoot: string,
  options: { skipDeps?: boolean } = {},
): void {
  const m = readManifest(join(modulesRoot, name))

  const others = installedModuleNames(projectDir).filter((n) => n !== name)
  const stillNeeded = others.flatMap((n) => readManifest(join(modulesRoot, n)).besoinDesPrises)
  for (const slot of m.remplitLesPrises) {
    if (stillNeeded.includes(slot)) {
      throw new Error(`Impossible, un autre module a encore besoin de la prise ${slot}.`)
    }
  }

  for (const b of m.branchements) {
    const path = join(projectDir, b.fichier)
    let content = readFileSync(path, "utf8")
    if (b.type === "remplacement") {
      content = replaceBetweenMarkers(content, b.marqueur, b.valeurParDefaut ?? "")
    } else {
      content = removeLineBetweenMarkers(content, b.marqueur, b.valeurInstallee)
    }
    if (b.import) content = removeImport(content, b.import)
    writeFileSync(path, content)
  }

  const envPath = join(projectDir, ".env.example")
  writeFileSync(envPath, removeEnvVars(readFileSync(envPath, "utf8"), m.env))

  const listPath = join(projectDir, "lib/installed-modules.ts")
  writeFileSync(
    listPath,
    removeLineBetweenMarkers(readFileSync(listPath, "utf8"), "installed", `  "${name}",`),
  )

  removeModuleFiles(m.files, projectDir)
  if (!options.skipDeps) removeDeps(m.deps, projectDir)
}
