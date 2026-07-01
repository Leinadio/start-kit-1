import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

const { mockSignOut, mockRefresh } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockRefresh: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr" } }, isPending: false }),
  signOut: mockSignOut,
}))

import { UserMenu } from "@/components/dashboard/user-menu"

describe("UserMenu", () => {
  it("affiche l'email de l'utilisateur connecté après ouverture", async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    await user.click(screen.getByRole("button", { name: /menu utilisateur/i }))
    expect(await screen.findByText("jean@exemple.fr")).toBeInTheDocument()
    expect(await screen.findByText("Se déconnecter")).toBeInTheDocument()
  })

  it("appelle signOut et router.refresh lors du clic sur Se déconnecter", async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole("button", { name: /menu utilisateur/i }))
    await user.click(await screen.findByRole("menuitem", { name: /se déconnecter/i }))

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRefresh).toHaveBeenCalled()
  })
})
