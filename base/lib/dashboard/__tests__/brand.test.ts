import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it, expect } from "vitest"

describe("fichier de marque", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

  it("définit les variables de marque essentielles", () => {
    for (const token of ["--primary", "--background", "--foreground", "--radius"]) {
      expect(css).toContain(token)
    }
  })

  it("définit une variante sombre", () => {
    expect(css).toContain(".dark")
  })
})
