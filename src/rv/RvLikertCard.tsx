import type { ReponseRv } from '../domain/rv/types'
import { ECHELLE_RV, type QuestionRv } from './questions'

interface Props {
  question: QuestionRv
  onChoisir: (valeur: ReponseRv) => void
  /** undefined : pas encore répondue. null : « Je préfère ne pas répondre ». */
  valeurChoisie?: ReponseRv
}

/** Même gabarit que LikertCard (Test), échelle 0 à 4 à libellés et sixième option sans chiffre. */
export function RvLikertCard({ question, onChoisir, valeurChoisie }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-xl leading-snug md:text-2xl">{question.enonce}</h2>
      <ul className="flex flex-col gap-3">
        {ECHELLE_RV.map((opt) => {
          const choisie = valeurChoisie === opt.valeur
          const chiffre = opt.valeur !== null
          return (
            <li key={String(opt.valeur)}>
              <button
                type="button"
                onClick={() => onChoisir(opt.valeur)}
                aria-pressed={choisie}
                className="flex w-full items-center gap-4 rounded-xl border p-4 text-left text-base transition hover:scale-[1.01] focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--h3c-fond-card)',
                  borderColor: choisie ? 'var(--h3c-accent-primaire)' : 'var(--h3c-bordure)',
                  boxShadow: choisie ? '0 0 0 2px var(--h3c-accent-primaire)' : undefined,
                  color: chiffre ? undefined : 'var(--h3c-texte-secondaire)',
                }}
              >
                {chiffre && (
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full font-medium"
                    style={{
                      background: choisie ? 'var(--h3c-accent-primaire)' : 'var(--h3c-bordure)',
                      color: choisie ? '#fff' : 'var(--h3c-texte-principal)',
                    }}
                  >
                    {opt.valeur}
                  </span>
                )}
                <span>{opt.texte}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
