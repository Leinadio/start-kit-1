import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { DataTable, type Column } from "@/components/dashboard/data-table"

type Facture = { id: number; client: string; montant: string }

const columns: Column<Facture>[] = [
  { key: "client", header: "Client" },
  { key: "montant", header: "Montant" },
]

describe("DataTable", () => {
  it("affiche les en-têtes et les lignes de données", () => {
    const data: Facture[] = [{ id: 1, client: "Acme", montant: "100 €" }]
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText("Client")).toBeInTheDocument()
    expect(screen.getByText("Montant")).toBeInTheDocument()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByText("100 €")).toBeInTheDocument()
  })

  it("utilise la fonction render d'une colonne quand elle existe", () => {
    const cols: Column<Facture>[] = [
      { key: "client", header: "Client" },
      { key: "montant", header: "Montant", render: (r) => `≈ ${r.montant}` },
    ]
    render(<DataTable columns={cols} data={[{ id: 1, client: "Acme", montant: "100 €" }]} />)
    expect(screen.getByText("≈ 100 €")).toBeInTheDocument()
  })

  it("affiche l'état vide quand il n'y a pas de données", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Aucune facture" />)
    expect(screen.getByText("Aucune facture")).toBeInTheDocument()
  })

  it("affiche le message vide par défaut quand aucun message n'est fourni", () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText("Rien à afficher pour l'instant.")).toBeInTheDocument()
  })
})
