import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import DashboardHomePage from "@/app/(dashboard)/dashboard/page"

describe("Page d'accueil du dashboard", () => {
  it("affiche l'en-tête Accueil et au moins une carte de chiffre", () => {
    render(<DashboardHomePage />)
    expect(screen.getByRole("heading", { name: "Accueil" })).toBeInTheDocument()
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument()
  })
})
