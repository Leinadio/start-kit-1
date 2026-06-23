import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { readManifest } from "../lib/manifest"
import { replaceBetweenMarkers, insertLineBetweenMarkers, ensureImport } from "../lib/markers"
import { addEnvVars } from "../lib/env"
import { copyModuleFiles } from "../lib/fs-ops"
import { installDeps, installDevDeps } from "../lib/deps"
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

  for (const need of m.requires) {
    if (!filled.includes(need)) {
      throw new Error(`Installe d'abord un module pour la prise ${need}`)
    }
  }
  for (const slot of m.provides) {
    if (filled.includes(slot)) {
      throw new Error(`La prise ${slot} est déjà occupée. Retire l'autre module d'abord.`)
    }
  }

  copyModuleFiles(moduleDir, m.files, projectDir)

  for (const w of m.wiring) {
    const path = join(projectDir, w.file)
    let content = readFileSync(path, "utf8")
    if (w.import) content = ensureImport(content, w.import)
    if (w.type === "replace") {
      content = replaceBetweenMarkers(content, w.marker, w.installedValue)
    } else {
      content = insertLineBetweenMarkers(content, w.marker, w.installedValue)
    }
    writeFileSync(path, content)
  }

  const bootstrapPath = join(projectDir, "lib/bootstrap.ts")
  if (m.listeners && m.listeners.length > 0) {
    let bootstrap = readFileSync(bootstrapPath, "utf8")
    for (const listener of m.listeners) {
      bootstrap = ensureImport(bootstrap, listener.import)
      bootstrap = insertLineBetweenMarkers(bootstrap, "modules", listener.call)
    }
    writeFileSync(bootstrapPath, bootstrap)
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
  if (!options.skipDeps) installDevDeps(m.devDeps ?? [], projectDir)
}
