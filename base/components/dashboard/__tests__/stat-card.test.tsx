import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { StatCard } from "@/components/dashboard/stat-card"

describe("StatCard", () => {
  it("affiche le libellé et la valeur", () => {
    render(<StatCard label="Utilisateurs" value="1 248" />)
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument()
    expect(screen.getByText("1 248")).toBeInTheDocument()
  })

  it("affiche l'indice quand il est fourni", () => {
    render(<StatCard label="Revenu" value="8 430 €" hint="+4% ce mois" />)
    expect(screen.getByText("+4% ce mois")).toBeInTheDocument()
  })
})
