# Auth : connexion / inscription Google, LinkedIn et email/password

Date : 2026-06-24
Statut : design approuvé, prêt pour plan d'implémentation

## Objectif

Permettre la connexion et l'inscription via trois moyens : Google, LinkedIn et
email/mot de passe. Le tout en respectant le système de modules du starter :
l'UI vit dans la base, le comportement réel est fourni par le module
`auth-better-auth`, et un stub sert d'état « non installé ».

## Contexte actuel

- `modules/auth-better-auth/files/lib/auth/server.ts` : better-auth avec
  `emailAndPassword` activé, aucun `socialProviders`.
- `modules/auth-better-auth/files/lib/auth/client-adapter.ts` : `signIn()` figé
  sur GitHub (`signIn.social({ provider: "github" })`).
- `base/lib/auth/types.ts` : interface `AuthClient` avec `useSession`, `signIn()`
  (sans paramètre), `signOut`.
- `base/lib/auth/client-stub.ts` : implémentation « éteinte » du contrat.
- Aucune page de connexion / inscription n'existe dans `base/app`.

## Décisions de cadrage

1. On étend le vrai module `auth-better-auth` (pas une démo mockée).
2. Les pages login/signup vivent dans `base/` et appellent l'interface
   `AuthClient`. En base vierge, le stub lève une erreur claire.
3. Le contrat utilise des méthodes plates fortement typées.
4. GitHub est retiré au profit de Google + LinkedIn.
5. UI volontairement sobre (simulation, pas de design poussé).

## Architecture

Trois couches, déjà en place dans le projet :

- Contrat : `base/lib/auth/types.ts` (l'interface, toujours présente).
- Implémentation « éteinte » : `base/lib/auth/client-stub.ts` (toujours en base).
- Implémentation réelle : `modules/.../client-adapter.ts` + `server.ts`
  (injectés par le module à l'installation).

L'UI ne dépend que du contrat. Elle ignore quelle implémentation est branchée.

## Contrat (`base/lib/auth/types.ts`)

```ts
export type SocialProvider = "google" | "linkedin"

export interface Credentials {
  email: string
  password: string
}

export interface SignUpInput extends Credentials {
  name: string
}

export interface AuthClient {
  useSession(): AuthSession
  signInSocial(provider: SocialProvider): Promise<unknown>
  signInEmail(input: Credentials): Promise<unknown>
  signUpEmail(input: SignUpInput): Promise<unknown>
  signOut(): void | Promise<unknown>
}
```

`AuthSession` reste inchangé. L'ancienne méthode `signIn()` disparaît.

## Implémentations

### Stub (`base/lib/auth/client-stub.ts`)

- `useSession` : renvoie `{ data: null, isPending: false }`.
- `signInSocial`, `signInEmail`, `signUpEmail` : lèvent
  `Error("Aucun module d'authentification installé")`.
- `signOut` : no-op.

### Adaptateur module (`modules/.../client-adapter.ts`)

Traduit le contrat vers better-auth :

- `signInSocial(provider)` -> `authClient.signIn.social({ provider, callbackURL: "/" })`
- `signInEmail({ email, password })` -> `authClient.signIn.email({ email, password })`
- `signUpEmail({ email, password, name })` -> `authClient.signUp.email({ email, password, name })`
- `useSession`, `signOut` : inchangés dans l'esprit actuel.

### Serveur (`modules/.../server.ts`)

- `emailAndPassword: { enabled: true }` (conservé).
- Ajout de `socialProviders` :

```ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  },
}
```

Vérifier l'API exacte de better-auth pour `linkedin` dans
`node_modules/better-auth` avant d'écrire le code (cf. AGENTS.md).

## UI (`base/app`)

Deux routes, sobres :

- `app/login/page.tsx` : formulaire email + mot de passe (-> `signInEmail`),
  plus deux boutons « Continuer avec Google » / « Continuer avec LinkedIn »
  (-> `signInSocial`).
- `app/signup/page.tsx` : nom + email + mot de passe (-> `signUpEmail`),
  mêmes deux boutons sociaux.

Composants client (`"use client"`), gestion d'erreur locale : si la promesse
échoue (y compris l'erreur du stub), afficher le message à l'utilisateur.

Les boutons sociaux sont identiques sur les deux pages : OAuth crée le compte
si besoin.

## Manifeste (`module.json`)

- `env` : ajouter `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.
- `files` : inchangé (l'UI vit en base, pas dans le module).
- `wiring` : inchangé.

## Flux de données

- Social : bouton -> `signInSocial("google")` -> adaptateur ->
  `authClient.signIn.social` -> redirection fournisseur ->
  `/api/auth/[...all]` (route du module) -> session.
- Inscription email : formulaire -> `signUpEmail` -> `authClient.signUp.email`
  -> session.
- Connexion email : formulaire -> `signInEmail` -> `authClient.signIn.email`
  -> session.

## Gestion d'erreur

- Stub : lève une erreur explicite « Aucun module d'authentification installé ».
- UI : capture l'échec de la promesse et affiche un message.
- better-auth : renvoie ses propres erreurs (identifiants invalides, etc.),
  remontées telles quelles à l'UI.

## Tests

- Les e2e du CLI doivent rester verts : round-trip des nouvelles variables
  d'environnement à l'`add` puis au `remove` (snapshot `.env.example`).
- Typecheck propre sur `base` (le stub doit implémenter tout le contrat) et
  sur la source du module.
- Pas de vraies clés OAuth (simulation) : le flux réel Google/LinkedIn n'est
  pas testé de bout en bout.

## Hors périmètre (YAGNI)

- Réinitialisation de mot de passe, vérification d'email.
- Gestion de session avancée, rôles, autorisations.
- Design abouti des pages.
- Autres fournisseurs sociaux.

## Point ouvert assumé

En base vierge, `/login` et `/signup` s'affichent mais le stub lève une erreur
tant que le module `auth-better-auth` n'est pas installé. C'est la conséquence
acceptée du choix « UI en base ».
