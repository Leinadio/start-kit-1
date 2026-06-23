"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUpEmail, signInSocial } from "@/lib/auth/client"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signUpEmail({ name, email, password })
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }

  async function onSocial(provider: "google" | "linkedin") {
    setError(null)
    try {
      await signInSocial(provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 360 }}>
      <h1>Inscription</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Créer mon compte</button>
      </form>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <button type="button" onClick={() => onSocial("google")}>
          Continuer avec Google
        </button>
        <button type="button" onClick={() => onSocial("linkedin")}>
          Continuer avec LinkedIn
        </button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <p style={{ marginTop: 12 }}>
        <a href="/login">J'ai déjà un compte</a>
      </p>
    </main>
  )
}
