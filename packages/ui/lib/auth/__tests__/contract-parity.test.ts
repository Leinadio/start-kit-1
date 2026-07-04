import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it, expect } from "vitest"

describe("contrat AuthClient", () => {
  it("reste identique entre packages/ui et base", () => {
    const ui = readFileSync(join(process.cwd(), "lib/auth/types.ts"), "utf8")
    const base = readFileSync(join(process.cwd(), "..", "..", "base/lib/auth/types.ts"), "utf8")
    expect(ui).toBe(base)
  })
})
