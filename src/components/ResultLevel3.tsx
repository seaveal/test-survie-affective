import { ctaParStatut } from '../data/profils'
import { getRoadmap } from '../domain/result'
import type { Resultat } from '../domain/types'

interface Props {
  resultat: Resultat
}

export function ResultLevel3({ resultat }: Props) {
  const roadmap = getRoadmap(resultat.profilDominant, resultat.intensite)
  const cta = ctaParStatut[resultat.statutLivre]
  const estLecteur =
    resultat.statutLivre === 'lu_complet' || resultat.statutLivre === 'lu_partiel'

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <h2 className="text-2xl md:text-3xl">Votre prochain pas</h2>

      <div className="flex flex-col gap-4">
        <Pas
          titre="Pas n°1 — Cette semaine"
          texte={roadmap.pasNumeroUn}
        />
        <Pas titre="Pas n°2 — Ce mois" texte={roadmap.pasNumeroDeux} />
        <Pas titre="Pas n°3 — Dans les 3 mois" texte={roadmap.pasNumeroTrois} />
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--h3c-fond-card)' }}>
        <h3 className="mb-2 text-lg">Exercice corporel prioritaire</h3>
        <p className="text-base leading-relaxed">{roadmap.exerciceCorporel}</p>
      </div>

      {estLecteur && roadmap.chapitresLivreCibles.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--h3c-fond-card)' }}
        >
          <h3 className="mb-2 text-lg">Chapitres à relire</h3>
          <p className="text-base">
            {roadmap.chapitresLivreCibles
              .map((n) => `Chapitre ${n}`)
              .join(' · ')}
          </p>
        </div>
      )}

      <div
        className="whitespace-pre-line rounded-xl p-5 text-base leading-relaxed"
        style={{
          background: 'var(--h3c-fond-card)',
          borderLeft: '4px solid var(--h3c-accent-secondaire)',
        }}
      >
        {cta.amorce}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={cta.ctaPrincipal.url}
          className="flex-1 rounded-lg px-6 py-4 text-center text-base font-medium text-white shadow-md transition hover:scale-[1.02]"
          style={{ background: 'var(--h3c-accent-primaire)' }}
        >
          {cta.ctaPrincipal.texte}
        </a>
        <a
          href={cta.ctaSecondaire.url}
          className="flex-1 rounded-lg border px-6 py-4 text-center text-base font-medium transition hover:scale-[1.02]"
          style={{
            borderColor: 'var(--h3c-accent-primaire)',
            color: 'var(--h3c-accent-primaire)',
          }}
        >
          {cta.ctaSecondaire.texte}
        </a>
      </div>
    </section>
  )
}

function Pas({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--h3c-fond-card)' }}>
      <h3
        className="mb-2 text-sm uppercase tracking-wide"
        style={{ color: 'var(--h3c-accent-primaire)' }}
      >
        {titre}
      </h3>
      <p className="text-base leading-relaxed">{texte}</p>
    </div>
  )
}
