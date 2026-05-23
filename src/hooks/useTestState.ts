import { useCallback, useMemo, useState } from 'react'
import { questions, questionsTypage } from '../data/questions'
import { composerResultat } from '../domain/result'
import type {
  EtatEmotionnel,
  PretAAgir,
  Question,
  Reponses,
  Resultat,
  SituationActuelle,
  StatutLivre,
} from '../domain/types'
import {
  buildPayload,
  submitTestComplete,
  type CaptureValues,
  type TestCompleteResponse,
} from '../api/client'

export type Etape = 'welcome' | 'questions' | 'capture' | 'resultat'

interface UseTestState {
  etape: Etape
  indexCourant: number
  questionCourante: Question
  reponses: Reponses
  resultat: Resultat | null
  envoiEnCours: boolean
  envoiReussi: boolean
  apiResponse: TestCompleteResponse | null
  commencer: () => void
  retour: () => void
  recommencer: () => void
  repondreTypage: (optionId: string) => void
  repondreIntensite: (valeur: 1 | 2 | 3 | 4 | 5) => void
  repondreContexte: (valeur: string) => void
  soumettreCapture: (capture: CaptureValues) => Promise<void>
}

const reponsesVides: Reponses = {
  typage: {},
  intensite: {},
  contexte: {
    statutLivre: 'pas_lu',
    situation: 'celibat_long',
    etatEmotionnel: 'fonctionnel',
    pretAAgir: 'incertain',
  },
}

const ORDRE_CHAMP_CONTEXTE: Array<keyof Reponses['contexte']> = [
  'statutLivre',
  'situation',
  'etatEmotionnel',
  'pretAAgir',
]

export function useTestState(): UseTestState {
  const [etape, setEtape] = useState<Etape>('welcome')
  const [indexCourant, setIndexCourant] = useState(0)
  const [reponses, setReponses] = useState<Reponses>(() => ({
    ...reponsesVides,
    typage: {},
    intensite: {},
    contexte: { ...reponsesVides.contexte },
  }))
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [envoiReussi, setEnvoiReussi] = useState(false)
  const [apiResponse, setApiResponse] = useState<TestCompleteResponse | null>(null)

  const questionCourante = questions[indexCourant]

  const commencer = useCallback(() => {
    setEtape('questions')
    setIndexCourant(0)
  }, [])

  const recommencer = useCallback(() => {
    setEtape('welcome')
    setIndexCourant(0)
    setResultat(null)
    setEnvoiEnCours(false)
    setEnvoiReussi(false)
    setApiResponse(null)
    setReponses({
      typage: {},
      intensite: {},
      contexte: { ...reponsesVides.contexte },
    })
  }, [])

  const retour = useCallback(() => {
    setIndexCourant((i) => Math.max(0, i - 1))
  }, [])

  // Quand la derniere question est repondue, on calcule le resultat
  // puis on passe par l'etape 'capture' (et non plus directement 'resultat').
  const calculerEtCapture = useCallback((nouvellesReponses: Reponses) => {
    const r = composerResultat(nouvellesReponses, questionsTypage)
    setResultat(r)
    setEtape('capture')
  }, [])

  const avancerOuFinaliser = useCallback(
    (nouvelles: Reponses) => {
      const next = indexCourant + 1
      if (next >= questions.length) {
        calculerEtCapture(nouvelles)
      } else {
        setIndexCourant(next)
      }
    },
    [indexCourant, calculerEtCapture],
  )

  const repondreTypage = useCallback(
    (optionId: string) => {
      const q = questions[indexCourant]
      if (q.type !== 'typage') return
      const nouvelles: Reponses = {
        ...reponses,
        typage: { ...reponses.typage, [q.id]: optionId },
      }
      setReponses(nouvelles)
      avancerOuFinaliser(nouvelles)
    },
    [reponses, indexCourant, avancerOuFinaliser],
  )

  const repondreIntensite = useCallback(
    (valeur: 1 | 2 | 3 | 4 | 5) => {
      const q = questions[indexCourant]
      if (q.type !== 'intensite') return
      const nouvelles: Reponses = {
        ...reponses,
        intensite: { ...reponses.intensite, [q.id]: valeur },
      }
      setReponses(nouvelles)
      avancerOuFinaliser(nouvelles)
    },
    [reponses, indexCourant, avancerOuFinaliser],
  )

  const repondreContexte = useCallback(
    (valeur: string) => {
      const q = questions[indexCourant]
      if (q.type !== 'contexte') return
      const champ = q.champCible as keyof Reponses['contexte']
      const nouvelles: Reponses = {
        ...reponses,
        contexte: {
          ...reponses.contexte,
          [champ]: valeur as StatutLivre & SituationActuelle & EtatEmotionnel & PretAAgir,
        },
      }
      setReponses(nouvelles)
      avancerOuFinaliser(nouvelles)
    },
    [reponses, indexCourant, avancerOuFinaliser],
  )

  /**
   * Soumet la capture (email + consentements) a l'API d'ingestion.
   *
   * Strategie : on transitionne IMMEDIATEMENT vers 'resultat' pour ne pas
   * bloquer l'experience utilisateur sur la latence reseau. L'appel API
   * tourne en parallele. Si echec, le payload va en queue localStorage
   * (gere par client.ts) et la note "envoi en file d'attente" s'affiche
   * dans ResultPreview.
   */
  const soumettreCapture = useCallback(
    async (capture: CaptureValues) => {
      if (!resultat) return
      setEnvoiEnCours(true)
      setEtape('resultat')
      const reponsesBrutes: Record<string, unknown> = {
        typage: reponses.typage,
        intensite: reponses.intensite,
        contexte: reponses.contexte,
      }
      const payload = buildPayload(capture, resultat, reponsesBrutes)
      try {
        const res = await submitTestComplete(payload)
        setApiResponse(res)
        setEnvoiReussi(res !== null)
      } finally {
        setEnvoiEnCours(false)
      }
    },
    [resultat, reponses],
  )

  // Évite que ORDRE_CHAMP_CONTEXTE soit purgé par un linter (utile aux dérivés futurs).
  void ORDRE_CHAMP_CONTEXTE

  return useMemo(
    () => ({
      etape,
      indexCourant,
      questionCourante,
      reponses,
      resultat,
      envoiEnCours,
      envoiReussi,
      apiResponse,
      commencer,
      retour,
      recommencer,
      repondreTypage,
      repondreIntensite,
      repondreContexte,
      soumettreCapture,
    }),
    [
      etape,
      indexCourant,
      questionCourante,
      reponses,
      resultat,
      envoiEnCours,
      envoiReussi,
      apiResponse,
      commencer,
      retour,
      recommencer,
      repondreTypage,
      repondreIntensite,
      repondreContexte,
      soumettreCapture,
    ],
  )
}
