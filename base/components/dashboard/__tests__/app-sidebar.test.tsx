import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

describe("AppSidebar", () => {
  it("affiche un lien par entrée de navigation", () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    )
    expect(screen.getByRole("link", { name: "Accueil" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Réglages" })).toBeInTheDocument()
  })
})
