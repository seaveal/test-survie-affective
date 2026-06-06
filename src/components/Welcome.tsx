import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
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
 * - CTA terracotta #9E4332 avec hover/active/focus nets
 * - Preuve sociale en points distincts (3 réseaux + 700 témoignages)
 * - Longueur resserrée : hero + masques + CTA + preuve, c'est tout
 * - visage → masque (3 occurrences remplacées)
 * - DisclaimerFooter Règle 12 préservé sur route welcome
 *
 * Apparition staggered respecte `useReducedMotion`. Contrat `onCommencer`
 * préservé : seul appelant des 1 boutons CTA.
 *
 * Charte voix v2 : 0 tiret cadratin, 0 point-virgule.
 */

const STACK_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
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

export function Welcome({ onCommencer }: Props) {
  const reduceMotion = useReducedMotion()
  const stackProps = reduceMotion
    ? {}
    : { initial: 'hidden' as const, animate: 'visible' as const, variants: STACK_VARIANTS }
  const itemProps = reduceMotion ? {} : { variants: ITEM_VARIANTS }

  return (
    <>
      <main
        className="mx-auto w-full max-w-3xl px-5 pb-10 pt-10 sm:px-6 md:px-8 md:pt-14"
        style={{ color: 'var(--h3c-texte-principal)' }}
      >
        <motion.section
          {...stackProps}
          className="flex flex-col items-stretch"
        >
          {/* Hero visuel */}
          <motion.div
            {...itemProps}
            className="mx-auto mb-6 w-full max-w-2xl md:mb-8"
          >
            <MasquesHero />
          </motion.div>

          {/* Eyebrow centré */}
          <motion.p
            {...itemProps}
            className="mb-3 text-center text-xs uppercase md:text-sm"
            style={{
              color: 'var(--h3c-accent-terracotta)',
              fontFamily: 'var(--font-eyebrow)',
              fontWeight: 500,
              letterSpacing: '0.14em',
            }}
          >
            Test de survie affective
          </motion.p>

          {/* H1 centré, hiérarchie affirmée */}
          <motion.h1
            {...itemProps}
            className="mx-auto mb-7 max-w-2xl text-center text-3xl leading-tight sm:text-4xl md:mb-9 md:text-5xl"
            style={{ fontFamily: 'var(--font-titre)', fontWeight: 500 }}
          >
            En amour, vous rejouez toujours le même scénario
          </motion.h1>

          {/* Signature auteur — colophon éditorial (filet + nom caps + référence livre italique) */}
          {/* Signal E-E-A-T pour Google/LLM + cohérence JSON-LD Person/Book */}
          <motion.div
            {...itemProps}
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
          </motion.div>

          {/* Bloc corps aligné gauche */}
          <motion.div {...itemProps} className="mx-auto mb-10 max-w-xl md:mb-12">
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
          </motion.div>

          {/* Bloc 4 cartes masques — centre de gravité visuel */}
          <motion.div
            {...itemProps}
            className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-1 gap-4 md:mb-14 md:grid-cols-2 md:gap-5"
            role="list"
            aria-label="Les quatre masques du test"
          >
            {CARTES.map((c) => (
              <article
                key={c.id}
                role="listitem"
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
              </article>
            ))}
          </motion.div>

          {/* Bloc CTA centré, dense, avec hover/active/focus marqués */}
          <motion.div
            {...itemProps}
            className="flex flex-col items-center"
          >
            <button
              type="button"
              onClick={onCommencer}
              className="tsa-cta-terracotta rounded-lg px-10 py-4 text-base font-medium text-white shadow-md md:text-lg"
            >
              Commencer le test
            </button>
            <ul
              className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm"
              style={{ color: 'var(--h3c-texte-secondaire)' }}
              aria-label="Caractéristiques du test"
            >
              <li>30 questions</li>
              <li aria-hidden>·</li>
              <li>5 minutes</li>
              <li aria-hidden>·</li>
              <li>Gratuit</li>
              <li aria-hidden>·</li>
              <li>Confidentiel</li>
            </ul>
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
                  47&nbsp;000
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
          </motion.div>
        </motion.section>
      </main>
      <DisclaimerFooter />
    </>
  )
}
