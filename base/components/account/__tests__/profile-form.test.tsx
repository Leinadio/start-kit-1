import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

const updateProfile = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr", name: "Jean" } }, isPending: false }),
  updateProfile: (...args: unknown[]) => updateProfile(...args),
}))

import { ProfileForm } from "@/components/account/profile-form"

describe("ProfileForm", () => {
  it("préremplit le nom et appelle updateProfile à la soumission", async () => {
    const user = userEvent.setup()
    render(<ProfileForm />)
    const input = screen.getByLabelText("Nom") as HTMLInputElement
    expect(input.value).toBe("Jean")
    await user.clear(input)
    await user.type(input, "Jeanne")
    await user.click(screen.getByRole("button", { name: /enregistrer/i }))
    expect(updateProfile).toHaveBeenCalledWith({ name: "Jeanne" })
  })
})
