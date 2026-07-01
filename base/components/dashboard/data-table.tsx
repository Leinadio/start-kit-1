import type { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty } from "@/components/ui/empty"

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = "Rien à afficher pour l'instant.",
}: {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}) {
  if (data.length === 0) {
    return <Empty>{emptyMessage}</Empty>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, i) => (
            <TableHead key={i}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col, i) => (
              <TableCell key={i}>
                {col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[col.key] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
