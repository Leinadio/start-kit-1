"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteAccount } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

// AlertDialogAction (base-ui) is a plain Button wrapper — it does NOT close the dialog.
// AlertDialogCancel wraps AlertDialogPrimitive.Close via render={<Button />} and closes on click.
// We use controlled `open` state so the trigger button stays outside the AlertDialog tree.

export function DeleteAccount() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onConfirm = async () => {
    setError(null)
    setLoading(true)
    try {
      await deleteAccount()
      setOpen(false)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Supprimer mon compte
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button variant="destructive" onClick={onConfirm} disabled={loading}>
              Confirmer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
