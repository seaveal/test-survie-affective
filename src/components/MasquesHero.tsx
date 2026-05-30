import { motion, useReducedMotion } from 'framer-motion'

/**
 * MasquesHero : visuel décoratif de l'écran d'accueil (mission refonte 2026-05-29).
 *
 * Quatre masques alignés du plus pâle au plus net, en line-art terracotta sur
 * crème. Le quatrième masque est plein (terracotta, yeux + bouche en négatif
 * crème) : c'est « le masque que le test révèle ». Métaphore : répétition du
 * même scénario amoureux, et révélation au bout du parcours.
 *
 * Concept SVG validé par Cyrille 2026-05-29, repris au pixel près de la
 * référence fournie dans la mission (viewBox 680×300, opacités croissantes
 * 0.22 / 0.40 / 0.62 / plein, baseline hairline + ancrages).
 *
 * Apparition séquentielle gauche → droite si motion autorisé. `useReducedMotion`
 * respecté : si réduit, les 4 masques apparaissent directement aux opacités
 * finales sans animation.
 *
 * Décoratif accessible : role="img" + title + desc pour lecteurs d'écran.
 * Responsive 100% largeur. Pas de bitmap, pas de dépendance ajoutée.
 *
 * Remplace BoucleHero (mission 2026-05-25 → 2026-05-29).
 */

const TERRA = '#9E4332'
const CREME = '#FAF8F5'

interface MasqueProps {
  opacity: number
  filled?: boolean
  delay: number
  reduceMotion: boolean
}

function MasqueGroup({ opacity, filled = false, delay, reduceMotion }: MasqueProps) {
  return (
    <motion.g
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: filled ? 1 : opacity }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: 'easeOut', delay }
      }
    >
      {filled ? (
        <>
          <path
            d="M0,-55 C30,-55 30,-18 22,10 C17,28 9,40 0,40 C-9,40 -17,28 -22,10 C-30,-18 -30,-55 0,-55 Z"
            fill={TERRA}
          />
          <ellipse cx="-10" cy="-20" rx="2.8" ry="4.5" fill={CREME} />
          <ellipse cx="10" cy="-20" rx="2.8" ry="4.5" fill={CREME} />
          <path
            d="M-7,13 Q0,16 7,13"
            fill="none"
            stroke={CREME}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M0,-55 C30,-55 30,-18 22,10 C17,28 9,40 0,40 C-9,40 -17,28 -22,10 C-30,-18 -30,-55 0,-55 Z"
            fill="none"
            stroke={TERRA}
            strokeWidth="2.6"
          />
          <ellipse cx="-10" cy="-20" rx="2.6" ry="4.2" fill={TERRA} />
          <ellipse cx="10" cy="-20" rx="2.6" ry="4.2" fill={TERRA} />
        </>
      )}
    </motion.g>
  )
}

export function MasquesHero() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <svg
      viewBox="0 0 680 300"
      role="img"
      aria-labelledby="masques-hero-title"
      aria-describedby="masques-hero-desc"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <title id="masques-hero-title">
        Quatre masques alignés, du plus pâle au plus net
      </title>
      <desc id="masques-hero-desc">
        Concept de hero : la répétition du même scénario amoureux, et le masque
        que le test révèle.
      </desc>
      <line
        x1="78"
        y1="236"
        x2="602"
        y2="236"
        stroke={TERRA}
        strokeWidth="1"
        opacity="0.35"
      />
      <g transform="translate(118,205) rotate(-4) scale(0.78)">
        <MasqueGroup opacity={0.22} delay={0.05} reduceMotion={reduceMotion} />
      </g>
      <g transform="translate(262,200) rotate(3) scale(0.92)">
        <MasqueGroup opacity={0.4} delay={0.22} reduceMotion={reduceMotion} />
      </g>
      <g transform="translate(408,196) rotate(-2) scale(1.02)">
        <MasqueGroup opacity={0.62} delay={0.4} reduceMotion={reduceMotion} />
      </g>
      <g transform="translate(560,188) scale(1.2)">
        <MasqueGroup opacity={1} filled delay={0.6} reduceMotion={reduceMotion} />
      </g>
      <circle cx="118" cy="236" r="1.6" fill={TERRA} opacity="0.3" />
      <circle cx="262" cy="236" r="1.6" fill={TERRA} opacity="0.45" />
      <circle cx="408" cy="236" r="1.6" fill={TERRA} opacity="0.6" />
      <circle cx="560" cy="236" r="1.8" fill={TERRA} />
    </svg>
  )
}
