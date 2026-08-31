import type { ReactNode } from 'react'
import { MasquesHero } from './MasquesHero'
import { DisclaimerFooter } from './DisclaimerFooter'

interface Props {
  onCommencer: () => void
}

/**
 * Welcome v3 — refonte design 2026-05-29.
 *
 * Direction validée Cyrille (mission refonte-design-ecran-accueil) :
 * - Hero MasquesHero (4 masques line-art → plein, terracotta sur crème)
 * - H1 + CTA centrés ; corps de texte aligné gauche (fin du « tout centré »)
 * - 4 cartes masques (grille 2×2 desktop, empilées mobile) = centre de gravité visuel
 *   contenu tiré strictement de src/data/profils.ts (noms + premières phrases de
 *   tension du descriptionBase canonique)
 * - Échelle typo affirmée (eyebrow Oswald MAJ → H1 Lora large → corps Inter)
 * - CTA terracotta #A8432B (token --h3c-accent-terracotta) avec hover/active/focus nets
 * - Preuve sociale en points distincts (3 réseaux + témoignages)
 * - Longueur resserrée : hero + masques + CTA + preuve, c'est tout
 * - visage → masque (3 occurrences remplacées)
 * - DisclaimerFooter Règle 12 préservé sur route welcome
 *
 * Audit conversion 2026-08-27 :
 * - Le hero, l'eyebrow, le H1 et la signature ne sont PLUS animés. Le H1 est
 *   l'élément LCP de la page : le faire naître à `opacity: 0` derrière un
 *   stagger framer-motion coûtait ~600 ms de LCP, et faisait voir à axe un
 *   texte à mi-fondu, donc un contraste mélangé (les 27 nœuds « serious »
 *   du rapport Landing Doctor, non reproductibles au repos). Le fondu ne
 *   commence qu'à partir du corps de texte.
 * - Un CTA vit désormais au-dessus de la ligne de flottaison, précédé de la
 *   demande explicite (doctrine : le corps demande, le bouton exécute) et
 *   suivi de ce que le visiteur obtient vraiment, mur email compris.
 *
 * Apparition staggered respecte `useReducedMotion`. Contrat `onCommencer`
 * préservé : les deux boutons CTA passent par `lancer()`, seul appelant.
 *
 * Audit conversion 2026-08-30 (Landing Doctor, 58/100) :
 * - La demande avant le CTA porte le bénéfice et le temps (« Découvrez lequel en
 *   3 minutes ») et le bouton aussi : c'est la variante n°1 du rapport.
 * - Bloc « Après le test » entre les cartes et le second CTA : ce que le visiteur
 *   reçoit, et que Régénération lui sera présenté ensuite, sans obligation. Le
 *   rapport voyait une « arrière-pensée cachée » dans un programme payant nommé
 *   seulement dans l'avertissement du pied.
 * - Trois témoignages, les mêmes mots et les mêmes prénoms d'emprunt que sur la
 *   page du livre (un pseudonyme par personne, partout). Jamais de citation
 *   inventée : le rapport en proposait une, elle n'existe pas.
 * - Pas d'urgence ajoutée : le test n'a aucune contrainte réelle, et une rareté
 *   fabriquée est refusée (arbitrage du 27/08, reconduit).
 *
 * Charte voix v2 : 0 tiret cadratin, 0 point-virgule.
 */

/**
 * Décalage d'apparition des blocs sous la ligne de flottaison. L'animation
 * elle-même vit dans src/index.css (.tsa-apparition), en CSS pure : c'est un
 * glissement, sans fondu d'opacité, pour qu'aucun texte ne soit jamais mesuré
 * à mi-transparence. `prefers-reduced-motion` est honoré par media query.
 */
function apparition(delai: number) {
  return { style: { animationDelay: `${delai}s` } }
}

/**
 * 4 cartes masques. Noms tirés tels quels de src/data/profils.ts (champ `nom`).
 * Phrases de tension : premières lignes du descriptionBase canonique (rythme
 * triplet + punch), recopiées strictement pour rester cohérent avec l'écran
 * de résultat. Pas de réinvention de copy.
 */
type CarteMasque = {
  id: 'mendiant' | 'sauveur' | 'controleur' | 'fantome'
  nom: string
  triplet: string
  punch: string
  iconPath: ReactNode
}

const CARTES: CarteMasque[] = [
  {
    id: 'mendiant',
    nom: 'MENDIANT DE LUXE',
    triplet: 'Vous brillez. Vous performez. Vous excellez.',
    punch: 'Et ça ne suffit jamais.',
    iconPath: (
      // Couronne stylisée
      <>
        <path
          d="M4 17 L7 9 L12 13 L17 9 L20 17 Z"
          fill="none"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="9" r="1.3" />
        <circle cx="17" cy="9" r="1.3" />
        <circle cx="12" cy="13" r="1.3" />
        <line x1="4" y1="20" x2="20" y2="20" strokeWidth="1.8" />
      </>
    ),
  },
  {
    id: 'sauveur',
    nom: 'SAUVEUR ÉPUISÉ',
    triplet: 'Vous donnez. Vous aidez. Vous sauvez.',
    punch: 'Mais qui s’occupe de vous ?',
    iconPath: (
      // Bouclier
      <>
        <path
          d="M12 3 L20 6 L20 13 C20 17 16 20 12 21 C8 20 4 17 4 13 L4 6 Z"
          fill="none"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    id: 'controleur',
    nom: 'CONTRÔLEUR ANXIEUX',
    triplet: 'Vous anticipez. Vous vérifiez. Vous contrôlez.',
    punch: 'Plus vous serrez, plus vous repoussez.',
    iconPath: (
      // Œil
      <>
        <path
          d="M2 12 C5 6 9 4 12 4 C15 4 19 6 22 12 C19 18 15 20 12 20 C9 20 5 18 2 12 Z"
          fill="none"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3.4" fill="none" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.4" />
      </>
    ),
  },
  {
    id: 'fantome',
    nom: 'FANTÔME RELATIONNEL',
    triplet: 'Vous disparaissez. Vous vous effacez. Vous fuyez.',
    punch: 'Vous partez avant qu’on vous quitte.',
    iconPath: (
      // Silhouette qui s'efface
      <>
        <path
          d="M6 4 C6 4 6 12 6 18 C6 19.5 7 20.5 8.5 19.8 L10 19 L12 20 L14 19 L15.5 19.8 C17 20.5 18 19.5 18 18 C18 12 18 4 18 4 C18 2.5 16.5 2 15 3 C13.8 3.8 12 3.8 12 3.8 C12 3.8 10.2 3.8 9 3 C7.5 2 6 2.5 6 4 Z"
          fill="none"
          strokeWidth="1.8"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <circle cx="10" cy="10" r="1" />
        <circle cx="14" cy="10" r="1" />
      </>
    ),
  },
]

/**
 * Témoignages de repli, identiques mot pour mot à ceux de la page du livre
 * (agents-workers/sites/livre-sq-front/index.html) : même personne, même pseudonyme,
 * partout. Jean-Luc témoigne sous son prénom, en vidéo aussi.
 */
const TEMOIGNAGES: { qui: string; texte: string }[] = [
  {
    qui: 'Hélène',
    texte:
      'J’ai mis deux jours à demander. C’était compliqué, difficile. J’ai refait plusieurs fois le SMS. À la seconde, j’ai eu une réponse très positive. Je n’y croyais pas.',
  },
  {
    qui: 'Marc',
    texte:
      'J’ai compris que mon père n’était pas tout-puissant. Il a fait ce qu’il a pu avec ce qu’il avait. Pour la première fois, je m’autorise à dire : la vie est belle, tout va bien.',
  },
  {
    qui: 'Jean-Luc, 70 ans',
    texte:
      'Comment être calme quand le corps n’est pas calme ? […] J’avais le sentiment d’avoir le corps beaucoup plus léger. […] C’est ma femme qui m’a dit hier soir : c’est étonnant, tout se passe bien entre nous, là maintenant.',
  },
]

/**
 * Bouton unique des deux emplacements CTA. `emplacement` ne change rien au
 * rendu : il part avec l'événement de suivi, pour savoir lequel des deux
 * déclenche réellement les tests.
 */
function BoutonTest({
  onClick,
  emplacement,
}: {
  onClick: (emplacement: 'haut' | 'bas') => void
  emplacement: 'haut' | 'bas'
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(emplacement)}
      data-testid={`cta-${emplacement}`}
      className="tsa-cta-terracotta rounded-lg px-10 py-4 text-base font-medium text-white shadow-md md:text-lg"
    >
      Découvrir mon masque en 3 minutes
    </button>
  )
}

function CaracteristiquesTest() {
  return (
    <ul
      className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm"
      style={{ color: 'var(--h3c-texte-secondaire)' }}
      aria-label="Caractéristiques du test"
    >
      <li>30 questions</li>
      <li aria-hidden>·</li>
      <li>3 minutes</li>
      <li aria-hidden>·</li>
      <li>Gratuit</li>
      <li aria-hidden>·</li>
      <li>Confidentiel</li>
    </ul>
  )
}

export function Welcome({ onCommencer }: Props) {
  /**
   * Seul chemin vers `onCommencer`. Le clic CTA était le trou de mesure du
   * funnel : ce front n'émettait que `lead`, à la capture email, tout en bas.
   * Sans numérateur ici, le taux de clic de la page d'accueil n'existait pas.
   * `h3cTrackPage` met en file jusqu'au tranchage du consentement, `h3cTrack`
   * sert de repli.
   */
  function lancer(emplacement: 'haut' | 'bas') {
    const suivre = window.h3cTrackPage ?? window.h3cTrack
    suivre?.('cta_commencer_test', { emplacement })
    onCommencer()
  }

  return (
    <>
      <main
        className="mx-auto w-full max-w-3xl px-5 pb-10 pt-10 sm:px-6 md:px-8 md:pt-14"
        style={{ color: 'var(--h3c-texte-principal)' }}
      >
        <section className="flex flex-col items-stretch">
          {/* Hero visuel — hors stagger : chaîne LCP */}
          <div className="mx-auto mb-6 w-full max-w-2xl md:mb-8">
            <MasquesHero />
          </div>

          {/* Eyebrow centré — hors stagger */}
          <p
            className="mb-3 text-center text-xs uppercase md:text-sm"
            style={{
              color: 'var(--h3c-accent-terracotta)',
              fontFamily: 'var(--font-eyebrow)',
              fontWeight: 500,
              letterSpacing: '0.14em',
            }}
          >
            Test de survie affective
          </p>

          {/* H1 centré — élément LCP, jamais animé */}
          <h1
            className="mx-auto mb-7 max-w-2xl text-center text-3xl leading-tight sm:text-4xl md:mb-9 md:text-5xl"
            style={{ fontFamily: 'var(--font-titre)', fontWeight: 500 }}
          >
            En amour, vous rejouez toujours le même scénario
          </h1>

          {/* CTA primaire, au-dessus de la ligne de flottaison */}
          <div className="mb-10 flex flex-col items-center md:mb-14">
            <p
              className="mb-4 text-center text-base md:text-lg"
              style={{ color: 'var(--h3c-texte-principal)' }}
            >
              Découvrez lequel en 3 minutes. Faites le test maintenant.
            </p>
            <BoutonTest onClick={lancer} emplacement="haut" />
            <CaracteristiquesTest />
            <p
              className="mt-4 max-w-md text-center text-sm leading-relaxed"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Vous répondez, vous donnez votre email, votre masque s&apos;affiche.
              Le rapport complet et vos 20 séances audio guidées partent dans
              votre boîte. Sans carte bancaire.
            </p>
          </div>

          {/* Signature auteur — colophon éditorial (filet + nom caps + référence livre italique) */}
          {/* Signal E-E-A-T pour Google/LLM + cohérence JSON-LD Person/Book */}
          <div
            className="mx-auto mb-10 flex flex-col items-center md:mb-14"
            data-testid="signature-auteur"
          >
            <div
              aria-hidden="true"
              className="mb-3 h-px w-10 md:mb-4 md:w-12"
              style={{ background: 'var(--h3c-accent-terracotta)', opacity: 0.45 }}
            />
            <p
              className="mb-1.5 text-[0.6875rem] md:mb-2 md:text-xs"
              style={{
                fontFamily: 'var(--font-eyebrow)',
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--h3c-texte-principal)',
              }}
            >
              Par Cyrille NOVOU
            </p>
            <p
              className="text-center text-sm leading-snug md:text-base"
              style={{
                fontFamily: 'var(--font-titre)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--h3c-texte-secondaire)',
              }}
            >
              auteur de «&nbsp;Vous avez tout compris. Rien n&apos;a changé.&nbsp;»
            </p>
          </div>

          {/* Bloc corps aligné gauche */}
          <div
            {...apparition(0)}
            className="tsa-apparition mx-auto mb-10 max-w-xl md:mb-12"
          >
            <p
              className="mb-4 text-base leading-relaxed md:text-lg"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Derrière chaque scénario qui se répète, il y a un masque parmi
              quatre.
            </p>
            <p
              className="mb-4 text-base italic leading-relaxed md:text-lg"
              style={{ color: 'var(--h3c-texte-principal)' }}
            >
              Mendiant. Sauveur. Contrôleur. Fantôme.
            </p>
            <p
              className="mb-4 text-base leading-relaxed md:text-lg"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Et derrière ce masque, une autorisation que vous n&apos;avez
              jamais reçue&nbsp;: ressentir, décevoir, poser une limite, ou
              prendre de la place.
            </p>
            <p
              className="text-base leading-relaxed md:text-lg"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Le test ne vous donnera pas une compréhension de plus. Il vous
              donnera un nom, un masque, et la prochaine action.
            </p>
          </div>

          {/* Bloc 4 cartes masques — centre de gravité visuel */}
          <ul
            {...apparition(0.08)}
            className="tsa-apparition mx-auto mb-12 grid w-full max-w-2xl list-none grid-cols-1 gap-4 p-0 md:mb-14 md:grid-cols-2 md:gap-5"
            aria-label="Les quatre masques du test"
          >
            {CARTES.map((c) => (
              <li
                key={c.id}
                data-testid={`carte-masque-${c.id}`}
                className="flex flex-col gap-3 rounded-lg p-5 md:p-6"
                style={{
                  background: 'var(--h3c-fond-card)',
                  border: '1px solid var(--h3c-bordure)',
                  boxShadow: '0 1px 2px var(--h3c-ombre)',
                }}
              >
                <div className="flex items-start gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    width="28"
                    height="28"
                    stroke="var(--h3c-accent-terracotta)"
                    fill="var(--h3c-accent-terracotta)"
                    style={{ flex: '0 0 auto', marginTop: '2px' }}
                  >
                    {c.iconPath}
                  </svg>
                  <h2
                    className="text-sm md:text-base"
                    style={{
                      color: 'var(--h3c-accent-terracotta)',
                      fontFamily: 'var(--font-eyebrow)',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                    }}
                  >
                    {c.nom}
                  </h2>
                </div>
                <p
                  className="text-sm leading-relaxed md:text-base"
                  style={{
                    color: 'var(--h3c-texte-principal)',
                    fontFamily: 'var(--font-titre)',
                  }}
                >
                  {c.triplet}
                </p>
                <p
                  className="text-sm italic leading-relaxed md:text-base"
                  style={{ color: 'var(--h3c-texte-secondaire)' }}
                >
                  {c.punch}
                </p>
              </li>
            ))}
          </ul>

          {/* Après le test : ce qui arrive, et ce qui sera proposé ensuite. Rien de caché. */}
          <div
            {...apparition(0.12)}
            className="tsa-apparition mx-auto mb-10 max-w-xl md:mb-12"
            data-testid="apres-le-test"
          >
            <h2
              className="mb-3 text-xl md:text-2xl"
              style={{ fontFamily: 'var(--font-titre)', fontWeight: 500 }}
            >
              Après le test
            </h2>
            <p
              className="mb-3 text-base leading-relaxed md:text-lg"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Votre profil détaillé et vos 20 séances audio guidées arrivent
              gratuitement dans votre boîte email. Aucune carte bancaire, aucun
              engagement.
            </p>
            <p
              className="text-base leading-relaxed md:text-lg"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Si vous voulez aller plus loin, je vous présenterai ensuite le
              programme Régénération. À vous de décider.
            </p>
          </div>

          {/* Bloc CTA centré, dense, avec hover/active/focus marqués */}
          <div
            {...apparition(0.16)}
            className="tsa-apparition flex flex-col items-center"
          >
            <p
              className="mb-4 text-center text-base md:text-lg"
              style={{ color: 'var(--h3c-texte-principal)' }}
            >
              Vous vous reconnaissez dans l&apos;un des quatre. Allez chercher
              lequel.
            </p>
            <BoutonTest onClick={lancer} emplacement="bas" />
            <CaracteristiquesTest />
            <ul
              className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
              aria-label="Communauté"
            >
              <li>
                <strong style={{ color: 'var(--h3c-texte-principal)' }}>
                  39&nbsp;000
                </strong>{' '}
                sur Instagram
              </li>
              <li aria-hidden>·</li>
              <li>
                <strong style={{ color: 'var(--h3c-texte-principal)' }}>
                  48&nbsp;000
                </strong>{' '}
                sur YouTube
              </li>
              <li aria-hidden>·</li>
              <li>
                <strong style={{ color: 'var(--h3c-texte-principal)' }}>
                  13&nbsp;000
                </strong>{' '}
                sur Facebook
              </li>
            </ul>
            <p
              className="mt-5 max-w-xl text-center text-sm leading-relaxed"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              En cinq ans, plus de 700 femmes et hommes ont écrit pour la même
              raison. La vôtre y est sans doute aussi.
            </p>
            {/* Preuve d'accompagnement — déjà affirmée dans le bloc noscript de
                index.html depuis la refonte SEO, mais invisible à l'écran, donc
                absente de tout ce que lit un visiteur. Remontée ici le
                2026-08-27 : la durée et le nombre de personnes accompagnées
                sont la seule preuve de résultat que porte la page. */}
            <p
              className="mt-3 max-w-xl text-center text-sm leading-relaxed"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Treize ans d&apos;accompagnement. Plus de 1700 femmes et hommes
              à ce jour.
            </p>
            <ul
              className="mt-6 grid w-full max-w-xl list-none gap-4 p-0 text-left"
              aria-label="Témoignages"
              data-testid="temoignages"
            >
              {TEMOIGNAGES.map((t) => (
                <li
                  key={t.qui}
                  className="rounded-lg p-4 md:p-5"
                  style={{
                    background: 'var(--h3c-fond-card)',
                    border: '1px solid var(--h3c-bordure)',
                  }}
                >
                  <p
                    className="text-sm leading-relaxed md:text-base"
                    style={{
                      fontFamily: 'var(--font-titre)',
                      fontStyle: 'italic',
                      color: 'var(--h3c-texte-principal)',
                    }}
                  >
                    «&nbsp;{t.texte}&nbsp;»
                  </p>
                  <p
                    className="mt-2 text-xs md:text-sm"
                    style={{ color: 'var(--h3c-texte-secondaire)' }}
                  >
                    {t.qui}
                  </p>
                </li>
              ))}
            </ul>
            <p
              className="mt-3 max-w-xl text-center text-xs leading-relaxed"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
            >
              Les prénoms sont des pseudonymes, sauf Jean-Luc qui témoigne sous le
              sien. Les mots sont les leurs.
            </p>
          </div>
        </section>
      </main>
      <DisclaimerFooter />
    </>
  )
}
