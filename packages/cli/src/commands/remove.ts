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
import { removeDeps, removeDevDeps } from "../lib/deps"
import { installedModuleNames } from "../lib/project"

export function removeModule(
  name: string,
  projectDir: string,
  modulesRoot: string,
  options: { skipDeps?: boolean } = {},
): void {
  const m = readManifest(join(modulesRoot, name))

  const others = installedModuleNames(projectDir).filter((n) => n !== name)
  const stillNeeded = others.flatMap((n) => readManifest(join(modulesRoot, n)).requires)
  for (const slot of m.provides) {
    if (stillNeeded.includes(slot)) {
      throw new Error(`Impossible, un autre module a encore besoin de la prise ${slot}.`)
    }
  }

  for (const w of m.wiring) {
    const path = join(projectDir, w.file)
    let content = readFileSync(path, "utf8")
    if (w.type === "replace") {
      content = replaceBetweenMarkers(content, w.marker, w.defaultValue ?? "")
    } else {
      content = removeLineBetweenMarkers(content, w.marker, w.installedValue)
    }
    if (w.import) content = removeImport(content, w.import)
    writeFileSync(path, content)
  }

  const bootstrapPath = join(projectDir, "lib/bootstrap.ts")
  if (m.listeners && m.listeners.length > 0) {
    let bootstrap = readFileSync(bootstrapPath, "utf8")
    for (const listener of m.listeners) {
      bootstrap = removeLineBetweenMarkers(bootstrap, "modules", listener.call)
      bootstrap = removeImport(bootstrap, listener.import)
    }
    writeFileSync(bootstrapPath, bootstrap)
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
  if (!options.skipDeps) removeDevDeps(m.devDeps ?? [], projectDir)
}
