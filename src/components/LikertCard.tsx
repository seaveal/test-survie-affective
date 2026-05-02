import type { QuestionIntensite } from '../domain/types'

interface Props {
  question: QuestionIntensite
  onChoisir: (valeur: 1 | 2 | 3 | 4 | 5) => void
  valeurChoisie?: 1 | 2 | 3 | 4 | 5
}

export function LikertCard({ question, onChoisir, valeurChoisie }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-xl leading-snug md:text-2xl">{question.enonce}</h2>
      <ul className="flex flex-col gap-3">
        {question.options.map((opt) => {
          const choisie = valeurChoisie === opt.valeur
          return (
            <li key={opt.valeur}>
              <button
                type="button"
                onClick={() => onChoisir(opt.valeur)}
                aria-pressed={choisie}
                className="flex w-full items-center gap-4 rounded-xl border p-4 text-left text-base transition hover:scale-[1.01] focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--h3c-fond-card)',
                  borderColor: choisie
                    ? 'var(--h3c-accent-primaire)'
                    : 'var(--h3c-bordure)',
                  boxShadow: choisie ? '0 0 0 2px var(--h3c-accent-primaire)' : undefined,
                }}
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full font-medium"
                  style={{
                    background: choisie
                      ? 'var(--h3c-accent-primaire)'
                      : 'var(--h3c-bordure)',
                    color: choisie ? '#fff' : 'var(--h3c-texte-principal)',
                  }}
                >
                  {opt.valeur}
                </span>
                <span>{opt.texte}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
