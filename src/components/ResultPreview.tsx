// ResultPreview — affichage allege du resultat a l'ecran (decision 2026-05-22).
//
// L'ancien comportement (ResultLevel1 + ResultLevel2 + ResultLevel3 a l'ecran)
// est REMPLACE par : niveau 1 seul + bloc "le detail arrive par email".
// Les composants ResultLevel2 et ResultLevel3 sont conserves dans le code
// (tests passent) mais ne sont plus rendus dans le parcours principal.

import { ResultLevel1 } from './ResultLevel1'
import type { Resultat } from '../domain/types'

interface Props {
  resultat: Resultat
  envoiReussi: boolean
}

export function ResultPreview({ resultat, envoiReussi }: Props) {
  return (
    <article className="mx-auto flex max-w-2xl flex-col" data-testid="result-preview">
      <ResultLevel1 resultat={resultat} />

      <section
        className="mx-6 mb-8 rounded-xl p-6"
        style={{
          background: 'var(--h3c-fond-card)',
          borderLeft: '4px solid var(--h3c-accent-principal, #b89e5d)',
        }}
      >
        <h2 className="text-xl">La suite arrive par email</h2>
        <p className="mt-3 text-base leading-relaxed">
          Le detail complet de votre profil, les sept symptomes que vous reconnaissez
          sans doute, votre feuille de route, et votre cadeau, sont en chemin dans
          votre boite.
        </p>
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Verifiez vos messages dans les prochaines minutes. Pensez aux spams.
        </p>
        {!envoiReussi && (
          <p
            role="status"
            className="mt-3 text-sm"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
            data-testid="result-retry-note"
          >
            L'envoi est en file d'attente. Votre profil partira des que la connexion
            sera retablie. Vous pouvez fermer cette page.
          </p>
        )}
      </section>
    </article>
  )
}
