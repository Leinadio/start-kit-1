import type { Meta } from "@storybook/react-vite"
import { DataTable, type Column } from "@/components/dashboard/data-table"

type Facture = { id: number; client: string; montant: string }
const columns: Column<Facture>[] = [
  { key: "client", header: "Client" },
  { key: "montant", header: "Montant" },
]
const meta: Meta<typeof DataTable<Facture>> = { title: "Dashboard/DataTable" }
export default meta

export const AvecDonnees = {
  render: () => <DataTable columns={columns} data={[{ id: 1, client: "Acme", montant: "100 €" }]} />,
}
export const Vide = {
  render: () => <DataTable columns={columns} data={[]} emptyMessage="Aucune facture" />,
}
