# Dashboard – La page « mon compte » (Plan 3/3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Étendre le contrat d'authentification avec les opérations de compte (modifier nom/photo, changer email, changer mot de passe, supprimer le compte) puis construire l'écran de réglages « mon compte » à `/dashboard/compte`, en réutilisant les briques et le contrat d'auth.

**Architecture :** L'UI ne parle jamais à better-auth directement : elle passe par la prise auth client (`@/lib/auth/client`). On étend donc d'abord le contrat (`AuthClient`) et son bouchon, puis l'adaptateur réel (base + gabarit du module), puis on construit des sections de formulaire (Client Components) qui appellent ces méthodes. Les tests d'UI mockent `@/lib/auth/client` et vérifient que la bonne méthode est appelée. Deux opérations (changer email, supprimer le compte) exigent une activation côté serveur de better-auth.

**Tech Stack :** Next.js 16, React 19, Tailwind v4, shadcn/ui (base-ui), better-auth ^1.6, Vitest + @testing-library/react.

## Global Constraints

- **Ceci n'est PAS le Next.js habituel.** Lire `node_modules/next/dist/docs/01-app/` au besoin.
- **Vérifier l'API réelle de better-auth avant de l'utiliser.** Les noms de méthodes client supposés ici (`authClient.updateUser`, `authClient.changeEmail`, `authClient.changePassword`, `authClient.deleteUser`) doivent être confirmés contre la version installée (`better-auth` ^1.6) — lire les types dans le store pnpm ou la doc. Adapter noms/signatures si besoin et documenter.
- Tout le travail UI se fait dans `base/`. Alias `@/*` → `base/*`.
- `pnpm` ; commandes depuis `base/`.
- Versions à ne PAS changer : `next` 16.2.9, `react` 19.2.4, `tailwindcss` v4, `better-auth` ^1.6.
- Langue de l'interface : français. Le fichier de marque est la SEULE source des couleurs ; aucune couleur en dur.
- **Variante base-ui :** primitives sur `@base-ui/react`. Ouvrir le fichier réel sous `base/components/ui/` avant de composer ; `render={<El/>}` remplace `asChild`.
- **Discipline de la prise :** l'UI importe UNIQUEMENT depuis `@/lib/auth/client`, jamais depuis `better-auth`. L'adaptateur normalise les erreurs en exceptions (`throw new Error(...)`), comme l'adaptateur existant.
- **Cohérence base ↔ module :** l'adaptateur réel existe en deux exemplaires qui doivent rester identiques : `base/lib/auth/client-adapter.ts` (copie installée, fait marcher l'app maintenant) et `modules/auth-better-auth/files/lib/auth/client-adapter.ts` (gabarit copié aux futures installations). Toute modification de l'un doit être répliquée à l'identique dans l'autre.
- Tests : config `base/vitest.config.mts`, lancés par `pnpm test`. Shim `matchMedia` déjà présent.
- Commits fréquents, message français, style `feat(auth): ...` pour le contrat/adaptateur, `feat(dashboard): ...` pour l'UI.

## Prérequis serveur (à connaître avant la Task 3)

better-auth n'autorise `changeEmail` et `deleteUser` que s'ils sont activés dans la config serveur (`betterAuth({ user: { changeEmail: { enabled: true }, deleteUser: { enabled: true } } })`). Ces réglages vivent dans `modules/auth-better-auth/files/lib/auth/server.ts` (gabarit) et `base/lib/auth/server.ts` (copie installée). De plus, `changeEmail` déclenche en général un email de vérification : son comportement réel dépend de la configuration d'envoi d'emails, non couverte ici. Les tests d'UI mockent la prise, donc ils passent indépendamment ; la vérification réelle de ces deux opérations est un point ouvert (voir Task 6).

## Structure des fichiers

- `base/components/ui/label.tsx`, `base/components/ui/alert-dialog.tsx` – primitives (générées).
- `base/lib/auth/types.ts` – modifié : contrat `AuthClient` étendu + `AuthSession.user` enrichi (name, image).
- `base/lib/auth/client-stub.ts` – modifié : bouchon des nouvelles méthodes.
- `base/lib/auth/client-adapter.ts` ET `modules/auth-better-auth/files/lib/auth/client-adapter.ts` – modifiés (identiques) : implémentation des nouvelles méthodes + `useSession` expose name/image.
- `base/lib/auth/server.ts` ET `modules/auth-better-auth/files/lib/auth/server.ts` – modifiés (identiques) : activer changeEmail + deleteUser.
- `base/components/account/profile-form.tsx`, `email-form.tsx`, `password-form.tsx`, `delete-account.tsx` – sections (Client Components).
- `base/components/account/__tests__/*.test.tsx` – tests.
- `base/app/(dashboard)/dashboard/compte/page.tsx` – la page qui assemble les sections.

## Séquence des plans

- Plans 1 & 2 (faits, fusionnés) : coquille + briques.
- **Plan 3 (ce document) : la page mon compte.** À la fin : `/dashboard/compte` (le lien « Réglages » du menu) affiche les sections de gestion du compte.

---

### Task 1 : Ajouter les primitives label et alert-dialog

**Files:**
- Create: `base/components/ui/label.tsx`, `base/components/ui/alert-dialog.tsx` (générés)

**Interfaces:**
- Produces: primitives importables depuis `@/components/ui/label` et `@/components/ui/alert-dialog`.

- [ ] **Step 1 : Générer**

Run: `cd base && pnpm dlx shadcn@latest add label alert-dialog` (non-interactif). Vérifier les noms dans le registre base-ui ; rapporter toute différence.

- [ ] **Step 2 : Vérifier**

Run: `cd base && pnpm exec tsc --noEmit` (exit 0) ; `cd base && pnpm test` (suite existante verte).

- [ ] **Step 3 : Commit**

```bash
git add base/components/ui base/package.json ../pnpm-lock.yaml
git commit -m "feat(dashboard): ajouter les primitives label et alert-dialog"
```

---

### Task 2 : Étendre le contrat d'auth et son bouchon

**Files:**
- Modify: `base/lib/auth/types.ts`
- Modify: `base/lib/auth/client-stub.ts`
- Test: `base/lib/auth/__tests__/client-stub.test.ts`

**Interfaces:**
- Produces (sur `AuthClient` depuis `@/lib/auth/types`) : `updateProfile(input: UpdateProfileInput): Promise<void>`, `changeEmail(input: ChangeEmailInput): Promise<void>`, `changePassword(input: ChangePasswordInput): Promise<void>`, `deleteAccount(): Promise<void>`. Et `AuthSession.user` gagne `name?: string` et `image?: string | null`.
- Types : `UpdateProfileInput = { name?: string; image?: string }`, `ChangeEmailInput = { newEmail: string }`, `ChangePasswordInput = { currentPassword: string; newPassword: string }`.

- [ ] **Step 1 : Écrire le test du bouchon**

Create `base/lib/auth/__tests__/client-stub.test.ts` :
```ts
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
```

- [ ] **Step 2 : Lancer (échec attendu)**

Run: `cd base && pnpm test -- client-stub`
Expected: FAIL (méthodes inexistantes).

- [ ] **Step 3 : Étendre le contrat**

Dans `base/lib/auth/types.ts`, enrichir `AuthSession` et `AuthClient` :
```ts
export interface AuthSession {
  data: { user: { email: string; name?: string; image?: string | null } } | null
  isPending: boolean
}

export interface UpdateProfileInput {
  name?: string
  image?: string
}
export interface ChangeEmailInput {
  newEmail: string
}
export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}
```
Ajouter à l'interface `AuthClient` (après `signOut`) :
```ts
  updateProfile(input: UpdateProfileInput): Promise<void>
  changeEmail(input: ChangeEmailInput): Promise<void>
  changePassword(input: ChangePasswordInput): Promise<void>
  deleteAccount(): Promise<void>
```

- [ ] **Step 4 : Étendre le bouchon**

Dans `base/lib/auth/client-stub.ts`, ajouter :
```ts
export const updateProfile: AuthClient["updateProfile"] = async () => notInstalled()
export const changeEmail: AuthClient["changeEmail"] = async () => notInstalled()
export const changePassword: AuthClient["changePassword"] = async () => notInstalled()
export const deleteAccount: AuthClient["deleteAccount"] = async () => notInstalled()
```
(`notInstalled()` lève déjà une exception dans ce fichier.)

- [ ] **Step 5 : Lancer**

Run: `cd base && pnpm test -- client-stub` (PASS) ; `cd base && pnpm exec tsc --noEmit` (exit 0).
Note : le typecheck peut signaler que `client-adapter.ts` n'implémente pas encore les nouvelles méthodes — c'est attendu, la Task 3 le corrige. Si le typecheck échoue uniquement pour cette raison, le noter et continuer ; sinon corriger.

- [ ] **Step 6 : Commit**

```bash
git add base/lib/auth/types.ts base/lib/auth/client-stub.ts base/lib/auth/__tests__/client-stub.test.ts
git commit -m "feat(auth): etendre le contrat client avec les operations de compte"
```

---

### Task 3 : Implémenter les opérations dans l'adaptateur (base + module) et activer côté serveur

**Files:**
- Modify: `base/lib/auth/client-adapter.ts`
- Modify: `modules/auth-better-auth/files/lib/auth/client-adapter.ts` (identique à la précédente)
- Modify: `base/lib/auth/server.ts`
- Modify: `modules/auth-better-auth/files/lib/auth/server.ts` (identique à la précédente)

**Interfaces:**
- Consumes: le client better-auth (`authClient`) déjà créé dans `client-adapter.ts`.
- Produces: les 4 méthodes du contrat, réellement branchées ; `useSession` expose désormais `name` et `image`.

- [ ] **Step 1 : Vérifier l'API better-auth**

Lire les types de `better-auth` (client react) dans le store pnpm pour confirmer les signatures de `updateUser`, `changeEmail`, `changePassword`, `deleteUser` (noms, champs, forme du retour `{ data, error }`). Adapter le code ci-dessous aux signatures réelles ; documenter tout écart.

- [ ] **Step 2 : Étendre `useSession` et ajouter les méthodes (base)**

Dans `base/lib/auth/client-adapter.ts`, modifier `useSession` pour exposer name/image :
```ts
export const useSession: AuthClient["useSession"] = () => {
  const session = authClient.useSession()
  return {
    data: session.data
      ? {
          user: {
            email: session.data.user.email,
            name: session.data.user.name,
            image: session.data.user.image ?? null,
          },
        }
      : null,
    isPending: session.isPending,
  }
}
```
Et ajouter (adapter aux signatures réelles) :
```ts
export const updateProfile: AuthClient["updateProfile"] = async ({ name, image }) => {
  const { error } = await authClient.updateUser({ name, image })
  if (error) throw new Error(error.message ?? "Mise à jour du profil impossible")
}
export const changeEmail: AuthClient["changeEmail"] = async ({ newEmail }) => {
  const { error } = await authClient.changeEmail({ newEmail, callbackURL: "/dashboard/compte" })
  if (error) throw new Error(error.message ?? "Changement d'email impossible")
}
export const changePassword: AuthClient["changePassword"] = async ({ currentPassword, newPassword }) => {
  const { error } = await authClient.changePassword({ currentPassword, newPassword })
  if (error) throw new Error(error.message ?? "Changement de mot de passe impossible")
}
export const deleteAccount: AuthClient["deleteAccount"] = async () => {
  const { error } = await authClient.deleteUser()
  if (error) throw new Error(error.message ?? "Suppression du compte impossible")
}
```

- [ ] **Step 3 : Répliquer à l'identique dans le gabarit du module**

Copier exactement les mêmes changements dans `modules/auth-better-auth/files/lib/auth/client-adapter.ts`. Les deux fichiers doivent être identiques (à comparer avec `diff`).

- [ ] **Step 4 : Activer changeEmail + deleteUser côté serveur (base + module)**

Dans `base/lib/auth/server.ts` et `modules/auth-better-auth/files/lib/auth/server.ts` (identiques), ajouter à la config `betterAuth({ ... })` le bloc :
```ts
  user: {
    changeEmail: { enabled: true },
    deleteUser: { enabled: true },
  },
```
Vérifier d'abord la forme exacte attendue par la version installée de better-auth ; adapter si nécessaire.

- [ ] **Step 5 : Vérifier**

Run: `cd base && pnpm exec tsc --noEmit` (exit 0, `client-adapter` implémente maintenant tout le contrat) ; `cd base && pnpm test` (suite verte) ; `diff base/lib/auth/client-adapter.ts modules/auth-better-auth/files/lib/auth/client-adapter.ts` (aucune différence) ; `diff base/lib/auth/server.ts modules/auth-better-auth/files/lib/auth/server.ts` (aucune différence).

- [ ] **Step 6 : Commit**

```bash
git add base/lib/auth/client-adapter.ts modules/auth-better-auth/files/lib/auth/client-adapter.ts base/lib/auth/server.ts modules/auth-better-auth/files/lib/auth/server.ts
git commit -m "feat(auth): brancher les operations de compte et les activer cote serveur"
```

---

### Task 4 : Sections profil et email

**Files:**
- Create: `base/components/account/profile-form.tsx`, `base/components/account/email-form.tsx`
- Test: `base/components/account/__tests__/profile-form.test.tsx`, `base/components/account/__tests__/email-form.test.tsx`

**Interfaces:**
- Consumes: `useSession`, `updateProfile`, `changeEmail` depuis `@/lib/auth/client` ; `Input`, `Label`, `Button` depuis `@/components/ui/*`.
- Produces: `ProfileForm` et `EmailForm` (Client Components) depuis `@/components/account/*`.

- [ ] **Step 1 : Écrire le test profil**

Create `base/components/account/__tests__/profile-form.test.tsx` :
```tsx
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
```

- [ ] **Step 2 : Lancer (échec attendu)**

Run: `cd base && pnpm test -- profile-form`
Expected: FAIL (`ProfileForm` introuvable).

- [ ] **Step 3 : Implémenter ProfileForm**

Create `base/components/account/profile-form.tsx` :
```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, updateProfile } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileForm() {
  const router = useRouter()
  const { data } = useSession()
  const [name, setName] = useState(data?.user.name ?? "")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await updateProfile({ name })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={saving}>
        {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  )
}
```
Note : vérifier que le token `text-destructive` existe dans le thème ; sinon utiliser `text-muted-foreground`.

- [ ] **Step 4 : Lancer (PASS), puis écrire le test email**

Run: `cd base && pnpm test -- profile-form` (PASS).

Create `base/components/account/__tests__/email-form.test.tsx` :
```tsx
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
```

- [ ] **Step 5 : Implémenter EmailForm (même patron que ProfileForm)**

Create `base/components/account/email-form.tsx` — même structure que `ProfileForm` mais : champ « Nouvel email » (state `newEmail`, initialement vide), bouton « Changer l'email », appelle `changeEmail({ newEmail })`. Afficher un message de succès « Vérifiez votre boîte mail pour confirmer. » après succès (car le changement passe par un email de vérification). Réutiliser `useSession` pour afficher l'email actuel en lecture seule au-dessus du champ.

- [ ] **Step 6 : Lancer et commit**

Run: `cd base && pnpm test -- "profile-form|email-form"` (PASS) ; `cd base && pnpm test` (suite verte) ; `cd base && pnpm exec tsc --noEmit` (exit 0).
```bash
git add base/components/account/profile-form.tsx base/components/account/email-form.tsx base/components/account/__tests__/profile-form.test.tsx base/components/account/__tests__/email-form.test.tsx
git commit -m "feat(dashboard): sections profil et email de la page compte"
```

---

### Task 5 : Sections mot de passe et suppression

**Files:**
- Create: `base/components/account/password-form.tsx`, `base/components/account/delete-account.tsx`
- Test: `base/components/account/__tests__/password-form.test.tsx`, `base/components/account/__tests__/delete-account.test.tsx`

**Interfaces:**
- Consumes: `changePassword`, `deleteAccount`, `signOut` depuis `@/lib/auth/client` ; `Input`, `Label`, `Button`, `AlertDialog*` depuis `@/components/ui/*`.
- Produces: `PasswordForm` et `DeleteAccount` (Client Components).

- [ ] **Step 1 : Écrire le test mot de passe**

Create `base/components/account/__tests__/password-form.test.tsx` :
```tsx
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
```

- [ ] **Step 2 : Lancer (échec attendu) puis implémenter PasswordForm**

Run: `cd base && pnpm test -- password-form` (FAIL).

Create `base/components/account/password-form.tsx` — même patron que `ProfileForm` : deux champs mot de passe (`type="password"`, labels « Mot de passe actuel » et « Nouveau mot de passe »), bouton « Changer le mot de passe », appelle `changePassword({ currentPassword, newPassword })`, gère erreur + succès, vide les champs après succès.

- [ ] **Step 3 : Lancer (PASS) puis écrire le test suppression**

Run: `cd base && pnpm test -- password-form` (PASS).

Create `base/components/account/__tests__/delete-account.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

const deleteAccount = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/auth/client", () => ({
  deleteAccount: (...args: unknown[]) => deleteAccount(...args),
  signOut: vi.fn(),
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

import { DeleteAccount } from "@/components/account/delete-account"

describe("DeleteAccount", () => {
  it("appelle deleteAccount après confirmation dans la boîte de dialogue", async () => {
    const user = userEvent.setup()
    render(<DeleteAccount />)
    await user.click(screen.getByRole("button", { name: /supprimer mon compte/i }))
    // confirmation dans l'AlertDialog
    await user.click(await screen.findByRole("button", { name: /confirmer/i }))
    expect(deleteAccount).toHaveBeenCalled()
  })
})
```

- [ ] **Step 4 : Implémenter DeleteAccount (avec AlertDialog)**

Create `base/components/account/delete-account.tsx` (Client Component). Ouvrir `base/components/ui/alert-dialog.tsx` pour l'API réelle (base-ui). Structure attendue :
- Un bouton déclencheur « Supprimer mon compte » (variante destructive si dispo).
- Un `AlertDialog` de confirmation : titre « Supprimer votre compte ? », description « Cette action est irréversible. », un bouton d'annulation et un bouton « Confirmer ».
- Au clic sur « Confirmer » : `await deleteAccount()` puis rediriger vers `/` (via `router.push("/")`). Gérer l'erreur en l'affichant.
Adapter les noms de sous-composants à l'API réelle de l'AlertDialog base-ui ; documenter.

- [ ] **Step 5 : Lancer et commit**

Run: `cd base && pnpm test -- "password-form|delete-account"` (PASS) ; `cd base && pnpm test` (suite verte) ; `cd base && pnpm exec tsc --noEmit` (exit 0).
```bash
git add base/components/account/password-form.tsx base/components/account/delete-account.tsx base/components/account/__tests__/password-form.test.tsx base/components/account/__tests__/delete-account.test.tsx
git commit -m "feat(dashboard): sections mot de passe et suppression du compte"
```

---

### Task 6 : Assembler la page mon compte et vérifier

**Files:**
- Create: `base/app/(dashboard)/dashboard/compte/page.tsx`
- Test: `base/app/(dashboard)/dashboard/compte/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `PageHeader` ; les 4 sections de compte ; `Card`/`Separator` pour la mise en page si utile.
- Produces: la route `/dashboard/compte` (le lien « Réglages » du menu la pointe déjà).

- [ ] **Step 1 : Écrire le test de la page**

Create `base/app/(dashboard)/dashboard/compte/__tests__/page.test.tsx` :
```tsx
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
```

- [ ] **Step 2 : Lancer (échec attendu) puis implémenter la page**

Run: `cd base && pnpm test -- "compte/__tests__/page"` (FAIL).

Create `base/app/(dashboard)/dashboard/compte/page.tsx` :
```tsx
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/account/profile-form"
import { EmailForm } from "@/components/account/email-form"
import { PasswordForm } from "@/components/account/password-form"
import { DeleteAccount } from "@/components/account/delete-account"

export default function ComptePage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Réglages" description="Gérez votre compte." />
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Profil</h2>
          <ProfileForm />
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Email</h2>
          <EmailForm />
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Mot de passe</h2>
          <PasswordForm />
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Supprimer le compte</h2>
          <DeleteAccount />
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Vérifications finales**

Run: `cd base && pnpm test -- "compte/__tests__/page"` (PASS) ; `cd base && pnpm test` (toute la suite verte) ; `cd base && pnpm exec tsc --noEmit` (exit 0) ; `cd base && pnpm build` (succès ; rapporter le mode de rendu de `/dashboard/compte`).

- [ ] **Step 4 : Commit**

```bash
git add "base/app/(dashboard)/dashboard/compte"
git commit -m "feat(dashboard): assembler la page mon compte"
```

---

## Point ouvert (à vérifier hors tests unitaires)

Les tests mockent la prise auth, donc ils valident le câblage UI, pas le comportement réel de better-auth. Le changement d'email (email de vérification) et la suppression de compte dépendent de la config serveur activée en Task 3 et de la version installée de better-auth. Une vérification manuelle contre le vrai backend (Supabase + better-auth) est recommandée avant de considérer ces deux opérations comme livrées : lancer `pnpm dev`, se connecter, et essayer chaque opération sur `/dashboard/compte`.

## Self-Review (rempli par l'auteur du plan)

- **Couverture :** primitives label + alert-dialog (Task 1) ; contrat + bouchon (Task 2) ; adaptateur base+module + activation serveur (Task 3) ; sections profil/email (Task 4), mot de passe/suppression (Task 5) ; page assemblée + route « Réglages » (Task 6). Les cinq opérations du design (nom, photo→via image, email, mot de passe, suppression) sont couvertes ; l'upload de photo se limite ici au champ `image` (URL) passé à `updateProfile` — l'upload de fichier réel est hors périmètre et pourra venir plus tard.
- **Placeholders :** aucun ; les patrons répétés (EmailForm, PasswordForm) sont décrits explicitement par référence au patron de ProfileForm, dont le code complet est donné.
- **Cohérence base ↔ module :** la Task 3 impose l'égalité stricte des deux copies de `client-adapter.ts` et de `server.ts` (vérifiée par `diff`).
- **Risque connu :** better-auth `changeEmail`/`deleteUser` exigent l'activation serveur (Task 3) et, pour l'email, un flux de vérification non couvert — signalé comme point ouvert. L'API better-auth doit être vérifiée avant usage (Task 3, Step 1).
