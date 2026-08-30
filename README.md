# Test de survie affective — H3C

App web React embarquée en iframe dans Circle. 30 questions, calcule un profil
de survie affective parmi 4 (Mendiant, Sauveur, Contrôleur, Fantôme), mesure
l'intensité du schéma, et adapte le résultat selon le statut de lecteur du livre
*"Vous avez tout compris. Rien n'a changé."* de Cyrille Novou.

## Stack

- **Vite 8** + **React 19** + **TypeScript 6** strict
- **TailwindCSS v4** (via `@tailwindcss/vite`)
- **Framer Motion 12** (animations)
- **Vitest 4** + **@testing-library/react** + **jsdom** (tests)

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
```

## Tests

```bash
npm test                # mode watch
npm run test:run        # one-shot CI
npm run test:coverage   # avec couverture
npm run test:ui         # UI Vitest
```

État actuel : **104 tests verts** sur 16 fichiers.

## Build production

```bash
npm run build           # → dist/
npm run preview         # serveur statique pour tester dist/
```

Le build produit un bundle d'environ **80 kB gzippé total** (HTML + CSS + JS), bien
en dessous de la cible de 250 kB gzippé fixée par le cahier des charges.

## Architecture

```
src/
├── data/        Données : questions, profils, roadmaps, CTA par statut
├── domain/      Logique pure : scoring, intensité, composition résultat
├── components/  Composants UI (Welcome, ProgressBar, Question*Card, ResultLevel*)
├── hooks/       useTestState (orchestration parcours)
├── App.tsx      Composant racine
├── main.tsx     Bootstrap
└── index.css    Variables CSS H3C + import Tailwind
```

Toute la logique métier (scoring, intensité, résolution profil) est dans `src/domain/`,
testée à 100% (statements/branches/functions/lines). La couche `data/` est générée
par les scripts Python dans `scripts/` à partir des fichiers de référence dans `docs/`.

## Mise à jour des données

Les 30 questions, les 4 profils et les 12 roadmaps sont **générés** depuis
les fichiers `docs/*.md` qui sont les sources de vérité éditoriale. Ne pas
éditer manuellement les fichiers `src/data/*.ts`.

```bash
python3 scripts/parse_questions.py
python3 scripts/parse_profils.py
python3 scripts/parse_roadmaps.py
```

## Embed iframe

Une page de test pour l'embed est livrée dans `public/iframe-test.html`. Elle
charge l'app dans une iframe et permet de valider visuellement l'intégration
sur Circle.

Les en-têtes HTTP `X-Frame-Options` et la CSP `frame-ancestors *` sont définis
dans `public/_headers` (lus par Cloudflare Pages au déploiement). Pour
restreindre à Circle uniquement en production, modifier `public/_headers` en
remplaçant `*` par `https://cyrillenovou.circle.so`.

## Déploiement Cloudflare Pages

### Option A — connexion GitHub (recommandée)

1. Pousser ce repo sur GitHub.
2. Sur Cloudflare Dashboard → Pages → **Create project** → Connect to GitHub →
   sélectionner le repo.
3. Build settings :
   - **Framework preset** : Vite
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
4. Déploiement automatique à chaque push sur `main`.

### Option B — wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy dist --project-name=test-survie-affective
```

### Domaine custom

Une fois le projet créé sur Cloudflare Pages :
- Pages → projet → **Custom domains** → Add → `test.souverainauquotidien.com` (domaine prod live)
- Cloudflare propose le CNAME à ajouter chez le registrar du domaine.

### Vérifier l'embed

Après déploiement, ouvrir `https://<projet>.pages.dev/iframe-test.html`
(ou le domaine custom) pour valider visuellement l'embed iframe avant
intégration dans Circle.

## Décisions de conception

- **Pas de localStorage** en V1 : si la page est rechargée, le test recommence.
  Décision volontaire pour limiter la surface de tracking.
- **Pas de tracking client** (pas de Google Analytics, pas de Pixel). Toute
  remontée de donnée passe par un proxy serveur (phase 2) vers Circle API.
- **Mobile-first** : la majorité des scans QR code se font depuis un smartphone.

## Référence

- Cahier des charges : `docs/CAHIER_DES_CHARGES_TDD.md`
- Questions / scoring : `docs/QUESTIONS_30_SCORING.md`
- Profils + textes par intensité : `docs/PROFILS_RESULTATS_TEXTES.md`
- Roadmaps personnalisées : `docs/ROADMAPS_PERSONNALISEES.md`

## Après un clone — obligatoire

```bash
git config core.hooksPath .git-hooks
```

Sans cette ligne, `.git-hooks/pre-commit` est présent et exécutable mais Git ne
l'appelle jamais : le filet anti-secret est muet. Git n'active jamais un crochet
à la volée, par sécurité — aucun commit ne peut fermer cette moitié-là, seule la
consigne le peut. Mesuré au banc le 2026-08-30 (audit système tour 4, SOCLE-T4-02).
