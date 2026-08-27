import type { CSSProperties } from 'react'

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
 * Apparition séquentielle gauche → droite, en CSS pure depuis le 2026-08-27
 * (audit conversion) : framer-motion ne servait plus qu'à ce fondu et à celui
 * de Welcome, pour une centaine de kilooctets sur la chaîne critique.
 * `prefers-reduced-motion` reste respecté, en media query cette fois : les 4
 * masques s'affichent alors directement à leur opacité finale.
 *
 * Décoratif accessible : role="img" + title + desc pour lecteurs d'écran.
 * Responsive 100% largeur. Pas de bitmap, pas de dépendance ajoutée.
 *
 * Remplace BoucleHero (mission 2026-05-25 → 2026-05-29).
 */

const TERRA = '#A8432B'  // terracotta canonique de marque (cf. --h3c-accent-terracotta), aligné Livre H3C 2026-06-21
const CREME = '#FAF8F5'

interface MasqueProps {
  opacity: number
  filled?: boolean
  delay: number
}

function MasqueGroup({ opacity, filled = false, delay }: MasqueProps) {
  return (
    <g
      className="tsa-masque"
      style={
        {
          '--tsa-opacite-cible': filled ? 1 : opacity,
          animationDelay: `${delay}s`,
        } as CSSProperties
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
    </g>
  )
}

export function MasquesHero() {
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
        <MasqueGroup opacity={0.22} delay={0.03} />
      </g>
      <g transform="translate(262,200) rotate(3) scale(0.92)">
        <MasqueGroup opacity={0.4} delay={0.1} />
      </g>
      <g transform="translate(408,196) rotate(-2) scale(1.02)">
        <MasqueGroup opacity={0.62} delay={0.18} />
      </g>
      <g transform="translate(560,188) scale(1.2)">
        <MasqueGroup opacity={1} filled delay={0.26} />
      </g>
      <circle cx="118" cy="236" r="1.6" fill={TERRA} opacity="0.3" />
      <circle cx="262" cy="236" r="1.6" fill={TERRA} opacity="0.45" />
      <circle cx="408" cy="236" r="1.6" fill={TERRA} opacity="0.6" />
      <circle cx="560" cy="236" r="1.8" fill={TERRA} />
    </svg>
  )
}
