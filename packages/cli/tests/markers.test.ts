import { describe, it, expect } from "vitest"
import {
  replaceBetweenMarkers,
  insertLineBetweenMarkers,
  removeLineBetweenMarkers,
  ensureImport,
  removeImport,
} from "../src/lib/markers"

const base = `const x = {
  // @adapter:auth start
  auth: authStub,
  // @adapter:auth end
}
`

describe("replaceBetweenMarkers", () => {
  it("remplace le contenu entre les marqueurs", () => {
    const out = replaceBetweenMarkers(base, "adapter:auth", "  auth: realAuth,")
    expect(out).toContain("auth: realAuth,")
    expect(out).not.toContain("auth: authStub,")
    expect(out).toContain("// @adapter:auth start")
    expect(out).toContain("// @adapter:auth end")
  })
})

const list = `const m = [
  // @modules start
  // @modules end
]
`

describe("insert and remove line", () => {
  it("ajoute une ligne sans doublon", () => {
    let out = insertLineBetweenMarkers(list, "modules", "  registerX()")
    out = insertLineBetweenMarkers(out, "modules", "  registerX()")
    expect(out.match(/registerX\(\)/g)!.length).toBe(1)
  })
  it("retire seulement sa ligne", () => {
    const seeded = insertLineBetweenMarkers(list, "modules", "  registerX()")
    const out = removeLineBetweenMarkers(seeded, "modules", "  registerX()")
    expect(out).not.toContain("registerX()")
    expect(out).toContain("// @modules start")
  })
})

describe("imports", () => {
  it("ajoute un import une seule fois puis le retire", () => {
    const imp = 'import { x } from "y"'
    let out = ensureImport(base, imp)
    out = ensureImport(out, imp)
    expect(out.match(/import \{ x \}/g)!.length).toBe(1)
    out = removeImport(out, imp)
    expect(out).not.toContain('import { x }')
  })
})
