import type { QuestionContexte } from '../domain/types'

interface Props {
  question: QuestionContexte
  onChoisir: (valeur: string) => void
  valeurChoisie?: string
}

export function ContextCard({ question, onChoisir, valeurChoisie }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-xl leading-snug md:text-2xl">{question.enonce}</h2>
      <ul className="grid grid-cols-1 gap-3">
        {question.options.map((opt) => {
          const choisie = valeurChoisie === opt.valeur
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => onChoisir(opt.valeur)}
                aria-pressed={choisie}
                className="w-full rounded-xl border p-5 text-left text-base transition hover:scale-[1.01] focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--h3c-fond-card)',
                  borderColor: choisie
                    ? 'var(--h3c-accent-primaire)'
                    : 'var(--h3c-bordure)',
                  boxShadow: choisie ? '0 0 0 2px var(--h3c-accent-primaire)' : undefined,
                }}
              >
                {opt.texte}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
