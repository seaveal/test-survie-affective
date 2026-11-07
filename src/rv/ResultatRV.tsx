import { useEffect, useState } from 'react'
import { lireJetonContact, lireOrientationRv, lienSuiteRv } from '../api/client'
import { DisclaimerFooter } from '../components/DisclaimerFooter'
import { niveau } from '../domain/rv/scoring'
import { DIMENSIONS_RV, type ResultatRv } from '../domain/rv/types'
import type { ReponseSecurite } from './questions'
import { RESTITUTIONS_RV } from './restitutions'
import { TEXTES_RV } from './textes'


const T = TEXTES_RV.resultat
const secondaire = { color: 'var(--h3c-texte-secondaire)' }
const carte = { background: 'var(--h3c-fond-card)' }

interface Props {
  resultat: ResultatRv
  /** Réponse à la question de sécurité, gardée en mémoire d'écran seulement. */
  securite: ReponseSecurite | null
  envoiReussi: boolean
  envoiEnCours: boolean
  /** Fin refusée par l'API (4xx) : rien n'est conservé ni envoyé. */
  envoiRefuse: boolean
  /** Présent quand la case des emails est restée vide : la suite est reproposée. */
  accepterSuite?: () => Promise<boolean>
  onRecommencer: () => void
}

function SuiteParEmail({ accepter }: { accepter: () => Promise<boolean> }) {
  const S = TEXTES_RV.suite
  const [etat, setEtat] = useState<'offre' | 'envoi' | 'ok' | 'erreur'>('offre')
  if (etat === 'ok') {
    return (
      <p role="status" className="mt-5 text-base" data-testid="suite-ok">
        {S.merci}
      </p>
    )
  }
  return (
    <div className="mt-5 border-t pt-5" style={{ borderColor: 'var(--h3c-bordure)' }} data-testid="suite-par-email">
      <p className="text-base leading-relaxed">{S.phrase}</p>
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
        {S.bouton}
      </button>
      <p className="mt-2 text-xs" style={secondaire}>
        {S.mention}
      </p>
      {etat === 'erreur' && (
        <p role="alert" className="mt-2 text-sm" style={{ color: 'var(--h3c-alerte, #b91c1c)' }}>
          {S.erreur}
        </p>
      )}
    </div>
  )
}

/** Rend chaque numéro connu d'une ligne en lien cliquable (tel: ou sms:). */
function ligneAvecNumeros(ligne: string) {
  const numeros = Object.keys(TEXTES_RV.urgence.liens).sort((a, b) => b.length - a.length)
  const re = new RegExp(`(${numeros.join('|')})`, 'g')
  return ligne.split(re).map((part, i) =>
    TEXTES_RV.urgence.liens[part] ? (
      <a key={i} href={TEXTES_RV.urgence.liens[part]} className="font-medium underline">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function Urgence() {
  const U = TEXTES_RV.urgence
  return (
    <section
      className="mx-6 mt-12 rounded-xl p-6"
      style={{ ...carte, border: '2px solid var(--h3c-accent-primaire)' }}
      data-testid="urgence"
    >
      <h2 className="text-xl">{U.titre}</h2>
      <ul className="mt-4 flex flex-col gap-2 text-base">
        {U.lignes.map((l) => (
          <li key={l}>{ligneAvecNumeros(l)}</li>
        ))}
      </ul>
    </section>
  )
}

export function ResultatRV({ resultat, securite, envoiReussi, envoiEnCours, envoiRefuse, accepterSuite, onRecommencer }: Props) {
  const p1 = RESTITUTIONS_RV.priorites[resultat.priorite]
  // Priorité à 5 ou moins (« Ressources disponibles ») : la phrase de ce niveau remplace la
  // restitution, qui affirmerait une difficulté, et aucune seconde priorité n'est montrée
  // (décision de Cyrille du 03/11/2026, audit FRONT-07). L'appel reste proposé.
  const s1 = resultat.priorite === 'incomplet' ? null : resultat.scores[resultat.priorite]
  const ressources = s1 !== null && niveau(s1) === 'ressources'
  const p2 = !ressources && resultat.priorite_2 && RESTITUTIONS_RV.priorites[resultat.priorite_2]
  const urgence = securite === 'oui'
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col" data-testid="resultat-rv">
      {/* Réponse « Oui » à la question de sécurité : le bloc d'urgence en tête de page, à la
          place de l'appel (décision de Cyrille du 03/11/2026). */}
      {urgence && <Urgence />}
      <section className={`flex flex-col gap-3 px-6 text-center ${urgence ? 'pt-8' : 'pt-12'}`}>
        <p
          className="text-xs uppercase md:text-sm"
          style={{ color: 'var(--h3c-accent-terracotta)', fontFamily: 'var(--font-eyebrow)', letterSpacing: '0.14em' }}
        >
          {T.priorite}
        </p>
        <h1 className="text-3xl md:text-4xl" data-testid="priorite-titre">
          {p1.titre}
        </h1>
        <p className="mt-2 text-base leading-relaxed" data-testid="priorite-texte">
          {ressources ? RESTITUTIONS_RV.phrasesNiveaux.ressources : p1.ecran}
        </p>
      </section>

      {p2 && (
        <section className="mx-6 mt-6 rounded-xl p-6" style={carte} data-testid="priorite-2">
          <h2 className="text-lg">{p2.titre}</h2>
          <p className="mt-2 text-base leading-relaxed">{p2.seconde}</p>
        </section>
      )}

      <section className="mx-6 mt-6" data-testid="scores">
        <h2 className="text-xl">{T.surtitre}</h2>
        <p className="mt-2 text-base leading-relaxed">{T.reperes}</p>
        <ul className="mt-3 flex flex-col">
          {DIMENSIONS_RV.map((d) => {
            const s = resultat.scores[d]
            return (
              <li
                key={d}
                className="flex flex-wrap justify-between gap-x-4 border-b py-2 text-base"
                style={{ borderColor: 'var(--h3c-bordure)' }}
                data-testid={`score-${d}`}
              >
                <span>{TEXTES_RV.dimensions[d]}</span>
                <span style={secondaire}>
                  {s === null ? RESTITUTIONS_RV.scoreIncomplet : `${s}/20 · ${RESTITUTIONS_RV.niveaux[niveau(s)]}`}
                </span>
              </li>
            )
          })}
        </ul>
        {/* Bilan entièrement incomplet : sa restitution dit déjà la même chose (audit 03/11, FRONT-12). */}
        {resultat.priorite !== 'incomplet' && DIMENSIONS_RV.some((d) => resultat.scores[d] === null) && (
          <p className="mt-3 text-sm" style={secondaire} data-testid="incomplet">
            {T.incomplet}
          </p>
        )}
      </section>

      <section className="mx-6 mt-6 rounded-xl p-6" style={{ ...carte, borderLeft: '4px solid var(--h3c-accent-secondaire)' }}>
        <h2 className="text-lg">
          {envoiRefuse ? T.emailRefus : envoiReussi ? T.emailOk : envoiEnCours ? T.emailEnvoi : T.emailFile}
        </h2>
        {envoiReussi && (
          <p className="mt-3 text-sm" style={secondaire}>
            {T.spams}
          </p>
        )}
        {!envoiReussi && !envoiEnCours && !envoiRefuse && (
          <p role="status" className="mt-4 text-sm" style={secondaire} data-testid="resultat-attente">
            {T.enAttente}
          </p>
        )}
        {envoiReussi && accepterSuite && <SuiteParEmail accepter={accepterSuite} />}
      </section>

      {!urgence && <SuiteDuBilan />}


      <p className="mx-6 mt-8 text-base leading-relaxed" style={secondaire}>
        {T.pied}
      </p>
      <div className="px-6 pb-4 pt-6 text-center">
        <button type="button" onClick={onRecommencer} className="text-sm underline" style={secondaire}>
          {T.recommencer}
        </button>
      </div>
      <DisclaimerFooter nomTest={TEXTES_RV.nomTest} />
    </main>
  )
}


/** L'adresse saisie et le jeton de cycle ne prouvent pas l'identité d'un membre. */
export function SuiteDuBilan() {
  const [contact] = useState(lireJetonContact)
  const [suite, setSuite] = useState<'chargement' | 'email' | 'rdv' | 'programme'>(contact ? 'chargement' : 'email')
  useEffect(() => {
    if (!contact) return
    let actif = true
    void lireOrientationRv(contact).then((resultat) => {
      if (actif) setSuite(resultat ?? 'email')
    })
    return () => { actif = false }
  }, [contact])
  if (suite === 'chargement') return <p className="mx-6 mt-6" role="status">{T.suiteChargement}</p>
  if (suite === 'email' || !contact) return (
    <section className="mx-6 mt-6" data-testid="suite-bilan-email">
      <h2 className="text-xl">{T.suiteTitre}</h2>
      <p className="mt-3 text-base leading-relaxed">{T.suiteEmail}</p>
    </section>
  )
  const membre = suite === 'programme'
  return (
    <section className="mx-6 mt-6" data-testid={membre ? 'suite-programme' : 'appel'}>
      <p className="text-base leading-relaxed">{membre ? T.suiteProgramme : T.demande}</p>
      <a href={lienSuiteRv(contact)} referrerPolicy="no-referrer"
         className="tsa-cta-terracotta mt-4 block rounded-lg px-6 py-4 text-center text-base font-medium text-white shadow-md"
         data-testid={membre ? 'programme-bouton' : 'rdv-bouton'}>
        {membre ? T.boutonProgramme : T.bouton}
      </a>
      {!membre && <p className="mt-3 text-sm" style={secondaire}>{T.sousBouton}</p>}
    </section>
  )
}
