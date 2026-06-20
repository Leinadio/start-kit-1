import { describe, it, expect, beforeAll } from "vitest"
import { execSync } from "node:child_process"
import { cpSync, mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const repoRoot = join(__dirname, "..", "..", "..")
const modulesRoot = join(repoRoot, "modules")

let tmp: string

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "ms-"))
  cpSync(join(repoRoot, "base"), tmp, {
    recursive: true,
    filter: (src) => !src.includes("node_modules") && !src.includes(".next"),
  })
})

describe("flux add et remove", () => {
  it("refuse auth sans database", async () => {
    const { addModule } = await import("../src/commands/add")
    expect(() => addModule("auth-better-auth", tmp, modulesRoot, { skipDeps: true })).toThrow(/database/)
  })

  it("installe database puis auth, puis vérifie le registre", async () => {
    const { addModule } = await import("../src/commands/add")
    addModule("database", tmp, modulesRoot, { skipDeps: true })
    addModule("auth-better-auth", tmp, modulesRoot, { skipDeps: true })
    const registry = readFileSync(join(tmp, "lib/adapters/index.ts"), "utf8")
    expect(registry).toContain("betterAuthAdapter")
    expect(registry).toContain("prismaDatabaseAdapter")
    const list = readFileSync(join(tmp, "lib/installed-modules.ts"), "utf8")
    expect(list).toContain('"database"')
    expect(list).toContain('"auth-better-auth"')
  })

  it("retire auth puis database, et retrouve les bouchons", async () => {
    const { removeModule } = await import("../src/commands/remove")
    removeModule("auth-better-auth", tmp, modulesRoot, { skipDeps: true })
    removeModule("database", tmp, modulesRoot, { skipDeps: true })
    const registry = readFileSync(join(tmp, "lib/adapters/index.ts"), "utf8")
    expect(registry).toContain("auth: authStub,")
    expect(registry).toContain("database: databaseStub,")
  })
})
