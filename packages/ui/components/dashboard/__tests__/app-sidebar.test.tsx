import type { ComponentProps } from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

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
