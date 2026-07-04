import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

const changePassword = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/auth/client", () => ({
  changePassword: (...args: unknown[]) => changePassword(...args),
}))

import { PasswordForm } from "@/components/account/password-form"

describe("PasswordForm", () => {
  it("appelle changePassword avec les deux mots de passe", async () => {
    const user = userEvent.setup()
    render(<PasswordForm />)
    await user.type(screen.getByLabelText("Mot de passe actuel"), "ancien123")
    await user.type(screen.getByLabelText("Nouveau mot de passe"), "nouveau123")
    await user.click(screen.getByRole("button", { name: /changer/i }))
    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: "ancien123",
      newPassword: "nouveau123",
    })
  })
})
