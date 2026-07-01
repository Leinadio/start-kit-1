"use client"
import { useState } from "react"
import { useSession, changeEmail } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EmailForm() {
  const { data } = useSession()
  const [newEmail, setNewEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await changeEmail({ newEmail })
      setSuccess(true)
      setNewEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {data?.user.email ? (
        <p className="text-sm text-muted-foreground">
          Email actuel : <span className="font-medium text-foreground">{data.user.email}</span>
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="newEmail">Nouvel email</Label>
        <Input
          id="newEmail"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-muted-foreground">Vérifiez votre boîte mail pour confirmer.</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Enregistrement…" : "Changer l'email"}
      </Button>
    </form>
  )
}
