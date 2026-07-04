# Bibliothèque UI (packages/ui + Storybook) et base vierge — Design

**Date :** 2026-07-04
**Statut :** Design, à relire avant plan.

## Contexte et problème

Le dashboard (coquille, briques, page compte) a été construit directement dans `base/`, avec les modules `auth-better-auth` et `database-supabase` installés. Résultat : `base/` n'est plus le gabarit vierge que la commande est censée copier par client. Le test e2e du CLI le prouve (il refuse d'installer des modules déjà présents).

Décision : séparer clairement deux choses aujourd'hui mélangées.

- Le gabarit d'app vierge (ce qu'on copie par client, où la commande installe les modules).
- La bibliothèque de composants réutilisables (ce qu'on développe et montre isolément).

## Objectif

1. Extraire tous les composants dans un paquet dédié `packages/ui`, avec Storybook.
2. Remettre `base/` complètement vierge (squelette + bouchons, aucun module installé, aucune page câblée).
3. Conserver la correction Prisma multi-fichiers dans les modules (l'auth possède ses tables).

Les composants ne sont plus câblés dans une app. On les montre dans Storybook, et on les intègre à la main, par projet, le jour venu.

## Architecture cible : trois boîtes séparées

### 1. `packages/ui` — la bibliothèque

Paquet de l'espace de travail (`pnpm-workspace.yaml` inclut déjà `packages/*`). Contient :

- Les composants : primitives (`ui/`), coquille de dashboard (`dashboard/`), formulaires de compte (`account/`), auth (`auth/`).
- Les helpers de présentation associés : `lib/utils.ts` (`cn`), `lib/dashboard/nav.ts`, `lib/dashboard/breadcrumb.ts`, `hooks/use-mobile.ts`.
- Le fichier de marque (le thème : les variables CSS de `globals.css`).
- Les tests de composants (déplacés avec eux).
- Storybook et les fiches (`*.stories.tsx`).

C'est ici qu'on développe, teste et montre les composants.

### 2. `base/` — le gabarit nu

Retour à l'état vierge :

- `app/` minimal : `layout.tsx`, une `page.tsx` d'accueil simple, `globals.css`, favicon. Aucune route `(dashboard)`, `compte`, `login`, `signup`, `api/auth`.
- `lib/` en bouchons : registre d'adaptateurs tout en stubs, `lib/auth/client.ts` qui réexporte le stub, `installed-modules.ts` vide.
- Aucun module installé. Pas de schéma Prisma (il vient du module database).
- C'est la cible d'installation de la commande, et ce qu'on copie par client.

### 3. `modules/` — inchangés (avec la correction Prisma)

`auth-better-auth` et `database-supabase` restent tels quels, en gardant le schéma Prisma multi-fichiers : `database-supabase` apporte `prisma/schema/schema.prisma` (socle), `auth-better-auth` apporte `prisma/schema/auth.prisma` (ses 4 tables).

## Point délicat : le couplage à `@/lib/auth/client`

Certains composants ne sont pas autonomes : `user-menu`, et les formulaires de compte (`profile-form`, `email-form`, `password-form`, `delete-account`) importent `@/lib/auth/client` (la prise d'auth de l'app). Une bibliothèque isolée ne peut pas dépendre de l'app qui la consomme.

**Décision (pragmatique) :** on garde la convention. La bibliothèque suppose que l'app consommatrice fournit un module à l'emplacement `@/lib/auth/client` respectant le contrat `AuthClient`. Dans Storybook, on simule cette prise (mock). Les composants ne changent pas.

Conséquence : `packages/ui` n'est pas 100% autonome (elle attend cette prise chez le consommateur). C'est acceptable puisque tout le kit partage cette convention. Le contrat `AuthClient` (types) doit vivre dans un endroit partagé accessible à la bibliothèque et à l'app — voir Décisions ouvertes.

**Alternative reportée :** injecter les actions d'auth par les props (composants vraiment autonomes). Plus propre, plus de travail, à faire seulement si on distribue la bibliothèque pour de vrai.

## Storybook

- `packages/ui` est une bibliothèque, pas une app Next. Storybook en mode React + Vite (pas le framework Next).
- Brancher Tailwind v4 et importer le fichier de marque dans le preview, pour que les composants s'affichent thémés.
- Simuler dans les fiches les dépendances externes : `@/lib/auth/client` (auth) et `next/navigation` (`usePathname`, `useRouter`).
- Les primitives base-ui et les composants d'affichage rendent bien en isolation. Les composants serveur purs (PageHeader, StatCard) sont de simples fonctions React, ils rendent aussi.
- Vérifier la compatibilité Storybook avec React 19 / Tailwind v4 au montage ; adapter les versions si friction.

## Remise à vierge de `base/`

- Référence : le dernier état vierge connu dans l'historique git (commit `9789ae9`, « chore(base): reset to pristine »). Servira de repère pour le squelette (`app/`, `lib/`, adaptateurs stubs).
- Concrètement : retirer les pages câblées, remettre le registre d'adaptateurs et `lib/auth/client.ts` en bouchons, vider `installed-modules.ts`, retirer les fichiers copiés par les modules (`lib/auth/server.ts`, `client-adapter.ts`, `lib/database/client.ts`, `app/api/auth/...`, schéma Prisma), retirer les variables d'environnement ajoutées.
- Après ça, le test e2e du CLI redevient vert (base vierge, install/désinstall propre).

## Découpage en phases (pour le plan)

1. **Créer `packages/ui`** : squelette du paquet (package.json, tsconfig, alias, Tailwind, dépendances), sans composants encore.
2. **Déplacer la bibliothèque** : composants + helpers + hooks + fichier de marque + tests, de `base/` vers `packages/ui`. Corriger les imports internes.
3. **Monter Storybook** dans `packages/ui` + écrire une fiche par composant, avec les mocks (auth, navigation).
4. **Remettre `base/` vierge** : retirer pages et modules, revenir au squelette. Vérifier le vert du test CLI.
5. **Vérifier l'ensemble** : build de la bibliothèque, Storybook démarre, tests verts des deux côtés, test e2e CLI vert.

Chaque phase peut être un plan à part, ou un plan unique en 5 tâches. À décider à l'étape plan.

## Tests et vérification

- Les tests de composants suivent les composants dans `packages/ui` et doivent rester verts.
- `base/` : après remise à vierge, typecheck vert, et le test e2e du CLI (`@starter/cli`) redevient vert.
- Storybook : démarre sans erreur, chaque fiche s'affiche.

## Décisions ouvertes (à trancher au plan)

- **Où vit le contrat `AuthClient` (types) ?** Il est aujourd'hui dans `base/lib/auth/types.ts` (squelette). La bibliothèque en a besoin (les formulaires typent leurs appels). Options : le garder côté base et que la bibliothèque l'attende via l'alias, ou l'extraire dans un endroit partagé. À trancher.
- **login/signup** : retirés de `base/` sans être extraits en composants pour l'instant (câblage manuel plus tard). Confirmer.
- **Nom et périmètre exact du paquet** : `packages/ui` proposé.
- **Alias d'import dans `packages/ui`** : définir (par exemple un alias interne au paquet) pour remplacer les `@/…` actuels qui pointent vers `base/`.

## Ce qui ne change pas

- Le fichier de marque reste la seule source des couleurs/typo/arrondis (il déménage dans `packages/ui`).
- Les modules et la mécanique du CLI restent le cœur du kit.
- La règle de rangement par fonctionnalité reste (dans `packages/ui` : `ui/`, `dashboard/`, `account/`, `auth/`).
