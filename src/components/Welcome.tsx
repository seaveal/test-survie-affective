import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { BoucleHero } from './BoucleHero'
import { DisclaimerFooter } from './DisclaimerFooter'

interface Props {
  onCommencer: () => void
}

/**
 * Welcome v2 — écran d'accueil court (mission 2026-05-25).
 *
 * Une seule section hero centrée, suivie du DisclaimerFooter (Règle 12).
 * Les sections de vente du 24/05 (miroir / retournement / 4 profils / livrables
 * / réassurance / preuve sociale / CTA final / signature) ont été supprimées
 * pour ramener l'écran à UN clic « je commence le test ».
 *
 * Apparition staggered de la pile hero (eyebrow → H1 → sous-titre → bouton
 * → ligne info), `useReducedMotion` respecté. BoucleHero anime ses 4
 * silhouettes indépendamment (cf. composant).
 *
 * Charte voix v2 : 0 tiret cadratin, 0 point-virgule.
 */

const STACK_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

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
          className="flex flex-col items-center text-center"
        >
          <div className="mb-6 w-full max-w-xl md:mb-8">
            <BoucleHero />
          </div>
          <motion.p
            {...itemProps}
            className="mb-3 text-xs uppercase md:text-sm"
            style={{
              color: 'var(--h3c-accent-primaire)',
              fontFamily: 'var(--font-eyebrow)',
              fontWeight: 500,
              letterSpacing: '0.14em',
            }}
          >
            Test de survie affective
          </motion.p>
          <motion.h1
            {...itemProps}
            className="mb-5 text-3xl leading-tight sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-titre)' }}
          >
            En amour, vous rejouez toujours le même scénario
          </motion.h1>
          <motion.p
            {...itemProps}
            className="mb-8 max-w-xl text-base leading-relaxed md:text-lg"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
          >
            Le test qui met un nom sur votre schéma, et révèle ce qui vous
            empêche d'en sortir.
          </motion.p>
          <motion.button
            {...itemProps}
            type="button"
            onClick={onCommencer}
            className="rounded-lg px-8 py-4 text-base font-medium text-white shadow-md transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ background: 'var(--h3c-accent-primaire)' }}
          >
            Commencer le test
          </motion.button>
          <motion.p
            {...itemProps}
            className="mt-5 text-sm"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
          >
            30 questions. 5 minutes. Gratuit. Confidentiel.
          </motion.p>
          <motion.p
            {...itemProps}
            className="mt-4 text-sm"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
          >
            Rejoint par plus de 39 000 personnes sur Instagram, 47 000 sur
            YouTube et 13 000 sur Facebook.
          </motion.p>
          <motion.p
            {...itemProps}
            className="mt-4 max-w-xl text-sm leading-relaxed"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
          >
            En cinq ans, plus de 700 femmes et hommes ont écrit pour la même
            raison. La vôtre y est sans doute aussi.
          </motion.p>
        </motion.section>
      </main>
      <DisclaimerFooter />
    </>
  )
}
