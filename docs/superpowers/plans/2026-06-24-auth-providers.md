# Auth Providers (Google / LinkedIn / email-password) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add login and signup via Google, LinkedIn and email/password to the starter, with the UI in `base/` and the real behaviour in the `auth-better-auth` module.

**Architecture:** The `AuthClient` interface in `base/lib/auth/types.ts` is the single contract. The login/signup pages in `base/app` depend only on it. Two implementations satisfy it: the stub (`base/lib/auth/client-stub.ts`, ships in base, throws when no auth module is installed) and the module adapter (`modules/auth-better-auth/files/lib/auth/client-adapter.ts`, injected on install, backed by better-auth). The module server enables the providers.

**Tech Stack:** Next.js 16.2.9 (App Router), React client components, better-auth (module dep), TypeScript, vitest (CLI tests).

## Global Constraints

- Next.js 16.2.9: pages are `export default function Page()`; `"use client"` must sit above all imports; `useRouter` is imported from `next/navigation` (never `next/router`).
- better-auth is NOT installed in `base/` — it is a dependency of the `auth-better-auth` module, available only once the module is installed. Module-source files typecheck only in an installed project.
- Communication/comment style in this repo: French, plain text, no decorative symbols.
- Provider set is exactly `google` and `linkedin`. GitHub is removed.
- The UI must depend only on the `AuthClient` interface, never import better-auth directly.
- Adapter methods normalise better-auth errors to thrown exceptions so the UI has one uniform error path (try/catch).

## Prerequisites (read before starting)

The current working tree `base/` is in a dirty "installed" state (auth + database wired as installed, extra injected files present). Verification steps below assume a **pristine base**. Before starting, reset `base/` to its pristine committed state for the four wired files (`lib/adapters/index.ts`, `lib/auth/client.ts` → stub, no injected `lib/auth/server.ts` / `client-adapter.ts` / `lib/database/client.ts` / `app/api/auth/...`). The CLI e2e tests build their own clean temp project, so they are unaffected by the dirty tree.

Module-source typecheck (Tasks 2-3) is verified inside a scratch project where the module is installed (`pnpm starter add database-supabase && pnpm starter add auth-better-auth`, deps installed, `pnpm prisma generate`). Base typecheck (Tasks 1, 5, 6) runs against the pristine base and does not need better-auth or prisma.

---

### Task 1: Extend the AuthClient contract and stub

The interface is the test: changing it makes the stub fail to compile until it implements the new shape. `tsc` is the red→green gate.

**Files:**
- Modify: `base/lib/auth/types.ts`
- Modify: `base/lib/auth/client-stub.ts`

**Interfaces:**
- Produces: `SocialProvider = "google" | "linkedin"`; `Credentials = { email: string; password: string }`; `SignUpInput = Credentials & { name: string }`; `AuthClient.signInSocial(provider: SocialProvider): Promise<unknown>`; `AuthClient.signInEmail(input: Credentials): Promise<unknown>`; `AuthClient.signUpEmail(input: SignUpInput): Promise<unknown>`; `AuthClient.signOut(): void | Promise<unknown>`; `AuthClient.useSession(): AuthSession`. The old `signIn()` is removed.

- [ ] **Step 1: Rewrite the contract** in `base/lib/auth/types.ts`

```ts
export interface AuthSession {
  data: { user: { email: string } } | null
  isPending: boolean
}

export type SocialProvider = "google" | "linkedin"

export interface Credentials {
  email: string
  password: string
}

export interface SignUpInput extends Credentials {
  name: string
}

/**
 * Contrat de la prise auth cote navigateur.
 * Le bouchon (client-stub) et chaque adaptateur de fournisseur (client-adapter)
 * doivent le respecter, pour que l'application voie toujours la meme forme.
 */
export interface AuthClient {
  useSession(): AuthSession
  signInSocial(provider: SocialProvider): Promise<unknown>
  signInEmail(input: Credentials): Promise<unknown>
  signUpEmail(input: SignUpInput): Promise<unknown>
  signOut(): void | Promise<unknown>
}
```

- [ ] **Step 2: Run typecheck to verify the stub now fails**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: FAIL — `client-stub.ts` does not satisfy `AuthClient` (missing `signInSocial`, `signInEmail`, `signUpEmail`; stale `signIn`).

- [ ] **Step 3: Rewrite the stub** in `base/lib/auth/client-stub.ts`

```ts
"use client"
import type { AuthClient } from "@/lib/auth/types"

const notInstalled = () => {
  throw new Error("Aucun module d'authentification installé")
}

export const useSession: AuthClient["useSession"] = () => {
  return { data: null, isPending: false }
}
export const signInSocial: AuthClient["signInSocial"] = async () => notInstalled()
export const signInEmail: AuthClient["signInEmail"] = async () => notInstalled()
export const signUpEmail: AuthClient["signUpEmail"] = async () => notInstalled()
export const signOut: AuthClient["signOut"] = () => {}
```

- [ ] **Step 4: Run typecheck to verify base passes**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: PASS (pristine base, no better-auth/prisma needed by these files).

- [ ] **Step 5: Commit**

```bash
git add base/lib/auth/types.ts base/lib/auth/client-stub.ts
git commit -m "feat(auth): extend AuthClient contract for social + email/password"
```

---

### Task 2: Enable Google and LinkedIn on the module server

**Files:**
- Modify: `modules/auth-better-auth/files/lib/auth/server.ts`

**Interfaces:**
- Consumes: env vars `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.
- Produces: unchanged exports `auth`, `betterAuthAdapter`.

- [ ] **Step 1: Verify better-auth provider API** before editing

Run: `cat node_modules/better-auth/dist/social-providers/*.d.ts 2>/dev/null | grep -iA3 "linkedin\|google" | head -40` inside a project where the module is installed.
Expected: confirm `socialProviders.google` and `socialProviders.linkedin` each take `{ clientId, clientSecret }`. If the option names differ in this version, adapt the code below to match the docs.

- [ ] **Step 2: Add `socialProviders`** to `modules/auth-better-auth/files/lib/auth/server.ts`

```ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/database/client"
import type { AuthAdapter } from "@/lib/adapters/types"
import { headers } from "next/headers"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    },
  },
})

export const betterAuthAdapter: AuthAdapter = {
  async getSession() {
    const result = await auth.api.getSession({ headers: await headers() })
    if (!result?.session) return null
    return { userId: result.user.id, email: result.user.email }
  },
  async signOut() {},
}
```

- [ ] **Step 3: Typecheck in an installed scratch project**

Run (in a scratch project with database + auth installed and deps installed): `pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add modules/auth-better-auth/files/lib/auth/server.ts
git commit -m "feat(auth): enable Google and LinkedIn social providers on server"
```

---

### Task 3: Implement the new contract in the module adapter

**Files:**
- Modify: `modules/auth-better-auth/files/lib/auth/client-adapter.ts`

**Interfaces:**
- Consumes: `AuthClient`, `Credentials`, `SignUpInput`, `SocialProvider` from `@/lib/auth/types` (Task 1).
- Produces: named exports `useSession`, `signInSocial`, `signInEmail`, `signUpEmail`, `signOut` satisfying `AuthClient`.

- [ ] **Step 1: Rewrite the adapter** in `modules/auth-better-auth/files/lib/auth/client-adapter.ts`

```ts
"use client"
import { createAuthClient } from "better-auth/react"
import type { AuthClient } from "@/lib/auth/types"

const authClient = createAuthClient()

// Adapter : on traduit NOTRE contrat vers la forme de better-auth, et on
// normalise les erreurs en exceptions pour que l'UI ait un seul chemin d'erreur.
export const useSession: AuthClient["useSession"] = () => {
  const session = authClient.useSession()
  return {
    data: session.data ? { user: { email: session.data.user.email } } : null,
    isPending: session.isPending,
  }
}

export const signInSocial: AuthClient["signInSocial"] = async (provider) => {
  const { error } = await authClient.signIn.social({ provider, callbackURL: "/" })
  if (error) throw new Error(error.message ?? "Échec de la connexion")
}

export const signInEmail: AuthClient["signInEmail"] = async ({ email, password }) => {
  const { error } = await authClient.signIn.email({ email, password })
  if (error) throw new Error(error.message ?? "Identifiants invalides")
}

export const signUpEmail: AuthClient["signUpEmail"] = async ({ email, password, name }) => {
  const { error } = await authClient.signUp.email({ email, password, name })
  if (error) throw new Error(error.message ?? "Inscription impossible")
}

export const signOut: AuthClient["signOut"] = () => {
  return authClient.signOut()
}
```

- [ ] **Step 2: Typecheck in an installed scratch project**

Run (scratch project, module installed, deps installed): `pnpm exec tsc --noEmit`
Expected: PASS. If better-auth's `signIn.social` rejects the `provider` string type, narrow with `provider as "google" | "linkedin"` per the installed types.

- [ ] **Step 3: Commit**

```bash
git add modules/auth-better-auth/files/lib/auth/client-adapter.ts
git commit -m "feat(auth): implement social + email/password in client adapter"
```

---

### Task 4: Add provider env vars to the manifest (TDD via e2e)

**Files:**
- Modify: `packages/cli/tests/e2e.test.ts`
- Modify: `modules/auth-better-auth/module.json`

**Interfaces:**
- Consumes: existing `addModule` / `removeModule` and the e2e harness (`tmp`, `modulesRoot`, `SNAPSHOT_FILES` incl. `.env.example`).
- Produces: `module.json` `env` array containing the four provider vars.

- [ ] **Step 1: Add a failing assertion** to the "installe database puis auth" test in `packages/cli/tests/e2e.test.ts`, right after the auth `addModule` call and the existing registry assertions:

```ts
const envAfter = readFileSync(join(tmp, ".env.example"), "utf8")
expect(envAfter).toContain("GOOGLE_CLIENT_ID")
expect(envAfter).toContain("GOOGLE_CLIENT_SECRET")
expect(envAfter).toContain("LINKEDIN_CLIENT_ID")
expect(envAfter).toContain("LINKEDIN_CLIENT_SECRET")
```

- [ ] **Step 2: Run the e2e test to verify it fails**

Run: `cd packages/cli && pnpm exec vitest run tests/e2e.test.ts`
Expected: FAIL — `.env.example` does not contain `GOOGLE_CLIENT_ID`.

- [ ] **Step 3: Add the env vars** to `modules/auth-better-auth/module.json` (replace the `env` line):

```json
  "env": ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
```

- [ ] **Step 4: Run the full CLI suite**

Run: `cd packages/cli && pnpm exec vitest run`
Expected: PASS (15+ tests, including the new assertion and the byte-for-byte `.env.example` round-trip on remove).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/tests/e2e.test.ts modules/auth-better-auth/module.json
git commit -m "feat(auth): add Google/LinkedIn env vars to module manifest"
```

---

### Task 5: Login page

**Files:**
- Create: `base/app/login/page.tsx`

**Interfaces:**
- Consumes: `signInEmail`, `signInSocial` from `@/lib/auth/client` (the interface re-export, Task 1); `useRouter` from `next/navigation`.

- [ ] **Step 1: Create** `base/app/login/page.tsx`

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInEmail, signInSocial } from "@/lib/auth/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signInEmail({ email, password })
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
      <h1>Connexion</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
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
        <button type="submit">Se connecter</button>
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
        <a href="/signup">Créer un compte</a>
      </p>
    </main>
  )
}
```

- [ ] **Step 2: Typecheck base**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add base/app/login/page.tsx
git commit -m "feat(auth): add login page"
```

---

### Task 6: Signup page

**Files:**
- Create: `base/app/signup/page.tsx`

**Interfaces:**
- Consumes: `signUpEmail`, `signInSocial` from `@/lib/auth/client`; `useRouter` from `next/navigation`.

- [ ] **Step 1: Create** `base/app/signup/page.tsx`

```tsx
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
```

- [ ] **Step 2: Typecheck base**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add base/app/signup/page.tsx
git commit -m "feat(auth): add signup page"
```

---

### Task 7: Link the pages from the home page

**Files:**
- Modify: `base/app/page.tsx`

**Interfaces:**
- Consumes: nothing new. Adds plain `<a>` links so the pages are reachable.

- [ ] **Step 1: Add navigation links** to `base/app/page.tsx`

```tsx
import { adapters } from "@/lib/adapters"

export default async function Home() {
  const session = await adapters.auth.getSession()
  return (
    <main style={{ padding: 24 }}>
      <h1>Starter Kit</h1>
      <p>{session ? `Connecté, ${session.email}` : "Invité, aucun module d'authentification"}</p>
      {!session && (
        <p style={{ display: "flex", gap: 12 }}>
          <a href="/login">Connexion</a>
          <a href="/signup">Inscription</a>
        </p>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Typecheck base**

Run: `cd base && pnpm exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add base/app/page.tsx
git commit -m "feat(auth): link login and signup from home"
```

---

## Final verification

- [ ] `cd packages/cli && pnpm exec vitest run` — all CLI tests green (env round-trip incl. new vars).
- [ ] `cd base && pnpm exec tsc --noEmit` — pristine base typechecks (contract, stub, pages).
- [ ] In a scratch project: `pnpm starter add database-supabase && pnpm starter add auth-better-auth`, install deps, `pnpm prisma generate`, `pnpm exec tsc --noEmit` — module source typechecks with better-auth present.
- [ ] Manual smoke (optional, needs real OAuth keys): visit `/login` and `/signup`; with no auth module installed the stub error appears; with the module installed and keys set, the flows reach the provider / create a session.

## Spec coverage check

- Contract (flat typed methods, `SocialProvider`) → Task 1.
- Stub implementation → Task 1.
- Module adapter (social + email/password, error normalisation) → Task 3.
- Server providers (Google, LinkedIn) → Task 2.
- UI in base (`/login`, `/signup`) → Tasks 5, 6 (reachability: Task 7).
- Env vars in manifest → Task 4.
- Tests (CLI e2e env round-trip, typecheck) → Tasks 4 and final verification.
- GitHub removed → Tasks 1 and 3 (no `signIn()`, no github provider).
