# Cahier des charges TDD V2 : App Test de Survie Affective

**Projet** : test-survie-affective
**Demandeur** : Cyrille Novou
**Date** : 30 avril 2026
**Deadline** : 7 jours calendaires
**Méthode** : FULL TDD strict
**Version** : 2.0 (remplace V1 du 2026-04-30 17:00)

---

## 1. Objectif produit

Développer une application web React, embarquée en iframe dans Circle, qui fait passer au lecteur du livre H3C un test de 30 questions, calcule son profil dominant de survie affective parmi 4 profils, mesure l'intensité du schéma, détecte son statut de lecteur, et affiche un résultat triple-couches : révélation émotionnelle, lecture fine du profil, roadmap personnalisée.

L'app doit servir trois publics distincts avec une expérience adaptée :
1. **Le non-lecteur** scannera le QR code pour la première fois et doit ressortir convaincu d'acheter le livre
2. **Le lecteur en cours** doit recevoir une lecture qui enrichit ce qu'il lit déjà
3. **Le lecteur post-livre** doit recevoir une roadmap actionnable et une orientation vers le programme high-ticket

## 2. Principes directeurs

- **Pas de feature en plus** que celles spécifiées dans ce cahier. Pas de gamification, pas de partage social, pas de timer, pas de musique de fond.
- **TDD strict obligatoire** sur la logique métier (scoring, calcul d'intensité, détermination du résultat). Tests unitaires couvrant 100% du code de la couche domain.
- **Mobile-first absolu**. La majorité des scans QR code se font depuis un smartphone. L'expérience desktop est secondaire.
- **Performance** : bundle de production sous 250 Ko gzippé. Premier rendu sous 2 secondes en 4G.
- **Accessibilité** : navigable au clavier, contraste AA minimum, balises sémantiques correctes.
- **Pas de tracking utilisateur** côté client en V1. Pas de Google Analytics, pas de Facebook Pixel. La donnée part directement vers Circle via API serveur (phase 2).

## 3. Stack technique imposée

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Build | Vite 5+ | Vitesse de dev, HMR rapide |
| Framework | React 18 | Stack standard, écosystème mature |
| Langage | TypeScript strict | Sécurité du typage essentielle pour scoring |
| Styling | TailwindCSS 3+ | Rapidité de styling, cohérence design |
| Animation | Framer Motion | Transitions entre questions et apparition résultats |
| Tests | Vitest + React Testing Library | Tests unitaires + tests composants |
| Lint | ESLint + Prettier | Qualité de code |
| Hébergement | Cloudflare Pages | Gratuit, déploiement git automatique |
| Backend (phase 2) | Cloudflare Workers | API proxy vers Circle |

## 4. Architecture

### 4.1 Arborescence du projet

```
test-survie-affective/
├── docs/
│   ├── CAHIER_DES_CHARGES_TDD.md
│   ├── QUESTIONS_30_SCORING.md
│   ├── PROFILS_RESULTATS_TEXTES.md
│   └── ROADMAPS_PERSONNALISEES.md
├── src/
│   ├── data/
│   │   ├── questions.ts        Les 30 questions typées
│   │   ├── profils.ts          Les 4 profils avec textes par intensité
│   │   ├── roadmaps.ts         Les 12 roadmaps personnalisées
│   │   └── *.test.ts           Tests de validation des données
│   ├── domain/
│   │   ├── types.ts            Types TS du domaine
│   │   ├── scoring.ts          Calcul du profil dominant et secondaire
│   │   ├── intensity.ts        Calcul de l'intensité du schéma
│   │   ├── result.ts           Composition du résultat final
│   │   └── *.test.ts           Tests unitaires
│   ├── components/
│   │   ├── Welcome.tsx         Écran d'accueil
│   │   ├── QuestionCard.tsx    Question à choix multiple (4 options)
│   │   ├── LikertCard.tsx      Question d'intensité (échelle 1-5)
│   │   ├── ContextCard.tsx     Question de contexte (4 options qualitatives)
│   │   ├── ProgressBar.tsx     Barre de progression
│   │   ├── ResultPage.tsx      Orchestrateur de la page de résultat
│   │   ├── ResultLevel1.tsx    Révélation : profil + intensité
│   │   ├── ResultLevel2.tsx    Lecture fine : 7 symptômes contextualisés
│   │   ├── ResultLevel3.tsx    Roadmap personnalisée + CTA
│   │   └── *.test.tsx          Tests de composants
│   ├── pages/
│   │   └── App.tsx             Orchestrateur principal
│   ├── hooks/
│   │   └── useTestState.ts     Gestion d'état du parcours
│   ├── lib/
│   │   └── circle-api.ts       Client API Circle (phase 2)
│   ├── styles/
│   │   └── h3c-theme.css       Variables CSS H3C
│   ├── main.tsx
│   └── index.html
├── tests/
│   ├── e2e.test.tsx            Tests bout en bout
│   └── fixtures/               Données de test
├── public/
│   └── favicon.svg
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

### 4.2 Modèle de données

```typescript
// src/domain/types.ts

export type ProfilId = 'mendiant' | 'sauveur' | 'controleur' | 'fantome';

export type IntensiteId = 'surface' | 'modere' | 'profond';

export type StatutLivre = 'lu_complet' | 'lu_partiel' | 'pas_lu';

export type SituationActuelle = 
  | 'couple_stable' 
  | 'couple_difficile' 
  | 'rupture_recente' 
  | 'celibat_long';

export type EtatEmotionnel = 
  | 'fonctionnel' 
  | 'tendu' 
  | 'crise' 
  | 'reconstruction';

export type PretAAgir = 
  | 'maintenant' 
  | 'bientot' 
  | 'comprendre_dabord' 
  | 'incertain';

// QUESTIONS

export type TypeQuestion = 'typage' | 'intensite' | 'contexte';

export interface OptionTypage {
  id: string;          // 'A', 'B', 'C', 'D'
  texte: string;
  profil: ProfilId;
}

export interface OptionLikert {
  valeur: 1 | 2 | 3 | 4 | 5;
  texte: string;
}

export interface OptionContexte {
  id: string;
  texte: string;
  valeur: string;      // valeur sémantique (ex: 'lu_complet')
}

export interface QuestionTypage {
  id: number;          // 1 à 20
  type: 'typage';
  enonce: string;
  options: OptionTypage[];  // exactement 4 options, une par profil
}

export interface QuestionIntensite {
  id: number;          // 21 à 26
  type: 'intensite';
  enonce: string;
  options: OptionLikert[];  // exactement 5 options sur échelle 1-5
}

export interface QuestionContexte {
  id: number;          // 27 à 30
  type: 'contexte';
  enonce: string;
  options: OptionContexte[];
  champCible: 'statutLivre' | 'situation' | 'etatEmotionnel' | 'pretAAgir';
}

export type Question = QuestionTypage | QuestionIntensite | QuestionContexte;

// RÉPONSES

export interface Reponses {
  typage: Record<number, string>;        // q.id -> option.id
  intensite: Record<number, 1|2|3|4|5>;  // q.id -> valeur
  contexte: {
    statutLivre: StatutLivre;
    situation: SituationActuelle;
    etatEmotionnel: EtatEmotionnel;
    pretAAgir: PretAAgir;
  };
}

// SCORE ET RÉSULTAT

export interface ScoreProfils {
  mendiant: number;
  sauveur: number;
  controleur: number;
  fantome: number;
}

export interface Resultat {
  profilDominant: ProfilId;
  profilSecondaire: ProfilId | null;
  scoreProfils: ScoreProfils;
  intensite: IntensiteId;
  scoreIntensite: number;          // 6 à 30
  statutLivre: StatutLivre;
  situation: SituationActuelle;
  etatEmotionnel: EtatEmotionnel;
  pretAAgir: PretAAgir;
}

// PROFILS ET ROADMAPS (data layer)

export interface Profil {
  id: ProfilId;
  nom: string;
  icone: string;
  ambassadeur: string;
  descriptionBase: string;
  septSymptomes: string[];
  modulateursIntensite: {
    surface: string;
    modere: string;
    profond: string;
  };
}

export interface Roadmap {
  profilId: ProfilId;
  intensite: IntensiteId;
  pasNumeroUn: string;
  pasNumeroDeux: string;
  pasNumeroTrois: string;
  chapitresLivreCibles: number[];   // pour les lecteurs
  exerciceCorporel: string;
  ctaPrincipal: { texte: string; url: string };
  ctaSecondaire: { texte: string; url: string };
}
```

### 4.3 Flow utilisateur de bout en bout

1. Le lecteur scanne le QR code (ou clique sur un lien dans Circle)
2. Il atterrit sur la page Circle d'invitation, s'inscrit avec email + mot de passe
3. Circle l'authentifie et l'amène au Space "Découvrez votre profil"
4. L'iframe charge l'app à test.souverainauquotidien.com
5. **Écran d'accueil** : titre, sous-titre, mention "30 questions, 5 minutes, confidentiel", bouton "Commencer"
6. **Phase typage** (questions 1 à 20) : énoncé + 4 options carrées cliquables, transition automatique au clic
7. **Phase intensité** (questions 21 à 26) : énoncé + échelle Likert 1 à 5 avec étiquettes textuelles
8. **Phase contexte** (questions 27 à 30) : énoncé + 4 options qualitatives
9. **Calcul du résultat** (instantané, en mémoire)
10. **Page de résultat à 3 niveaux** :
    - Niveau 1 : profil dominant + intensité + profil secondaire si applicable
    - Niveau 2 : 7 symptômes contextualisés
    - Niveau 3 : roadmap personnalisée + CTA adapté au statut livre

### 4.4 Algorithme de calcul

#### 4.4.1 Calcul du profil dominant

Chaque option de typage choisie ajoute 3 points au profil correspondant. Score maximum théorique par profil : 60 points (si l'utilisateur choisit toujours le même profil).

Profil dominant = celui avec le plus haut score.

En cas d'égalité parfaite :
1. Critère 1 : profil avec le plus de réponses sur les 4 questions discriminantes (1, 4, 11, 19)
2. Critère 2 (si toujours égalité) : ordre prédéfini Fantôme > Contrôleur > Sauveur > Mendiant

Profil secondaire : si l'écart entre dominant et second est inférieur à 4 points, le second est mentionné. Sinon, null.

#### 4.4.2 Calcul de l'intensité

Somme des valeurs Likert des 6 questions d'intensité (questions 21 à 26). Score total entre 6 et 30.

| Score total | Intensité | Sens |
|-------------|-----------|------|
| 6 à 13 | surface | La blessure existe mais le schéma reste tenable au quotidien |
| 14 à 22 | modere | Le schéma impacte significativement la vie relationnelle et émotionnelle |
| 23 à 30 | profond | Le schéma est en crise, urgence à agir |

#### 4.4.3 Composition du résultat

Le résultat final combine les 4 dimensions : profil dominant, profil secondaire, intensité, contexte (statut livre + situation + état + prêt à agir). Le contexte ne change pas le profil ni l'intensité, il change uniquement les CTA et le ton de la roadmap.

### 4.5 Adaptation par statut livre

**Décision 2026-05-24 (livre retiré du parcours)** : le livre n'est plus un produit du funnel test. Tous les statuts basculent désormais sur la même stratégie **cadeau-first** (20 séances audio guidées par email) + appel YCBM 45 min. Le champ `statutLivre` reste collecté pour l'analytics et la segmentation Brevo, mais ne pilote plus le routage de CTA.

| Statut | CTA principal | CTA secondaire | Roadmap |
|--------|---------------|----------------|---------|
| pas_lu | Ouvrir mon email et récupérer mes 20 séances | Réserver un appel de qualification YCBM | Roadmap orientée découverte |
| lu_partiel | Ouvrir mon email et récupérer mes 20 séances | Réserver un appel de qualification YCBM | Roadmap orientée approfondissement |
| lu_complet | Réserver un appel de qualification YCBM | Rejoindre Souverain au Quotidien | Roadmap orientée passage à l'action |

Voir `PROFILS_RESULTATS_TEXTES.md` (textes verbatim par statut) et `MISSION_2026-05-24_corrections-parcours-bloc1.md`.

## 5. Spécifications fonctionnelles

### 5.1 Écran d'accueil

> Écran d'accueil scrollable enrichi (refonte 2026-05-24, décision Cyrille via Claude.ai). Le cadeau des 20 descentes n'est PAS annoncé sur cet écran, il est réservé à l'email de résultat. Voir Annexe A de la mission `MISSION_2026-05-24_ecran-accueil-test-enrichi.md` pour le copy verbatim complet (8 sections).

**Eyebrow** : Test de survie affective
**Titre (H1)** : En amour, vous rejouez toujours le même scénario
**Sous-titre** : Le test qui met un nom sur votre schéma, et mesure à quel point il vous tient.
**Mention sous le bouton** : 30 questions. 5 minutes. Gratuit. Confidentiel.
**Bouton (Hero + CTA final)** : Commencer le test
**Signature de fin** : La tête comprend. Le corps répare.

Sections en scroll (verticales, mobile-first 360px mini) :
1. Hero (visuel boucle SVG + eyebrow + H1 + sous-titre + bouton + ligne info)
2. Le miroir (5 lignes — bascule "sauf en amour")
3. Le retournement (blessure unique de l'abandon + 4 stratégies)
4. Les 4 profils (Mendiant / Sauveur / Contrôleur / Fantôme, icônes Crown/Shield/Eye/User)
5. Ce que le test vous donne (4 livrables : profil dominant + secondaire, intensité, 7 symptômes, prochain pas)
6. Réassurance (5 min, gratuit, confidentiel, pas de jugement)
7. Preuve sociale (39 000 Instagram, 48 000 YouTube)
8. CTA final + signature

Règles techniques : Lora titres / Inter UI (variables `--font-titre` / `--font-ui`). Framer Motion `whileInView` discret, `useReducedMotion` respecté. Bundle < 250 Ko gzippé. Contraste AA. 0 tiret cadratin, 0 point-virgule (charte voix v2). Les DEUX boutons "Commencer le test" appellent `onCommencer` (contrat préservé).

### 5.2 Affichage des questions de typage (1-20)

Une seule question visible à la fois. Barre de progression "Question X sur 30". 4 options en cartes cliquables. Au clic, transition slide horizontale vers la question suivante (durée 300ms).

Bouton "Question précédente" disponible sauf sur la question 1.

### 5.3 Affichage des questions d'intensité (21-26)

Énoncé en haut. 5 options empilées verticalement avec valeur Likert (1 à 5) et étiquette textuelle descriptive. L'utilisateur clique sur l'option qui lui correspond.

Exemple visuel pour la question "Depuis combien de temps ce schéma se manifeste ?" :
- 1 : Depuis quelques mois seulement
- 2 : Depuis 1 ou 2 ans
- 3 : Depuis 5 ans
- 4 : Depuis 10 ans ou plus
- 5 : Depuis aussi loin que je me souvienne

### 5.4 Affichage des questions de contexte (27-30)

Énoncé en haut. 4 options qualitatives sous forme de cartes. Une seule réponse possible.

### 5.5 Page de résultat

**Niveau 1 (visible immédiatement)**
Titre : Votre profil dominant : [Nom]
Icône emblématique du profil
Description de base du profil (2-3 paragraphes percutants)
Mention du profil secondaire si applicable
Indicateur d'intensité : barre visuelle + texte ("Votre intensité : [Surface/Modéré/Profond]")
Texte modulateur d'intensité (1 paragraphe spécifique au croisement profil × intensité)

**Niveau 2 (visible au scroll)**
Titre : Les 7 symptômes que vous reconnaissez
Liste des 7 symptômes contextualisés selon le profil

**Niveau 3 (visible au scroll)**
Titre : Votre prochain pas
Roadmap personnalisée :
- Pas numéro 1 (à faire cette semaine)
- Pas numéro 2 (à faire ce mois)
- Pas numéro 3 (à faire dans les 3 mois)
- Exercice corporel prioritaire
- Si lecteur : chapitres du livre à relire
CTA principal et secondaire selon statut livre

### 5.6 Persistance et rechargement

Réponses stockées en state React uniquement. Pas de localStorage. Si rechargement, le test recommence. Cette contrainte est volontaire pour la V1.

### 5.7 Responsive

L'app doit fonctionner sur mobile (largeur 360px minimum). Cartes d'options assez grandes pour être tapées au pouce. Pas d'élément qui sort de la viewport. Page de résultat lisible et scrollable sur mobile.

## 6. Design system H3C

### 6.1 Palette de couleurs

```css
:root {
  --h3c-fond-principal: #faf8f5;
  --h3c-fond-card: #ffffff;
  --h3c-texte-principal: #2c2c2c;
  --h3c-texte-secondaire: #666666;
  --h3c-accent-primaire: #8b7355;
  --h3c-accent-secondaire: #c4a777;
  --h3c-erreur: #c0392b;
  --h3c-succes: #5d8a66;
  --h3c-bordure: #e8e2d8;
  --h3c-ombre: rgba(0, 0, 0, 0.08);
  --h3c-intensite-surface: #c4a777;
  --h3c-intensite-modere: #b8854a;
  --h3c-intensite-profond: #8b4513;
}
```

### 6.2 Typographie

Police titres : Lora (serif) via Google Fonts.
Police UI : Inter (sans-serif) via Google Fonts.

Tailles :
- Titre principal : 32px desktop / 26px mobile
- Énoncé question : 22px desktop / 18px mobile
- Texte option : 16px desktop / 15px mobile
- UI : 14px

### 6.3 Composants visuels

**Cartes d'options** : fond blanc, bordure douce, coins arrondis 12px, ombre subtile, padding 20px, hover sur desktop seulement.

**Bouton primaire** : fond accent-primaire, texte blanc, padding 16px 32px, coins arrondis 8px.

**Barre de progression** : hauteur 4px, fond bordure clair, partie remplie en accent-secondaire.

**Indicateur d'intensité** : barre horizontale segmentée en 3 sections (surface, modéré, profond), partie active colorée selon le résultat.

## 7. Plan de tests TDD

L'application est développée en TDD strict. Tests écrits AVANT le code pour la logique métier. Phases dans l'ordre.

### Phase 1 : Tests de la logique de scoring (src/domain/scoring.test.ts)

**Test 1.1** : un parcours qui répond toujours par l'option Mendiant aux 20 questions de typage produit profilDominant = 'mendiant', score.mendiant = 60, autres scores = 0.

**Test 1.2** : un parcours "tout Fantôme" produit profilDominant = 'fantome', score.fantome = 60.

**Test 1.3** : 11 réponses Sauveur et 9 Mendiant produit profilDominant = 'sauveur', score.sauveur = 33, score.mendiant = 27.

**Test 1.4** : égalité parfaite Fantôme/Contrôleur (10 chacun, 0 ailleurs) produit profilDominant = 'fantome' (priorité prédéfinie).

**Test 1.5** : profil dominant à 30 points et second à 27 (écart 3) produit profilSecondaire = second profil.

**Test 1.6** : profil dominant à 30 et second à 24 (écart 6) produit profilSecondaire = null.

**Test 1.7** : si reponses.typage est incomplet, lève une erreur.

**Test 1.8** : si une réponse référence une option inexistante, lève une erreur.

**Test 1.9** : la fonction scoring est pure (mêmes entrées = mêmes sorties).

**Test 1.10** : tie-breaker via questions discriminantes (1, 4, 11, 19) sur égalité parfaite avec scores différents sur ces questions.

### Phase 2 : Tests du calcul d'intensité (src/domain/intensity.test.ts)

**Test 2.1** : 6 réponses à 1 produit scoreIntensite = 6, intensite = 'surface'.

**Test 2.2** : 6 réponses à 5 produit scoreIntensite = 30, intensite = 'profond'.

**Test 2.3** : score 13 produit intensite = 'surface' (limite haute).

**Test 2.4** : score 14 produit intensite = 'modere' (limite basse).

**Test 2.5** : score 22 produit intensite = 'modere' (limite haute).

**Test 2.6** : score 23 produit intensite = 'profond' (limite basse).

**Test 2.7** : si reponses.intensite est incomplet (moins de 6 réponses), lève une erreur.

**Test 2.8** : si une valeur Likert est hors plage (0 ou 6), lève une erreur.

### Phase 3 : Tests de composition du résultat (src/domain/result.test.ts)

**Test 3.1** : composeResult retourne un objet Resultat complet avec toutes les dimensions.

**Test 3.2** : le résultat inclut bien les valeurs de contexte (statutLivre, situation, etatEmotionnel, pretAAgir).

**Test 3.3** : un parcours complet "tout Fantôme + intensité maxi + pas_lu + crise + maintenant" produit le résultat attendu.

### Phase 4 : Tests des données (src/data/*.test.ts)

**Test 4.1 questions** : il y a exactement 30 questions, dans l'ordre 1 à 30 sans trou.

**Test 4.2 questions** : 20 questions de typage (id 1 à 20), 6 d'intensité (21 à 26), 4 de contexte (27 à 30).

**Test 4.3 questions** : chaque question de typage a 4 options couvrant les 4 profils sans doublon.

**Test 4.4 questions** : chaque question d'intensité a 5 options Likert avec valeurs 1 à 5.

**Test 4.5 questions** : chaque question de contexte cible un champ valide (statutLivre, situation, etatEmotionnel, pretAAgir).

**Test 4.6 profils** : il y a exactement 4 profils avec ids corrects.

**Test 4.7 profils** : chaque profil a 7 symptômes et 3 modulateurs d'intensité.

**Test 4.8 roadmaps** : il y a exactement 12 roadmaps (4 profils × 3 intensités).

**Test 4.9 roadmaps** : chaque roadmap a 3 pas, 1 exercice corporel, 2 CTA.

### Phase 5 : Tests de composants (src/components/*.test.tsx)

**Test 5.1 Welcome** : affiche titre, sous-titre, bouton "Commencer".

**Test 5.2 Welcome** : au clic, callback onStart appelé.

**Test 5.3 QuestionCard** : affiche énoncé + 4 options.

**Test 5.4 QuestionCard** : au clic option, callback onAnswer appelé avec optionId.

**Test 5.5 LikertCard** : affiche énoncé + 5 options de 1 à 5.

**Test 5.6 LikertCard** : au clic, callback onAnswer appelé avec valeur 1-5.

**Test 5.7 ContextCard** : affiche énoncé + 4 options qualitatives.

**Test 5.8 ContextCard** : au clic, callback onAnswer appelé avec valeur sémantique.

**Test 5.9 ProgressBar** : affiche "Question X sur 30" et barre proportionnelle.

**Test 5.10 ResultLevel1** : affiche profil + intensité + profil secondaire si applicable.

**Test 5.11 ResultLevel2** : affiche les 7 symptômes du profil.

**Test 5.12 ResultLevel3** : affiche roadmap + CTA selon statut livre.

**Test 5.13 ResultPage** : si statutLivre = 'pas_lu' OU 'lu_partiel', CTA principal = "Ouvrir mon email et récupérer mes 20 séances" (cadeau-first, livre retiré 2026-05-24).

**Test 5.14 ResultPage** : si statutLivre = 'lu_complet', CTA principal = "Réserver un appel de qualification YCBM" (URL YCBM réelle).

### Phase 6 : Tests bout en bout (tests/e2e.test.tsx)

**Test 6.1** : parcours complet "tout Fantôme + intensité 30 + pas_lu" produit la page de résultat correcte.

**Test 6.2** : parcours mixte avec profil secondaire mentionne bien le secondaire dans la page de résultat.

**Test 6.3** : retour en arrière à la question 5, changement de réponse, le scoring final est mis à jour.

### Phase 7 : Tests de production

**Test 7.1** : npm run build produit un bundle sans erreur.

**Test 7.2** : bundle gzippé sous 250 Ko.

**Test 7.3** : npm run preview lance le bundle servi en local.

## 8. Ordre d'exécution TDD sur 7 jours

### Jour 1 (8 heures) : Fondations
- Heures 1-2 : init projet Vite + TS + Tailwind + Vitest, dépendances, premier commit
- Heures 3-4 : phase 1 (scoring) tests + implémentation
- Heures 5-6 : phase 2 (intensité) tests + implémentation
- Heures 7-8 : phase 3 (composition) tests + implémentation

### Jour 2 (8 heures) : Données
- Heures 1-3 : import des 30 questions depuis QUESTIONS_30_SCORING.md vers questions.ts + tests phase 4.1-4.5
- Heures 4-5 : import des 4 profils depuis PROFILS_RESULTATS_TEXTES_V2.md vers profils.ts + tests 4.6-4.7
- Heures 6-8 : import des 12 roadmaps depuis ROADMAPS_PERSONNALISEES.md vers roadmaps.ts + tests 4.8-4.9

### Jour 3 (8 heures) : Composants questions
- Heures 1-3 : QuestionCard (typage) + tests 5.3-5.4
- Heures 4-5 : LikertCard (intensité) + tests 5.5-5.6
- Heures 6-7 : ContextCard (contexte) + tests 5.7-5.8
- Heure 8 : ProgressBar + Welcome + tests 5.1-5.2, 5.9

### Jour 4 (8 heures) : Composants résultat
- Heures 1-3 : ResultLevel1 (révélation) + tests 5.10
- Heures 4-5 : ResultLevel2 (lecture fine) + tests 5.11
- Heures 6-7 : ResultLevel3 (roadmap) + tests 5.12-5.14
- Heure 8 : ResultPage orchestrateur

### Jour 5 (8 heures) : Orchestration et e2e
- Heures 1-3 : useTestState hook + App.tsx orchestrateur
- Heures 4-6 : tests e2e phase 6 (3 tests bout en bout)
- Heures 7-8 : ajustements visuels, animations Framer Motion

### Jour 6 (8 heures) : QA et responsive
- Heures 1-3 : QA mobile (Chrome Android, Safari iOS) sur Chrome DevTools
- Heures 4-5 : ajustements responsive et accessibilité
- Heures 6-8 : tests utilisateurs réels avec 5 personnes minimum, ajustements selon retours

### Jour 7 (8 heures) : Déploiement
- Heures 1-3 : phase 7 (build production) + déploiement Cloudflare Pages
- Heures 4-5 : configuration domaine custom test.souverainauquotidien.com
- Heure 6 : test d'intégration iframe dans Circle réel
- Heures 7-8 : tampon final, fix bugs détectés en pré-prod, communication mise en ligne

## 9. Phase 2 (post-V1)

Ces fonctionnalités ne sont PAS dans la V1 livrée à J+7. Elles sont à prévoir pour une V2 dans les 2 semaines suivantes.

- Worker Cloudflare proxy pour appel API Circle (tagging automatique du membre)
- Tracking analytics (taux complétion, distribution profils, temps moyen)
- A/B test sur formulations de questions
- Sauvegarde du parcours en localStorage (reprendre où on s'est arrêté)
- Partage du résultat par email à la demande
- Version anglaise du test

## 10. Critères d'acceptation finaux

L'app est livrable si et seulement si :

1. Tous les tests Vitest passent au vert
2. Couverture de la logique domain (scoring, intensity, result) à 100%
3. Couverture des composants critiques à 90% minimum
4. App fonctionne sur Chrome desktop, Chrome Android, Safari desktop, Safari iOS
5. Bundle production sous 250 Ko gzippé
6. Premier rendu sous 2 secondes en 4G simulée
7. Aucune erreur console en navigation normale
8. Les 30 questions s'enchaînent dans l'ordre
9. Le résultat correspond bien au scoring (validation visuelle sur 4 cas types par profil × 3 intensités)
10. Adaptation correcte des CTA selon statut livre
11. App embarquable en iframe (test sur page HTML statique)
12. Code commité en git avec messages clairs par phase TDD
13. README.md créé avec instructions dev et build
14. Test utilisateur réel avec 5 personnes minimum, sans bug bloquant identifié

## 11. Risques connus et mitigations

**Risque 1** : le délai de 7 jours est tendu si Cyrille demande beaucoup de modifications de textes.
Mitigation : les textes sont externalisés dans docs/. Modifications rapides sans refactor de code.

**Risque 2** : les 24 variations de pages de résultat (4 profils × 3 intensités × 2 statuts) peuvent créer une explosion combinatoire de bugs visuels.
Mitigation : factorisation maximale des composants. Tests automatiques sur les 24 cas.

**Risque 3** : iframe Circle peut imposer une hauteur fixe.
Mitigation : utiliser postMessage pour communiquer la hauteur du contenu (à prévoir en V2 si nécessaire).

**Risque 4** : la complexité du scoring (typage + intensité + contexte) peut produire des résultats contre-intuitifs.
Mitigation : Cyrille valide manuellement 12 parcours types (4 profils × 3 intensités) avant lancement.

## 12. Posture du dev Claude Code

- TDD strict, pas de code sans test préalable sauf couche présentation pure
- Refactor encouragé après chaque GREEN
- Pas de feature en plus que celles spécifiées
- Commits fréquents avec messages explicites
- Stop si doute sur un texte ou un comportement, demander à Cyrille
- Alerter dès le jour 3 si le délai de 7 jours menace de déraper

---

Document de référence à lire avant tout dev. Mis à jour après chaque décision majeure.
