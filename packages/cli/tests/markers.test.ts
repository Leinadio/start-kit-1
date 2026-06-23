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

  it("insère l'import après une directive \"use client\"", () => {
    const file = '"use client"\nexport function f() {}'
    const out = ensureImport(file, 'import { x } from "y"')
    const lines = out.split("\n")
    expect(lines[0]).toBe('"use client"')
    expect(lines[1]).toBe('import { x } from "y"')
  })
})

describe("idempotence", () => {
  it("replaceBetweenMarkers est idempotent", () => {
    const once = replaceBetweenMarkers(base, "adapter:auth", "  auth: realAuth,")
    const twice = replaceBetweenMarkers(once, "adapter:auth", "  auth: realAuth,")
    expect(twice).toBe(once)
  })
  it("removeLineBetweenMarkers est un no-op si la ligne est absente", () => {
    const out = removeLineBetweenMarkers(list, "modules", "  registerX()")
    expect(out).toBe(list)
  })
  it("removeImport est un no-op si l'import est absent", () => {
    const out = removeImport(base, 'import { x } from "y"')
    expect(out).toBe(base)
  })
})

describe("marqueurs absents ou malformes", () => {
  it("leve une erreur quand le marqueur est introuvable", () => {
    expect(() => replaceBetweenMarkers(base, "inexistant", "x")).toThrow(
      /Marqueurs introuvables/,
    )
  })
  it("leve une erreur quand end precede start", () => {
    const malformed = `// @bloc end\n// @bloc start\n`
    expect(() => insertLineBetweenMarkers(malformed, "bloc", "x")).toThrow(
      /Marqueurs introuvables/,
    )
  })
})
