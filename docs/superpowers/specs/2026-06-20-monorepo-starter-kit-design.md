# Design, monorepo starter kit modulaire

Date, 2026-06-20.
Source du design, les pages Notion d'architecture (maison, prises, bouchons, marqueurs, bus d'évènements, hooks, dépendance contre réaction, infrastructure contre fonctionnalité). Ce spec rend ces idées concrètes pour un premier build.

## 1. Objectif

Construire, dans le dossier actuel, un monorepo qui sert de starter kit. Une application Next.js de base qui tourne dès le départ, une commande qui ajoute et retire des fonctionnalités, et deux modules liés pour prouver le flux de bout en bout, une base de données et une authentification.

L'usage cible est un freelance qui démarre vite des SaaS pour des clients, et qui veut pouvoir changer de fournisseur d'une fonctionnalité d'un client à l'autre sans réécrire l'application.

## 2. Décisions validées

- Périmètre, la fondation plus deux modules liés, database puis auth-better-auth. better-auth a besoin d'une base, donc le module database est son prérequis.
- Base de données, Prisma avec Supabase Postgres.
- Outils, pnpm workspaces, build de la commande avec tsup, tests avec vitest. Pas de Turborepo (YAGNI).
- Point destructif accepté, le Create Next App actuel est déplacé sous base. C'est un déplacement, rien n'est supprimé pour de bon ni publié.

## 3. Principes d'architecture, rappel

- Le squelette (code stable) ne parle qu'à des prises (interfaces), jamais à un fournisseur précis.
- Tant qu'aucun module ne remplit une prise, un bouchon (stub) l'occupe et ne fait rien. Le code retombe dessus, donc retirer un module ne casse rien.
- Un module ne touche le code partagé qu'à trois endroits, ses propres fichiers, le registre central entre marqueurs, et la configuration externe (variables et dépendances).
- Un module ne connait jamais le contenu d'un autre module. Il dépend de prises, pas de modules.
- Deux familles de prises. Infrastructure, toujours présente, par exemple le bus, utilisable sans déclaration. Fonctionnalité, présente seulement si installée, à déclarer dans la fiche quand on l'appelle en direct.
- Dépendance contre réaction. Si un module a besoin d'un autre pour finir son travail, appel direct par la prise, et la dépendance est déclarée. Si un module veut juste prévenir que quelque chose est arrivé, il passe par le bus d'évènements.
- École des marqueurs seuls. Pas de fichier de suivi séparé dans le projet. La fiche du module porte tout ce qu'il faut pour brancher et débrancher.

## 4. Structure du monorepo

```text
starter-kit-1/
  package.json                  racine, pnpm workspaces
  pnpm-workspace.yaml
  base/                         l'application Next.js de base, le banc d'essai
  packages/
    cli/                        la commande my-starter
  modules/
    database/                   Prisma plus Supabase, remplit la prise database
    auth-better-auth/           better-auth, remplit la prise auth, dépend de database
  docs/                         specs et documentation
```

Le dossier base reçoit les fichiers de l'actuel Create Next App (app, public, configs Next, Tailwind, tsconfig). Son alias `@/*` reste vers la racine de base.

## 5. La fondation, dans base

### 5.1 Les prises et leurs bouchons

Fichier des contrats, base/lib/adapters/types.ts. Interfaces pour, AuthAdapter (serveur), PaymentAdapter, DatabaseAdapter, EmailAdapter, AnalyticsAdapter. Plus le type Adapters qui les regroupe.

Bouchons par défaut, base/lib/adapters/stubs/, un fichier par prise. Chaque bouchon respecte l'interface et ne fait rien d'utile. Exemple, authStub.getSession rend null. paymentStub refuse poliment. databaseStub jette une erreur explicite si on l'utilise sans module. emailStub et analyticsStub ne font rien en silence.

Registre central, base/lib/adapters/index.ts. Il assemble les prises et expose l'objet adapters. Chaque prise est encadrée par des marqueurs, par exemple `// @adapter:auth start` et `// @adapter:auth end`, avec le bouchon comme valeur de départ.

### 5.2 La prise client de l'authentification

Les hooks ne peuvent pas vivre dans un objet de registre. La prise client est donc un fichier stable, base/lib/auth/client.ts, depuis lequel l'application importe toujours useSession, signIn, signOut. Au départ, ce fichier contient un bouchon (useSession rend une session vide). Le contenu entre marqueurs `// @prise:auth-client start` et `// @prise:auth-client end` est remplacé à l'installation d'un module d'authentification.

### 5.3 Le bus d'évènements

- base/lib/events/types.ts, l'interface EventBusAdapter (emit, on) et le catalogue typé AppEvents (la liste des évènements de l'application).
- base/lib/events/memory-bus.ts, la version par défaut en mémoire, au-dessus d'un EventEmitter.
- base/lib/events/index.ts, le bus serveur, exposé entre marqueurs `// @adapter:eventbus start/end`, avec memoryBus par défaut.
- base/lib/events/client.ts, un bus client équivalent pour les évènements du navigateur.

Le bus est une prise d'infrastructure, toujours présente, donc utilisable sans déclaration.

### 5.4 La mise en route et la liste des modules

- base/lib/bootstrap.ts, fonction bootstrapModules, avec marqueurs `// @modules start/end`. C'est ici que les modules inscrivent leurs auditeurs du bus. Appelée une fois au démarrage, depuis app/layout.tsx.
- base/lib/installed-modules.ts, un tableau des modules installés, mis à jour par la commande. Sert d'information, pas de mécanisme de retrait.

### 5.5 Une page de démonstration

base/app/page.tsx montre l'état d'authentification via la prise, par exemple un badge connecté ou invité, pour qu'on voie le bouchon puis le vrai module à l'oeuvre.

## 6. La commande, dans packages/cli

Binaire my-starter, deux sous-commandes, add et remove. Construite avec tsup, sortie en CommonJS, testée avec vitest.

### 6.1 La fiche du module, module.json

Chaque module porte une fiche qui décrit tout ce qu'il faut pour le brancher et le débrancher. Schéma.

```json
{
  "name": "auth-better-auth",
  "remplitLesPrises": ["auth", "auth-client"],
  "besoinDesPrises": ["database"],
  "deps": ["better-auth"],
  "devDeps": [],
  "env": ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"],
  "files": ["lib/auth/server.ts", "app/api/auth/[...all]/route.ts"],
  "branchements": [
    {
      "fichier": "lib/adapters/index.ts",
      "marqueur": "adapter:auth",
      "import": "import { betterAuthAdapter } from \"@/lib/auth/server\"",
      "valeurInstallee": "auth: betterAuthAdapter,",
      "valeurParDefaut": "auth: authStub,"
    },
    {
      "fichier": "lib/auth/client.ts",
      "marqueur": "prise:auth-client",
      "import": "import { createAuthClient } from \"better-auth/react\"",
      "valeurInstallee": "export const { useSession, signIn, signOut } = createAuthClient()",
      "valeurParDefaut": "export const useSession = () => ({ data: null, isPending: false }); export const signIn = () => { throw new Error(\"Aucun module d'authentification\") }; export const signOut = () => {}"
    }
  ],
  "listeners": []
}
```

Notes. remplitLesPrises liste les prises que le module occupe. besoinDesPrises liste les prises de fonctionnalité dont il a besoin pour travailler, vérifiées à l'installation et protégées au retrait. branchements porte la valeur installée et la valeur par défaut, ce qui permet de débrancher sans fichier de suivi. listeners, le cas échéant, donne les fonctions à inscrire dans bootstrap.

### 6.2 Deux types de patch entre marqueurs

- Remplacement, pour une prise à un seul fournisseur, par exemple auth ou database. On remplace tout ce qui est entre les marqueurs par valeurInstallee, et au retrait on remet valeurParDefaut.
- Ajout de ligne, pour une liste à plusieurs entrées, par exemple les auditeurs dans bootstrap. On ajoute une ligne entre les marqueurs sans toucher aux autres, et au retrait on retire seulement sa ligne.

### 6.3 Modules internes de la commande

- manifest.ts, lecture et validation de module.json.
- markers.ts, chirurgie de texte entre marqueurs, remplacement et ajout de ligne, plus la gestion des imports en tête de fichier. Partie fragile, écrite en TDD.
- env.ts, ajout et retrait de variables dans base/.env.example. Écrite en TDD.
- installed.ts, mise à jour de lib/installed-modules.ts. Écrite en TDD.
- fs-ops.ts, copie et suppression des fichiers du module.
- deps.ts, pnpm add et pnpm remove des dépendances.
- commands/add.ts et commands/remove.ts, l'orchestration.

### 6.4 Déroulé de add

1. Lire la fiche.
2. Vérifier que chaque prise de besoinDesPrises est remplie par un module installé. Sinon, refuser avec un message clair.
3. Vérifier qu'aucune prise de remplitLesPrises n'est déjà occupée par un autre module. Sinon, proposer le remplacement.
4. Copier les fichiers du module.
5. Appliquer les branchements entre marqueurs, avec les imports.
6. Inscrire les listeners dans bootstrap, le cas échéant.
7. Ajouter les variables dans .env.example.
8. Installer les dépendances.
9. Mettre à jour la liste des modules installés.

Chaque étape est idempotente, relancer add ne casse rien.

### 6.5 Déroulé de remove

L'inverse exact. Vérifier qu'aucun module installé ne dépend de la prise retirée. Retirer les listeners, remettre les valeurs par défaut entre marqueurs, retirer les imports, supprimer les fichiers, retirer les variables, désinstaller les dépendances, mettre à jour la liste.

## 7. Le module database, Prisma avec Supabase Postgres

Remplit la prise database, sans dépendance.

- deps, prisma et @prisma/client.
- files, un schéma Prisma (prisma/schema.prisma), un client exposé par la prise (lib/database/client.ts qui implémente DatabaseAdapter au-dessus du client Prisma).
- env, DATABASE_URL et DIRECT_URL (Supabase fournit les deux, une connexion poolée et une connexion directe pour les migrations).
- branchement, remplace le bouchon de la prise database dans le registre par le client Prisma.

La chaine de connexion réelle reste dans le fichier .env local de l'utilisateur, jamais en dur. Le fichier .env.example ne reçoit que les noms de variables.

## 8. Le module auth-better-auth

Remplit les prises auth (serveur) et auth-client. Déclare besoin de la prise database.

- deps, better-auth.
- files, l'adaptateur serveur (lib/auth/server.ts, qui configure better-auth avec l'adaptateur Prisma et implémente AuthAdapter), et la route d'authentification (app/api/auth/[...all]/route.ts).
- env, BETTER_AUTH_SECRET et BETTER_AUTH_URL.
- branchements, la prise auth serveur dans le registre, et la prise auth-client dans lib/auth/client.ts, avec le hook useSession traduit vers le standard de l'application.

better-auth utilise la prise database via Prisma, ce qui illustre la dépendance déclarée et la règle infrastructure contre fonctionnalité.

## 9. Stratégie de test et de preuve

- Tests unitaires en TDD pour markers.ts, env.ts, installed.ts. Ce sont les parties fragiles de la chirurgie de texte.
- Test de bout en bout, on copie base dans un dossier temporaire, on lance add database puis add auth-better-auth, et on vérifie que la copie compile (typecheck) et build. On vérifie aussi l'idempotence et le retrait propre, après remove on doit retrouver les bouchons.
- La preuve porte sur le câblage, les types et le build. Une vraie connexion à Supabase et un vrai login dépendent de la chaine fournie par l'utilisateur dans .env, hors du périmètre automatique.

## 10. Hors périmètre

- Les autres modules, auth Firebase, paiement Stripe, notifications, statistiques, ne sont pas construits dans ce premier build. L'architecture les prévoit, on les ajoutera ensuite.
- Le registre distant à la shadcn, on reste sur les modules embarqués dans le paquet de la commande.
- Une suite de tests complète des flux d'authentification réels en ligne.
- Le déploiement.

## 11. Critères de réussite

- L'application de base démarre et build sans aucun module, avec les bouchons.
- La commande add database remplit la prise database, add auth-better-auth remplit les prises auth et auth-client et passe la vérification de dépendance.
- Installer auth-better-auth sans database est refusé avec un message clair.
- Après add puis remove, le projet revient à l'état initial, les bouchons sont de retour et le projet compile.
- Les patchers sont couverts par des tests unitaires verts.
