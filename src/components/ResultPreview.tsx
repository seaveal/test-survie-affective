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

import { useState } from 'react'
import { getProfil } from '../domain/result'
import type { Resultat } from '../domain/types'
import { DisclaimerFooter } from './DisclaimerFooter'

interface Props {
  resultat: Pick<Resultat, 'profilDominant'>
  envoiReussi: boolean
  apercu?: boolean
  envoiEnCours?: boolean
  /** Fin refusée par l'API (4xx) : rien n'est conservé ni envoyé. */
  envoiRefuse?: boolean
  /** Présent quand la case des emails est restée vide : la suite est reproposée. */
  accepterSuite?: () => Promise<boolean>
}

// Seconde proposition (décision Cyrille du 2026-10-09). Le bouton vaut consentement :
// il dit qui écrit, quoi, et comment se désinscrire.
const TEXTES_SUITE = {
  phrase:
    'Voulez-vous recevoir la suite ? Les textes de Cyrille Novou sur votre profil, ses séances guidées et ses propositions d’accompagnement.',
  bouton: 'Oui, je veux la suite',
  mention: 'Désinscription en un clic, en bas de chaque email.',
  merci: 'C’est noté : la suite arrive dans votre email.',
  erreur: 'L’inscription n’a pas pu être enregistrée. Cliquez de nouveau dans un instant.',
} as const

function SuiteParEmail({ accepter }: { accepter: () => Promise<boolean> }) {
  const [etat, setEtat] = useState<'offre' | 'envoi' | 'ok' | 'erreur'>('offre')
  if (etat === 'ok') {
    return <p role="status" className="mt-5 text-base" data-testid="suite-ok">{TEXTES_SUITE.merci}</p>
  }
  return (
    <div className="mt-5 border-t pt-5" style={{ borderColor: 'var(--h3c-bordure)' }}
         data-testid="suite-par-email">
      <p className="text-base leading-relaxed">{TEXTES_SUITE.phrase}</p>
      <button
        type="button"
        disabled={etat === 'envoi'}
        onClick={async () => {
          setEtat('envoi')
          setEtat((await accepter()) ? 'ok' : 'erreur')
        }}
        className="tsa-cta-terracotta mt-3 rounded-md px-5 py-2.5 text-base font-medium text-white transition disabled:opacity-50"
        data-testid="suite-accepter"
      >
        {TEXTES_SUITE.bouton}
      </button>
      <p className="mt-2 text-xs" style={{ color: 'var(--h3c-texte-secondaire)' }}>
        {TEXTES_SUITE.mention}
      </p>
      {etat === 'erreur' && (
        <p role="alert" className="mt-2 text-sm" style={{ color: 'var(--h3c-alerte, #b91c1c)' }}>
          {TEXTES_SUITE.erreur}
        </p>
      )}
    </div>
  )
}

// Bloc rendez-vous (décision Cyrille du 18/10/2026 : « l'upsell du test est le kit et non
// l'appel avec moi », puis « l'update de la page de résultat est une priorité car on va
// booster les 2 réels », puis « il faut supprimer le kit sur la page de résultat, ça n'a pas
// de sens d'empiler les propositions »). SEUL appel à l'action de la page : un appel offert
// de trente minutes. Lien court suivi `h3c.fr/rdv-test` (utm page-resultat, créé le 18/10),
// jamais l'URL YouCanBookMe en dur. Texte court écrit directement (exception du 12/10),
// sans date ni compte de créneaux : la page est evergreen.
export function RdvBloc() {
  const p = 'mt-4 text-base leading-relaxed'
  return (
    <section className="mx-6 mb-6" data-testid="rdv-bloc">
      <h2 className="text-xl">Votre prochain pas : trente minutes avec moi</h2>
      <p className={p}>
        Vous venez de mettre un nom sur votre profil. Ce qui se rejoue dans votre relation, lui, continue au prochain silence.
      </p>
      <p className={p}>
        Un appel de trente minutes, offert, en visio ou au téléphone. Vous me racontez ce qui se rejoue, je nomme le mécanisme, et si l’un de mes accompagnements vous convient, je vous le propose. Sinon, vous repartez avec une lecture claire de votre situation.
      </p>
      <a
        href="https://h3c.fr/rdv-test"
        className="mt-6 block rounded-lg px-6 py-4 text-center text-base font-medium text-white shadow-md transition hover:scale-[1.02]"
        style={{ background: 'var(--h3c-accent-primaire)' }}
        data-testid="rdv-bouton"
      >
        Réserver mon appel de 30 minutes
      </a>
    </section>
  )
}

export function ResultPreview({ resultat, envoiReussi, apercu = false, envoiEnCours = false, envoiRefuse = false, accepterSuite }: Props) {
  const profil = getProfil(resultat.profilDominant)

  return (
    <article className="mx-auto flex max-w-2xl flex-col" data-testid="result-preview">
      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12 text-center">
        {/* Vignette de Cyrille (exigence Cyrille, pages v2 du 30/09) : ronde, ~110 px,
            anneau terracotta. Portrait servi depuis public/. */}
        <picture className="mx-auto block">
          <source srcSet="/portrait-cyrille.webp" type="image/webp" />
          <img
            src="/portrait-cyrille.jpg"
            width={110}
            height={110}
            alt="Cyrille Novou"
            decoding="async"
            className="block rounded-full object-cover"
            style={{
              width: 110,
              height: 110,
              border: '3px solid #fff',
              boxShadow: '0 0 0 3px var(--h3c-accent-terracotta), 0 4px 12px rgba(0,0,0,.08)',
            }}
            data-testid="vignette-cyrille"
          />
        </picture>
        <p
          className="text-sm uppercase tracking-wide"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {apercu ? 'Exemple de résultat' : 'Votre profil'}
        </p>
        <h1 className="text-3xl md:text-4xl">{profil.nom}</h1>
        <p
          className="mt-2 text-base"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {apercu ? 'Aperçu de la page affichée après le test.' : 'La suite arrive dans votre email.'}
        </p>
      </section>

      <section
        className="mx-6 mb-6 rounded-xl p-6"
        style={{
          background: 'var(--h3c-fond-card)',
          borderLeft: '4px solid var(--h3c-accent-secondaire)',
        }}
      >
        <h2 className="text-xl">{envoiRefuse ? 'Votre adresse n’a pas pu être enregistrée.' : envoiReussi || apercu ? 'Votre rapport arrive dans une dizaine de minutes' : 'Votre demande est en cours d’envoi'}</h2>
        {!envoiRefuse && (<>
        <p className="mt-3 text-base leading-relaxed">
          Vous recevrez par email le détail de votre profil, votre feuille de route
          et votre séance guidée offerte.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {apercu ? 'Cet aperçu utilise un profil d’exemple et ne déclenche aucun envoi.' : 'Pensez à vérifier vos spams si vous ne trouvez pas le message.'}
        </p>
        </>)}
        {!envoiReussi && !envoiEnCours && !envoiRefuse && (
          <p
            role="status"
            className="mt-4 text-sm"
            style={{ color: 'var(--h3c-texte-secondaire)' }}
            data-testid="result-retry-note"
          >
            Votre demande est conservée sur cet appareil. Revenez sur le test avec
            une connexion pour la transmettre ; votre rapport sera ensuite envoyé
            dans une dizaine de minutes.
          </p>
        )}
        {envoiReussi && !apercu && accepterSuite && <SuiteParEmail accepter={accepterSuite} />}
      </section>

      {/* Une seule proposition sur la page de résultat : l'appel de trente minutes
          (décision Cyrille du 18/10/2026). Le kit (vidéo + bloc) a été retiré ce jour ;
          la vente du kit vit sur sa propre page. */}
      <RdvBloc />

      <DisclaimerFooter />
    </article>
  )
}
