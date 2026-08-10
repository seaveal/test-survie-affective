import { motion, useReducedMotion } from 'framer-motion'

/**
 * BoucleHero : visuel décoratif de l'écran d'accueil.
 *
 * 4 silhouettes en écho, de la plus pâle à la plus nette → métaphore visuelle
 * de la répétition du même scénario amoureux.
 *
 * Apparition staggered (mission Welcome v2 2026-05-25) : les 4 silhouettes
 * s'allument séquentiellement (~0.1 → 0.6 s) vers leurs opacités cibles
 * 0.14 / 0.28 / 0.5 / 1. Respect prefers-reduced-motion : si réduit, les
 * silhouettes apparaissent directement aux opacités finales, sans animation.
 *
 * Décoratif accessible : role="img" + title + desc pour lecteurs d'écran.
 * Responsive 100% (viewBox 680×140 préserve les proportions).
 *
 * Couleurs verrouillées sur la palette H3C (taupe sur crème).
 */
const SILHOUETTES: Array<{
  opacity: number
  translateX: number
  scale: number
  delay: number
}> = [
  { opacity: 0.14, translateX: 258, scale: 0.82, delay: 0.1 },
  { opacity: 0.28, translateX: 322, scale: 0.9, delay: 0.27 },
  { opacity: 0.5, translateX: 384, scale: 0.98, delay: 0.43 },
  { opacity: 1, translateX: 448, scale: 1.08, delay: 0.6 },
]

export function BoucleHero() {
  const reduceMotion = useReducedMotion()

  return (
    <svg
      viewBox="0 0 680 140"
      role="img"
      aria-labelledby="boucle-title"
      aria-describedby="boucle-desc"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', maxHeight: '160px' }}
    >
      <title id="boucle-title">
        Une silhouette répétée quatre fois en écho, de la plus pâle à la plus
        nette
      </title>
      <desc id="boucle-desc">
        Concept de la répétition : toujours le même scénario.
      </desc>
      <line
        x1="150"
        y1="116"
        x2="530"
        y2="116"
        stroke="#c4a777"
        strokeWidth="0.5"
        opacity="0.5"
      />
      {SILHOUETTES.map((s, i) => (
        <motion.g
          key={i}
          fill="#8b7355"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: s.opacity }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.5, ease: 'easeOut', delay: s.delay }
          }
          transform={`translate(${s.translateX},116) scale(${s.scale})`}
        >
          <circle cx="0" cy="-46" r="9" />
          <path d="M -14 0 Q -14 -34 0 -34 Q 14 -34 14 0 Z" />
        </motion.g>
      ))}
    </svg>
  )
}
