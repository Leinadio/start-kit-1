import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

const changeEmail = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr" } }, isPending: false }),
  changeEmail: (...args: unknown[]) => changeEmail(...args),
}))

import { EmailForm } from "@/components/account/email-form"

describe("EmailForm", () => {
  it("appelle changeEmail avec le nouvel email", async () => {
    const user = userEvent.setup()
    render(<EmailForm />)
    await user.type(screen.getByLabelText("Nouvel email"), "jeanne@exemple.fr")
    await user.click(screen.getByRole("button", { name: /changer/i }))
    expect(changeEmail).toHaveBeenCalledWith({ newEmail: "jeanne@exemple.fr" })
  })
})
