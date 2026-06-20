import { describe, it, expect } from "vitest"
import { addEnvVars, removeEnvVars } from "../src/lib/env"

describe("env vars", () => {
  it("ajoute sans doublon", () => {
    let out = addEnvVars("# header\n", ["A", "B"])
    out = addEnvVars(out, ["A"])
    expect(out.match(/^A=/gm)!.length).toBe(1)
    expect(out).toContain("B=")
  })
  it("retire les variables", () => {
    const seeded = addEnvVars("# header\n", ["A", "B"])
    const out = removeEnvVars(seeded, ["A"])
    expect(out).not.toMatch(/^A=/m)
    expect(out).toMatch(/^B=/m)
  })
})
