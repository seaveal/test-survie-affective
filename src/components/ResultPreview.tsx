// ResultPreview — écran de résultat réduit au nom du profil seul.
//
// Décision Bloc 2 (2026-05-25, mission corrections-parcours-bloc2) :
// l'écran affiche désormais uniquement le nom du profil dominant + une phrase
// d'invitation + le bloc "le rapport arrive par email" + DisclaimerFooter.
//
// Retiré de l'écran (vs. version 2026-05-22) : description, intensité, modulateur,
// ambassadeur. Tout le rapport part en email via le template Brevo `test_email_resultat`.
//
// Les composants ResultLevel1/2/3 sont conservés dans le code (tests passent)
// mais ne sont plus rendus dans le parcours principal.

import { getProfil } from '../domain/result'
import type { Resultat } from '../domain/types'
import { DisclaimerFooter } from './DisclaimerFooter'

interface Props {
  resultat: Resultat
  envoiReussi: boolean
}

export function ResultPreview({ resultat, envoiReussi }: Props) {
  const profil = getProfil(resultat.profilDominant)

  return (
    <article className="mx-auto flex max-w-2xl flex-col" data-testid="result-preview">
      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12 text-center">
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Votre profil
        </p>
        <h1 className="text-3xl md:text-4xl">{profil.nom}</h1>
        <p
          className="mt-2 text-base"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          La suite arrive dans votre email.
        </p>
      </section>

      <section
        className="mx-6 mb-6 rounded-xl p-6"
        style={{
          background: 'var(--h3c-fond-card)',
          borderLeft: '4px solid var(--h3c-accent-secondaire)',
        }}
      >
        <h2 className="text-xl">Votre rapport complet est en chemin</h2>
        <p className="mt-3 text-base leading-relaxed">
          Le détail de votre profil, les sept symptômes que vous reconnaissez sans
          doute, votre feuille de route, et votre cadeau (une séance de descente dans le
          corps, guidée par ma voix) arrivent dans votre boîte.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Vérifiez vos messages dans les prochaines minutes. Pensez aux spams.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          Votre cadeau reste accessible pendant 3 jours.
        </p>
        {!envoiReussi && (
          <p
            role="status"
            className="mt-4 text-sm"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
            data-testid="result-retry-note"
          >
            L'envoi est en file d'attente. Votre profil partira dès que la connexion
            sera rétablie. Vous pouvez fermer cette page.
          </p>
        )}
      </section>

      <DisclaimerFooter />
    </article>
  )
}
