import { motion, useReducedMotion } from 'framer-motion'
import { BoucleHero } from './BoucleHero'

interface Props {
  onCommencer: () => void
}

/**
 * Welcome — écran d'accueil enrichi en page de vente scrollable (2026-05-24).
 *
 * Sections verticales :
 *   1. Hero (boucle SVG + eyebrow + H1 + sous-titre + bouton + ligne info)
 *   2. Le miroir
 *   3. Le retournement
 *   4. Les 4 profils (cartes Crown / Shield / Eye / User)
 *   5. Ce que le test vous donne (4 livrables)
 *   6. Réassurance
 *   7. Preuve sociale
 *   8. CTA final + signature
 *
 * Règles :
 * - Les DEUX boutons "Commencer le test" appellent onCommencer (contrat préservé).
 * - Lora pour les titres, Inter pour l'UI (variables --font-titre / --font-ui).
 * - Framer Motion `whileInView` discret, respect prefers-reduced-motion.
 * - 0 tiret cadratin, 0 point-virgule (charte voix v2).
 * - Aucune mention du cadeau / 20 descentes (décision Cyrille, réservé email).
 */
export function Welcome({ onCommencer }: Props) {
  const reduceMotion = useReducedMotion()
  // Apparition fade-in subtile au scroll. Annulée si user a "Réduire les animations".
  const fadeIn = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.5, ease: 'easeOut' as const },
      }

  return (
    <main
      className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:px-6 md:px-8 md:pt-14"
      style={{ color: 'var(--h3c-texte-principal)' }}
    >
      {/* 1. HERO */}
      <section className="mb-14 flex flex-col items-center text-center md:mb-20">
        <div className="mb-6 w-full max-w-xl md:mb-8">
          <BoucleHero />
        </div>
        <p
          className="mb-3 text-xs uppercase md:text-sm"
          style={{
            color: 'var(--h3c-accent-primaire)',
            fontFamily: 'var(--font-eyebrow)',
            fontWeight: 500,
            letterSpacing: '0.14em',
          }}
        >
          Test de survie affective
        </p>
        <h1
          className="mb-5 text-3xl leading-tight sm:text-4xl md:text-5xl"
          style={{ fontFamily: 'var(--font-titre)' }}
        >
          En amour, vous rejouez toujours le même scénario
        </h1>
        <p
          className="mb-8 max-w-xl text-base leading-relaxed md:text-lg"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Le test qui met un nom sur votre schéma, et mesure à quel point il
          vous tient.
        </p>
        <button
          type="button"
          onClick={onCommencer}
          className="rounded-lg px-8 py-4 text-base font-medium text-white shadow-md transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ background: 'var(--h3c-accent-primaire)' }}
        >
          Commencer le test
        </button>
        <p
          className="mt-5 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          30 questions. 5 minutes. Gratuit. Confidentiel.
        </p>
      </section>

      {/* 2. LE MIROIR */}
      <motion.section
        {...fadeIn}
        className="mx-auto mb-14 max-w-2xl text-center md:mb-20"
      >
        <h2
          className="mb-6 text-2xl md:text-3xl"
          style={{ fontFamily: 'var(--font-titre)' }}
        >
          Le miroir
        </h2>
        <div
          className="space-y-3 text-base leading-relaxed md:text-lg"
          style={{ color: 'var(--h3c-texte-principal)' }}
        >
          <p>Vous réussissez dans votre travail. Avec vos amis. Partout.</p>
          <p>Sauf en amour.</p>
          <p>Toujours la même histoire. Toujours la même fin.</p>
          <p>
            Vous savez exactement ce qu'il faut faire. Vous ne le faites pas.
          </p>
          <p>Ce n'est pas un manque de volonté.</p>
        </div>
      </motion.section>

      {/* 3. LE RETOURNEMENT */}
      <motion.section
        {...fadeIn}
        className="mx-auto mb-14 max-w-2xl text-center md:mb-20"
      >
        <h2
          className="mb-6 text-2xl md:text-3xl"
          style={{ fontFamily: 'var(--font-titre)' }}
        >
          Le retournement
        </h2>
        <div
          className="space-y-3 text-base leading-relaxed md:text-lg"
          style={{ color: 'var(--h3c-texte-principal)' }}
        >
          <p>
            Derrière chacune de vos relations, il y a une seule blessure :
            l'abandon.
          </p>
          <p>Et quatre façons d'y survivre.</p>
          <p>
            Vous en avez adopté une, bien avant aujourd'hui. Sans la choisir.
          </p>
        </div>
      </motion.section>

      {/* 4. LES 4 PROFILS */}
      <motion.section {...fadeIn} className="mb-14 md:mb-20">
        <h2
          className="mb-3 text-center text-2xl md:text-3xl"
          style={{ fontFamily: 'var(--font-titre)' }}
        >
          Une même blessure. Quatre stratégies.
        </h2>
        <p
          className="mb-8 text-center text-base md:text-lg"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Laquelle vous habite ?
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProfilCard
            icon={<IconCrown />}
            nom="Le Mendiant de Luxe"
            phrase="Vous performez pour mériter l'amour."
          />
          <ProfilCard
            icon={<IconShield />}
            nom="Le Sauveur Épuisé"
            phrase="Vous vous rendez indispensable pour qu'on reste."
          />
          <ProfilCard
            icon={<IconEye />}
            nom="Le Contrôleur Anxieux"
            phrase="Vous serrez si fort que vous repoussez ceux que vous voulez garder."
          />
          <ProfilCard
            icon={<IconUserGhost />}
            nom="Le Fantôme Relationnel"
            phrase="Vous partez avant qu'on vous quitte."
          />
        </ul>
        <p
          className="mt-6 text-center text-base"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Le test vous dit laquelle est la vôtre.
        </p>
      </motion.section>

      {/* 5. CE QUE LE TEST VOUS DONNE */}
      <motion.section
        {...fadeIn}
        className="mx-auto mb-14 max-w-2xl md:mb-20"
      >
        <h2
          className="mb-6 text-center text-2xl md:text-3xl"
          style={{ fontFamily: 'var(--font-titre)' }}
        >
          Ce que le test vous donne
        </h2>
        <p
          className="mb-5 text-center text-base md:text-lg"
          style={{ color: 'var(--h3c-texte-principal)' }}
        >
          À la fin des 30 questions, vous saurez :
        </p>
        <ul className="mx-auto max-w-xl space-y-3 text-base md:text-lg">
          <Livrable text="Votre profil dominant, et votre profil secondaire s'il existe" />
          <Livrable text="L'intensité de votre schéma aujourd'hui : surface, modéré ou profond" />
          <Livrable text="Les 7 symptômes que vous vivez, lus à travers votre profil" />
          <Livrable text="Votre prochain pas, une feuille de route adaptée à votre cas" />
        </ul>
      </motion.section>

      {/* 6. RÉASSURANCE */}
      <motion.section
        {...fadeIn}
        className="mx-auto mb-14 max-w-2xl text-center md:mb-20"
      >
        <div
          className="space-y-3 text-base leading-relaxed md:text-lg"
          style={{ color: 'var(--h3c-texte-principal)' }}
        >
          <p>5 minutes, pas une de plus.</p>
          <p>Gratuit. Confidentiel.</p>
          <p>Ici, pas de jugement. Un miroir, rien de plus.</p>
        </div>
      </motion.section>

      {/* 7. PREUVE SOCIALE */}
      <motion.section
        {...fadeIn}
        className="mx-auto mb-14 max-w-2xl text-center md:mb-20"
      >
        <p
          className="rounded-xl border px-6 py-5 text-base leading-relaxed md:text-lg"
          style={{
            borderColor: 'var(--h3c-bordure)',
            background: 'var(--h3c-fond-card)',
            color: 'var(--h3c-texte-principal)',
          }}
        >
          39 000 personnes sur Instagram, 47 000 sur YouTube suivent Cyrille
          Novou.
        </p>
      </motion.section>

      {/* 8. CTA FINAL + SIGNATURE */}
      <motion.section {...fadeIn} className="flex flex-col items-center text-center">
        <h2
          className="mb-3 text-2xl md:text-3xl"
          style={{ fontFamily: 'var(--font-titre)' }}
        >
          Vous avez tout compris. Rien n'a changé.
        </h2>
        <p
          className="mb-7 text-base md:text-lg"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Comprendre ne suffit pas.
        </p>
        <button
          type="button"
          onClick={onCommencer}
          className="rounded-lg px-8 py-4 text-base font-medium text-white shadow-md transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ background: 'var(--h3c-accent-primaire)' }}
        >
          Commencer le test
        </button>
        <p
          className="mt-6 italic"
          style={{
            color: 'var(--h3c-accent-primaire)',
            fontFamily: 'var(--font-titre)',
          }}
        >
          La tête comprend. Le corps répare.
        </p>
      </motion.section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Sous-composants internes                                            */
/* ------------------------------------------------------------------ */

interface ProfilCardProps {
  icon: React.ReactNode
  nom: string
  phrase: string
}

function ProfilCard({ icon, nom, phrase }: ProfilCardProps) {
  return (
    <li
      className="flex flex-col gap-3 rounded-xl border p-5"
      style={{
        borderColor: 'var(--h3c-bordure)',
        background: 'var(--h3c-fond-card)',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          background: 'rgba(196, 167, 119, 0.15)',
          color: 'var(--h3c-accent-primaire)',
        }}
      >
        {icon}
      </span>
      {/* Surtitre de carte profil — seul autre endroit en Oswald avec l'eyebrow hero
          (mission update 2026-05-24). MAJUSCULES + letter-spacing 0.14em. */}
      <h3
        className="text-sm uppercase leading-snug md:text-base"
        style={{
          fontFamily: 'var(--font-eyebrow)',
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: 'var(--h3c-accent-primaire)',
        }}
      >
        {nom}
      </h3>
      <p
        className="text-sm leading-relaxed md:text-base"
        style={{ color: 'var(--h3c-texte-principal)' }}
      >
        {phrase}
      </p>
    </li>
  )
}

function Livrable({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full"
        style={{ background: 'var(--h3c-accent-secondaire)' }}
      />
      <span style={{ color: 'var(--h3c-texte-principal)' }}>{text}</span>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Icônes SVG inline (équivalents Lucide Crown / Shield / Eye / User)  */
/* Optimisées Tailwind. Pas de dep Lucide ajoutée au bundle.           */
/* ------------------------------------------------------------------ */

function IconCrown() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconUserGhost() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ opacity: 0.5 }}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
