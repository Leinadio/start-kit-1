# Dashboard – Fondation et coquille (Plan 1/3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser les fondations UI du dashboard (shadcn + fichier de marque + tests) et construire la coquille réutilisable (barre latérale, barre du haut avec fil d'Ariane et menu utilisateur, zone de contenu) protégée par l'authentification.

**Architecture :** On installe shadcn/ui sur la stack existante (Next.js 16, React 19, Tailwind v4). Le « fichier de marque » est le thème shadcn (variables CSS dans `app/globals.css`). La coquille est un layout Next.js dans un groupe de routes `(dashboard)`, composé à partir des primitives shadcn (Sidebar, Breadcrumb, Avatar, Dropdown Menu). La logique testable (navigation, fil d'Ariane) est isolée dans des fonctions pures testées en TDD.

**Tech Stack :** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Vitest + @testing-library/react.

## Global Constraints

- **Ceci n'est PAS le Next.js habituel.** Avant de toucher au routing, aux layouts ou aux Server Components, lire le guide concerné dans `node_modules/next/dist/docs/01-app/`. Respecter les avis de dépréciation.
- Répertoire de travail : tout le travail UI se fait dans `base/`. Les chemins ci-dessous sont relatifs à `base/` sauf indication contraire.
- Alias d'import : `@/*` pointe vers `base/*` (défini dans `base/tsconfig.json`).
- Gestionnaire de paquets : `pnpm`. Les commandes UI se lancent depuis `base/` (ex. `cd base && pnpm dlx shadcn@latest add button`).
- Versions à ne pas changer : `next` 16.2.9, `react` 19.2.4, `tailwindcss` v4. Ne pas rétrograder.
- Langue de l'interface : français (libellés, textes visibles).
- Le fichier de marque (thème shadcn) est la SEULE source des couleurs, arrondis et polices. Aucun composant ne code une couleur en dur ; toujours passer par les variables du thème.
- Commits fréquents : un commit par tâche terminée, message en français, style `feat(dashboard): ...`.

## Séquence des plans

Ce plan est le premier d'une série de trois. Chacun livre un logiciel qui marche.

1. **Plan 1 (ce document) – Fondation et coquille.** À la fin : on peut se connecter et naviguer dans un dashboard réel mais encore vide.
2. **Plan 2 – Les briques et l'accueil.** En-tête de page, carte de chiffre, surcouche tableau, et une vraie page d'accueil qui les utilise.
3. **Plan 3 – La page « mon compte ».** Extension du contrat d'auth (nom, email, mot de passe, suppression) puis l'écran de réglages.

## Structure des fichiers (créés dans ce plan)

- `base/components.json` – config shadcn (généré).
- `base/lib/utils.ts` – helper `cn()` (généré par shadcn).
- `base/app/globals.css` – modifié : le fichier de marque (variables du thème).
- `base/components/ui/*` – primitives shadcn (générées : sidebar, button, avatar, dropdown-menu, breadcrumb, separator, sheet, input, tooltip, skeleton).
- `base/lib/dashboard/nav.ts` – données de navigation (liens du menu de gauche).
- `base/lib/dashboard/breadcrumb.ts` – fonction pure qui déduit le fil d'Ariane du chemin.
- `base/components/dashboard/app-sidebar.tsx` – la barre latérale.
- `base/components/dashboard/dashboard-topbar.tsx` – la barre du haut (déclencheur, fil d'Ariane, recherche, menu utilisateur).
- `base/components/dashboard/user-menu.tsx` – le menu utilisateur (avatar + déconnexion).
- `base/app/(dashboard)/layout.tsx` – la coquille assemblée, protégée par l'auth.
- `base/app/(dashboard)/dashboard/page.tsx` – page d'accueil provisoire.
- `base/vitest.config.ts`, `base/vitest.setup.ts` – config des tests de composants.

---

### Task 1 : Initialiser shadcn/ui

**Files:**
- Create: `base/components.json` (généré)
- Create: `base/lib/utils.ts` (généré)
- Modify: `base/app/globals.css` (shadcn y ajoute ses variables)
- Modify: `base/package.json` (deps ajoutées par shadcn)

**Interfaces:**
- Produces: helper `cn(...inputs)` exporté depuis `@/lib/utils` (fusionne des classes Tailwind), utilisé par toutes les primitives.

- [ ] **Step 1 : Lire le guide shadcn Tailwind v4**

Lire `node_modules/next/dist/docs/01-app/` (sections styling / CSS) puis vérifier la doc shadcn Tailwind v4. La commande d'init détecte Tailwind v4 et écrit le thème sous forme de variables CSS.

- [ ] **Step 2 : Lancer l'initialisation shadcn**

Run:
```bash
cd base && pnpm dlx shadcn@latest init
```
Répondre : base color `neutral` (on ajustera dans la Task 2), utiliser les variables CSS = oui. L'outil doit créer `components.json`, `lib/utils.ts`, et modifier `app/globals.css`.

- [ ] **Step 3 : Vérifier que le helper existe et que le projet compile**

Run:
```bash
cd base && pnpm exec tsc --noEmit
```
Expected: exit 0. Vérifier aussi que `base/lib/utils.ts` exporte `cn`.

- [ ] **Step 4 : Commit**

```bash
git add base/components.json base/lib/utils.ts base/app/globals.css base/package.json ../pnpm-lock.yaml
git commit -m "feat(dashboard): initialiser shadcn/ui sur la base"
```

---

### Task 2 : Le fichier de marque (thème)

**Files:**
- Modify: `base/app/globals.css`

**Interfaces:**
- Produces: un jeu complet de variables de thème (couleurs, `--radius`) en mode clair et sombre, servant de fichier de marque unique.

- [ ] **Step 1 : Écrire un test de présence des variables de marque**

Create `base/lib/dashboard/__tests__/brand.test.ts` :
```ts
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it, expect } from "vitest"

describe("fichier de marque", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

  it("définit les variables de marque essentielles", () => {
    for (const token of ["--primary", "--background", "--foreground", "--radius"]) {
      expect(css).toContain(token)
    }
  })

  it("définit une variante sombre", () => {
    expect(css).toContain(".dark")
  })
})
```

- [ ] **Step 2 : Lancer le test (échec attendu si les tests ne tournent pas encore)**

Note : ce test dépend de la config Vitest de la Task 3. Si Vitest n'est pas encore installé, faire d'abord la Task 3 puis revenir. Sinon :
Run: `cd base && pnpm test -- brand`
Expected: PASS si l'init shadcn a bien écrit les variables ; sinon compléter `globals.css` à l'étape suivante.

- [ ] **Step 3 : Compléter/ajuster les variables de marque**

Dans `base/app/globals.css`, s'assurer que le bloc `:root` et le bloc `.dark` définissent au minimum `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--muted`, `--border`, `--ring`, et `--radius`. Ajouter un commentaire en tête :
```css
/* Fichier de marque : SEULE source des couleurs, arrondis et polices.
   Pour un nouveau client, modifier uniquement les valeurs ci-dessous. */
```

- [ ] **Step 4 : Lancer le test**

Run: `cd base && pnpm test -- brand`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add base/app/globals.css base/lib/dashboard/__tests__/brand.test.ts
git commit -m "feat(dashboard): definir le fichier de marque (theme shadcn)"
```

---

### Task 3 : Mettre en place les tests de composants

**Files:**
- Create: `base/vitest.config.ts`
- Create: `base/vitest.setup.ts`
- Modify: `base/package.json` (scripts + devDeps)

**Interfaces:**
- Produces: script `pnpm test` (Vitest en mode run) exécutant les tests `**/*.test.ts(x)` avec l'environnement jsdom et l'alias `@/`.

- [ ] **Step 1 : Installer les dépendances de test**

Run:
```bash
cd base && pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths
```

- [ ] **Step 2 : Créer la config Vitest**

Create `base/vitest.config.ts` :
```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
})
```

Create `base/vitest.setup.ts` :
```ts
import "@testing-library/jest-dom/vitest"
```

- [ ] **Step 3 : Ajouter les scripts de test**

Modify `base/package.json`, dans `"scripts"` :
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4 : Écrire un test de fumée**

Create `base/lib/dashboard/__tests__/smoke.test.ts` :
```ts
import { describe, it, expect } from "vitest"

describe("environnement de test", () => {
  it("fonctionne", () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5 : Lancer les tests**

Run: `cd base && pnpm test`
Expected: PASS (smoke + brand de la Task 2).

- [ ] **Step 6 : Commit**

```bash
git add base/vitest.config.ts base/vitest.setup.ts base/package.json base/lib/dashboard/__tests__/smoke.test.ts ../pnpm-lock.yaml
git commit -m "feat(dashboard): mettre en place Vitest et Testing Library"
```

---

### Task 4 : Ajouter les primitives shadcn

**Files:**
- Create: `base/components/ui/*` (générés)

**Interfaces:**
- Produces: les primitives importables depuis `@/components/ui/*` : `sidebar`, `button`, `avatar`, `dropdown-menu`, `breadcrumb`, `separator`, `sheet`, `input`, `tooltip`, `skeleton`.

- [ ] **Step 1 : Générer les primitives**

Run:
```bash
cd base && pnpm dlx shadcn@latest add sidebar button avatar dropdown-menu breadcrumb separator sheet input tooltip skeleton
```
La commande installe aussi les dépendances Radix nécessaires.

- [ ] **Step 2 : Vérifier la compilation**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3 : Commit**

```bash
git add base/components/ui base/package.json ../pnpm-lock.yaml
git commit -m "feat(dashboard): ajouter les primitives shadcn de la coquille"
```

---

### Task 5 : Navigation et barre latérale

**Files:**
- Create: `base/lib/dashboard/nav.ts`
- Create: `base/components/dashboard/app-sidebar.tsx`
- Test: `base/components/dashboard/__tests__/app-sidebar.test.tsx`

**Interfaces:**
- Consumes: `Sidebar` et ses sous-composants depuis `@/components/ui/sidebar`.
- Produces:
  - `navItems: NavItem[]` depuis `@/lib/dashboard/nav`, avec `type NavItem = { label: string; href: string }`.
  - `<AppSidebar />` depuis `@/components/dashboard/app-sidebar` (Client Component).

- [ ] **Step 1 : Écrire les données de navigation**

Create `base/lib/dashboard/nav.ts` :
```ts
export type NavItem = { label: string; href: string }

// Menu minimal : on ne met que ce qui existe. Les écrans produit du client
// s'ajouteront ici plus tard.
export const navItems: NavItem[] = [
  { label: "Accueil", href: "/dashboard" },
  { label: "Réglages", href: "/dashboard/compte" },
]
```

- [ ] **Step 2 : Écrire le test de la barre latérale**

Create `base/components/dashboard/__tests__/app-sidebar.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

describe("AppSidebar", () => {
  it("affiche un lien par entrée de navigation", () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
    )
    expect(screen.getByRole("link", { name: "Accueil" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Réglages" })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- app-sidebar`
Expected: FAIL (`AppSidebar` introuvable).

- [ ] **Step 4 : Implémenter la barre latérale**

Create `base/components/dashboard/app-sidebar.tsx` :
```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navItems } from "@/lib/dashboard/nav"

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

- [ ] **Step 5 : Lancer le test**

Run: `cd base && pnpm test -- app-sidebar`
Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add base/lib/dashboard/nav.ts base/components/dashboard/app-sidebar.tsx base/components/dashboard/__tests__/app-sidebar.test.tsx
git commit -m "feat(dashboard): barre laterale avec navigation"
```

---

### Task 6 : Le fil d'Ariane (logique pure)

**Files:**
- Create: `base/lib/dashboard/breadcrumb.ts`
- Test: `base/lib/dashboard/__tests__/breadcrumb.test.ts`

**Interfaces:**
- Consumes: `navItems` depuis `@/lib/dashboard/nav`.
- Produces: `buildBreadcrumb(pathname: string): Crumb[]` depuis `@/lib/dashboard/breadcrumb`, avec `type Crumb = { label: string; href: string }`. Le dernier élément est la page courante.

- [ ] **Step 1 : Écrire le test**

Create `base/lib/dashboard/__tests__/breadcrumb.test.ts` :
```ts
import { describe, it, expect } from "vitest"
import { buildBreadcrumb } from "@/lib/dashboard/breadcrumb"

describe("buildBreadcrumb", () => {
  it("renvoie Accueil pour la racine du dashboard", () => {
    expect(buildBreadcrumb("/dashboard")).toEqual([
      { label: "Accueil", href: "/dashboard" },
    ])
  })

  it("construit le chemin pour une sous-page connue", () => {
    expect(buildBreadcrumb("/dashboard/compte")).toEqual([
      { label: "Accueil", href: "/dashboard" },
      { label: "Réglages", href: "/dashboard/compte" },
    ])
  })

  it("met en Capitale les segments inconnus", () => {
    expect(buildBreadcrumb("/dashboard/factures")).toEqual([
      { label: "Accueil", href: "/dashboard" },
      { label: "Factures", href: "/dashboard/factures" },
    ])
  })
})
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- breadcrumb`
Expected: FAIL (`buildBreadcrumb` introuvable).

- [ ] **Step 3 : Implémenter la fonction**

Create `base/lib/dashboard/breadcrumb.ts` :
```ts
import { navItems } from "@/lib/dashboard/nav"

export type Crumb = { label: string; href: string }

const labelFor = (href: string, segment: string): string => {
  const known = navItems.find((item) => item.href === href)
  if (known) return known.label
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function buildBreadcrumb(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: Crumb[] = []
  let href = ""
  for (const segment of segments) {
    href += `/${segment}`
    if (href === "/dashboard") {
      crumbs.push({ label: "Accueil", href })
    } else if (segment !== "dashboard") {
      crumbs.push({ label: labelFor(href, segment), href })
    }
  }
  return crumbs
}
```

- [ ] **Step 4 : Lancer le test**

Run: `cd base && pnpm test -- breadcrumb`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add base/lib/dashboard/breadcrumb.ts base/lib/dashboard/__tests__/breadcrumb.test.ts
git commit -m "feat(dashboard): logique du fil d'Ariane"
```

---

### Task 7 : Le menu utilisateur et la barre du haut

**Files:**
- Create: `base/components/dashboard/user-menu.tsx`
- Create: `base/components/dashboard/dashboard-topbar.tsx`
- Test: `base/components/dashboard/__tests__/user-menu.test.tsx`
- Test: `base/components/dashboard/__tests__/dashboard-topbar.test.tsx`

**Interfaces:**
- Consumes: `useSession`, `signOut` depuis `@/lib/auth/client` ; `buildBreadcrumb` depuis `@/lib/dashboard/breadcrumb` ; primitives `SidebarTrigger`, `Breadcrumb*`, `Avatar*`, `DropdownMenu*`, `Input`.
- Produces:
  - `<UserMenu />` depuis `@/components/dashboard/user-menu` (Client Component ; affiche l'email et un bouton de déconnexion).
  - `<DashboardTopbar />` depuis `@/components/dashboard/dashboard-topbar` (Client Component ; déclencheur de barre latérale + fil d'Ariane + recherche + menu utilisateur).

- [ ] **Step 1 : Écrire le test du menu utilisateur**

Create `base/components/dashboard/__tests__/user-menu.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr" } }, isPending: false }),
  signOut: vi.fn(),
}))

import { UserMenu } from "@/components/dashboard/user-menu"

describe("UserMenu", () => {
  it("affiche l'email de l'utilisateur connecté", () => {
    render(<UserMenu />)
    expect(screen.getByText("jean@exemple.fr")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- user-menu`
Expected: FAIL (`UserMenu` introuvable).

- [ ] **Step 3 : Implémenter le menu utilisateur**

Create `base/components/dashboard/user-menu.tsx` :
```tsx
"use client"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const router = useRouter()
  const { data } = useSession()
  const email = data?.user.email ?? ""
  const initial = email ? email.charAt(0).toUpperCase() : "?"

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Menu utilisateur">
        <Avatar>
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Se déconnecter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 4 : Lancer le test**

Run: `cd base && pnpm test -- user-menu`
Expected: PASS.

- [ ] **Step 5 : Écrire le test de la barre du haut**

Create `base/components/dashboard/__tests__/dashboard-topbar.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/compte",
  useRouter: () => ({ refresh: vi.fn() }),
}))
vi.mock("@/lib/auth/client", () => ({
  useSession: () => ({ data: { user: { email: "jean@exemple.fr" } }, isPending: false }),
  signOut: vi.fn(),
}))

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"

describe("DashboardTopbar", () => {
  it("affiche le fil d'Ariane du chemin courant", () => {
    render(
      <SidebarProvider>
        <DashboardTopbar />
      </SidebarProvider>,
    )
    expect(screen.getByText("Accueil")).toBeInTheDocument()
    expect(screen.getByText("Réglages")).toBeInTheDocument()
  })
})
```

- [ ] **Step 6 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- dashboard-topbar`
Expected: FAIL (`DashboardTopbar` introuvable).

- [ ] **Step 7 : Implémenter la barre du haut**

Create `base/components/dashboard/dashboard-topbar.tsx` :
```tsx
"use client"
import { Fragment } from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { buildBreadcrumb } from "@/lib/dashboard/breadcrumb"
import { UserMenu } from "@/components/dashboard/user-menu"

export function DashboardTopbar() {
  const pathname = usePathname()
  const crumbs = buildBreadcrumb(pathname)

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-3">
        <Input type="search" placeholder="Rechercher..." className="w-48" />
        <UserMenu />
      </div>
    </header>
  )
}
```

- [ ] **Step 8 : Lancer le test**

Run: `cd base && pnpm test -- dashboard-topbar`
Expected: PASS.

- [ ] **Step 9 : Commit**

```bash
git add base/components/dashboard/user-menu.tsx base/components/dashboard/dashboard-topbar.tsx base/components/dashboard/__tests__/user-menu.test.tsx base/components/dashboard/__tests__/dashboard-topbar.test.tsx
git commit -m "feat(dashboard): menu utilisateur et barre du haut avec fil d'Ariane"
```

---

### Task 8 : La coquille assemblée (layout protégé)

**Files:**
- Create: `base/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `adapters.auth.getSession()` depuis `@/lib/adapters` (Server Component) ; `redirect` de `next/navigation` ; `SidebarProvider`, `SidebarInset` de `@/components/ui/sidebar` ; `AppSidebar`, `DashboardTopbar`.
- Produces: le layout du groupe de routes `(dashboard)`. Toute page sous `(dashboard)` hérite de la coquille et de la protection auth.

- [ ] **Step 1 : Lire le guide des layouts et route groups**

Lire `node_modules/next/dist/docs/01-app/` (routing : layouts et groupes de routes). Confirmer la syntaxe des groupes `(dossier)` et la signature d'un layout dans cette version.

- [ ] **Step 2 : Implémenter le layout**

Create `base/app/(dashboard)/layout.tsx` :
```tsx
import { redirect } from "next/navigation"
import { adapters } from "@/lib/adapters"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await adapters.auth.getSession()
  if (!session) redirect("/login")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardTopbar />
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

- [ ] **Step 3 : Vérifier la compilation**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4 : Commit**

```bash
git add "base/app/(dashboard)/layout.tsx"
git commit -m "feat(dashboard): coquille assemblee protegee par l'auth"
```

---

### Task 9 : Page d'accueil provisoire

**Files:**
- Create: `base/app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Consumes: la coquille via le layout `(dashboard)`.
- Produces: la route `/dashboard`, page d'accueil provisoire (remplacée par une vraie vue au Plan 2).

- [ ] **Step 1 : Implémenter la page**

Create `base/app/(dashboard)/dashboard/page.tsx` :
```tsx
export default function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Accueil</h1>
      <p className="text-muted-foreground">
        Votre tableau de bord. Le contenu arrivera au prochain lot.
      </p>
    </div>
  )
}
```

- [ ] **Step 2 : Vérification manuelle dans le navigateur**

Run: `cd base && pnpm dev`
Ouvrir `http://localhost:3000/dashboard`.
Attendu : si connecté, la coquille s'affiche (barre latérale « Accueil / Réglages », barre du haut avec fil d'Ariane « Accueil », recherche, avatar). Si déconnecté, redirection vers `/login`.

- [ ] **Step 3 : Lancer toute la suite de tests**

Run: `cd base && pnpm test`
Expected: tous les tests PASS.

- [ ] **Step 4 : Vérifier le typecheck global**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5 : Commit**

```bash
git add "base/app/(dashboard)/dashboard/page.tsx"
git commit -m "feat(dashboard): page d'accueil provisoire"
```

---

## Self-Review (rempli par l'auteur du plan)

- **Couverture du spec :** couche marque (Task 2) ; outil shadcn (Task 1, 4) ; cadre = barre latérale (Task 5) + barre du haut avec fil d'Ariane, recherche, menu utilisateur (Task 6, 7) + zone de contenu + protection auth (Task 8) ; menu de gauche par défaut (Task 5) ; structure de dossiers = conventions shadcn/Next, pas de dossier inventé (respecté). Hors périmètre de CE plan, traités ensuite : en-tête de page, carte de chiffre, surcouche tableau (Plan 2) ; page « mon compte » et extension du contrat d'auth (Plan 3). Le comportement mobile est fourni par la primitive Sidebar de shadcn (Sheet intégré).
- **Placeholders :** aucun « TODO/TBD » ; chaque étape de code montre le code réel.
- **Cohérence des types :** `NavItem`/`navItems` (Task 5) réutilisés par `buildBreadcrumb` (Task 6) ; `Crumb` consommé par la barre du haut (Task 7) ; `useSession`/`signOut` consommés tels qu'exposés par `@/lib/auth/client` (contrat existant vérifié dans le code).
