import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PageHeader } from "@/components/dashboard/page-header"

describe("PageHeader", () => {
  it("affiche le titre comme en-tête", () => {
    render(<PageHeader title="Factures" />)
    expect(screen.getByRole("heading", { name: "Factures" })).toBeInTheDocument()
  })

  it("affiche la description quand elle est fournie", () => {
    render(<PageHeader title="Factures" description="Vos factures récentes" />)
    expect(screen.getByText("Vos factures récentes")).toBeInTheDocument()
  })

  it("affiche les actions passées", () => {
    render(<PageHeader title="Factures" actions={<button>Nouvelle</button>} />)
    expect(screen.getByRole("button", { name: "Nouvelle" })).toBeInTheDocument()
  })
})
