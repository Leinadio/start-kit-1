import { describe, it, expect } from "vitest"
import { buildBreadcrumb } from "@/lib/dashboard/breadcrumb"

describe("buildBreadcrumb", () => {
  it("renvoie Accueil pour la racine du dashboard", () => {
    expect(buildBreadcrumb("/dashboard")).toEqual([
      { label: "Accueil", href: "/dashboard" },
    ])
  })

  it("construit le chemin pour une sous-page connue", () => {
    expect(buildBreadcrumb("/dashboard/compte")).toEqual([
      { label: "Accueil", href: "/dashboard" },
      { label: "Réglages", href: "/dashboard/compte" },
    ])
  })

  it("met en Capitale les segments inconnus", () => {
    expect(buildBreadcrumb("/dashboard/factures")).toEqual([
      { label: "Accueil", href: "/dashboard" },
      { label: "Factures", href: "/dashboard/factures" },
    ])
  })
})
