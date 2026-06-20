import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { readManifest } from "../lib/manifest"
import { replaceBetweenMarkers, insertLineBetweenMarkers, ensureImport } from "../lib/markers"
import { addEnvVars } from "../lib/env"
import { copyModuleFiles } from "../lib/fs-ops"
import { installDeps } from "../lib/deps"
import { filledPrises, installedModuleNames } from "../lib/project"

export function addModule(
  name: string,
  projectDir: string,
  modulesRoot: string,
  options: { skipDeps?: boolean } = {},
): void {
  const moduleDir = join(modulesRoot, name)
  const m = readManifest(moduleDir)
  const filled = filledPrises(projectDir, modulesRoot)

  for (const need of m.besoinDesPrises) {
    if (!filled.includes(need)) {
      throw new Error(`Installe d'abord un module pour la prise ${need}`)
    }
  }
  for (const slot of m.remplitLesPrises) {
    if (filled.includes(slot)) {
      throw new Error(`La prise ${slot} est déjà occupée. Retire l'autre module d'abord.`)
    }
  }

  copyModuleFiles(moduleDir, m.files, projectDir)

  for (const b of m.branchements) {
    const path = join(projectDir, b.fichier)
    let content = readFileSync(path, "utf8")
    if (b.import) content = ensureImport(content, b.import)
    if (b.type === "remplacement") {
      content = replaceBetweenMarkers(content, b.marqueur, b.valeurInstallee)
    } else {
      content = insertLineBetweenMarkers(content, b.marqueur, b.valeurInstallee)
    }
    writeFileSync(path, content)
  }

  const envPath = join(projectDir, ".env.example")
  writeFileSync(envPath, addEnvVars(readFileSync(envPath, "utf8"), m.env))

  const listPath = join(projectDir, "lib/installed-modules.ts")
  if (!installedModuleNames(projectDir).includes(name)) {
    writeFileSync(
      listPath,
      insertLineBetweenMarkers(readFileSync(listPath, "utf8"), "installed", `  "${name}",`),
    )
  }

  if (!options.skipDeps) installDeps(m.deps, projectDir)
}
