"use client"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth/client"

export function SignOutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut()
        router.refresh()
      }}
    >
      Se déconnecter
    </button>
  )
}
