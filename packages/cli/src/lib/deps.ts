import { execSync } from "node:child_process"

export function installDeps(deps: string[], projectDir: string): void {
  if (deps.length === 0) return
  execSync(`pnpm add ${deps.join(" ")}`, { cwd: projectDir, stdio: "inherit" })
}

export function removeDeps(deps: string[], projectDir: string): void {
  if (deps.length === 0) return
  execSync(`pnpm remove ${deps.join(" ")}`, { cwd: projectDir, stdio: "inherit" })
}
