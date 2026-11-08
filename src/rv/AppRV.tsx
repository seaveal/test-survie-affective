import { livraisonWhatsApp } from '../api/setting'
import { ResultDelivery } from '../components/ResultDelivery'
import { useEffect } from 'react'
import { flushPendingCaptures } from '../api/client'
import { CaptureScreen } from '../components/CaptureScreen'
import { ContextCard } from '../components/ContextCard'
import { ProgressBar } from '../components/ProgressBar'
import { contexteRv, questionsRv } from './questions'
import { ResultatRV } from './ResultatRV'
import { RvLikertCard } from './RvLikertCard'
import { SecuriteCard } from './SecuriteCard'
import { TEXTES_RV } from './textes'
import { NB_QUESTIONS_RV, useRvState } from './useRvState'
import { WelcomeRV } from './WelcomeRV'

/** Bilan RETROUVEZ-VOUS, servi sur /retrouvez-vous (aiguillage dans main.tsx). */
function AppRV() {
  const s = useRvState()

  // Au montage : les captures du Test restées en attente repartent. Les fins du bilan
  // restées en attente repartent dans useRvState, AVANT la reprise (FRONT-04).
  useEffect(() => {
    void flushPendingCaptures()
  }, [])

  // Chaque écran commence en haut (même raison que dans App.tsx).
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo(0, 0)
  }, [s.etape, s.indexCourant])

  if (s.etape === 'chargement') {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-sm"
        style={{ color: 'var(--h3c-texte-secondaire)' }}
        aria-busy="true"
        role="status"
      >
        {TEXTES_RV.chargement}
      </main>
    )
  }

  if (s.etape === 'welcome') return <WelcomeRV onCommencer={s.commencer} />

  if (s.etape === 'capture') {
    return (
      <CaptureScreen
        textes={TEXTES_RV.capture}
        onSubmit={(values) => {
          void s.soumettreCapture(values)
        }}
        envoiEnCours={s.envoiEnCours}
        erreurServeur={s.erreurCapture}
      />
    )
  }

  if (s.etape === 'resultat' && livraisonWhatsApp) return <ResultDelivery game="rv" busy={s.envoiEnCours} refused={s.envoiRefuse} />

  if (s.etape === 'resultat') {
    if (!s.resultat) return null
    return (
      <ResultatRV
        resultat={s.resultat}
        securite={s.securite}
        envoiReussi={s.envoiReussi}
        envoiEnCours={s.envoiEnCours}
        envoiRefuse={s.envoiRefuse}
        accepterSuite={s.suiteAProposer ? s.accepterSuite : undefined}
        onRecommencer={s.recommencer}
      />
    )
  }

  // 'questions' ou 'securite' : la question de sécurité est le dernier pas de la barre.
  const total = NB_QUESTIONS_RV + 1
  const i = s.indexCourant
  const q = questionsRv[i]
  const ctx = contexteRv[i - questionsRv.length]
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-8">
      <ProgressBar courant={s.etape === 'securite' ? total : i + 1} total={total} />
      {s.etape === 'securite' ? (
        <SecuriteCard onChoisir={s.repondreSecurite} valeurChoisie={s.securite} />
      ) : q ? (
        <>
          <p className="-mb-4 text-sm" style={{ color: 'var(--h3c-texte-secondaire)' }}>
            {TEXTES_RV.questions.consigne}
          </p>
          <RvLikertCard key={q.id} question={q} onChoisir={s.repondreQuestion} valeurChoisie={s.corps.reponses[q.id]} />
        </>
      ) : (
        <ContextCard
          question={ctx}
          onChoisir={s.repondreContexte}
          valeurChoisie={(ctx.champCible === 'situation' ? s.corps.situation : s.corps.pret_a_agir) ?? undefined}
        />
      )}
      {(s.etape === 'securite' || i > 0) && (
        <button
          type="button"
          onClick={s.retour}
          className="self-start rounded-md px-4 py-2 text-sm transition hover:underline"
          style={{ color: 'var(--h3c-texte-secondaire)' }}
        >
          {TEXTES_RV.questions.retour}
        </button>
      )}
    </main>
  )
}

export default AppRV
