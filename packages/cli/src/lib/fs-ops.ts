import { cpSync, rmSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"

export function copyModuleFiles(moduleDir: string, files: string[], projectDir: string): void {
  for (const file of files) {
    const from = join(moduleDir, "files", file)
    const to = join(projectDir, file)
    mkdirSync(dirname(to), { recursive: true })
    cpSync(from, to, { recursive: true })
  }
}

export function removeModuleFiles(files: string[], projectDir: string): void {
  for (const file of files) {
    rmSync(join(projectDir, file), { force: true, recursive: true })
  }
}
