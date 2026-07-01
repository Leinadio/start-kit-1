import { describe, it, expect } from "vitest"
import * as stub from "@/lib/auth/client-stub"

describe("client-stub : opérations de compte", () => {
  it("rejette updateProfile quand aucun module n'est installé", async () => {
    await expect(stub.updateProfile({ name: "Jean" })).rejects.toThrow()
  })
  it("rejette changeEmail", async () => {
    await expect(stub.changeEmail({ newEmail: "a@b.fr" })).rejects.toThrow()
  })
  it("rejette changePassword", async () => {
    await expect(
      stub.changePassword({ currentPassword: "x", newPassword: "y" }),
    ).rejects.toThrow()
  })
  it("rejette deleteAccount", async () => {
    await expect(stub.deleteAccount()).rejects.toThrow()
  })
})
