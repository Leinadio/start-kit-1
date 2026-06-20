import { describe, it, expect, beforeAll } from "vitest"
import { cpSync, existsSync, mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const repoRoot = join(__dirname, "..", "..", "..")
const modulesRoot = join(repoRoot, "modules")

let tmp: string

// Files whose contents must be byte-for-byte identical before-add and after-remove
const SNAPSHOT_FILES = [
  "lib/adapters/index.ts",
  "lib/auth/client.ts",
  "lib/installed-modules.ts",
  ".env.example",
]

// Files that module installation copies in; must exist after add and not after remove
const COPIED_FILES = [
  "lib/database/client.ts",
  "lib/auth/server.ts",
  "app/api/auth/[...all]/route.ts",
]

// Holds pristine snapshots captured before the first add
const pristineSnapshots: Record<string, string> = {}

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "ms-"))
  cpSync(join(repoRoot, "base"), tmp, {
    recursive: true,
    filter: (src) => !src.includes("node_modules") && !src.includes(".next"),
  })

  // Snapshot the pristine base state before any module is installed
  for (const file of SNAPSHOT_FILES) {
    pristineSnapshots[file] = readFileSync(join(tmp, file), "utf8")
  }
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

    // Copied module files must exist after install
    for (const file of COPIED_FILES) {
      expect(existsSync(join(tmp, file)), `${file} should exist after add`).toBe(true)
    }
  })

  it("retire auth puis database, retrouve les bouchons et les états d'origine", async () => {
    const { removeModule } = await import("../src/commands/remove")

    removeModule("auth-better-auth", tmp, modulesRoot, { skipDeps: true })
    removeModule("database", tmp, modulesRoot, { skipDeps: true })

    const registry = readFileSync(join(tmp, "lib/adapters/index.ts"), "utf8")
    expect(registry).toContain("auth: authStub,")
    expect(registry).toContain("database: databaseStub,")

    // Byte-for-byte inverse: each snapshotted file must equal its pre-install content
    for (const file of SNAPSHOT_FILES) {
      const after = readFileSync(join(tmp, file), "utf8")
      expect(after, `${file} must be byte-for-byte identical to its pre-install snapshot`).toBe(pristineSnapshots[file])
    }

    // Copied module files must no longer exist after remove
    for (const file of COPIED_FILES) {
      expect(existsSync(join(tmp, file)), `${file} should not exist after remove`).toBe(false)
    }
  })
})
