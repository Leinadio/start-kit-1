import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

const deleteAccount = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/auth/client", () => ({
  deleteAccount: (...args: unknown[]) => deleteAccount(...args),
  signOut: vi.fn(),
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

import { DeleteAccount } from "@/components/account/delete-account"

describe("DeleteAccount", () => {
  it("appelle deleteAccount après confirmation dans la boîte de dialogue", async () => {
    const user = userEvent.setup()
    render(<DeleteAccount />)
    await user.click(screen.getByRole("button", { name: /supprimer mon compte/i }))
    // confirmation dans l'AlertDialog
    await user.click(await screen.findByRole("button", { name: /confirmer/i }))
    expect(deleteAccount).toHaveBeenCalled()
  })

  it("n'appelle pas deleteAccount quand l'utilisateur annule", async () => {
    deleteAccount.mockClear()
    const user = userEvent.setup()
    render(<DeleteAccount />)
    await user.click(screen.getByRole("button", { name: /supprimer mon compte/i }))
    await user.click(await screen.findByRole("button", { name: /annuler/i }))
    expect(deleteAccount).not.toHaveBeenCalled()
  })
})
