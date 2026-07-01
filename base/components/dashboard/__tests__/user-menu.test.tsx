import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr" } }, isPending: false }),
  signOut: vi.fn(),
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
})
