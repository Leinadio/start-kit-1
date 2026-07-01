# Dashboard – Les briques et l'accueil (Plan 2/3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire les briques réutilisables du dashboard (en-tête de page, carte de chiffre, surcouche tableau avec état vide) et remplacer la page d'accueil provisoire par une vraie vue d'ensemble qui les utilise.

**Architecture :** On ajoute d'abord les primitives shadcn manquantes (table, card, empty). Puis trois briques hand-written par-dessus : `PageHeader` (nouveau, shadcn n'en a pas), `StatCard` (convention mince sur `Card`), `DataTable` (surcouche déclarative sur `Table` + état vide). Enfin la page d'accueil compose l'en-tête et des cartes de chiffre. Tout lit le fichier de marque ; aucune couleur en dur.

**Tech Stack :** Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui (variante base-ui), Vitest + @testing-library/react (déjà en place depuis le Plan 1).

## Global Constraints

- **Ceci n'est PAS le Next.js habituel.** Avant de toucher au routing/layouts, lire le guide dans `node_modules/next/dist/docs/01-app/`.
- Tout le travail UI se fait dans `base/`. Chemins relatifs à `base/` sauf mention contraire.
- Alias d'import : `@/*` pointe vers `base/*`.
- Gestionnaire de paquets : `pnpm`. Lancer les commandes depuis `base/` (ex. `cd base && pnpm dlx shadcn@latest add table`).
- Versions à ne PAS changer : `next` 16.2.9, `react` 19.2.4, `tailwindcss` v4.
- Langue de l'interface : français.
- Le fichier de marque (`app/globals.css`) est la SEULE source des couleurs, arrondis et polices. Aucune couleur en dur (pas de hex, pas de `bg-black`) dans les fichiers hand-written.
- **Variante base-ui :** les primitives shadcn de ce projet sont bâties sur `@base-ui/react`, pas Radix. Où Radix utilise `asChild`, base-ui utilise `render={<El/>}`. Les NOMS des sous-composants générés peuvent différer des attentes : avant d'importer/composer, OUVRIR le fichier réel sous `base/components/ui/` et utiliser l'API réelle. Documenter toute adaptation.
- Tests : config `base/vitest.config.mts`, lancés par `pnpm test`. Un shim `matchMedia` est déjà dans `base/vitest.setup.ts`.
- Commits fréquents : un commit par tâche, message en français, style `feat(dashboard): ...`.

## Séquence des plans

- Plan 1 (fait, fusionné dans main) : fondation et coquille.
- **Plan 2 (ce document) : les briques et l'accueil.** À la fin : la page `/dashboard` affiche un en-tête et des cartes de chiffre ; la brique tableau est disponible et testée pour les écrans produit.
- Plan 3 : la page « mon compte » (extension du contrat d'auth + écran de réglages).

## Structure des fichiers (créés/modifiés dans ce plan)

- `base/components/ui/table.tsx`, `card.tsx`, `empty.tsx` – primitives shadcn (générées).
- `base/components/dashboard/page-header.tsx` – l'en-tête de page (titre + description + actions).
- `base/components/dashboard/stat-card.tsx` – la carte de chiffre.
- `base/components/dashboard/data-table.tsx` – la surcouche tableau déclarative + état vide.
- `base/components/dashboard/__tests__/page-header.test.tsx`, `stat-card.test.tsx`, `data-table.test.tsx` – tests.
- `base/app/(dashboard)/dashboard/page.tsx` – modifié : la vraie vue d'accueil.
- `base/app/(dashboard)/dashboard/__tests__/page.test.tsx` – test léger de la page d'accueil.

---

### Task 1 : Ajouter les primitives table, card, empty

**Files:**
- Create: `base/components/ui/table.tsx`, `base/components/ui/card.tsx`, `base/components/ui/empty.tsx` (générés)

**Interfaces:**
- Produces: primitives importables depuis `@/components/ui/table`, `@/components/ui/card`, `@/components/ui/empty`. Les noms exacts des sous-composants seront lus dans les fichiers générés par les tâches suivantes.

- [ ] **Step 1 : Générer les primitives**

Run:
```bash
cd base && pnpm dlx shadcn@latest add table card empty
```
Non-interactif (autoriser l'écriture). Si un nom de composant n'existe pas dans le registre base-ui, lire `pnpm dlx shadcn@latest add --help` et vérifier le nom exact ; rapporter toute différence.

- [ ] **Step 2 : Vérifier la présence et la compilation**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: exit 0. Vérifier que `table.tsx`, `card.tsx`, `empty.tsx` existent sous `base/components/ui/`.

- [ ] **Step 3 : Vérifier les tests existants**

Run: `cd base && pnpm test`
Expected: suite existante toujours verte (10/10).

- [ ] **Step 4 : Commit**

```bash
git add base/components/ui base/package.json ../pnpm-lock.yaml
git commit -m "feat(dashboard): ajouter les primitives table, card, empty"
```

---

### Task 2 : La brique en-tête de page

**Files:**
- Create: `base/components/dashboard/page-header.tsx`
- Test: `base/components/dashboard/__tests__/page-header.test.tsx`

**Interfaces:**
- Produces: `PageHeader` depuis `@/components/dashboard/page-header`, signature `PageHeader({ title, description?, actions? }: { title: string; description?: string; actions?: React.ReactNode })`. Server Component (aucun hook, pas de `"use client"`).

- [ ] **Step 1 : Écrire le test**

Create `base/components/dashboard/__tests__/page-header.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PageHeader } from "@/components/dashboard/page-header"

describe("PageHeader", () => {
  it("affiche le titre comme en-tête", () => {
    render(<PageHeader title="Factures" />)
    expect(screen.getByRole("heading", { name: "Factures" })).toBeInTheDocument()
  })

  it("affiche la description quand elle est fournie", () => {
    render(<PageHeader title="Factures" description="Vos factures récentes" />)
    expect(screen.getByText("Vos factures récentes")).toBeInTheDocument()
  })

  it("affiche les actions passées", () => {
    render(<PageHeader title="Factures" actions={<button>Nouvelle</button>} />)
    expect(screen.getByRole("button", { name: "Nouvelle" })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- page-header`
Expected: FAIL (`PageHeader` introuvable).

- [ ] **Step 3 : Implémenter la brique**

Create `base/components/dashboard/page-header.tsx` :
```tsx
import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 4 : Lancer le test**

Run: `cd base && pnpm test -- page-header`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add base/components/dashboard/page-header.tsx base/components/dashboard/__tests__/page-header.test.tsx
git commit -m "feat(dashboard): brique en-tete de page"
```

---

### Task 3 : La brique carte de chiffre

**Files:**
- Create: `base/components/dashboard/stat-card.tsx`
- Test: `base/components/dashboard/__tests__/stat-card.test.tsx`

**Interfaces:**
- Consumes: `Card` et ses sous-composants depuis `@/components/ui/card` (noms exacts à vérifier dans le fichier généré).
- Produces: `StatCard` depuis `@/components/dashboard/stat-card`, signature `StatCard({ label, value, hint? }: { label: string; value: string | number; hint?: string })`. Server Component.

- [ ] **Step 1 : Écrire le test**

Create `base/components/dashboard/__tests__/stat-card.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { StatCard } from "@/components/dashboard/stat-card"

describe("StatCard", () => {
  it("affiche le libellé et la valeur", () => {
    render(<StatCard label="Utilisateurs" value="1 248" />)
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument()
    expect(screen.getByText("1 248")).toBeInTheDocument()
  })

  it("affiche l'indice quand il est fourni", () => {
    render(<StatCard label="Revenu" value="8 430 €" hint="+4% ce mois" />)
    expect(screen.getByText("+4% ce mois")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- stat-card`
Expected: FAIL (`StatCard` introuvable).

- [ ] **Step 3 : Lire l'API réelle de Card puis implémenter**

Ouvrir `base/components/ui/card.tsx` et relever les noms réels des sous-composants (typiquement `Card`, `CardHeader`, `CardTitle`, `CardContent` ; adapter si la variante base-ui diffère).

Create `base/components/dashboard/stat-card.tsx` (adapter les imports aux noms réels) :
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4 : Lancer le test**

Run: `cd base && pnpm test -- stat-card`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add base/components/dashboard/stat-card.tsx base/components/dashboard/__tests__/stat-card.test.tsx
git commit -m "feat(dashboard): brique carte de chiffre"
```

---

### Task 4 : La brique tableau (surcouche déclarative)

**Files:**
- Create: `base/components/dashboard/data-table.tsx`
- Test: `base/components/dashboard/__tests__/data-table.test.tsx`

**Interfaces:**
- Consumes: `Table` et ses sous-composants depuis `@/components/ui/table` ; `Empty` depuis `@/components/ui/empty` (noms/API exacts à vérifier dans les fichiers générés).
- Produces:
  - `type Column<T> = { key: string; header: string; render?: (row: T) => React.ReactNode }` depuis `@/components/dashboard/data-table`.
  - `DataTable<T extends { id: string | number }>({ columns, data, emptyMessage? })` depuis le même module. Rend un tableau ; si `data` est vide, rend un état vide portant `emptyMessage`.

- [ ] **Step 1 : Écrire le test**

Create `base/components/dashboard/__tests__/data-table.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { DataTable, type Column } from "@/components/dashboard/data-table"

type Facture = { id: number; client: string; montant: string }

const columns: Column<Facture>[] = [
  { key: "client", header: "Client" },
  { key: "montant", header: "Montant" },
]

describe("DataTable", () => {
  it("affiche les en-têtes et les lignes de données", () => {
    const data: Facture[] = [{ id: 1, client: "Acme", montant: "100 €" }]
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText("Client")).toBeInTheDocument()
    expect(screen.getByText("Montant")).toBeInTheDocument()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByText("100 €")).toBeInTheDocument()
  })

  it("utilise la fonction render d'une colonne quand elle existe", () => {
    const cols: Column<Facture>[] = [
      { key: "client", header: "Client" },
      { key: "montant", header: "Montant", render: (r) => `≈ ${r.montant}` },
    ]
    render(<DataTable columns={cols} data={[{ id: 1, client: "Acme", montant: "100 €" }]} />)
    expect(screen.getByText("≈ 100 €")).toBeInTheDocument()
  })

  it("affiche l'état vide quand il n'y a pas de données", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Aucune facture" />)
    expect(screen.getByText("Aucune facture")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- data-table`
Expected: FAIL (`DataTable` introuvable).

- [ ] **Step 3 : Lire l'API réelle de Table et Empty puis implémenter**

Ouvrir `base/components/ui/table.tsx` (relever `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) et `base/components/ui/empty.tsx` (relever comment afficher un message ; l'API base-ui peut exposer `Empty` + sous-composants comme `EmptyContent`/`EmptyTitle`). Adapter le rendu de l'état vide à l'API réelle — un simple message centré via le composant `Empty` suffit ; si son API est lourde, un `<div>` centré avec le message et une classe `text-muted-foreground` est acceptable et doit être documenté.

Create `base/components/dashboard/data-table.tsx` (adapter aux noms réels) :
```tsx
import type { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Empty } from "@/components/ui/empty"

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = "Rien à afficher pour l'instant.",
}: {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}) {
  if (data.length === 0) {
    return <Empty>{emptyMessage}</Empty>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col) => (
              <TableCell key={col.key}>
                {col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[col.key] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4 : Lancer le test**

Run: `cd base && pnpm test -- data-table`
Expected: PASS (les 3 cas).

- [ ] **Step 5 : Commit**

```bash
git add base/components/dashboard/data-table.tsx base/components/dashboard/__tests__/data-table.test.tsx
git commit -m "feat(dashboard): brique tableau declarative avec etat vide"
```

---

### Task 5 : La vraie page d'accueil

**Files:**
- Modify: `base/app/(dashboard)/dashboard/page.tsx`
- Test: `base/app/(dashboard)/dashboard/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `PageHeader` et `StatCard`.
- Produces: la route `/dashboard`, vue d'ensemble. Valeurs de démonstration statiques (le fondateur branchera ses vraies données) — le noter en commentaire.

- [ ] **Step 1 : Écrire le test**

Create `base/app/(dashboard)/dashboard/__tests__/page.test.tsx` :
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import DashboardHomePage from "@/app/(dashboard)/dashboard/page"

describe("Page d'accueil du dashboard", () => {
  it("affiche l'en-tête Accueil et au moins une carte de chiffre", () => {
    render(<DashboardHomePage />)
    expect(screen.getByRole("heading", { name: "Accueil" })).toBeInTheDocument()
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer le test (échec attendu)**

Run: `cd base && pnpm test -- "dashboard/__tests__/page"`
Expected: FAIL (la page ne contient pas encore l'en-tête ni les cartes).

- [ ] **Step 3 : Implémenter la page**

Replace le contenu de `base/app/(dashboard)/dashboard/page.tsx` par :
```tsx
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"

// Valeurs de démonstration statiques : le fondateur branchera ses vraies
// données à la place. Ce sont des exemples pour montrer la mise en page.
export default function DashboardHomePage() {
  return (
    <div>
      <PageHeader title="Accueil" description="Vue d'ensemble de votre activité." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Utilisateurs" value="1 248" hint="+12% ce mois" />
        <StatCard label="Revenu" value="8 430 €" hint="+4% ce mois" />
        <StatCard label="Abonnements actifs" value="312" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4 : Lancer le test**

Run: `cd base && pnpm test -- "dashboard/__tests__/page"`
Expected: PASS.

- [ ] **Step 5 : Vérifications finales**

Run: `cd base && pnpm test`
Expected: toute la suite verte.
Run: `cd base && pnpm exec tsc --noEmit`
Expected: exit 0.
Run: `cd base && pnpm build`
Expected: succès, `/dashboard` toujours dynamique (ou statique — les deux sont acceptables ici puisque la page n'a plus de dépendance dynamique propre ; le layout parent reste le garde d'auth). Rapporter le statut obtenu.

- [ ] **Step 6 : Commit**

```bash
git add "base/app/(dashboard)/dashboard/page.tsx" "base/app/(dashboard)/dashboard/__tests__/page.test.tsx"
git commit -m "feat(dashboard): vraie page d'accueil avec en-tete et cartes de chiffre"
```

---

## Self-Review (rempli par l'auteur du plan)

- **Couverture du spec (briques Plan 2) :** en-tête de page (Task 2), carte de chiffre (Task 3), surcouche tableau avec état vide (Task 4), vraie page d'accueil qui utilise les briques (Task 5). Primitives manquantes ajoutées en amont (Task 1 : table, card, empty). La brique tableau reste volontairement simple (colonnes + données + état vide, pas de tri) — YAGNI ; le tri pourra s'ajouter plus tard via la Data Table de shadcn si un écran client le demande.
- **Placeholders :** aucun « TODO » ; chaque étape de code montre le code réel. Les valeurs de la page d'accueil sont explicitement des exemples statiques, documentés en commentaire.
- **Cohérence des types :** `Column<T>` défini en Task 4 et consommé par son test ; `PageHeader`/`StatCard` produits en Task 2/3 et consommés en Task 5 avec les mêmes signatures. Les noms de sous-composants shadcn (Card/Table/Empty) sont marqués « à vérifier dans le fichier généré » car la variante base-ui peut différer.
- **Risque connu :** l'API du composant `Empty` (base-ui) est incertaine ; la Task 4 autorise explicitement un repli (message centré dans un `<div>`) si l'API est lourde, pour ne pas bloquer.
