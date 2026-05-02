import { getProfil } from '../domain/result'
import type { IntensiteId, Resultat } from '../domain/types'

const LABEL_INTENSITE: Record<IntensiteId, string> = {
  surface: 'Surface',
  modere: 'Modéré',
  profond: 'Profond',
}

const COULEUR_INTENSITE: Record<IntensiteId, string> = {
  surface: 'var(--h3c-intensite-surface)',
  modere: 'var(--h3c-intensite-modere)',
  profond: 'var(--h3c-intensite-profond)',
}

interface Props {
  resultat: Resultat
}

export function ResultLevel1({ resultat }: Props) {
  const profil = getProfil(resultat.profilDominant)
  const profilSecondaire = resultat.profilSecondaire
    ? getProfil(resultat.profilSecondaire)
    : null
  const modulateur = profil.modulateursIntensite[resultat.intensite]

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="text-center">
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Votre profil dominant
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl">{profil.nom}</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>
          Ambassadeur : {profil.ambassadeur}
        </p>
      </header>

      <div
        className="whitespace-pre-line rounded-xl p-6 text-base leading-relaxed"
        style={{ background: 'var(--h3c-fond-card)' }}
      >
        {profil.descriptionBase}
      </div>

      {profilSecondaire && (
        <p
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{
            background: 'var(--h3c-fond-card)',
            borderLeft: '4px solid var(--h3c-accent-secondaire)',
          }}
        >
          Vous oscillez aussi avec une forte tendance{' '}
          <strong>{profilSecondaire.nom}</strong>. Selon les contextes, vous
          basculez d'une stratégie à l'autre.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Votre intensité
        </p>
        <IntensiteBar intensite={resultat.intensite} />
        <p className="text-base font-medium">
          {LABEL_INTENSITE[resultat.intensite]} ({resultat.scoreIntensite}/30)
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'var(--h3c-texte-secondaire)' }}>
          {modulateur}
        </p>
      </div>
    </section>
  )
}

function IntensiteBar({ intensite }: { intensite: IntensiteId }) {
  const segments: IntensiteId[] = ['surface', 'modere', 'profond']
  return (
    <div className="flex w-full overflow-hidden rounded-full" style={{ height: 8 }}>
      {segments.map((seg) => {
        const actif = seg === intensite
        return (
          <div
            key={seg}
            className="flex-1"
            style={{
              background: actif ? COULEUR_INTENSITE[seg] : 'var(--h3c-bordure)',
              opacity: actif ? 1 : 0.4,
            }}
          />
        )
      })}
    </div>
  )
}
