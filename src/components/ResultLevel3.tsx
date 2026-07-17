import { getRoadmap } from '../domain/result'
import type { Resultat } from '../domain/types'

interface Props {
  resultat: Resultat
}

// CTA aplati (décision Bloc 2, 2026-05-25). CTA secondaire réalignée sur le
// funnel No Phone (2026-07-17) : plus d'appel de qualification YouCanBookMe,
// le séminaire Régénération se découvre et s'achète en direct via h3c.fr/solution.
// statutLivre reste collecté pour analytics/segmentation Brevo, mais ne pilote
// plus le routage.
const ctaUnifie = {
  amorce: `Vous venez d'identifier votre profil. La suite arrive dans votre email : vos 20 séances audio guidées, calibrées sur votre profil, prêtes à écouter dès ce soir. Le corps se met au travail là où comprendre seul ne va pas.

Et si vous voulez aller plus loin, vous découvrez le séminaire Régénération, l'immersion qui transforme ce que la compréhension seule ne transforme pas.

La tête comprend. Le corps répare.`,
  ctaPrincipal: {
    texte: `Ouvrir mon email et récupérer mes 20 séances`,
    url: `#`,
  },
  ctaSecondaire: {
    texte: `Découvrir le séminaire Régénération`,
    url: `https://h3c.fr/solution`,
  },
}

// Flag de gel des références au livre (décision Bloc 2 — 2026-05-25).
// Le livre H3C n'est pas encore publié ; les "Chapitres à relire" sont gelés
// par défaut. Réactivation au moment de la sortie en basculant VITE_LIVRE_DISPONIBLE=true.
const LIVRE_DISPONIBLE = import.meta.env.VITE_LIVRE_DISPONIBLE === 'true'

export function ResultLevel3({ resultat }: Props) {
  const roadmap = getRoadmap(resultat.profilDominant, resultat.intensite)
  const cta = ctaUnifie

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

      {LIVRE_DISPONIBLE && roadmap.chapitresLivreCibles.length > 0 && (
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
