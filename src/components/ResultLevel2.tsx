import { getProfil } from '../domain/result'
import type { Resultat } from '../domain/types'

interface Props {
  resultat: Resultat
}

export function ResultLevel2({ resultat }: Props) {
  const profil = getProfil(resultat.profilDominant)

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-10">
      <h2 className="text-2xl md:text-3xl">Les 7 symptômes que vous reconnaissez</h2>
      <ol className="flex flex-col gap-3" style={{ counterReset: 'sym' }}>
        {profil.septSymptomes.map((s, i) => (
          <li
            key={i}
            className="rounded-xl p-4 text-base leading-relaxed"
            style={{ background: 'var(--h3c-fond-card)' }}
          >
            <strong style={{ color: 'var(--h3c-accent-primaire)' }}>{i + 1}.</strong>{' '}
            <SymptomeText texte={s} />
          </li>
        ))}
      </ol>
    </section>
  )
}

// Rend le markdown gras simple (**...**) en strong, sans dépendance.
function SymptomeText({ texte }: { texte: string }) {
  const parts = texte.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}
