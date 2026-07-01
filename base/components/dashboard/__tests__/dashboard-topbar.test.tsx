import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/compte",
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr" } }, isPending: false }),
  signOut: vi.fn(),
}))

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"

describe("DashboardTopbar", () => {
  it("affiche le fil d'Ariane du chemin courant", () => {
    render(
      <SidebarProvider>
        <DashboardTopbar />
      </SidebarProvider>,
    )
    expect(screen.getByText("Accueil")).toBeInTheDocument()
    expect(screen.getByText("Réglages")).toBeInTheDocument()
  })
})
