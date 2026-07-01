import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr", name: "Jean" } }, isPending: false }),
  updateProfile: vi.fn(), changeEmail: vi.fn(), changePassword: vi.fn(),
  deleteAccount: vi.fn(), signOut: vi.fn(),
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

import ComptePage from "@/app/(dashboard)/dashboard/compte/page"

describe("Page mon compte", () => {
  it("affiche l'en-tête Réglages et les sections", () => {
    render(<ComptePage />)
    expect(screen.getByRole("heading", { name: "Réglages" })).toBeInTheDocument()
    expect(screen.getByLabelText("Nom")).toBeInTheDocument()
    expect(screen.getByLabelText("Nouvel email")).toBeInTheDocument()
    expect(screen.getByLabelText("Mot de passe actuel")).toBeInTheDocument()
  })
})
