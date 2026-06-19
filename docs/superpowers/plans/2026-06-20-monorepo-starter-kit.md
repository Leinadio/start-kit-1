# Monorepo Starter Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire un monorepo starter kit, une application Next.js de base avec des prises et bouchons, une commande add/remove, et deux modules liés (database Prisma/Supabase, auth better-auth) pour prouver le flux de bout en bout.

**Architecture:** Le squelette (dossier base) ne parle qu'à des prises (interfaces) avec bouchons par défaut. Les modules se branchent par chirurgie de texte entre marqueurs, pilotée par une commande qui lit une fiche module.json. Le bus d'évènements découple les modules.

**Tech Stack:** pnpm workspaces, Next.js 16.2.9, React 19, TypeScript strict, Prisma, Supabase Postgres, better-auth, tsup, vitest, commander.

## Global Constraints

- Gestionnaire de paquets, pnpm 10.13.1. Jamais npm ni yarn.
- TypeScript strict, déjà activé dans le tsconfig de base.
- Alias d'import dans base, `@/*` vers la racine de base.
- Aucune valeur secrète en dur. Le fichier base/.env.example ne contient que des noms de variables.
- École des marqueurs seuls. Pas de fichier de suivi séparé. La fiche module.json porte valeurInstallee et valeurParDefaut pour brancher et débrancher.
- Les modules vivent dans modules/, ce ne sont pas des paquets pnpm, juste des dossiers de gabarits lus par la commande.
- Commits fréquents, un par tâche au minimum.

---

## Task 1: Restructuration en monorepo

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (racine)
- Move: tout le Create Next App actuel vers `base/`
- Delete: `package-lock.json` (passage npm vers pnpm)

**Interfaces:**
- Produces: la structure `base/`, `packages/`, `modules/`, et un workspace pnpm fonctionnel.

- [ ] **Step 1: Déplacer le Create Next App sous base**

```bash
cd /Users/danieldupont/Developer/Projects/starter-kit/starter-kit-1
mkdir -p base packages modules
git mv app base/app
git mv public base/public
git mv next.config.ts base/next.config.ts
git mv postcss.config.mjs base/postcss.config.mjs
git mv eslint.config.mjs base/eslint.config.mjs
git mv tsconfig.json base/tsconfig.json
git mv next-env.d.ts base/next-env.d.ts
git mv package.json base/package.json
git mv README.md base/README.md
rm -f package-lock.json
```

- [ ] **Step 2: Renommer le paquet de base**

Modifier `base/package.json`, champ `name`, de `starter-kit-1` vers `@starter/base`. Garder le reste (scripts dev/build/start/lint, dépendances next/react).

- [ ] **Step 3: Créer le workspace pnpm**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - base
  - packages/*
```

- [ ] **Step 4: Créer le package.json racine**

Create `package.json`:

```json
{
  "name": "starter-kit-monorepo",
  "private": true,
  "packageManager": "pnpm@10.13.1",
  "scripts": {
    "dev": "pnpm --filter @starter/base dev",
    "build": "pnpm --filter @starter/base build",
    "cli:build": "pnpm --filter @starter/cli build",
    "test": "pnpm --filter @starter/cli test"
  }
}
```

- [ ] **Step 5: Installer et vérifier le démarrage**

Run: `pnpm install`
Expected: installation réussie, un seul lockfile `pnpm-lock.yaml` à la racine.

Run: `pnpm --filter @starter/base build`
Expected: build Next réussi (l'app de départ inchangée compile encore).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: restructure into pnpm monorepo with base app"
```

---

## Task 2: Contrats des prises et bouchons

**Files:**
- Create: `base/lib/adapters/types.ts`
- Create: `base/lib/adapters/stubs/auth-stub.ts`
- Create: `base/lib/adapters/stubs/payment-stub.ts`
- Create: `base/lib/adapters/stubs/database-stub.ts`
- Create: `base/lib/adapters/stubs/email-stub.ts`
- Create: `base/lib/adapters/stubs/analytics-stub.ts`

**Interfaces:**
- Produces: `Session`, `AuthAdapter`, `PaymentAdapter`, `DatabaseAdapter`, `EmailAdapter`, `AnalyticsAdapter`, `Adapters` types. Stubs `authStub`, `paymentStub`, `databaseStub`, `emailStub`, `analyticsStub`.

- [ ] **Step 1: Écrire les contrats**

Create `base/lib/adapters/types.ts`:

```ts
export interface Session {
  userId: string
  email: string
}

export interface AuthAdapter {
  getSession(): Promise<Session | null>
  signOut(): Promise<void>
}

export interface DatabaseAdapter {
  isReady(): boolean
}

export interface PaymentAdapter {
  handleWebhook(req: Request): Promise<void>
}

export interface EmailAdapter {
  send(to: string, message: string): Promise<void>
}

export interface AnalyticsAdapter {
  track(userId: string, event: string, props?: Record<string, unknown>): void
}

export interface Adapters {
  auth: AuthAdapter
  database: DatabaseAdapter
  payment: PaymentAdapter | null
  email: EmailAdapter
  analytics: AnalyticsAdapter
}
```

- [ ] **Step 2: Écrire les bouchons**

Create `base/lib/adapters/stubs/auth-stub.ts`:

```ts
import type { AuthAdapter } from "@/lib/adapters/types"

export const authStub: AuthAdapter = {
  async getSession() {
    return null
  },
  async signOut() {},
}
```

Create `base/lib/adapters/stubs/database-stub.ts`:

```ts
import type { DatabaseAdapter } from "@/lib/adapters/types"

export const databaseStub: DatabaseAdapter = {
  isReady() {
    return false
  },
}
```

Create `base/lib/adapters/stubs/payment-stub.ts`:

```ts
import type { PaymentAdapter } from "@/lib/adapters/types"

export const paymentStub: PaymentAdapter = {
  async handleWebhook() {
    throw new Error("Aucun module de paiement installé")
  },
}
```

Create `base/lib/adapters/stubs/email-stub.ts`:

```ts
import type { EmailAdapter } from "@/lib/adapters/types"

export const emailStub: EmailAdapter = {
  async send() {},
}
```

Create `base/lib/adapters/stubs/analytics-stub.ts`:

```ts
import type { AnalyticsAdapter } from "@/lib/adapters/types"

export const analyticsStub: AnalyticsAdapter = {
  track() {},
}
```

- [ ] **Step 3: Vérifier le typecheck**

Run: `pnpm --filter @starter/base exec tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add base/lib/adapters
git commit -m "feat(base): adapter contracts and default stubs"
```

---

## Task 3: Registre central avec marqueurs

**Files:**
- Create: `base/lib/adapters/index.ts`

**Interfaces:**
- Consumes: types et stubs de Task 2.
- Produces: l'objet `adapters` exporté, avec les marqueurs `@adapter:auth`, `@adapter:database`, `@adapter:payment`, `@adapter:email`, `@adapter:analytics`.

- [ ] **Step 1: Écrire le registre**

Create `base/lib/adapters/index.ts`:

```ts
import type { Adapters } from "@/lib/adapters/types"
import { authStub } from "@/lib/adapters/stubs/auth-stub"
import { databaseStub } from "@/lib/adapters/stubs/database-stub"
import { paymentStub } from "@/lib/adapters/stubs/payment-stub"
import { emailStub } from "@/lib/adapters/stubs/email-stub"
import { analyticsStub } from "@/lib/adapters/stubs/analytics-stub"

export const adapters: Adapters = {
  // @adapter:auth start
  auth: authStub,
  // @adapter:auth end
  // @adapter:database start
  database: databaseStub,
  // @adapter:database end
  // @adapter:payment start
  payment: null,
  // @adapter:payment end
  // @adapter:email start
  email: emailStub,
  // @adapter:email end
  // @adapter:analytics start
  analytics: analyticsStub,
  // @adapter:analytics end
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @starter/base exec tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add base/lib/adapters/index.ts
git commit -m "feat(base): central adapter registry with markers"
```

---

## Task 4: Bus d'évènements

**Files:**
- Create: `base/lib/events/types.ts`
- Create: `base/lib/events/memory-bus.ts`
- Create: `base/lib/events/index.ts`
- Create: `base/lib/events/client.ts`

**Interfaces:**
- Produces: `AppEvents`, `EventBusAdapter`, `memoryBus`, `eventBus` (serveur), `clientBus` (navigateur).

- [ ] **Step 1: Écrire le contrat et le catalogue**

Create `base/lib/events/types.ts`:

```ts
export type AppEvents = {
  "payment.succeeded": { userId: string; amount: number }
  "auth.signedOut": { userId: string }
}

export interface EventBusAdapter {
  emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): void
  on<K extends keyof AppEvents>(event: K, handler: (payload: AppEvents[K]) => void): void
}
```

- [ ] **Step 2: Écrire le bus en mémoire**

Create `base/lib/events/memory-bus.ts`:

```ts
import { EventEmitter } from "node:events"
import type { EventBusAdapter } from "@/lib/events/types"

const emitter = new EventEmitter()
emitter.setMaxListeners(50)

export const memoryBus: EventBusAdapter = {
  emit(event, payload) {
    emitter.emit(event, payload)
  },
  on(event, handler) {
    emitter.on(event, handler as (payload: unknown) => void)
  },
}
```

- [ ] **Step 3: Écrire le bus serveur avec marqueur et le bus client**

Create `base/lib/events/index.ts`:

```ts
import { memoryBus } from "@/lib/events/memory-bus"
import type { EventBusAdapter } from "@/lib/events/types"

// @adapter:eventbus start
export const eventBus: EventBusAdapter = memoryBus
// @adapter:eventbus end
```

Create `base/lib/events/client.ts`:

```ts
"use client"
import type { AppEvents, EventBusAdapter } from "@/lib/events/types"

type Handler = (payload: unknown) => void
const handlers = new Map<string, Set<Handler>>()

export const clientBus: EventBusAdapter = {
  emit(event, payload) {
    handlers.get(event)?.forEach((h) => h(payload))
  },
  on(event, handler) {
    if (!handlers.has(event)) handlers.set(event, new Set())
    handlers.get(event)!.add(handler as Handler)
  },
}
```

- [ ] **Step 4: Vérifier le typecheck**

Run: `pnpm --filter @starter/base exec tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add base/lib/events
git commit -m "feat(base): typed event bus, server and client"
```

---

## Task 5: Prise client de l'authentification

**Files:**
- Create: `base/lib/auth/client.ts`

**Interfaces:**
- Produces: `useSession`, `signIn`, `signOut` côté client, avec le marqueur `@prise:auth-client`.

- [ ] **Step 1: Écrire le bouchon client**

Create `base/lib/auth/client.ts`:

```ts
"use client"
// @prise:auth-client start
export function useSession() {
  return { data: null as null | { user: { email: string } }, isPending: false }
}
export function signIn() {
  throw new Error("Aucun module d'authentification installé")
}
export function signOut() {}
// @prise:auth-client end
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @starter/base exec tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add base/lib/auth/client.ts
git commit -m "feat(base): client auth prise stub with marker"
```

---

## Task 6: Mise en route, liste des modules, et démo

**Files:**
- Create: `base/lib/bootstrap.ts`
- Create: `base/lib/installed-modules.ts`
- Modify: `base/app/layout.tsx`
- Modify: `base/app/page.tsx`
- Create: `base/.env.example`

**Interfaces:**
- Consumes: `adapters` (Task 3).
- Produces: `bootstrapModules()`, `installedModules`, marqueurs `@modules` et `@installed`.

- [ ] **Step 1: Écrire bootstrap et la liste des modules**

Create `base/lib/bootstrap.ts`:

```ts
export function bootstrapModules(): void {
  // @modules start
  // @modules end
}
```

Create `base/lib/installed-modules.ts`:

```ts
export const installedModules: string[] = [
  // @installed start
  // @installed end
]
```

- [ ] **Step 2: Brancher bootstrap dans le layout**

Modify `base/app/layout.tsx`, appeler `bootstrapModules()` une fois au niveau module (avant le composant), en ajoutant en haut:

```ts
import { bootstrapModules } from "@/lib/bootstrap"

bootstrapModules()
```

Garder le reste du layout généré tel quel.

- [ ] **Step 3: Page de démonstration de l'état d'authentification**

Replace `base/app/page.tsx` content:

```tsx
import { adapters } from "@/lib/adapters"

export default async function Home() {
  const session = await adapters.auth.getSession()
  return (
    <main style={{ padding: 24 }}>
      <h1>Starter Kit</h1>
      <p>{session ? `Connecté, ${session.email}` : "Invité, aucun module d'authentification"}</p>
    </main>
  )
}
```

- [ ] **Step 4: Fichier d'exemple des variables**

Create `base/.env.example`:

```text
# Variables ajoutées par les modules installés
```

- [ ] **Step 5: Vérifier le build**

Run: `pnpm --filter @starter/base build`
Expected: build réussi, la page d'accueil affiche l'état invité.

- [ ] **Step 6: Commit**

```bash
git add base/lib/bootstrap.ts base/lib/installed-modules.ts base/app/layout.tsx base/app/page.tsx base/.env.example
git commit -m "feat(base): bootstrap, installed modules list, demo page"
```

---

## Task 7: Scaffold du paquet de la commande

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/tsup.config.ts`
- Create: `packages/cli/vitest.config.ts`
- Create: `packages/cli/src/index.ts`

**Interfaces:**
- Produces: le paquet `@starter/cli` buildable, binaire `my-starter`.

- [ ] **Step 1: package.json de la commande**

Create `packages/cli/package.json`:

```json
{
  "name": "@starter/cli",
  "version": "0.1.0",
  "private": true,
  "bin": { "my-starter": "./dist/index.cjs" },
  "scripts": {
    "build": "tsup",
    "test": "vitest run"
  },
  "dependencies": {
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "vitest": "^2.0.0",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: tsconfig, tsup, vitest**

Create `packages/cli/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "tests"]
}
```

Create `packages/cli/tsup.config.ts`:

```ts
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  clean: true,
})
```

Create `packages/cli/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: { include: ["tests/**/*.test.ts"] },
})
```

- [ ] **Step 3: Entrée minimale**

Create `packages/cli/src/index.ts`:

```ts
#!/usr/bin/env node
import { Command } from "commander"

const program = new Command()
program.name("my-starter").description("Starter kit module manager")
program.parse()
```

- [ ] **Step 4: Installer et builder**

Run: `pnpm install`
Run: `pnpm --filter @starter/cli build`
Expected: `packages/cli/dist/index.cjs` créé.

- [ ] **Step 5: Commit**

```bash
git add packages/cli
git commit -m "chore(cli): scaffold cli package with tsup and vitest"
```

---

## Task 8: Chirurgie de texte entre marqueurs (TDD)

**Files:**
- Create: `packages/cli/src/lib/markers.ts`
- Test: `packages/cli/tests/markers.test.ts`

**Interfaces:**
- Produces: `replaceBetweenMarkers(content, marker, value)`, `insertLineBetweenMarkers(content, marker, line)`, `removeLineBetweenMarkers(content, marker, line)`, `ensureImport(content, importLine)`, `removeImport(content, importLine)`. Toutes rendent un nouveau `string`, toutes idempotentes.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `packages/cli/tests/markers.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import {
  replaceBetweenMarkers,
  insertLineBetweenMarkers,
  removeLineBetweenMarkers,
  ensureImport,
  removeImport,
} from "../src/lib/markers"

const base = `const x = {
  // @adapter:auth start
  auth: authStub,
  // @adapter:auth end
}
`

describe("replaceBetweenMarkers", () => {
  it("remplace le contenu entre les marqueurs", () => {
    const out = replaceBetweenMarkers(base, "adapter:auth", "  auth: realAuth,")
    expect(out).toContain("auth: realAuth,")
    expect(out).not.toContain("auth: authStub,")
    expect(out).toContain("// @adapter:auth start")
    expect(out).toContain("// @adapter:auth end")
  })
})

const list = `const m = [
  // @modules start
  // @modules end
]
`

describe("insert and remove line", () => {
  it("ajoute une ligne sans doublon", () => {
    let out = insertLineBetweenMarkers(list, "modules", "  registerX()")
    out = insertLineBetweenMarkers(out, "modules", "  registerX()")
    expect(out.match(/registerX\(\)/g)!.length).toBe(1)
  })
  it("retire seulement sa ligne", () => {
    const seeded = insertLineBetweenMarkers(list, "modules", "  registerX()")
    const out = removeLineBetweenMarkers(seeded, "modules", "  registerX()")
    expect(out).not.toContain("registerX()")
    expect(out).toContain("// @modules start")
  })
})

describe("imports", () => {
  it("ajoute un import une seule fois puis le retire", () => {
    const imp = 'import { x } from "y"'
    let out = ensureImport(base, imp)
    out = ensureImport(out, imp)
    expect(out.match(/import \{ x \}/g)!.length).toBe(1)
    out = removeImport(out, imp)
    expect(out).not.toContain('import { x }')
  })
})
```

- [ ] **Step 2: Lancer les tests, vérifier l'échec**

Run: `pnpm --filter @starter/cli test`
Expected: FAIL, le module markers n'existe pas.

- [ ] **Step 3: Écrire l'implémentation minimale**

Create `packages/cli/src/lib/markers.ts`:

```ts
function bounds(content: string, marker: string) {
  const lines = content.split("\n")
  const start = lines.findIndex((l) => l.includes(`@${marker} start`))
  const end = lines.findIndex((l) => l.includes(`@${marker} end`))
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Marqueurs introuvables pour ${marker}`)
  }
  return { lines, start, end }
}

export function replaceBetweenMarkers(content: string, marker: string, value: string): string {
  const { lines, start, end } = bounds(content, marker)
  const next = [...lines.slice(0, start + 1), value, ...lines.slice(end)]
  return next.join("\n")
}

export function insertLineBetweenMarkers(content: string, marker: string, line: string): string {
  const { lines, start, end } = bounds(content, marker)
  const inside = lines.slice(start + 1, end)
  if (inside.includes(line)) return content
  const next = [...lines.slice(0, end), line, ...lines.slice(end)]
  return next.join("\n")
}

export function removeLineBetweenMarkers(content: string, marker: string, line: string): string {
  const { lines, start, end } = bounds(content, marker)
  const next = lines.filter((l, i) => !(i > start && i < end && l === line))
  return next.join("\n")
}

export function ensureImport(content: string, importLine: string): string {
  if (content.includes(importLine)) return content
  return `${importLine}\n${content}`
}

export function removeImport(content: string, importLine: string): string {
  return content
    .split("\n")
    .filter((l) => l !== importLine)
    .join("\n")
}
```

- [ ] **Step 4: Lancer les tests, vérifier le succès**

Run: `pnpm --filter @starter/cli test`
Expected: PASS, tous les tests markers verts.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/lib/markers.ts packages/cli/tests/markers.test.ts
git commit -m "feat(cli): marker text surgery with tests"
```

---

## Task 9: Patch des variables d'environnement (TDD)

**Files:**
- Create: `packages/cli/src/lib/env.ts`
- Test: `packages/cli/tests/env.test.ts`

**Interfaces:**
- Produces: `addEnvVars(content, names)`, `removeEnvVars(content, names)`, idempotentes.

- [ ] **Step 1: Écrire les tests qui échouent**

Create `packages/cli/tests/env.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { addEnvVars, removeEnvVars } from "../src/lib/env"

describe("env vars", () => {
  it("ajoute sans doublon", () => {
    let out = addEnvVars("# header\n", ["A", "B"])
    out = addEnvVars(out, ["A"])
    expect(out.match(/^A=/gm)!.length).toBe(1)
    expect(out).toContain("B=")
  })
  it("retire les variables", () => {
    const seeded = addEnvVars("# header\n", ["A", "B"])
    const out = removeEnvVars(seeded, ["A"])
    expect(out).not.toMatch(/^A=/m)
    expect(out).toMatch(/^B=/m)
  })
})
```

- [ ] **Step 2: Lancer les tests, vérifier l'échec**

Run: `pnpm --filter @starter/cli test env`
Expected: FAIL, module env introuvable.

- [ ] **Step 3: Écrire l'implémentation**

Create `packages/cli/src/lib/env.ts`:

```ts
export function addEnvVars(content: string, names: string[]): string {
  let out = content.endsWith("\n") ? content : content + "\n"
  for (const name of names) {
    const re = new RegExp(`^${name}=`, "m")
    if (!re.test(out)) out += `${name}=\n`
  }
  return out
}

export function removeEnvVars(content: string, names: string[]): string {
  return content
    .split("\n")
    .filter((l) => !names.some((n) => l.startsWith(`${n}=`)))
    .join("\n")
}
```

- [ ] **Step 4: Lancer les tests, vérifier le succès**

Run: `pnpm --filter @starter/cli test env`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/lib/env.ts packages/cli/tests/env.test.ts
git commit -m "feat(cli): env var patching with tests"
```

---

## Task 10: Lecture de fiche et types

**Files:**
- Create: `packages/cli/src/lib/manifest.ts`

**Interfaces:**
- Consumes: rien.
- Produces: type `ModuleManifest`, type `Branchement`, fonction `readManifest(moduleDir): ModuleManifest`.

- [ ] **Step 1: Écrire les types et le lecteur**

Create `packages/cli/src/lib/manifest.ts`:

```ts
import { readFileSync } from "node:fs"
import { join } from "node:path"

export interface Branchement {
  fichier: string
  marqueur: string
  type: "remplacement" | "ligne"
  import?: string
  valeurInstallee: string
  valeurParDefaut?: string
}

export interface ModuleManifest {
  name: string
  remplitLesPrises: string[]
  besoinDesPrises: string[]
  deps: string[]
  devDeps?: string[]
  env: string[]
  files: string[]
  branchements: Branchement[]
}

export function readManifest(moduleDir: string): ModuleManifest {
  const raw = readFileSync(join(moduleDir, "module.json"), "utf8")
  const m = JSON.parse(raw) as ModuleManifest
  if (!m.name || !Array.isArray(m.remplitLesPrises)) {
    throw new Error(`Fiche invalide dans ${moduleDir}`)
  }
  return m
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @starter/cli exec tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/lib/manifest.ts
git commit -m "feat(cli): module manifest types and reader"
```

---

## Task 11: Opérations fichiers, dépendances, et état installé

**Files:**
- Create: `packages/cli/src/lib/fs-ops.ts`
- Create: `packages/cli/src/lib/deps.ts`
- Create: `packages/cli/src/lib/project.ts`

**Interfaces:**
- Produces: `copyModuleFiles(moduleDir, files, projectDir)`, `removeModuleFiles(files, projectDir)`, `installDeps(deps, projectDir)`, `removeDeps(deps, projectDir)`, `installedModuleNames(projectDir): string[]`, `filledPrises(projectDir, modulesRoot): string[]`.

- [ ] **Step 1: Opérations fichiers**

Create `packages/cli/src/lib/fs-ops.ts`:

```ts
import { cpSync, rmSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"

export function copyModuleFiles(moduleDir: string, files: string[], projectDir: string): void {
  for (const file of files) {
    const from = join(moduleDir, "files", file)
    const to = join(projectDir, file)
    mkdirSync(dirname(to), { recursive: true })
    cpSync(from, to, { recursive: true })
  }
}

export function removeModuleFiles(files: string[], projectDir: string): void {
  for (const file of files) {
    rmSync(join(projectDir, file), { force: true, recursive: true })
  }
}
```

- [ ] **Step 2: Dépendances via pnpm**

Create `packages/cli/src/lib/deps.ts`:

```ts
import { execSync } from "node:child_process"

export function installDeps(deps: string[], projectDir: string): void {
  if (deps.length === 0) return
  execSync(`pnpm add ${deps.join(" ")}`, { cwd: projectDir, stdio: "inherit" })
}

export function removeDeps(deps: string[], projectDir: string): void {
  if (deps.length === 0) return
  execSync(`pnpm remove ${deps.join(" ")}`, { cwd: projectDir, stdio: "inherit" })
}
```

- [ ] **Step 3: Lecture de l'état installé et des prises remplies**

Create `packages/cli/src/lib/project.ts`:

```ts
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { readManifest } from "./manifest"

export function installedModuleNames(projectDir: string): string[] {
  const content = readFileSync(join(projectDir, "lib/installed-modules.ts"), "utf8")
  const matches = content.match(/"([^"]+)"/g) ?? []
  return matches.map((m) => m.replace(/"/g, ""))
}

export function filledPrises(projectDir: string, modulesRoot: string): string[] {
  const names = installedModuleNames(projectDir)
  return names.flatMap((n) => readManifest(join(modulesRoot, n)).remplitLesPrises)
}
```

Note. Dans le paquet cli, on utilise des imports relatifs entre modules internes (par exemple `./manifest`), pas d'alias, pour que tsup résolve sans configuration supplémentaire.

- [ ] **Step 4: Vérifier le typecheck**

Run: `pnpm --filter @starter/cli exec tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/lib/fs-ops.ts packages/cli/src/lib/deps.ts packages/cli/src/lib/project.ts
git commit -m "feat(cli): file, deps, and installed-state helpers"
```

---

## Task 12: Commande add

**Files:**
- Create: `packages/cli/src/commands/add.ts`
- Modify: `packages/cli/src/index.ts`

**Interfaces:**
- Consumes: markers, env, manifest, fs-ops, deps, project (Tasks 8 à 11).
- Produces: `addModule(name, projectDir, modulesRoot)`.

- [ ] **Step 1: Écrire l'orchestration add**

Create `packages/cli/src/commands/add.ts`:

```ts
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { readManifest } from "../lib/manifest"
import { replaceBetweenMarkers, insertLineBetweenMarkers, ensureImport } from "../lib/markers"
import { addEnvVars } from "../lib/env"
import { copyModuleFiles } from "../lib/fs-ops"
import { installDeps } from "../lib/deps"
import { filledPrises, installedModuleNames } from "../lib/project"

export function addModule(
  name: string,
  projectDir: string,
  modulesRoot: string,
  options: { skipDeps?: boolean } = {},
): void {
  const moduleDir = join(modulesRoot, name)
  const m = readManifest(moduleDir)
  const filled = filledPrises(projectDir, modulesRoot)

  for (const need of m.besoinDesPrises) {
    if (!filled.includes(need)) {
      throw new Error(`Installe d'abord un module pour la prise ${need}`)
    }
  }
  for (const slot of m.remplitLesPrises) {
    if (filled.includes(slot)) {
      throw new Error(`La prise ${slot} est déjà occupée. Retire l'autre module d'abord.`)
    }
  }

  copyModuleFiles(moduleDir, m.files, projectDir)

  for (const b of m.branchements) {
    const path = join(projectDir, b.fichier)
    let content = readFileSync(path, "utf8")
    if (b.import) content = ensureImport(content, b.import)
    if (b.type === "remplacement") {
      content = replaceBetweenMarkers(content, b.marqueur, b.valeurInstallee)
    } else {
      content = insertLineBetweenMarkers(content, b.marqueur, b.valeurInstallee)
    }
    writeFileSync(path, content)
  }

  const envPath = join(projectDir, ".env.example")
  writeFileSync(envPath, addEnvVars(readFileSync(envPath, "utf8"), m.env))

  const listPath = join(projectDir, "lib/installed-modules.ts")
  if (!installedModuleNames(projectDir).includes(name)) {
    writeFileSync(
      listPath,
      insertLineBetweenMarkers(readFileSync(listPath, "utf8"), "installed", `  "${name}",`),
    )
  }

  if (!options.skipDeps) installDeps(m.deps, projectDir)
}
```

- [ ] **Step 2: Brancher la commande add dans le binaire**

Modify `packages/cli/src/index.ts`:

```ts
#!/usr/bin/env node
import { Command } from "commander"
import { join } from "node:path"
import { addModule } from "./commands/add"

const program = new Command()
program.name("my-starter").description("Starter kit module manager")

program
  .command("add <module>")
  .description("Ajoute un module")
  .action((module: string) => {
    const projectDir = process.cwd()
    const modulesRoot = join(__dirname, "..", "..", "..", "modules")
    addModule(module, projectDir, modulesRoot)
    console.log(`Module ${module} ajouté.`)
  })

program.parse()
```

- [ ] **Step 3: Builder**

Run: `pnpm --filter @starter/cli build`
Expected: build réussi.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/commands/add.ts packages/cli/src/index.ts
git commit -m "feat(cli): add command orchestration"
```

---

## Task 13: Commande remove

**Files:**
- Create: `packages/cli/src/commands/remove.ts`
- Modify: `packages/cli/src/index.ts`

**Interfaces:**
- Consumes: markers, env, manifest, fs-ops, deps, project.
- Produces: `removeModule(name, projectDir, modulesRoot)`.

- [ ] **Step 1: Écrire l'orchestration remove**

Create `packages/cli/src/commands/remove.ts`:

```ts
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { readManifest } from "../lib/manifest"
import {
  replaceBetweenMarkers,
  removeLineBetweenMarkers,
  removeImport,
} from "../lib/markers"
import { removeEnvVars } from "../lib/env"
import { removeModuleFiles } from "../lib/fs-ops"
import { removeDeps } from "../lib/deps"
import { installedModuleNames } from "../lib/project"

export function removeModule(
  name: string,
  projectDir: string,
  modulesRoot: string,
  options: { skipDeps?: boolean } = {},
): void {
  const m = readManifest(join(modulesRoot, name))

  const others = installedModuleNames(projectDir).filter((n) => n !== name)
  const stillNeeded = others.flatMap((n) => readManifest(join(modulesRoot, n)).besoinDesPrises)
  for (const slot of m.remplitLesPrises) {
    if (stillNeeded.includes(slot)) {
      throw new Error(`Impossible, un autre module a encore besoin de la prise ${slot}.`)
    }
  }

  for (const b of m.branchements) {
    const path = join(projectDir, b.fichier)
    let content = readFileSync(path, "utf8")
    if (b.type === "remplacement") {
      content = replaceBetweenMarkers(content, b.marqueur, b.valeurParDefaut ?? "")
    } else {
      content = removeLineBetweenMarkers(content, b.marqueur, b.valeurInstallee)
    }
    if (b.import) content = removeImport(content, b.import)
    writeFileSync(path, content)
  }

  const envPath = join(projectDir, ".env.example")
  writeFileSync(envPath, removeEnvVars(readFileSync(envPath, "utf8"), m.env))

  const listPath = join(projectDir, "lib/installed-modules.ts")
  writeFileSync(
    listPath,
    removeLineBetweenMarkers(readFileSync(listPath, "utf8"), "installed", `  "${name}",`),
  )

  removeModuleFiles(m.files, projectDir)
  if (!options.skipDeps) removeDeps(m.deps, projectDir)
}
```

- [ ] **Step 2: Brancher la commande remove**

Modify `packages/cli/src/index.ts`, ajouter avant `program.parse()`:

```ts
import { removeModule } from "./commands/remove"

program
  .command("remove <module>")
  .description("Retire un module")
  .action((module: string) => {
    const projectDir = process.cwd()
    const modulesRoot = join(__dirname, "..", "..", "..", "modules")
    removeModule(module, projectDir, modulesRoot)
    console.log(`Module ${module} retiré.`)
  })
```

- [ ] **Step 3: Builder**

Run: `pnpm --filter @starter/cli build`
Expected: build réussi.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/src/commands/remove.ts packages/cli/src/index.ts
git commit -m "feat(cli): remove command orchestration"
```

---

## Task 14: Module database, Prisma avec Supabase

**Files:**
- Create: `modules/database/module.json`
- Create: `modules/database/files/lib/database/client.ts`
- Create: `modules/database/files/prisma/schema.prisma`

**Interfaces:**
- Consumes: la prise `database` du registre de base.
- Produces: branchement qui remplace `databaseStub` par le client Prisma.

- [ ] **Step 1: Le client de base de données**

Create `modules/database/files/lib/database/client.ts`:

```ts
import { PrismaClient } from "@prisma/client"
import type { DatabaseAdapter } from "@/lib/adapters/types"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const prismaDatabaseAdapter: DatabaseAdapter = {
  isReady() {
    return true
  },
}
```

- [ ] **Step 2: Le schéma Prisma minimal**

Create `modules/database/files/prisma/schema.prisma`:

```text
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- [ ] **Step 3: La fiche du module**

Create `modules/database/module.json`:

```json
{
  "name": "database",
  "remplitLesPrises": ["database"],
  "besoinDesPrises": [],
  "deps": ["@prisma/client"],
  "devDeps": ["prisma"],
  "env": ["DATABASE_URL", "DIRECT_URL"],
  "files": ["lib/database/client.ts", "prisma/schema.prisma"],
  "branchements": [
    {
      "fichier": "lib/adapters/index.ts",
      "marqueur": "adapter:database",
      "type": "remplacement",
      "import": "import { prismaDatabaseAdapter } from \"@/lib/database/client\"",
      "valeurInstallee": "  database: prismaDatabaseAdapter,",
      "valeurParDefaut": "  database: databaseStub,"
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add modules/database
git commit -m "feat(modules): database module, prisma with supabase"
```

---

## Task 15: Module auth-better-auth

**Files:**
- Create: `modules/auth-better-auth/module.json`
- Create: `modules/auth-better-auth/files/lib/auth/server.ts`
- Create: `modules/auth-better-auth/files/app/api/auth/[...all]/route.ts`

**Interfaces:**
- Consumes: les prises `auth` et `auth-client`, et la prise `database` (dépendance déclarée).
- Produces: branchements serveur et client pour better-auth.

- [ ] **Step 1: L'adaptateur serveur**

Create `modules/auth-better-auth/files/lib/auth/server.ts`:

```ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/database/client"
import type { AuthAdapter } from "@/lib/adapters/types"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
})

export const betterAuthAdapter: AuthAdapter = {
  async getSession() {
    const result = await auth.api.getSession({ headers: new Headers() })
    if (!result?.session) return null
    return { userId: result.user.id, email: result.user.email }
  },
  async signOut() {},
}
```

- [ ] **Step 2: La route d'authentification**

Create `modules/auth-better-auth/files/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth/server"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

- [ ] **Step 3: La fiche du module**

Create `modules/auth-better-auth/module.json`:

```json
{
  "name": "auth-better-auth",
  "remplitLesPrises": ["auth", "auth-client"],
  "besoinDesPrises": ["database"],
  "deps": ["better-auth"],
  "env": ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"],
  "files": ["lib/auth/server.ts", "app/api/auth/[...all]/route.ts"],
  "branchements": [
    {
      "fichier": "lib/adapters/index.ts",
      "marqueur": "adapter:auth",
      "type": "remplacement",
      "import": "import { betterAuthAdapter } from \"@/lib/auth/server\"",
      "valeurInstallee": "  auth: betterAuthAdapter,",
      "valeurParDefaut": "  auth: authStub,"
    },
    {
      "fichier": "lib/auth/client.ts",
      "marqueur": "prise:auth-client",
      "type": "remplacement",
      "import": "import { createAuthClient } from \"better-auth/react\"",
      "valeurInstallee": "export const { useSession, signIn, signOut } = createAuthClient()",
      "valeurParDefaut": "export function useSession() { return { data: null as null | { user: { email: string } }, isPending: false } }\nexport function signIn() { throw new Error(\"Aucun module d'authentification installé\") }\nexport function signOut() {}"
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add modules/auth-better-auth
git commit -m "feat(modules): auth-better-auth module, server and client prises"
```

---

## Task 16: Vérification de bout en bout

**Files:**
- Create: `packages/cli/tests/e2e.test.ts`

**Interfaces:**
- Consumes: la commande complète, la base, les deux modules.

- [ ] **Step 1: Écrire le test de bout en bout**

Create `packages/cli/tests/e2e.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest"
import { execSync } from "node:child_process"
import { cpSync, mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const repoRoot = join(__dirname, "..", "..", "..")
const modulesRoot = join(repoRoot, "modules")

let tmp: string

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "ms-"))
  cpSync(join(repoRoot, "base"), tmp, {
    recursive: true,
    filter: (src) => !src.includes("node_modules") && !src.includes(".next"),
  })
})

describe("flux add et remove", () => {
  it("refuse auth sans database", async () => {
    const { addModule } = await import("../src/commands/add")
    expect(() => addModule("auth-better-auth", tmp, modulesRoot, { skipDeps: true })).toThrow(/database/)
  })

  it("installe database puis auth, puis vérifie le registre", async () => {
    const { addModule } = await import("../src/commands/add")
    addModule("database", tmp, modulesRoot, { skipDeps: true })
    addModule("auth-better-auth", tmp, modulesRoot, { skipDeps: true })
    const registry = readFileSync(join(tmp, "lib/adapters/index.ts"), "utf8")
    expect(registry).toContain("betterAuthAdapter")
    expect(registry).toContain("prismaDatabaseAdapter")
    const list = readFileSync(join(tmp, "lib/installed-modules.ts"), "utf8")
    expect(list).toContain('"database"')
    expect(list).toContain('"auth-better-auth"')
  })

  it("retire auth puis database, et retrouve les bouchons", async () => {
    const { removeModule } = await import("../src/commands/remove")
    removeModule("auth-better-auth", tmp, modulesRoot, { skipDeps: true })
    removeModule("database", tmp, modulesRoot, { skipDeps: true })
    const registry = readFileSync(join(tmp, "lib/adapters/index.ts"), "utf8")
    expect(registry).toContain("auth: authStub,")
    expect(registry).toContain("database: databaseStub,")
  })
})
```

Note. Le test e2e passe `{ skipDeps: true }`, ajouté aux signatures dès les tâches 12 et 13. Il n'installe donc pas les dépendances et ne fait aucun appel réseau. Il vérifie le câblage, les marqueurs, la vérification de dépendance et le retrait propre.

- [ ] **Step 2: Lancer les tests, vérifier l'échec**

Run: `pnpm --filter @starter/cli test e2e`
Expected: FAIL tant que les modules ou les commandes ne sont pas complets, puis PASS une fois tout en place.

- [ ] **Step 3: Lancer toute la suite**

Run: `pnpm --filter @starter/cli test`
Expected: PASS, markers, env, e2e tous verts.

- [ ] **Step 4: Vérification manuelle du build avec modules**

```bash
cd /tmp && rm -rf ms-manual && cp -R <repoRoot>/base ms-manual
cd ms-manual && pnpm install
node <repoRoot>/packages/cli/dist/index.cjs add database
node <repoRoot>/packages/cli/dist/index.cjs add auth-better-auth
pnpm exec tsc --noEmit
```

Expected: typecheck réussi avec les deux modules branchés. Une connexion Supabase réelle nécessite DATABASE_URL et DIRECT_URL dans .env, hors de ce test automatique.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/tests/e2e.test.ts packages/cli/src/commands/add.ts packages/cli/src/commands/remove.ts
git commit -m "test(cli): end-to-end add and remove verification"
```

---

## Notes d'exécution

- Le test e2e prouve le câblage, les marqueurs, la vérification de dépendance et le retrait propre, sans réseau.
- La preuve du vrai login better-auth contre Supabase dépend des variables fournies par l'utilisateur dans base/.env, et n'est pas automatisée ici.
- Après ce plan, les modules suivants (auth Firebase, paiement Stripe, notifications, statistiques) suivront le même gabarit, une fiche module.json plus des fichiers, sans toucher au squelette.
