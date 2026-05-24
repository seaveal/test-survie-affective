/**
 * BoucleHero : visuel décoratif de l'écran d'accueil enrichi.
 *
 * 4 silhouettes en écho, de la plus pâle à la plus nette → métaphore visuelle
 * de la répétition du même scénario amoureux.
 *
 * Décoratif accessible : role="img" + title + desc pour lecteurs d'écran.
 * Responsive 100% (viewBox 680×140 préserve les proportions).
 *
 * Couleurs verrouillées sur la palette H3C (taupe sur crème).
 */
export function BoucleHero() {
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
      <g
        fill="#8b7355"
        opacity="0.14"
        transform="translate(258,116) scale(0.82)"
      >
        <circle cx="0" cy="-46" r="9" />
        <path d="M -14 0 Q -14 -34 0 -34 Q 14 -34 14 0 Z" />
      </g>
      <g
        fill="#8b7355"
        opacity="0.28"
        transform="translate(322,116) scale(0.9)"
      >
        <circle cx="0" cy="-46" r="9" />
        <path d="M -14 0 Q -14 -34 0 -34 Q 14 -34 14 0 Z" />
      </g>
      <g fill="#8b7355" opacity="0.5" transform="translate(384,116) scale(0.98)">
        <circle cx="0" cy="-46" r="9" />
        <path d="M -14 0 Q -14 -34 0 -34 Q 14 -34 14 0 Z" />
      </g>
      <g fill="#8b7355" opacity="1" transform="translate(448,116) scale(1.08)">
        <circle cx="0" cy="-46" r="9" />
        <path d="M -14 0 Q -14 -34 0 -34 Q 14 -34 14 0 Z" />
      </g>
    </svg>
  )
}
