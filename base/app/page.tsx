import { adapters } from "@/lib/adapters"
import { SignOutButton } from "./sign-out-button"

export default async function Home() {
  const session = await adapters.auth.getSession()
  return (
    <main style={{ padding: 24 }}>
      <h1>Starter Kit</h1>
      <p>{session ? `Connecté, ${session.email}` : "Invité, aucun module d'authentification"}</p>
      {session ? (
        <SignOutButton />
      ) : (
        <p style={{ display: "flex", gap: 12 }}>
          <a href="/login">Connexion</a>
          <a href="/signup">Inscription</a>
        </p>
      )}
    </main>
  )
}
